"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONDITIONS = [
  "Atopic Dermatitis / Eczema",
  "Contact Dermatitis",
  "Sensitive Skin",
  "Psoriasis",
  "Heat Rash / Miliaria",
  "Hives / Urticaria",
];

const FABRIC_TYPES = [
  { name: "Organic Cotton", riskWeight: 1 },
  { name: "Bamboo Viscose", riskWeight: 1 },
  { name: "Pure Linen", riskWeight: 2 },
  { name: "Tencel Lyocell", riskWeight: 2 },
  { name: "Mulberry Silk", riskWeight: 2 },
  { name: "Merino Wool", riskWeight: 15 },
  { name: "Polyester", riskWeight: 35 },
  { name: "Nylon / Polyamide", riskWeight: 30 },
  { name: "Acrylic", riskWeight: 40 },
  { name: "Elastane / Spandex", riskWeight: 10 },
];

export default function AllergyCheckerPage() {
  const [selectedCondition, setSelectedCondition] = useState(CONDITIONS[0]);
  const [fibers, setFibers] = useState<Array<{ name: string; percentage: number }>>([
    { name: "Polyester", percentage: 65 },
    { name: "Organic Cotton", percentage: 35 },
  ]);

  useEffect(() => {
    document.title = "Allergy Checker | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Check fabric allergy risks");
  }, []);

  function updateFiber(index: number, name: string, percentage: number) {
    const updated = [...fibers];
    updated[index] = { name, percentage };
    setFibers(updated);
  }

  function addFiber() {
    if (fibers.length < 4) {
      setFibers([...fibers, { name: "Elastane / Spandex", percentage: 5 }]);
    }
  }

  function removeFiber(index: number) {
    if (fibers.length > 1) {
      setFibers(fibers.filter((_, i) => i !== index));
    }
  }

  const totalPercentage = fibers.reduce((sum, f) => sum + f.percentage, 0);

  // Risk Score calculation
  const weightedRisk = fibers.reduce((sum, f) => {
    const info = FABRIC_TYPES.find((t) => t.name === f.name);
    return sum + (info ? info.riskWeight * (f.percentage / 100) : 10);
  }, 0);

  const riskScore = Math.min(99, Math.max(5, Math.round(weightedRisk * 2.2)));
  const safetyLevel = riskScore < 25 ? "SAFE" : riskScore < 55 ? "MODERATE RISK" : "HIGH RISK";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Allergy & Flare-up Checker</h1>
              <p className="text-xs text-slate-500">Calculate custom multi-fiber friction & allergen risks</p>
            </div>
          </div>
          <span className="text-xs bg-rose-50 text-rose-700 font-bold px-3 py-1 rounded-full border border-rose-200">
            Derm Risk Engine
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Skin Condition Selector */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
          <h2 className="text-sm font-extrabold text-slate-900 mb-3">1. Select Primary Skin Condition</h2>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((cond) => (
              <button
                key={cond}
                onClick={() => setSelectedCondition(cond)}
                className={`text-xs font-bold px-4 py-2 rounded-2xl transition ${
                  selectedCondition === cond
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200"
                }`}
              >
                🩺 {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Blend Input */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-extrabold text-slate-900">2. Enter Custom Garment Blend</h2>
            <button
              onClick={addFiber}
              disabled={fibers.length >= 4}
              className="text-xs font-bold text-blue-600 hover:underline disabled:opacity-40"
            >
              + Add Fiber Component
            </button>
          </div>

          <div className="space-y-3">
            {fibers.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                <select
                  value={f.name}
                  onChange={(e) => updateFiber(i, e.target.value, f.percentage)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                >
                  {FABRIC_TYPES.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={f.percentage}
                    onChange={(e) => updateFiber(i, f.name, parseInt(e.target.value) || 0)}
                    className="w-16 bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-center"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
                {fibers.length > 1 && (
                  <button
                    onClick={() => removeFiber(i)}
                    className="text-slate-400 hover:text-red-500 text-xs font-bold px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {totalPercentage !== 100 && (
            <p className="text-xs font-bold text-amber-600">
              ⚠️ Total blend percentage is {totalPercentage}% (Ideal total: 100%)
            </p>
          )}
        </div>

        {/* Risk Calculation Results */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Risk Evaluation for {selectedCondition}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">Calculated Flare-up Index</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-slate-900">{riskScore}/100</span>
              <span
                className={`text-xs font-extrabold px-4 py-2 rounded-2xl ${
                  safetyLevel === "SAFE"
                    ? "bg-emerald-100 text-emerald-800"
                    : safetyLevel === "MODERATE RISK"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {safetyLevel}
              </span>
            </div>
          </div>

          {/* Detailed Diagnosis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-700 block mb-1">🧪 Moisture Trap Index:</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {fibers.some((f) => f.name === "Polyester" || f.name === "Acrylic")
                  ? "High synthetic percentage impedes natural skin transpiration. Sweat salt accumulation may cause itching."
                  : "Low synthetic content. Good breathability and natural moisture regulation."}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-700 block mb-1">🌿 Recommended Alternative:</span>
              <p className="text-xs font-semibold text-blue-700 leading-relaxed">
                Try switching to <strong>100% GOTS Organic Cotton</strong> or <strong>Bamboo Viscose</strong> for zero synthetic friction.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/shop"
              className="bg-blue-600 text-white font-bold text-xs px-6 py-3 rounded-2xl hover:bg-blue-700 transition"
            >
              Shop Safe Fabrics →
            </Link>
            <Link
              href="/ai-stylist"
              className="border-2 border-slate-200 text-slate-700 font-bold text-xs px-6 py-3 rounded-2xl hover:bg-slate-50 transition"
            >
              Ask AI Stylist for Advice
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
