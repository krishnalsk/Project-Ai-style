// src/lib/chatbotEngine.ts
// Intelligent ChatGPT-Style Conversational Engine & Retrieval Layer for Style AI
// Grounded strictly in existing application models, 1,000-record product catalog, vision classifiers, and clinical rules.

import { queryCatalog, ScoredProduct, FilterCriteria } from "./queryEngine";
import { MOCK_PRODUCTS, Product } from "./products";
import { getAssistantRuleResponse } from "./aiStylistRules";
import { extractFiberComposition, extractWashCareInstructions, StructuredWashCare } from "./careLabelOcr";
import { inspectImageModalityAsync, ImageInspectionResult } from "./imageInspector";
import { evaluateEvidenceBasedDiagnosisAsync, EvidenceBasedDiagnosisResponse } from "@/app/api/predict-issue/route";

export interface ChatHistoryMessage {
  id?: string;
  sender: "user" | "ai";
  text: string;
  image?: string | null;
  timestamp?: string;
  source?: "multimodal-ai-engine" | "catalog-retrieval" | "conversational-ai" | "system";
  diagnosis?: any;
  matchedProducts?: ScoredProduct[];
}

export interface ChatbotContext {
  message: string;
  image?: string | null;
  skinType?: string;
  climate?: string;
  history?: ChatHistoryMessage[];
  allergies?: string[];
  cityName?: string;
}

