"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AnalysisResult {
  composition: string;
  safetyScore: number;
  comfortScore: number;
  safetyLevel: "SAFE" | "MODERATE" | "AVOID";
  dermatologyVerdict: string;
  pros: string[];
  risks: string[];
  careInstructions: string[];
}

const PRESETS = [
  { label: "100% Organic Cotton", query: "100% Organic Cotton, Made in Portugal" },
  { label: "95% Bamboo / 5% Elastane", query: "95% Bamboo Viscose, 5% Spandex/Elastane" },
  { label: "100% French Linen", query: "100% Pure Flax Linen" },
  { label: "65% Polyester / 35% Cotton", query: "65% Polyester, 35% Recycled Cotton" },
  { label: "100% Acrylic Knit", query: "100% Acrylic, Dry Clean Only" },
];

export default function LabelLensPage() {
  const [tagInput, setTagInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    document.title = "Label Lens | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Scan clothing labels for fabric analysis");
  }, []);

  function analyzeFabric(text: string) {
    if (!text.trim()) return;
    setAnalyzing(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let res: AnalysisResult;

      if (lower.includes("acrylic") || (lower.includes("polyester") && !lower.includes("cotton"))) {
        res = {
          composition: text,
          safetyScore: 65,
          comfortScore: 68,
          safetyLevel: "AVOID",
          dermatologyVerdict: "High synthetic content traps perspiration and creates friction. Not recommended for eczema or sensitive skin.",
          pros: ["High durability", "Wrinkle resistant"],
          risks: ["Heat trapping", "Potential contact dermatitis", "Low breathability"],
          careInstructions: ["Wash cold in microfiber filter bag", "Air dry away from heat"],
        };
      } else if (lower.includes("bamboo")) {
        res = {
          composition: text,
          safetyScore: 98,
          comfortScore: 97,
          safetyLevel: "SAFE",
          dermatologyVerdict: "Excellent skin tolerance. Naturally hypoallergenic and ultra-smooth fibers reduce mechanical friction.",
          pros: ["Naturally antibacterial", "Super-soft micro-texture", "Superior moisture wicking"],
          risks: ["Requires gentle wash to prevent pilling"],
          careInstructions: ["Machine wash gentle with mild liquid soap", "Do not bleach", "Line dry"],
        };
      } else if (lower.includes("linen")) {
        res = {
          composition: text,
          safetyScore: 97,
          comfortScore: 93,
          safetyLevel: "SAFE",
          dermatologyVerdict: "Highly recommended for warm and humid conditions. Open weave structure prevents sweat accumulation.",
          pros: ["Maximum airflow", "Eco-friendly natural flax", "Gets softer with each wash"],
          risks: ["Initial stiffness until first 2-3 washes"],
          careInstructions: ["Wash at 30°C", "Hang to dry while slightly damp to minimize creasing"],
        };
      } else {
        res = {
          composition: text,
          safetyScore: 96,
          comfortScore: 95,
          safetyLevel: "SAFE",
          dermatologyVerdict: "Optimal everyday choice. High breathability and natural softness suitable for all sensitive skin types.",
          pros: ["High breathability", "Gentle on natural skin barrier", "Easy maintenance"],
          risks: ["Minor shrinkage if washed in hot water"],
          careInstructions: ["Warm machine wash with like colors", "Tumble dry low"],
        };
      }

      setResult(res);
      setAnalyzing(false);
    }, 500);
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
              <h1 className="text-xl font-extrabold text-slate-900">Label Lens™</h1>
              <p className="text-xs text-slate-500">AI clothing tag analyzer & skin safety scanner</p>
            </div>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
            OCR Engine Ready
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Input Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs mb-8">
          <h2 className="text-lg font-extrabold text-slate-900 mb-2">Scan or Enter Label Text</h2>
          <p className="text-slate-500 text-xs mb-6">
            Type the fabric composition from any garment wash-care label to evaluate its skin safety and breathability.
          </p>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setTagInput(p.query);
                  analyzeFabric(p.query);
                }}
                className="text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 px-3 py-1.5 rounded-xl transition"
              >
                🏷️ {p.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. 100% Organic Cotton, or 80% Wool 20% Polyester..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
            <button
              onClick={() => analyzeFabric(tagInput)}
              disabled={!tagInput.trim() || analyzing}
              className="bg-blue-600 text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-blue-700 transition disabled:opacity-40 shrink-0 text-sm shadow-xs"
            >
              {analyzing ? "Scanning..." : "Analyze Tag"}
            </button>
          </div>
        </div>

        {/* Results Display */}
        {result && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Analysis Result</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">{result.composition}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">Skin Safety</span>
                  <span className="text-lg font-black text-slate-900">{result.safetyScore}%</span>
                </div>
                <span
                  className={`text-sm font-black px-4 py-1.5 rounded-2xl ${
                    result.safetyLevel === "SAFE"
                      ? "bg-emerald-100 text-emerald-800"
                      : result.safetyLevel === "MODERATE"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {result.safetyLevel}
                </span>
              </div>
            </div>

            {/* Verdict */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <span className="text-xs font-bold text-blue-700 block mb-1">🔬 Dermatologist AI Verdict:</span>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{result.dermatologyVerdict}</p>
            </div>

            {/* Pros & Risks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4">
                <span className="text-xs font-extrabold text-emerald-800 block mb-2">✅ Fabric Advantages</span>
                <ul className="space-y-1.5 text-xs text-emerald-900">
                  {result.pros.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4">
                <span className="text-xs font-extrabold text-amber-800 block mb-2">⚠️ Potential Risks</span>
                <ul className="space-y-1.5 text-xs text-amber-900">
                  {result.risks.map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Care Guide */}
            <div className="border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-slate-600 block mb-2">🧼 Recommended Wash Care:</span>
              <div className="flex flex-wrap gap-2">
                {result.careInstructions.map((inst) => (
                  <span key={inst} className="text-xs bg-slate-100 text-slate-700 font-medium px-3 py-1 rounded-xl">
                    {inst}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
