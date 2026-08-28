"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
  category: "Skin Safety" | "AI Stylist" | "Certifications" | "Orders & Points";
}

const FAQS: FAQItem[] = [
  {
    category: "Skin Safety",
    question: "How does Style AI determine if a fabric is skin-safe?",
    answer: "Our XGBoost machine learning model analyzes fabric composition, breathability index, moisture dissipation speed, and fiber friction coefficient against dermatological datasets for sensitive skin, eczema, and dermatitis.",
  },
  {
    category: "Skin Safety",
    question: "Why should synthetic fabrics like polyester be avoided for eczema?",
    answer: "Synthetic fibers trap heat and body moisture against the skin. This creates a warm microclimate that encourages bacterial proliferation and aggravates eczema and contact dermatitis flare-ups.",
  },
  {
    category: "AI Stylist",
    question: "How does the AI Stylist work?",
    answer: "The AI Stylist uses a 4-step algorithm: Skin Safety Check → Clothing Weighting → Real-time Weather Adjustment → Structured Output. It provides instant 0ms responses for common questions and uses OpenRouter AI for complex queries.",
  },
  {
    category: "Certifications",
    question: "What does GOTS Certified mean?",
    answer: "Global Organic Textile Standard (GOTS) is the world's leading processing standard for organic fibers. It ensures at least 95% certified organic fibers without hazardous synthetic toxic dyes or heavy metals.",
  },
  {
    category: "Orders & Points",
    question: "How do Style Points work?",
    answer: "You earn 150 points for every eco-certified order and +50 points for completing your Skin Diary entries. Points can be redeemed for discount coupons in the Rewards dashboard.",
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    document.title = "Help & FAQ | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Get help with Style AI");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Help Center & FAQ</h1>
              <p className="text-xs text-slate-500">Dermatology research, fabric science & AI guidance</p>
            </div>
          </div>
          <Link href="/ai-stylist" className="text-xs font-bold text-blue-600 hover:underline">
            Ask AI Stylist →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {FAQS.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={faq.question} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-slate-50 transition"
              >
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
                    {faq.category}
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm block">{faq.question}</span>
                </div>
                <span className="text-slate-400 font-bold text-lg shrink-0">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-50 bg-slate-50/50">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
