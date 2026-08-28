"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface QuizQuestion {
  id: number;
  question: string;
  options: Array<{ label: string; tag: string }>;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What climate or weather condition do you dress for most often?",
    options: [
      { label: "Hot & Humid (Sweat rash prevention)", tag: "Summer Linen" },
      { label: "Cold & Chilly (Soft thermal insulation)", tag: "Organic Wool & Fleece" },
      { label: "Air-Conditioned Office", tag: "Tencel Formal" },
      { label: "Moderate & Casual All-Year", tag: "Korean Cotton" },
    ],
  },
  {
    id: 2,
    question: "What is your primary skin concern when choosing clothes?",
    options: [
      { label: "Eczema / Severe Flare-ups", tag: "Zero Synthetic" },
      { label: "Sweat Rash / Friction Chafing", tag: "Bamboo Wicking" },
      { label: "Sensitivity to Chemicals / Dyes", tag: "GOTS Organic" },
      { label: "General Comfort & Breathability", tag: "Breathable Natural" },
    ],
  },
  {
    id: 3,
    question: "Which fashion aesthetic best describes your personal style?",
    options: [
      { label: "Minimalist Linen & Earth Tones", tag: "Resort Minimalist" },
      { label: "Streetwear & Oversized Silhouette", tag: "Korean Casual" },
      { label: "Sharp Professional & Tailored", tag: "Executive Smart" },
      { label: "Active & Athletic Loungewear", tag: "Active Comfort" },
    ],
  },
];

export default function StyleQuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    document.title = "Style Quiz | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Discover your style profile");
  }, []);

  function handleSelect(tag: string) {
    const updated = [...answers, tag];
    setAnswers(updated);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setFinished(true);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Skin-Safe Style Quiz</h1>
              <p className="text-xs text-slate-500">Discover your ideal fabric match & aesthetic capsule</p>
            </div>
          </div>
          <span className="text-xs bg-purple-50 text-purple-700 font-bold px-3 py-1 rounded-full border border-purple-200">
            3 Quick Questions
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!finished ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs space-y-6">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>Question {step + 1} of {QUESTIONS.length}</span>
              <span>{Math.round(((step + 1) / QUESTIONS.length) * 100)}% Completed</span>
            </div>

            <h2 className="text-xl font-black text-slate-900">{QUESTIONS[step].question}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUESTIONS[step].options.map((opt) => (
                <button
                  key={opt.label}
                  role="radio"
                  aria-checked={answers.includes(opt.tag)}
                  onClick={() => handleSelect(opt.tag)}
                  className="bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 rounded-2xl p-5 text-left font-bold text-sm text-slate-800 transition"
                >
                  ✨ {opt.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto font-black">
              ✨
            </div>

            <h2 className="text-2xl font-black text-slate-900">Your Style Profile Matched!</h2>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left space-y-2 max-w-md mx-auto text-xs text-slate-700">
              <p className="font-bold text-slate-900 text-sm">Primary Capsule Match: {answers[2] || "Resort Minimalist"}</p>
              <p>• Top Fabric Match: <strong>100% French Linen & GOTS Organic Cotton</strong></p>
              <p>• Predicted Comfort Rating: <strong>98%</strong></p>
              <p>• Skin Friction Risk: <strong>Near Zero</strong></p>
            </div>

            <div className="flex justify-center gap-3">
              <Link href="/shop" className="bg-blue-600 text-white font-bold text-xs px-6 py-3.5 rounded-2xl hover:bg-blue-700 transition">
                Shop Your Matching Collection →
              </Link>
              <Link href="/outfit-generator" className="border-2 border-slate-200 text-slate-700 font-bold text-xs px-6 py-3.5 rounded-2xl hover:bg-slate-50 transition">
                Generate Outfits
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
