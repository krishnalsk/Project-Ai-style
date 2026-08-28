"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface FabricDetail {
  id: string;
  name: string;
  category: string;
  safetyScore: number;
  comfortScore: number;
  ecoScore: number;
  breathability: string;
  moistureWicking: string;
  allergyRisk: string;
  bestFor: string;
  care: string;
}

const ALL_FABRICS: FabricDetail[] = [
  {
    id: "cotton",
    name: "Organic Cotton",
    category: "Natural Plant",
    safetyScore: 99,
    comfortScore: 96,
    ecoScore: 94,
    breathability: "Very High",
    moistureWicking: "Moderate",
    allergyRisk: "Near Zero (Hypoallergenic)",
    bestFor: "Sensitive Skin, Daily Wear",
    care: "Machine wash cold",
  },
  {
    id: "bamboo",
    name: "Bamboo Viscose",
    category: "Cellulose",
    safetyScore: 98,
    comfortScore: 98,
    ecoScore: 90,
    breathability: "Very High",
    moistureWicking: "Excellent",
    allergyRisk: "Near Zero (Antibacterial)",
    bestFor: "Activewear, Loungewear",
    care: "Gentle cycle",
  },
  {
    id: "linen",
    name: "French Linen",
    category: "Flax Plant",
    safetyScore: 97,
    comfortScore: 94,
    ecoScore: 98,
    breathability: "Maximum",
    moistureWicking: "High",
    allergyRisk: "Very Low",
    bestFor: "Summer, Hot & Humid Weather",
    care: "Air dry, low heat",
  },
  {
    id: "tencel",
    name: "Tencel Lyocell",
    category: "Wood Pulp",
    safetyScore: 95,
    comfortScore: 95,
    ecoScore: 96,
    breathability: "High",
    moistureWicking: "Very High",
    allergyRisk: "Very Low",
    bestFor: "Workwear, Flowy Dresses",
    care: "Cold wash",
  },
  {
    id: "silk",
    name: "Mulberry Silk",
    category: "Protein Fiber",
    safetyScore: 96,
    comfortScore: 97,
    ecoScore: 84,
    breathability: "High",
    moistureWicking: "Moderate",
    allergyRisk: "Very Low (Amino Acids)",
    bestFor: "Evening Wear, Pillowcases",
    care: "Hand wash with silk soap",
  },
  {
    id: "polyester",
    name: "Polyester / Synthetic",
    category: "Petroleum Synthetic",
    safetyScore: 62,
    comfortScore: 70,
    ecoScore: 35,
    breathability: "Low",
    moistureWicking: "Low (Traps Heat)",
    allergyRisk: "High (Contact Rash Risk)",
    bestFor: "Waterproof Outerwear",
    care: "Use microfiber bag",
  },
];

export default function FabricComparePage() {
  const [fabric1, setFabric1] = useState("cotton");
  const [fabric2, setFabric2] = useState("polyester");

  useEffect(() => {
    document.title = "Fabric Compare | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Compare fabrics side by side");
  }, []);

  const f1 = ALL_FABRICS.find((f) => f.id === fabric1) || ALL_FABRICS[0];
  const f2 = ALL_FABRICS.find((f) => f.id === fabric2) || ALL_FABRICS[5];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-4 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/fabric-encyclopedia" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Side-by-Side Fabric Matchup</h1>
              <p className="text-xs text-slate-500">Compare skin safety, moisture dissipation, and eco impact</p>
            </div>
          </div>
          <Link href="/shop" className="text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">
            Shop Fabrics →
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
          <div>
            <label className="block text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-2">
              Select Fabric A
            </label>
            <select
              value={fabric1}
              onChange={(e) => setFabric1(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {ALL_FABRICS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-indigo-600 uppercase tracking-wider mb-2">
              Select Fabric B
            </label>
            <select
              value={fabric2}
              onChange={(e) => setFabric2(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {ALL_FABRICS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Matchup Comparison Table */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs overflow-hidden">
          <div className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-4 mb-4 text-center font-extrabold text-sm">
            <span className="text-slate-400 text-left">Metric</span>
            <span className="text-blue-600">{f1.name}</span>
            <span className="text-indigo-600">{f2.name}</span>
          </div>

          {[
            { label: "Skin Safety Score", v1: `${f1.safetyScore}%`, v2: `${f2.safetyScore}%`, highlight: f1.safetyScore > f2.safetyScore ? 1 : 2 },
            { label: "Comfort Rating", v1: `${f1.comfortScore}%`, v2: `${f2.comfortScore}%`, highlight: f1.comfortScore > f2.comfortScore ? 1 : 2 },
            { label: "Eco-Impact Score", v1: `${f1.ecoScore}%`, v2: `${f2.ecoScore}%`, highlight: f1.ecoScore > f2.ecoScore ? 1 : 2 },
            { label: "Breathability", v1: f1.breathability, v2: f2.breathability },
            { label: "Moisture Wicking", v1: f1.moistureWicking, v2: f2.moistureWicking },
            { label: "Allergy & Rash Risk", v1: f1.allergyRisk, v2: f2.allergyRisk },
            { label: "Best Use Case", v1: f1.bestFor, v2: f2.bestFor },
            { label: "Care Instructions", v1: f1.care, v2: f2.care },
          ].map((row) => (
            <div key={row.label} className="grid grid-cols-3 gap-4 py-3 border-b border-slate-50 text-xs items-center">
              <span className="font-bold text-slate-700">{row.label}</span>
              <span className={`text-center font-black ${row.highlight === 1 ? "text-emerald-600" : "text-slate-800"}`}>
                {row.v1}
              </span>
              <span className={`text-center font-black ${row.highlight === 2 ? "text-emerald-600" : "text-slate-800"}`}>
                {row.v2}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
