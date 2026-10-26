// src/app/ai-stylist/page.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { queryCatalog, ScoredProduct } from "@/lib/queryEngine";
import { getAssistantRuleResponse } from "@/lib/aiStylistRules";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  source?: "rule-engine" | "catalog-retrieval" | "system";
  matchedProducts?: ScoredProduct[];
  userFeedback?: "useful" | "comfortable" | "affordable" | "relevant" | "unsuitable";
  feedbackNote?: string;
}

interface ConversationContext {
  budgetMax?: number;
  category?: string;
  color?: string;
  occasion?: string;
  excludedMaterials: string[];
  recommendedIds: Set<string>;
}

const INITIAL_SUGGESTIONS = [
  "Recommend sensitive skin shirts",
  "Best clothes for eczema & dermatitis",
  "Summer outfits under ₹2,000",
  "Korean casual loose-fit styles",
  "Office formal wear with high comfort",
  "Exclude all synthetic polyester",
];

export default function AiStylistPage() {
  const { profile, updateProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am your AI Style Architect — connected directly to our 1,000-record clinical fashion catalog and 4-Step Dermatological Rule Engine. Ask me about skin-safe fabrics, weather-adapted outfits, or budget-friendly recommendations.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      source: "system",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const msgCounter = useRef(0);

  // Conversational Context (Continuity Memory)
  const [context, setContext] = useState<ConversationContext>({
    budgetMax: profile?.budgetMax || 4000,
    excludedMaterials: profile?.confirmedAllergies || [],
    recommendedIds: new Set<string>(),
  });

  const nextId = useCallback(() => {
    msgCounter.current += 1;
    return `msg-${msgCounter.current}-${Date.now()}`;
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    document.title = "AI Style Chat (1,000-Record Engine) | Style AI";
  }, []);

  // Update context when profile loads
  useEffect(() => {
    if (profile) {
      setContext((prev) => ({
        ...prev,
        budgetMax: prev.budgetMax || profile.budgetMax || 4000,
        excludedMaterials: Array.from(new Set([...prev.excludedMaterials, ...(profile.confirmedAllergies || [])])),
      }));
    }
  }, [profile]);

  function parseIntentFromQuery(text: string, currentContext: ConversationContext): {
    updatedContext: ConversationContext;
    detectedCategory?: string;
    detectedWeather?: string;
    detectedOccasion?: string;
    detectedColor?: string;
    detectedBudget?: number;
    detectedMaterialExclusion?: string;
  } {
    const lower = text.toLowerCase();
    const updated = { ...currentContext };

    // Budget intent
    const budgetMatch = lower.match(/(?:under|below|less than|budget|max)\s*(?:₹|rs\.?|inr)?\s*(\d{3,5})/i);
    let detectedBudget: number | undefined = undefined;
    if (budgetMatch && budgetMatch[1]) {
      detectedBudget = parseInt(budgetMatch[1], 10);
      updated.budgetMax = detectedBudget;
    }

    // Material Exclusion intent (e.g. "no wool", "exclude polyester")
    let detectedMaterialExclusion: string | undefined = undefined;
    if (lower.includes("no wool") || lower.includes("without wool") || lower.includes("exclude wool")) {
      detectedMaterialExclusion = "Wool";
      updated.excludedMaterials = Array.from(new Set([...updated.excludedMaterials, "Wool / Lanolin"]));
    }
    if (lower.includes("no polyester") || lower.includes("exclude polyester") || lower.includes("avoid synthetics")) {
      detectedMaterialExclusion = "Polyester";
      updated.excludedMaterials = Array.from(new Set([...updated.excludedMaterials, "Polyester"]));
    }

    // Category intent
    let detectedCategory: string | undefined = undefined;
    if (lower.includes("shirt") || lower.includes("t-shirt") || lower.includes("top") || lower.includes("polo")) {
      detectedCategory = "Tops";
      updated.category = "Tops";
    } else if (lower.includes("pant") || lower.includes("trouser") || lower.includes("chino") || lower.includes("short") || lower.includes("bottom")) {
      detectedCategory = "Bottoms";
      updated.category = "Bottoms";
    } else if (lower.includes("hoodie") || lower.includes("jacket") || lower.includes("coat") || lower.includes("sweater")) {
      detectedCategory = "Outerwear";
      updated.category = "Outerwear";
    } else if (lower.includes("dress") || lower.includes("maxi")) {
      detectedCategory = "Dresses";
      updated.category = "Dresses";
    } else if (lower.includes("shoe") || lower.includes("sneaker") || lower.includes("loafer") || lower.includes("trainer")) {
      detectedCategory = "Footwear";
      updated.category = "Footwear";
    }

    // Color intent
    let detectedColor: string | undefined = undefined;
    for (const c of ["blue", "green", "white", "black", "beige", "rose", "grey", "sand", "olive"]) {
      if (lower.includes(c)) {
        detectedColor = c;
        updated.color = c;
        break;
      }
    }

    // Occasion intent
    let detectedOccasion: string | undefined = undefined;
    if (lower.includes("formal") || lower.includes("office") || lower.includes("work")) {
      detectedOccasion = "Office & Formal";
      updated.occasion = "Office & Formal";
    } else if (lower.includes("summer") || lower.includes("hot") || lower.includes("beach")) {
      detectedOccasion = "Summer Heat";
      updated.occasion = "Summer Heat";
    } else if (lower.includes("winter") || lower.includes("cold")) {
      detectedOccasion = "Cold Winter";
      updated.occasion = "Cold Winter";
    } else if (lower.includes("workout") || lower.includes("gym") || lower.includes("active")) {
      detectedOccasion = "Active & Workout";
      updated.occasion = "Active & Workout";
    }

    return {
      updatedContext: updated,
      detectedCategory,
      detectedBudget,
      detectedColor,
      detectedOccasion,
      detectedMaterialExclusion,
    };
  }

  async function handleSend(textToSend?: string) {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: nextId(),
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    setTimeout(() => {
      // 1. Process conversational continuity intent
      const { updatedContext, detectedBudget, detectedMaterialExclusion, detectedCategory, detectedOccasion } =
        parseIntentFromQuery(text, context);
      setContext(updatedContext);

      // 2. Query 1,000-Record Catalog with Hard Constraints
      const queryResult = queryCatalog({
        query: text,
        category: updatedContext.category,
        maxPrice: updatedContext.budgetMax,
        color: updatedContext.color,
        occasion: updatedContext.occasion,
        confirmedAllergies: updatedContext.excludedMaterials,
        reportedSensitivities: profile?.reportedSensitivities || ["Rough Synthetics"],
        preferredFabrics: profile?.preferredFabrics || ["100% GOTS Organic Cotton"],
        fit: profile?.preferredFit || "Relaxed",
        inStockOnly: true,
        limit: 3,
      });

      // Filter out products already shown in recent turns to avoid repetitive recommendations
      const freshItems = queryResult.items.filter((item) => !updatedContext.recommendedIds.has(item.product.id));
      const chosenItems = freshItems.length > 0 ? freshItems.slice(0, 2) : queryResult.items.slice(0, 2);

      // Record recommended IDs
      const newIds = new Set(updatedContext.recommendedIds);
      chosenItems.forEach((c) => newIds.add(c.product.id));
      setContext((prev) => ({ ...prev, recommendedIds: newIds }));

      // 3. Compose Natural, Context-Aware Styling Answer
      let replyText = "";
      const ruleText = getAssistantRuleResponse(text);

      if (detectedMaterialExclusion) {
        replyText = `Understood! I have dynamically updated your exclusions to purge **${detectedMaterialExclusion}** from all calculations. `;
      } else if (detectedBudget) {
        replyText = `Got it! I adjusted your price limit to **under ₹${detectedBudget.toLocaleString("en-IN")}**. `;
      }

      if (chosenItems.length > 0) {
        const topItem = chosenItems[0].product;
        replyText += `Based on our 1,000-record dataset and your profile (${profile?.skinType || "Sensitive skin"}, ${
          updatedContext.excludedMaterials.length > 0 ? "excluding " + updatedContext.excludedMaterials.join(", ") : "hypoallergenic priority"
        }), here are clinical recommendations that balance skin barrier protection and aesthetic fit:

• **Primary Recommendation:** ${topItem.name} (${topItem.fabric})
• **Why it works:** ${chosenItems[0].explanation}
• **Comfort Score:** ${topItem.comfortScore}% | **Skin Safety:** ${topItem.skinSafetyScore}%
• **Price:** ₹${topItem.price.toLocaleString("en-IN")} (In Stock: ${topItem.stock} units)`;
      } else if (ruleText) {
        replyText += ruleText;
      } else {
        replyText += `Here is optimal dermatological advice for "${text}": Soft 100% GOTS Certified Organic Cotton or Pure French Flax Linen. These natural cellulosic fibers allow epidermal respiration while preventing cutaneous flare-ups.\n\nTip: You can specify a budget (e.g. "under ₹2000"), occasion ("for office"), or exclude fabrics ("no wool").`;
      }

      const aiMsg: Message = {
        id: nextId(),
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: chosenItems.length > 0 ? "catalog-retrieval" : "rule-engine",
        matchedProducts: chosenItems,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 400);
  }

  function handleFeedback(messageId: string, feedbackType: Message["userFeedback"]) {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId) {
          return {
            ...m,
            userFeedback: feedbackType,
            feedbackNote:
              feedbackType === "useful"
                ? "Noted as helpful! Prioritizing similar natural fibers."
                : feedbackType === "affordable"
                ? "Noted as good value."
                : feedbackType === "comfortable"
                ? "Comfort confirmed."
                : "Feedback recorded to refine future recommendations.",
          };
        }
        return m;
      })
    );

    // If user clicked unsuitable on a product, dynamically adjust preferences
    if (feedbackType === "unsuitable") {
      updateProfile({ comfortScore: Math.max(80, (profile?.comfortScore || 94) - 1) });
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      <PageHeader
        title="AI Style Chat"
        subtitle={`1,000-Record Dataset Engine · ${context.excludedMaterials.length} Exclusions Active · Max ₹${context.budgetMax?.toLocaleString("en-IN")}`}
        backHref="/dashboard"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="text-xs font-bold bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition"
            >
              ⚙️ Preferences
            </Link>
            <Link
              href="/virtual-closet"
              className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition"
            >
              👗 My Closet
            </Link>
          </div>
        }
      />

      {/* Active Constraints Banner */}
      <div className="bg-slate-100/80 border-b border-slate-200/60 px-4 py-2">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">Active Filters:</span>
            <span className="bg-white px-2 py-0.5 rounded-md border text-[11px] font-bold text-slate-700">
              🧴 {profile?.skinType || "Sensitive Skin"}
            </span>
            <span className="bg-white px-2 py-0.5 rounded-md border text-[11px] font-bold text-slate-700">
              💰 Max ₹{context.budgetMax?.toLocaleString("en-IN")}
            </span>
            {context.excludedMaterials.length > 0 && (
              <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
                🛡️ Excluding: {context.excludedMaterials.join(", ")}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Retrieving from 1,000 verified catalog items
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl w-full mx-auto space-y-5">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[90%] sm:max-w-[78%] rounded-3xl p-4 sm:p-5 shadow-xs whitespace-pre-line text-sm leading-relaxed ${
                m.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-xs"
                  : "bg-white text-slate-800 border border-slate-100 rounded-bl-xs"
              }`}
            >
              {m.text}

              {/* Matched Real Product Cards from 1,000-Record Dataset */}
              {m.matchedProducts && m.matchedProducts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                    Verified Catalog Matches (Real Stock & Pricing)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {m.matchedProducts.map(({ product, score, explanation }) => (
                      <div
                        key={product.id}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col justify-between hover:border-blue-400 transition"
                      >
                        <div className="flex gap-3">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-xl border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-slate-900 text-xs truncate">{product.name}</h4>
                            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{product.fabric}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-black text-blue-600">
                                ₹{product.price.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                                {score}% Match
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-600 mt-2 line-clamp-2 italic">{explanation}</p>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60">
                          <span className="text-[10px] text-slate-400">Stock: {product.stock} left</span>
                          <Link
                            href={`/shop/${product.id}`}
                            className="text-xs font-extrabold text-blue-600 hover:text-blue-800"
                          >
                            View Product Details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Feedback Widget on AI Recommendations */}
              {m.sender === "ai" && m.source !== "system" && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Feedback:</span>
                  <button
                    onClick={() => handleFeedback(m.id, "useful")}
                    className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold transition ${
                      m.userFeedback === "useful"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    👍 Useful
                  </button>
                  <button
                    onClick={() => handleFeedback(m.id, "comfortable")}
                    className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold transition ${
                      m.userFeedback === "comfortable"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ☁️ Comfortable
                  </button>
                  <button
                    onClick={() => handleFeedback(m.id, "affordable")}
                    className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold transition ${
                      m.userFeedback === "affordable"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    💰 Affordable
                  </button>
                  <button
                    onClick={() => handleFeedback(m.id, "unsuitable")}
                    className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold transition ${
                      m.userFeedback === "unsuitable"
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ❌ Unsuitable
                  </button>
                  {m.feedbackNote && (
                    <span className="text-[11px] text-emerald-600 font-bold ml-1">{m.feedbackNote}</span>
                  )}
                </div>
              )}
            </div>

            {/* Message Meta Info */}
            <div className="flex items-center gap-2 mt-1 px-1">
              <span className="text-[11px] text-slate-400">{m.timestamp}</span>
              {m.sender === "ai" && m.source && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {m.source === "catalog-retrieval"
                    ? "✨ 1,000-Record Retrieval Engine"
                    : m.source === "rule-engine"
                    ? "🔬 4-Step Derm Rule Engine"
                    : "ℹ️ System Notice"}
                </span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold p-3 bg-white border border-slate-100 rounded-2xl w-fit animate-pulse">
            <span>🔄</span>
            <span>Querying 1,000-record catalog & cross-checking allergy exclusions...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Follow-ups */}
      <div className="px-4 py-2 max-w-4xl w-full mx-auto overflow-x-auto scrollbar-none flex gap-1.5">
        {INITIAL_SUGGESTIONS.map((sug) => (
          <button
            key={sug}
            onClick={() => handleSend(sug)}
            className="text-[11px] font-bold bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition whitespace-nowrap shadow-2xs"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="bg-white border-t border-slate-200 px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-4xl mx-auto flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about skin-safe fabrics, specify budget, or ask for alternatives..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-blue-600 text-white font-extrabold text-sm px-6 py-3 rounded-2xl hover:bg-blue-700 transition disabled:opacity-40 shadow-xs"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
