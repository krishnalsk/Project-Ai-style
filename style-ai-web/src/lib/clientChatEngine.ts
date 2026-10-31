// src/lib/clientChatEngine.ts
// Client-Side ChatGPT-Style Conversational Engine & High-Availability Fallback for Style AI
// Runs directly in browser (works on GitHub Pages static hosting, offline, and dev environments)
// Grounded strictly in existing application models, 1,000-record product catalog, and clinical rules.

import { queryCatalog, ScoredProduct, FilterCriteria } from "./queryEngine";
import { MOCK_PRODUCTS, Product } from "./products";
import { getAssistantRuleResponse } from "./aiStylistRules";

export interface ClientChatMessage {
  id?: string;
  sender: "user" | "ai";
  text: string;
  image?: string | null;
  timestamp?: string;
  source?: "multimodal-ai-engine" | "catalog-retrieval" | "conversational-ai" | "system";
  diagnosis?: any;
  matchedProducts?: ScoredProduct[];
}

export interface ClientChatContext {
  message: string;
  image?: string | null;
  skinType?: string;
  climate?: string;
  history?: ClientChatMessage[];
  allergies?: string[];
  cityName?: string;
}

export interface ClientChatResponse {
  reply: string;
  source: "multimodal-ai-engine" | "catalog-retrieval" | "conversational-ai" | "system";
  matchedProducts: ScoredProduct[];
  diagnosis?: any;
  suggestedPills: string[];
}

/**
 * Standard missing information response mandated by data accuracy rules.
 */
export const MISSING_INFO_DISCLAIMER =
  "I don't have enough verified information to answer that accurately. Please provide the missing details.";

/**
 * Parses numeric price constraints from user queries:
 * "under 2000", "below ₹1,500", "less than 2500 rs", "between 1000 and 3000"
 */
function extractPriceConstraint(query: string): { maxPrice?: number; minPrice?: number } {
  const q = query.replace(/,/g, "").toLowerCase();

  const betweenMatch = q.match(/between\s*(?:₹|rs\.?|inr)?\s*(\d{2,6})\s*(?:and|to|-)\s*(?:₹|rs\.?|inr)?\s*(\d{2,6})/i);
  if (betweenMatch) {
    const min = parseInt(betweenMatch[1], 10);
    const max = parseInt(betweenMatch[2], 10);
    if (!isNaN(min) && !isNaN(max)) {
      return { minPrice: Math.min(min, max), maxPrice: Math.max(min, max) };
    }
  }

  const underMatch = q.match(/(?:under|below|less\s+than|within|up\s+to|max|budget\s+of|<|<=)\s*(?:₹|rs\.?|inr)?\s*(\d{2,6})/i);
  if (underMatch) {
    const max = parseInt(underMatch[1], 10);
    if (!isNaN(max) && max > 0) {
      return { maxPrice: max };
    }
  }

  const generalPriceMatch = q.match(/(?:₹|rs\.?|inr)\s*(\d{2,6})\b/i);
  if (generalPriceMatch && /budget|cheap|affordable/i.test(q)) {
    const max = parseInt(generalPriceMatch[1], 10);
    if (!isNaN(max) && max > 0) {
      return { maxPrice: max };
    }
  }

  return {};
}

/**
 * Extracts category or garment type from query.
 */
function extractGarmentCategory(query: string): { category?: string } {
  const q = query.toLowerCase();
  if (/\b(shirt|shirts|tee|t-shirt|tshirt|top|tops|blouse|polo)\b/i.test(q)) return { category: "Tops" };
  if (/\b(pant|pants|trousers|jeans|chinos|joggers|shorts|bottoms)\b/i.test(q)) return { category: "Bottoms" };
  if (/\b(dress|dresses|gown|kurta|kurti|ethnic)\b/i.test(q)) return { category: "Dresses" };
  if (/\b(jacket|hoodie|cardigan|sweater|outerwear|coat)\b/i.test(q)) return { category: "Outerwear" };
  if (/\b(innerwear|undershirt|base\s*layer|socks|boxers)\b/i.test(q)) return { category: "Basics" };
  return {};
}

/**
 * Extracts target textile fiber from query.
 */
function extractTargetFiber(query: string): string | null {
  const q = query.toLowerCase();
  if (/\b(organic\s+cotton|gots)\b/i.test(q)) return "Organic Cotton";
  if (/\bcotton\b/i.test(q)) return "Cotton";
  if (/\blinen\b/i.test(q)) return "Linen";
  if (/\bbamboo\b/i.test(q)) return "Bamboo";
  if (/\bsilk\b/i.test(q)) return "Silk";
  if (/\b(lyocell|tencel)\b/i.test(q)) return "Lyocell";
  if (/\bmodal\b/i.test(q)) return "Modal";
  if (/\bwool\b/i.test(q)) return "Wool";
  if (/\b(polyester|poly)\b/i.test(q)) return "Polyester";
  if (/\bnylon\b/i.test(q)) return "Nylon";
  if (/\b(elastane|spandex|lycra)\b/i.test(q)) return "Elastane";
  if (/\bviscose\b/i.test(q)) return "Viscose";
  if (/\bacrylic\b/i.test(q)) return "Acrylic";
  return null;
}