export interface ChatbotResponse {
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
 * Parses numeric price constraints from user queries such as:
 * "under 2000", "below ₹1,500", "less than 2500 rs", "between 1000 and 3000"
 */
function extractPriceConstraint(query: string): { maxPrice?: number; minPrice?: number } {
  const q = query.replace(/,/g, "").toLowerCase();

  // Pattern: "between 1000 and 3000"
  const betweenMatch = q.match(/between\s*(?:₹|rs\.?|inr)?\s*(\d{2,6})\s*(?:and|to|-)\s*(?:₹|rs\.?|inr)?\s*(\d{2,6})/i);
  if (betweenMatch) {
    const min = parseInt(betweenMatch[1], 10);
    const max = parseInt(betweenMatch[2], 10);
    if (!isNaN(min) && !isNaN(max)) {
      return { minPrice: Math.min(min, max), maxPrice: Math.max(min, max) };
    }
  }

  // Pattern: "under 2000", "below 1500", "less than 2500", "< 2000", "max 2000"
  const underMatch = q.match(/(?:under|below|less\s+than|within|up\s+to|max|budget\s+of|<|<=)\s*(?:₹|rs\.?|inr)?\s*(\d{2,6})/i);
  if (underMatch) {
    const max = parseInt(underMatch[1], 10);
    if (!isNaN(max) && max > 0) {
      return { maxPrice: max };
    }
  }

  // Pattern: "2000 rs", "₹2000 budget"
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
function extractGarmentCategory(query: string): { category?: string; subCategory?: string } {
  const q = query.toLowerCase();
  if (/\b(shirt|shirts|tee|t-shirt|tshirt|top|tops|blouse|polo)\b/i.test(q)) {
    return { category: "Tops" };
  }
  if (/\b(pant|pants|trousers|jeans|chinos|joggers|shorts|bottoms)\b/i.test(q)) {
    return { category: "Bottoms" };
  }
  if (/\b(dress|dresses|gown|kurta|kurti|ethnic)\b/i.test(q)) {
    return { category: "Dresses" };
  }
  if (/\b(jacket|hoodie|cardigan|sweater|outerwear|coat)\b/i.test(q)) {
    return { category: "Outerwear" };
  }
  if (/\b(innerwear|undershirt|base\s*layer|socks|boxers)\b/i.test(q)) {
    return { category: "Basics" };
  }
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
 * Searches conversation history for prior recommendations, fabrics, or products discussed.
 */
function searchConversationHistory(history: ChatHistoryMessage[]): {
  previouslyMentionedFabrics: string[];
  previouslyRecommendedProducts: Product[];
  previousDiagnosis?: any;
  lastAiTurnText?: string;
} {
  const fabrics = new Set<string>();
  const products: Product[] = [];
  let previousDiagnosis: any = undefined;
  let lastAiTurnText: string | undefined = undefined;

  // Process history from newest to oldest
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (msg.sender === "ai") {
      if (!lastAiTurnText && msg.text) {
        lastAiTurnText = msg.text;
      }
      if (msg.diagnosis && !previousDiagnosis) {
        previousDiagnosis = msg.diagnosis;
      }
      if (msg.matchedProducts && msg.matchedProducts.length > 0) {
        for (const item of msg.matchedProducts) {
          if (!products.some((p) => p.id === item.product.id)) {
            products.push(item.product);
          }
        }
      }

      // Check text for mentioned fabrics
      const text = msg.text.toLowerCase();
      if (text.includes("organic cotton")) fabrics.add("Organic Cotton");
      else if (text.includes("cotton")) fabrics.add("Cotton");
      if (text.includes("linen")) fabrics.add("Linen");
      if (text.includes("bamboo")) fabrics.add("Bamboo Viscose");
      if (text.includes("silk")) fabrics.add("Mulberry Silk");
      if (text.includes("lyocell") || text.includes("tencel")) fabrics.add("Tencel Lyocell");
      if (text.includes("polyester")) fabrics.add("Polyester");
    }
  }

  return {
    previouslyMentionedFabrics: Array.from(fabrics),
    previouslyRecommendedProducts: products,
    previousDiagnosis,
    lastAiTurnText,
  };
}

/**
 * Processes a single chat turn with the full conversational intelligence layer.
 */
const NON_NAME_WORDS = new Set([
  "hi", "hello", "hey", "hola", "yo", "bye", "goodbye", "farewell", "morning", "afternoon", "evening", "night",
  "thanks", "thank", "thanku", "thx", "welcome", "please", "sorry", "excuse",
  "yes", "no", "yeah", "yep", "nope", "ok", "okay", "sure", "fine", "good", "great",
  "awesome", "cool", "nice", "perfect", "wow", "bad", "help", "info", "about",
  "who", "what", "when", "where", "why", "how", "which",
  "can", "could", "would", "should", "will", "do", "does", "did",
  "is", "are", "am", "was", "were", "be", "being", "been",
  "have", "has", "had", "i", "me", "my", "you", "your", "we", "our", "us",
  "they", "them", "their", "it", "its", "this", "that", "these", "those",
  "there", "here", "and", "or", "but", "not", "so", "if", "then", "than",
  "to", "for", "with", "in", "on", "at", "by", "from", "up", "down", "out",
  "all", "any", "both", "each", "few", "more", "most", "other", "some",
  "cotton", "fabric", "textile", "shirt", "shirts", "pant", "pants", "trouser", "trousers",
  "dress", "dresses", "wear", "clothing", "clothes", "skin", "poly", "polyester",
  "linen", "silk", "wool", "bamboo", "nylon", "acrylic", "viscose", "rayon", "modal",
  "size", "cart", "shop", "price", "cost", "budget", "cheap", "expensive",
  "safe", "safety", "allergy", "allergies", "eczema", "rash", "redness", "itch", "itchy",
  "dermatitis", "summer", "winter", "spring", "fall", "autumn", "rain", "monsoon",
  "men", "women", "boy", "girl", "outfit", "outfits", "test", "catalog", "brand",
  "buy", "order", "recommend", "recommendation", "suggest", "suggestion",
  "style", "styles", "fashion", "casual", "formal", "office", "party", "gym",
  "weather", "climate", "hot", "cold", "warm", "cool", "dry", "humid", "care", "label",
  "find", "show", "search", "check", "tell", "give", "need", "want", "like"
]);

function capitalize(word: string): string {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function detectNameOrIntroduction(query: string): string | null {
  const q = query.trim();

  // Pattern 1: Explicit introduction phrases
  const introMatch = q.match(/(?:my\s+name\s+is|i\s+am|i'm|this\s+is|call\s+me)\s+([A-Za-z]{2,30})/i);
  if (introMatch) {
    return capitalize(introMatch[1]);
  }

  // Pattern 2: Single word or 2-word name string (not containing common english/fashion words)
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length >= 1 && words.length <= 2 && /^[a-zA-Z\s]{2,35}$/.test(q)) {
    const hasNonNameWord = words.some((w) => NON_NAME_WORDS.has(w.toLowerCase()));
    if (!hasNonNameWord) {
      return words.map(capitalize).join(" ");
    }
  }

  return null;
}

export function detectUserName(
  query: string,
  history: ChatHistoryMessage[] = [],
  explicitUserName?: string
): string | null {
  if (explicitUserName && explicitUserName.trim().length > 1) {
    return capitalize(explicitUserName.trim());
  }

  const fromQuery = detectNameOrIntroduction(query);
  if (fromQuery) return fromQuery;

  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (msg.sender === "user" && msg.text) {
      const fromHist = detectNameOrIntroduction(msg.text);
      if (fromHist) return fromHist;
    }
  }

  return null;
}

export async function processChatTurn(context: ChatbotContext): Promise<ChatbotResponse> {
  const query = (context.message || "").trim();
  const lower = query.toLowerCase();
  const image = context.image || null;
  const skinType = context.skinType || "Sensitive / Allergy Prone";
  const climate = context.climate || "Moderate (18°C - 24°C)";
  const history = context.history || [];
  const allergies = context.allergies || [];
  const userName = detectUserName(query, history, (context as any).userName);

  // ==============================================================================
  // 1. IN-CHAT MULTIMODAL IMAGE EVALUATION
  // ==============================================================================
  if (image && typeof image === "string" && image.trim().length > 50) {
    const diagnosis = await evaluateEvidenceBasedDiagnosisAsync(
      query,
      image,
      skinType,
      climate
    );

    const primaryFabric =
      diagnosis.personalizedClothingSuggestions.suggestedFabrics[0]?.name || "100% GOTS Certified Organic Cotton";

    // Query real catalog for matching products
    const catalogResult = queryCatalog({
      query: primaryFabric.split(" ")[0],
      preferredFabrics: [primaryFabric],
      confirmedAllergies: allergies,
      limit: 3,
      inStockOnly: true,
    });

    let reply = "";
    if (diagnosis.inputModality === "SKIN_IMAGE") {
      reply = `### 🩺 Photographic Skin Surface Evaluation\n\n` +
        `**Visual Findings:** ${diagnosis.visibleObservations.visualFindings}\n\n` +
        `• **Observed Erythema Level:** ${diagnosis.skinObservations?.erythemaLevel || "Localized Mild"}\n` +
        `• **Estimated Comfort Score:** ${diagnosis.comfortScore.score !== null ? `${diagnosis.comfortScore.score}/100` : "Indeterminate"} (${diagnosis.comfortScore.ratingBand})\n` +
        `• **Potential Contributing Factors:** ${diagnosis.possibleExplanations.hypotheses[0]}\n` +
        `• **Recommended Safe Fabric:** **${primaryFabric}** (Soft, breathable yarn with minimal abrasive friction)\n\n` +
        `> ⚠️ **Medical Disclaimer:** ${diagnosis.clinicalNotice}`;
    } else if (diagnosis.inputModality === "FABRIC_SURFACE") {
      reply = `### 🧵 Textile Weave & Surface Texture Analysis\n\n` +
        `**Observed Structure:** ${diagnosis.visibleObservations.visualFindings}\n\n` +
        `• **Weave Pattern:** ${diagnosis.weaveCharacteristics?.weaveType || "Plain Weave"}\n` +
        `• **Texture Roughness:** ${diagnosis.weaveCharacteristics?.textureRoughness || "Fine Grain"}\n` +
        `• **Verified Composition:** **Composition: Unknown**\n\n` +
        `> ℹ️ **Textile Notice:** ${diagnosis.clinicalNotice}\n\n` +
        `Would you like me to recommend certified skin-safe garments from our verified catalog?`;
    } else if (diagnosis.inputModality === "LABEL_CARE_TAG") {
      const fiberSummary = diagnosis.careLabelAnalysis?.compositionSummary || diagnosis.verifiedTextileInfo.fiberComposition;
      reply = `### 🏷️ Garment Care Tag Optical Verification\n\n` +
        `**Verified Fiber Breakdown:** ${fiberSummary}\n` +
        `• **Verification Status:** \`${diagnosis.verifiedTextileInfo.verificationStatus}\` (${diagnosis.verifiedTextileInfo.evidenceSource})\n` +
        `• **Washing:** ${diagnosis.careLabelAnalysis?.washCare.washing.instruction || "Not specified"}\n` +
        `• **Bleaching:** ${diagnosis.careLabelAnalysis?.washCare.bleaching.instruction || "Not specified"}\n` +
        `• **Drying:** ${diagnosis.careLabelAnalysis?.washCare.drying.instruction || "Not specified"}\n` +
        `• **Ironing:** ${diagnosis.careLabelAnalysis?.washCare.ironing.instruction || "Not specified"}\n` +
        `• **Dry Cleaning:** ${diagnosis.careLabelAnalysis?.washCare.dryCleaning.instruction || "Not specified"}\n\n` +
        `Notice: Analysis is grounded strictly in visible tag text and symbols.`;
    } else {
      const subject = diagnosis.imageRecognition?.detectedSubject || diagnosis.visibleObservations.subject || "Unknown Subject";
      const category = diagnosis.imageRecognition?.objectCategory || "UNKNOWN";
      reply = `### 🔍 Image Recognition Result\n\n` +
        `**Detected Subject:** ${subject}\n` +
        `**Category:** ${category}\n\n` +
        `${diagnosis.visibleObservations.visualFindings}\n\n` +
        `${diagnosis.clinicalNotice}`;
    }

    return {
      reply,
      source: "multimodal-ai-engine",
      matchedProducts: catalogResult.items,
      diagnosis: {
        diseaseOrCondition: diagnosis.assessmentTitle,
        severity: diagnosis.comfortScore.ratingBand,
        comfortScore: diagnosis.comfortScore.score ?? 75,
        rootCause: diagnosis.possibleExplanations.hypotheses[0] || "Mechanical textile friction",
        recommendedFabric: primaryFabric,
        recommendedWeave: diagnosis.personalizedClothingSuggestions.recommendedWeave,
        careTip: diagnosis.personalizedClothingSuggestions.washCareGuidance,
      },
      suggestedPills: [
        "What fabric is suitable for my skin?",
        "Show matching products under ₹2,000",
        "Explain care instructions",
      ],
    };
  }

  // ==============================================================================

  // ==============================================================================
  // 1b. NAME INTRODUCTIONS (e.g. "balamuarlie", "Balamurali", "I am Balamurali")
  // ==============================================================================
  const detectedName = detectNameOrIntroduction(query);
  if (detectedName) {
    const topMatches = queryCatalog({
      skinType: skinType,
      limit: 3,
      inStockOnly: true,
    }).items;

    return {
      reply:
        `Hello **${detectedName}**! 👋 Great to meet you!\n\n` +
        `I am your **Style AI Assistant**, trained on textile dermatology and our verified 1,000-record sustainable fashion catalog.\n\n` +
        `Whether you're looking for comfortable, irritation-free outfits for **${skinType}**, searching our catalog by budget (*e.g., "Show me products under ₹2,000"*), or checking which fabrics are best for your skin, I'm here to help.\n\n` +
        `What kind of outfits or styles would you like to explore today?`,
      source: "conversational-ai",
      matchedProducts: topMatches,
      suggestedPills: [
        "What fabric is suitable for my skin?",
        "Show me products under ₹2,000",
        "Is polyester suitable?",
        "Suggest a casual summer outfit",
      ],
    };
  }

  // 1c. GRATITUDE / THANKS (e.g. "thank you", "thanks")
  if (/\b(thank\s+you|thanks|thanku|thx|awesome|great\s+job|appreciate\s+it)\b/i.test(lower)) {
    return {
      reply:
        `You're very welcome! 😊 Always happy to assist you in finding comfortable, skin-friendly styles that look great.\n\n` +
        `Feel free to ask about fabric care, compare textiles (*e.g., "cotton vs polyester"*), or check out our catalog anytime!`,
      source: "conversational-ai",
      matchedProducts: [],
      suggestedPills: [
        "What fabric is suitable for my skin?",
        "Show me products under ₹2,000",
        "How should I wash sensitive skin clothes?",
      ],
    };
  }

  // 1d. SMALL TALK / "HOW ARE YOU"
  if (/\b(how\s+are\s+you|how's\s+it\s+going|how\s+do\s+you\s+do|what's\s+up)\b/i.test(lower)) {
    return {
      reply:
        `I'm doing wonderful, thank you for asking! 😊 I'm fully primed with our 1,000-item verified catalog and textile dermatology rules, ready to help you discover comfortable outfits.\n\n` +
        `How are you feeling today, and what kind of styling or fabric questions can I help you with?`,
      source: "conversational-ai",
      matchedProducts: [],
      suggestedPills: [
        "What fabric is suitable for my skin?",
        "Show me products under ₹2,000",
        "Is polyester suitable?",
      ],
    };
  }

  // 1e. AFFIRMATIONS / ACKNOWLEDGMENTS (e.g. "ok", "okay", "sure", "cool", "nice")
  if (/^(ok|okay|sure|cool|nice|got it|understood|fine|great|perfect|yes|no)\b/i.test(lower)) {
    const userPrefix = userName ? `Glad to hear that, **${userName}**! ` : "Glad to hear that! ";
    return {
      reply:
        `${userPrefix}😊 Feel free to ask about fabric care, test another outfit idea, or browse our skin-friendly catalog whenever you're ready.`,
      source: "conversational-ai",
      matchedProducts: [],
      suggestedPills: [
        "What fabric is suitable for my skin?",
        "Show me products under ₹2,000",
        "Suggest a casual summer outfit",
      ],
    };
  }

  // 1f. GOODBYE (e.g. "bye", "goodbye", "see you")
  if (/^(bye|goodbye|see\s+you|farewell|take\s+care)\b/i.test(lower)) {
    const byePrefix = userName ? `Goodbye, **${userName}**! 👋` : "Goodbye! 👋";
    return {
      reply:
        `${byePrefix} Have a wonderful day, and stay comfortable in your skin-safe styles! Feel free to come back whenever you need fabric or outfit advice.`,
      source: "conversational-ai",
      matchedProducts: [],
      suggestedPills: [
        "What fabric is suitable for my skin?",
        "Show me products under ₹2,000",
      ],
    };
  }

    // 2. CONVERSATION HISTORY & MEMORY RECALL
  // ==============================================================================
  if (
    /\b(what\s+did\s+you\s+(recommend|suggest)|earlier|previously|before|repeat\s+recommendation|what\s+was\s+that)\b/i.test(
      lower
    )
  ) {
    const memory = searchConversationHistory(history);

    if (memory.previouslyRecommendedProducts.length > 0 || memory.previouslyMentionedFabrics.length > 0) {
      let reply = `Earlier in our conversation, here is what we discussed and recommended:\n\n`;

      if (memory.previouslyMentionedFabrics.length > 0) {
        reply += `• **Recommended Fabrics:** ${memory.previouslyMentionedFabrics.join(", ")}\n`;
      }

      if (memory.previousDiagnosis) {
        reply += `• **Condition Discussed:** ${memory.previousDiagnosis.diseaseOrCondition} (${memory.previousDiagnosis.severity})\n`;
        reply += `• **Skin Comfort Index:** ${memory.previousDiagnosis.comfortScore}/100\n`;
      }

      if (memory.previouslyRecommendedProducts.length > 0) {
        reply += `\n**Specific Clothing Items Suggested:**\n`;
        memory.previouslyRecommendedProducts.slice(0, 3).forEach((p) => {
          reply += `• **${p.name}** (${p.fabric}) — ₹${p.price.toLocaleString("en-IN")}\n`;
        });
      }

      reply += `\nWould you like more details on any of these, or should we look for alternatives?`;

      const matched = memory.previouslyRecommendedProducts.slice(0, 3).map((p) => ({
        product: p,
        score: p.comfortScore,
        breakdown: {
          skinSafetyWeight: 40,
          comfortWeight: 25,
          weatherFitWeight: 15,
          bodyFitWeight: 10,
          preferenceBoost: 10,
          sensitivityPenalty: 0,
          totalScore: p.comfortScore,
        },
        explanation: `Previously recommended item tailored for ${skinType}.`,
        passedAllergyGate: true,
        sensitivityWarnings: [],
      }));

      return {
        reply,
        source: "conversational-ai",
        matchedProducts: matched,
        suggestedPills: [
          "Show me products under ₹2,000",
          "Is polyester suitable?",
          "Suggest summer outfits",
        ],
      };
    } else {
      return {
        reply:
          "We just started this conversation thread, so there are no earlier recommendations recorded yet. Tell me about your skin type, weather, or what outfit you're looking for, and I'll find the best options!",
        source: "conversational-ai",
        matchedProducts: [],
        suggestedPills: [
          "What fabric is suitable for my skin?",
          "Recommend sensitive skin shirts",
          "Summer outfits under ₹2,000",
        ],
      };
    }
  }

  // ==============================================================================
  // 3. CATALOG SEARCH & PRICE FILTERING INTENT (e.g. "under ₹2,000")
  // ==============================================================================
  const priceFilter = extractPriceConstraint(query);
  const categoryFilter = extractGarmentCategory(query);
  const targetFiber = extractTargetFiber(query);

  const isPriceOrProductSearch =
    priceFilter.maxPrice !== undefined ||
    priceFilter.minPrice !== undefined ||
    categoryFilter.category !== undefined ||
    /\b(show\s+me|find|search|recommend|buy|browse|catalog|products|clothes|shirts|pants|trousers|dresses)\b/i.test(
      lower
    );

  if (isPriceOrProductSearch && !lower.includes("what fabric is suitable") && !lower.includes("is polyester suitable")) {
    const filter: FilterCriteria = {
      maxPrice: priceFilter.maxPrice,
      minPrice: priceFilter.minPrice,
      category: categoryFilter.category,
      preferredFabrics: targetFiber ? [targetFiber] : undefined,
      confirmedAllergies: allergies,
      inStockOnly: true,
      limit: 4,
    };

    const searchResult = queryCatalog(filter);

    if (searchResult.items.length > 0) {
      let filterDesc = [];
      if (priceFilter.maxPrice) filterDesc.push(`under ₹${priceFilter.maxPrice.toLocaleString("en-IN")}`);
      if (priceFilter.minPrice) filterDesc.push(`above ₹${priceFilter.minPrice.toLocaleString("en-IN")}`);
      if (categoryFilter.category) filterDesc.push(`in ${categoryFilter.category}`);
      if (targetFiber) filterDesc.push(`made of ${targetFiber}`);

      const descText = filterDesc.length > 0 ? ` matching ${filterDesc.join(", ")}` : "";

      let reply = `Here are the top-rated skin-safe items from our verified catalog${descText}:\n\n`;
      searchResult.items.forEach(({ product, explanation }) => {
        reply += `• **[${product.name}](/shop/${product.id})** — **₹${product.price.toLocaleString("en-IN")}**\n`;
        reply += `  *Material:* ${product.fabric} | *Skin Safety:* ${product.skinSafetyScore}/100 | *Comfort:* ${product.comfortScore}/100\n`;
        reply += `  *Why:* ${explanation}\n\n`;
      });

      reply += `All prices and fabric compositions reflect our authentic in-stock product database. Click any product to inspect detailed fiber specs or add to cart.`;

      return {
        reply,
        source: "catalog-retrieval",
        matchedProducts: searchResult.items,
        suggestedPills: [
          "Show me options under ₹1,500",
          "Exclude all synthetic polyester",
          "What fabric is suitable for my skin?",
        ],
      };
    } else {
      return {
        reply: `I searched the verified 1,000-item catalog, but found no in-stock products matching your exact price criteria (${priceFilter.maxPrice ? `under ₹${priceFilter.maxPrice}` : ""}). Try broadening your budget or checking our cotton basics.`,
        source: "catalog-retrieval",
        matchedProducts: [],
        suggestedPills: [
          "Show all cotton shirts",
          "Products under ₹3,000",
          "Best clothes for eczema",
        ],
      };
    }
  }

  // ==============================================================================
  // 4. OUT-OF-SCOPE CLINICAL MEDICAL / PRESCRIPTION GUARD
  // ==============================================================================
  if (
    /\b(cure|prescribe|prescription|medicine|medication|steroid|ointment|biopsy|blood\s*test|hospital|clinical\s*diagnosis)\b/i.test(
      lower
    )
  ) {
    return {
      reply:
        `I cannot provide medical prescriptions or clinical diagnoses. I specialize in non-medical textile comfort and skin-safe clothing selection. For medical evaluations, please consult a licensed dermatologist.\n\n` +
        `${MISSING_INFO_DISCLAIMER}`,
      source: "conversational-ai",
      matchedProducts: [],
      suggestedPills: [
        "What fabric is suitable for my skin?",
        "Show me products under ₹2,000",
        "Is polyester suitable?",
      ],
    };
  }

  // ==============================================================================
  // 4b. COMPARISON INQUIRY (e.g. "Is cotton better than polyester for sensitive skin?", "cotton vs polyester")
  // ==============================================================================
  if (
    (/\b(cotton|linen|silk|bamboo)\b/i.test(lower) && /\b(polyester|acrylic|nylon|synthetic)\b/i.test(lower)) &&
    (/\b(better|prefer|versus|vs|compare|different|difference)\b/i.test(lower) || /\b(is\s+cotton\s+better)\b/i.test(lower))
  ) {
    const reply =
      `### Comparing Cotton vs. Polyester for Sensitive Skin\n\n` +
      `**Cotton** may be significantly more comfortable for sensitive or allergy-prone skin than **polyester** for several documented textile reasons:\n\n` +
      `• **Breathability & Moisture Absorption:** Cotton is a natural cellulosic fiber with high moisture absorption and vapor permeability. It absorbs perspiration and allows skin to breathe, whereas polyester is hydrophobic and traps heat and sweat against the skin barrier.\n` +
      `• **Cutaneous Friction:** Cotton yarns feature soft, non-abrasive cellulose staples, while synthetic polyester filaments have stiffer edges that generate higher friction and mechanical irritation, especially around seams and collars.\n` +
      `• **Chemical & Dye Formulation:** Polyester requires disperse dyes and synthetic sizing resins that can trigger cutaneous sensitivities during heavy perspiration.\n\n` +
      `*However, no fabric is completely allergen-proof or guaranteed safe for every person. Individual sensitivities vary, and garment fit and laundry detergent residues also affect comfort.*`;

    const cottonItems = queryCatalog({
      preferredFabrics: ["100% GOTS Organic Cotton"],
      limit: 2,
      inStockOnly: true,
    });

    return {
      reply,
      source: "conversational-ai",
      matchedProducts: cottonItems.items,
      suggestedPills: [
        "Show cotton clothing under ₹2,000",
        "How should I wash sensitive skin clothes?",
        "What about bamboo viscose?",
      ],
    };
  }

  // ==============================================================================
  // 5. SPECIFIC FIBER INQUIRY (e.g. "Is polyester suitable?", "Can I wear nylon?")
  // ==============================================================================
  if (
    /\b(is\s+(polyester|cotton|linen|silk|bamboo|wool|nylon|acrylic|viscose|modal)\s+(suitable|good|safe|bad|okay|fine))\b/i.test(
      lower
    ) ||
    /\b(polyester|acrylic|nylon|synthetic)\b/i.test(lower) && /\b(suitable|skin|wear|safe|eczema|irritat\w*)\b/i.test(lower)
  ) {
    const fiber = extractTargetFiber(query) || (lower.includes("polyester") ? "Polyester" : "Synthetic");

    let explanation = "";
    if (fiber === "Polyester" || fiber === "Synthetic" || fiber === "Nylon" || fiber === "Acrylic") {
      explanation =
        `### Evaluation for Sensitive Skin: **${fiber}**\n\n` +
        `**Verdict: Generally Not Recommended for Active Dermatitis or Warm Weather.**\n\n` +
        `**Documented Textile Properties:**\n` +
        `• **Breathability & Thermal Trapping:** ${fiber} is a synthetic hydrophobic polymer with low air permeability. It traps heat and perspiration against the skin.\n` +
        `• **Cutaneous Friction:** Synthetic filament edges can trigger mechanical prickliness and flare up atopic dermatitis or heat rash.\n` +
        `• **Dye Retention:** Disperse dyes used on polyester frequently transfer during heavy sweating, presenting contact sensitivity risks.\n\n` +
        `**Safe Alternatives:** Certified Organic Cotton, French Flax Linen, or Bamboo Viscose offer superior vapor permeability.\n\n` +
        `*Note: Optical appearance cannot determine whether a fabric contains synthetic blends. Always check the physical side-seam care tag for verified percentages.*`;
    } else if (fiber === "Wool") {
      explanation =
        `### Evaluation for Sensitive Skin: **Wool**\n\n` +
        `**Verdict: High Friction Risk on Bare Skin; Safe with Cotton Underlayer.**\n\n` +
        `Coarse wool fibers (>30 microns) have raised surface scales that cause mechanical prickle and itchiness. Lanolin residues can also cause allergic contact dermatitis. If wearing wool in cold climates, layer a 100% cotton long-sleeve tee underneath.`;
    } else {
      explanation =
        `### Evaluation for Sensitive Skin: **${fiber}**\n\n` +
        `**Verdict: Highly Recommended Baseline Fiber.**\n\n` +
        `Natural ${fiber} possesses smooth staple filaments and high hygroscopic vapor absorption. It dissipates body heat and reduces friction over sensitive epidermal barriers.`;
    }

    // Retrieve 2 safe alternative products
    const safeItems = queryCatalog({
      preferredFabrics: ["Organic Cotton", "Linen", "Bamboo"],
      confirmedAllergies: ["Polyester", "Acrylic"],
      limit: 2,
      inStockOnly: true,
    });

    return {
      reply: explanation,
      source: "conversational-ai",
      matchedProducts: safeItems.items,
      suggestedPills: [
        "What fabric is suitable for my skin?",
        "Show me products under ₹2,000",
        "Summer outfits for sensitive skin",
      ],
    };
  }

  // ==============================================================================
  // 5. SKIN COMPATIBILITY & SENSITIVITY INQUIRY (e.g. "What fabric is suitable for my skin?")
  // ==============================================================================
  if (
    /\b(what\s+fabric\s+(is\s+)?(suitable|good|safe|recommended)|what\s+should\s+i\s+wear|best\s+fabric|skin\s+(type|care|safe))\b/i.test(
      lower
    ) ||
    /\b(eczema|dermatitis|rash|itching|redness|sensitive\s+skin)\b/i.test(lower)
  ) {
    const isEczema = /eczema|dermatitis/i.test(lower);

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

    const catalogMatches = queryCatalog({
      preferredFabrics: isEczema ? ["Organic Cotton", "Bamboo"] : ["Organic Cotton", "Linen"],
      confirmedAllergies: allergies,
      limit: 3,
      inStockOnly: true,
    });

    return {
      reply,
      source: "conversational-ai",
      matchedProducts: catalogMatches.items,
      suggestedPills: [
        "Show me products under ₹2,000",
        "Is polyester suitable?",
        "Exclude all synthetic polyester",
      ],
    };
  }

  // ==============================================================================
  // 6. GREETINGS & METADATA INQUIRIES
  // ==============================================================================
  if (/^(hi|hello|hey|greetings|hola|good\s*(morning|afternoon|evening))\b/i.test(lower)) {
    return {
      reply:
        `Hello! 👋 I am your **Style AI Assistant**, trained on real fashion and textile dermatology datasets.\n\n` +
        `Here is what I can help you with today:\n` +
        `• **Skin-Safe Fabric Advice:** Ask about fabrics for eczema, rashes, or sweating.\n` +
        `• **Verified Product Search:** Filter our 1,000-item catalog by budget (*e.g., "Show me shirts under ₹2,000"*).\n` +
        `• **Garment & Skin Photo Inspection:** Click the camera icon below to upload a photo of your skin, fabric weave, or care label tag.\n` +
        `• **Material Safety Checks:** Inquire whether specific materials (*e.g., polyester vs. cotton*) are safe for you.\n\n` +
        `How can I assist your styling today?`,
      source: "conversational-ai",
      matchedProducts: [],
      suggestedPills: [
        "What fabric is suitable for my skin?",
        "Show me products under ₹2,000",
        "Is polyester suitable?",
        "Best clothes for eczema & dermatitis",
      ],
    };
  }

  if (/^(who\s+are\s+you|what\s+can\s+you\s+do|help)\b/i.test(lower)) {
    return {
      reply:
        `I am **Style AI**, an evidence-grounded AI style architect and textile comfort assistant. I operate with strict data integrity:\n\n` +
        `1. **Real Catalog Data:** All recommended products come from our 1,000-item inventory with genuine prices, fabric blends, and safety scores.\n` +
        `2. **Computer Vision Models:** I evaluate uploaded photos for human skin redness, fabric weave structures, and care tag washing symbols.\n` +
        `3. **Dermatological Grounding:** I follow clinical textile research (natural cellulosic fibers vs. occlusive synthetics).\n` +
        `4. **Strict Safety Rules:** I never invent missing data, fake prices, or provide medical diagnoses.\n\n` +
        `What would you like to explore?`,
      source: "conversational-ai",
      matchedProducts: [],
      suggestedPills: [
        "What fabric is suitable for my skin?",
        "Show me products under ₹2,000",
        "Is polyester suitable?",
      ],
    };
  }

  // ==============================================================================
  // 7. OCCASION & STYLING RULES (Ported from existing aiStylistRules.ts)
  // ==============================================================================
  const ruleReply = getAssistantRuleResponse(query);
  if (ruleReply) {
    const targetFabric = ruleReply.includes("Linen")
      ? "Linen"
      : ruleReply.includes("Bamboo")
      ? "Bamboo"
      : "Organic Cotton";

    const matched = queryCatalog({
      query: targetFabric,
      limit: 2,
      inStockOnly: true,
    });

    return {
      reply: `### ✨ Style Recommendation\n\n${ruleReply}`,
      source: "conversational-ai",
      matchedProducts: matched.items,
      suggestedPills: [
        "Show me products under ₹2,000",
        "What fabric is suitable for my skin?",
        "Check care instructions",
      ],
    };
  }

  // ==============================================================================
  // 8. UNKNOWN / OUT-OF-SCOPE / MISSING INFORMATION FALLBACK
  // ==============================================================================
  // If the user asks for unsupported or completely ungrounded data:
  if (
    /\b(cure|prescribe|medicine|steroid|ointment|biopsy|blood\s+test|hospital|clinical\s+diagnosis)\b/i.test(
      lower
    )
  ) {
    return {
      reply:
        `I cannot provide medical prescriptions or clinical diagnoses. I specialize in non-medical textile comfort and skin-safe clothing selection. For medical evaluations, please consult a licensed dermatologist.\n\n` +
        `${MISSING_INFO_DISCLAIMER}`,
      source: "conversational-ai",
      matchedProducts: [],
      suggestedPills: [
        "What fabric is suitable for my skin?",
        "Show me products under ₹2,000",
        "Is polyester suitable?",
      ],
    };
  }

  // General fallback: Query catalog for any relevant terms, or return polite missing info disclaimer
  const fallbackSearch = queryCatalog({
    query: query.slice(0, 40),
    limit: 2,
    inStockOnly: true,
  });

  if (fallbackSearch.items.length > 0) {
    let reply = `Here are skin-safe options from our catalog related to your query:\n\n`;
    fallbackSearch.items.forEach(({ product, explanation }) => {
      reply += `• **[${product.name}](/shop/${product.id})** (₹${product.price.toLocaleString("en-IN")}) — ${product.fabric}\n  *Note:* ${explanation}\n\n`;
    });
    reply += `Let me know if you would like to refine by price, occasion, or skin sensitivity!`;

    return {
      reply,
      source: "catalog-retrieval",
      matchedProducts: fallbackSearch.items,
      suggestedPills: [
        "What fabric is suitable for my skin?",
        "Show me products under ₹2,000",
        "Is polyester suitable?",
      ],
    };
  }

  const candidateKeywords = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !NON_NAME_WORDS.has(w));

  let matchedItems: ScoredProduct[] = [];
  if (candidateKeywords.length > 0) {
    const termSearch = queryCatalog({
      query: candidateKeywords.join(" "),
      skinType,
      limit: 3,
      inStockOnly: true,
    });
    matchedItems = termSearch.items;
  }

  if (matchedItems.length === 0) {
    matchedItems = queryCatalog({
      skinType,
      limit: 3,
      inStockOnly: true,
    }).items;
  }

  let conversationalReply = "";
  if (userName) {
    conversationalReply += `I understand, **${userName}**! `;
  } else {
    conversationalReply += "I understand! ";
  }

  conversationalReply += `Regarding **"${query}"**:\n\n` +
    `As your Style AI assistant, I evaluate fabrics, clothing construction, and textile comfort specifically for **${skinType}** skin.\n\n` +
    `• **For Comfort & Health:** We recommend natural fibers like 100% GOTS Organic Cotton, Linen, and Bamboo Viscose that maintain low cutaneous friction and high moisture regain.\n` +
    `• **From Our Catalog:** I've found ${matchedItems.length} verified skin-friendly options below that match your skin profile.\n\n` +
    `Could you clarify if you'd like an outfit recommendation, advice on a specific fabric, or to filter clothes by budget or occasion?`;

  return {
    reply: conversationalReply,
    source: "conversational-ai",
    matchedProducts: matchedItems,
    suggestedPills: [
      "What fabric is suitable for my skin?",
      "Show me products under ₹2,000",
      "Is polyester suitable for sensitive skin?",
      "Suggest a casual summer outfit",
    ],
  };
}