/**
 * Generates a high-quality ChatGPT-style conversational styling response in the browser.
 */
export async function generateClientChatResponse(context: ClientChatContext): Promise<ClientChatResponse> {
  const query = (context.message || "").trim();
  const lowerQuery = query.toLowerCase();
  const skinType = context.skinType || "Sensitive / Allergy Prone";
  const userAllergies = context.allergies || [];
  const history = context.history || [];

  // 1. PRICE-BASED CATALOG SEARCH (e.g. "Show me products under ₹2,000")
  const priceConstraint = extractPriceConstraint(query);
  const garmentFilter = extractGarmentCategory(query);

  if (priceConstraint.maxPrice || /catalog|products|show me|recommend clothes|buy|options/i.test(lowerQuery)) {
    const filter: FilterCriteria = {
      maxPrice: priceConstraint.maxPrice,
      minPrice: priceConstraint.minPrice,
      category: garmentFilter.category,
      confirmedAllergies: userAllergies,
      skinType: skinType,
      limit: 6,
    };

    const searchResults = queryCatalog(filter);
    const matched = searchResults.items;

    let reply = "";
    if (priceConstraint.maxPrice) {
      reply = `Here are verified skin-friendly clothing options from our verified catalog priced **under ₹${priceConstraint.maxPrice.toLocaleString("en-IN")}**`;
      if (garmentFilter.category) reply += ` in **${garmentFilter.category}**`;
      reply += `:\n\n`;
    } else {
      reply = `Here are verified clothing options from our catalog tailored for **${skinType}**:\n\n`;
    }

    if (matched.length > 0) {
      matched.slice(0, 4).forEach((item, idx) => {
        const p = item.product;
        reply += `${idx + 1}. **${p.name}** – ₹${p.price.toLocaleString("en-IN")}\n`;
        reply += `   • *Fabric Composition:* ${p.fabric}\n`;
        reply += `   • *Skin Safety Score:* ${p.skinSafetyScore}% (${p.comfortScore}% Comfort Index)\n`;
        reply += `   • *Why:* ${item.explanation}\n\n`;
      });
      reply += `> 💡 *Note: All items adhere to your dermatological comfort profile and allergy safeguards.*`;
    } else {
      reply += `No products found matching those exact constraints. Try broadening your price range or exploring organic cotton base layers.`;
    }

    return {
      reply,
      source: "catalog-retrieval",
      matchedProducts: matched,
      suggestedPills: [
        "What fabric is suitable for my skin?",
        "Is polyester suitable?",
        "Show clothes under ₹1,500",
      ],
    };
  }

  // 2. POLYESTER / SYNTHETICS SUITABILITY INQUIRY
  if (lowerQuery.includes("polyester") || lowerQuery.includes("synthetic")) {
    const isEczemaOrSensitive = /sensitive|eczema|allergy|dermatitis/i.test(skinType);
    let reply = `### Dermatological Assessment of Polyester\n\n`;
    reply += `**Is Polyester suitable for ${skinType}?**\n\n`;

    if (isEczemaOrSensitive) {
      reply += `**Generally Not Recommended for base layers.** Here is why:\n\n`;
      reply += `1. **Low Moisture Regain (0.4%):** Unlike natural cotton (8.5%) or linen (12%), polyester is completely hydrophobic. It traps sweat and heat against the epidermal barrier, creating a humid microclimate that exacerbates itching and contact dermatitis.\n`;
      reply += `2. **Static & Friction:** Synthetic polymer filaments build electrostatic charge and mechanical friction against sensitive cutaneous layers.\n`;
      reply += `3. **Chemical Finish Disperse Dyes:** Polyester requires disperse dyes at high temperatures, which can leach onto inflamed or open skin.\n\n`;
      reply += `> 🌿 **Best Alternative:** Choose **100% GOTS Certified Organic Cotton** or **Bamboo Viscose** with relaxed silhouettes for zero-friction daily wear.\n\n`;
      reply += `*If you must wear polyester, reserve it for loose-fitting outerwear over a soft 100% cotton undershirt.*`;
    } else {
      reply += `Polyester is durable and wrinkle-resistant, but has low moisture regain (0.4%). For active sportswear with advanced capillary moisture-wicking weaves, it performs well. However, for direct epidermal contact on sensitive skin, natural cellulosic fibers are preferred.\n\n`;
      reply += `> 🌿 **Alternative:** Check out our 100% Organic Cotton and Linen catalog items below.`;
    }

    const safeResults = queryCatalog({
      preferredFabrics: ["100% GOTS Organic Cotton", "Linen"],
      excludeMaterials: ["Polyester"],
      skinType: skinType,
      limit: 3,
    });

    return {
      reply,
      source: "conversational-ai",
      matchedProducts: safeResults.items,
      suggestedPills: [
        "Show me 100% cotton clothes",
        "Show products under ₹2,000",
        "What fabric is suitable for my skin?",
      ],
    };
  }

  // 3. SUITABLE FABRIC RECOMMENDATIONS FOR SKIN
  if (
    lowerQuery.includes("suitable") ||
    lowerQuery.includes("what fabric") ||
    lowerQuery.includes("recommend") ||
    lowerQuery.includes("skin") ||
    lowerQuery.includes("eczema") ||
    lowerQuery.includes("dermatitis") ||
    lowerQuery.includes("irritation") ||
    lowerQuery.includes("safe")
  ) {
    let reply = `Based on your profile (**${skinType}**) and textile dermatology guidelines, here are the most suitable fabrics:\n\n`;
    reply += `1. **100% GOTS Certified Organic Cotton:**\n`;
    reply += `   • *Why:* Natural cellulosic hollow-core fiber with zero chemical pesticide residues and neutral pH compatibility.\n`;
    reply += `   • *Best For:* Base layers, daily tees, and underwear.\n\n`;
    reply += `2. **Pure Flax Linen:**\n`;
    reply += `   • *Why:* Wide natural slub structure allows maximum evaporative airflow in humid or warm weather.\n`;
    reply += `   • *Best For:* Casual shirts and relaxed trousers.\n\n`;
    reply += `3. **Bamboo Viscose / Tencel Lyocell:**\n`;
    reply += `   • *Why:* Closed-loop circular fiber with an ultra-low coefficient of friction that glides smoothly over irritated skin.\n\n`;
    reply += `> 🩺 **Clinical Note:** This recommendation is for comfort and non-medical clothing selection. If you have severe, persistent, or blistering lesions, consult a dermatologist.\n\n`;
    reply += `Here are verified, skin-safe products from our catalog that match your skin profile:`;

    const suitableResults = queryCatalog({
      preferredFabrics: ["100% GOTS Organic Cotton", "Linen", "Bamboo Viscose"],
      skinType: skinType,
      limit: 3,
    });

    return {
      reply,
      source: "conversational-ai",
      matchedProducts: suitableResults.items,
      suggestedPills: [
        "Show me products under ₹2,000",
        "Is polyester suitable?",
        "Exclude all synthetic polyester",
      ],
    };
  }

  // 4. RETRIEVE EARLIER RECOMMENDATIONS FROM CONVERSATION HISTORY
  if (lowerQuery.includes("earlier") || lowerQuery.includes("previous") || lowerQuery.includes("before") || lowerQuery.includes("last recommend")) {
    const aiTurns = history.filter((m) => m.sender === "ai" && m.matchedProducts && m.matchedProducts.length > 0);
    if (aiTurns.length > 0) {
      const lastTurn = aiTurns[aiTurns.length - 1];
      const prods = lastTurn.matchedProducts || [];
      let reply = `Earlier in our conversation, I recommended the following items based on your preferences:\n\n`;
      prods.slice(0, 3).forEach((p, idx) => {
        reply += `${idx + 1}. **${p.product.name}** (₹${p.product.price}) - ${p.product.fabric}\n`;
      });
      reply += `\nWould you like to refine this search by price, fabric type, or color?`;

      return {
        reply,
        source: "conversational-ai",
        matchedProducts: prods,
        suggestedPills: ["Show me products under ₹2,000", "Show cotton only", "What fabric is suitable for my skin?"],
      };
    }
  }

  // 5. RULE-BASED OUTFIT STYLIST
  const ruleMatch = getAssistantRuleResponse(query);
  if (ruleMatch) {
    const products = queryCatalog({ query, skinType, limit: 3 }).items;
    return {
      reply: `### Style AI Expert Recommendation\n\n${ruleMatch}\n\n> 🩺 **Clinical Note:** Selected for dermatological compatibility and all-day thermal regulation.`,
      source: "conversational-ai",
      matchedProducts: products,
      suggestedPills: [
        "Show me products under ₹2,000",
        "What fabric is suitable for my skin?",
        "Is polyester suitable?",
      ],
    };
  }

  // 6. DEFAULT INTELLIGENT TEXTILE ASSISTANT RESPONSE
  const fallbackCatalog = queryCatalog({ skinType, limit: 3 }).items;
  return {
    reply: `Hello! I am your **Style AI Assistant**, trained on textile dermatology and our verified 1,000-record sustainable fashion catalog.\n\n` +
      `You can ask me questions like:\n` +
      `• *"What fabric is suitable for my skin?"*\n` +
      `• *"Show me products under ₹2,000"*\n` +
      `• *"Is polyester suitable for sensitive skin?"*\n\n` +
      `How can I assist you with your outfit or skin comfort today?`,
    source: "conversational-ai",
    matchedProducts: fallbackCatalog,
    suggestedPills: [
      "What fabric is suitable for my skin?",
      "Show me products under ₹2,000",
      "Is polyester suitable?",
    ],
  };
}
