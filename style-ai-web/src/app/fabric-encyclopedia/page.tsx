"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { BookOpenIcon, ShieldCheckIcon } from "@/components/ui/Icons";

interface Fabric {
  name: string;
  category: string;
  safety: "SAFE" | "MODERATE" | "AVOID";
  safetyScore: number;
  comfortScore: number;
  ecoScore: number;
  breathability: "High" | "Medium" | "Low";
  description: string;
  bestFor: string[];
  careTip: string;
}

const FABRICS: Fabric[] = [
  {
    name: "Organic Cotton",
    category: "Natural Plant Fiber",
    safety: "SAFE",
    safetyScore: 99,
    comfortScore: 96,
    ecoScore: 94,
    breathability: "High",
    description: "Grown without chemical pesticides. Ultra-soft on dermatitis-prone and allergy-sensitive skin.",
    bestFor: ["Everyday T-shirts", "Undergarments", "Loungewear"],
    careTip: "Wash with mild hypoallergenic detergent in cool water.",
  },
  {
    name: "Bamboo Viscose",
    category: "Regenerated Cellulose",
    safety: "SAFE",
    safetyScore: 98,
    comfortScore: 98,
    ecoScore: 90,
    breathability: "High",
    description: "Moisture-wicking and antibacterial with silky texture that reduces chafing.",
    bestFor: ["Activewear", "Sleepwear", "Socks"],
    careTip: "Gentle wash, air dry to preserve elasticity.",
  },
  {
    name: "Pure Linen",
    category: "Flax Plant Fiber",
    safety: "SAFE",
    safetyScore: 97,
    comfortScore: 94,
    ecoScore: 98,
    breathability: "High",
    description: "One of the most sustainable textiles. Open weave creates cooling microclimate in heat.",
    bestFor: ["Summer shirts", "Relaxed trousers", "Resort wear"],
    careTip: "Embrace natural texture; avoid heavy pressing.",
  },
  {
    name: "Mulberry Silk",
    category: "Natural Protein Fiber",
    safety: "SAFE",
    safetyScore: 96,
    comfortScore: 97,
    ecoScore: 82,
    breathability: "High",
    description: "Hypoallergenic and smooth. Natural amino acids help retain skin moisture.",
    bestFor: ["Pillowcases", "Formal shirts", "Evening wear"],
    careTip: "Hand wash with silk-specific pH neutral detergent.",
  },
  {
    name: "Tencel / Lyocell",
    category: "Closed-Loop Wood Pulp",
    safety: "SAFE",
    safetyScore: 95,
    comfortScore: 95,
    ecoScore: 96,
    breathability: "High",
    description: "Closed-loop solvent system from eucalyptus. Silky, breathable, wrinkle-resistant.",
    bestFor: ["Smart casual shirts", "Dresses", "Flowy trousers"],
    careTip: "Cold machine wash, low spin.",
  },
  {
    name: "Fine Merino Wool",
    category: "Animal Protein Fiber",
    safety: "MODERATE",
    safetyScore: 82,
    comfortScore: 90,
    ecoScore: 85,
    breathability: "Medium",
    description: "Finer than coarse wool. Warm but can trigger sensitivity for severe eczema.",
    bestFor: ["Winter sweaters", "Thermal mid-layers"],
    careTip: "Hand wash cold with wool-safe soap.",
  },
  {
    name: "Polyester / Synthetic",
    category: "Petroleum Synthetic",
    safety: "AVOID",
    safetyScore: 62,
    comfortScore: 70,
    ecoScore: 35,
    breathability: "Low",
    description: "Traps heat and perspiration. Friction and microplastics aggravate sensitive skin.",
    bestFor: ["Waterproof shells (outer only)"],
    careTip: "Use microfiber wash bag; avoid direct skin contact.",
  },
];

export default function FabricEncyclopediaPage() {
  const [search, setSearch] = useState("");
  const [safetyFilter, setSafetyFilter] = useState<string>("ALL");

  useEffect(() => {
    document.title = "Fabric Encyclopedia | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Learn about fabrics and their skin compatibility");
  }, []);

  const filtered = FABRICS.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase());
    const matchesSafety = safetyFilter === "ALL" || f.safety === safetyFilter;
    return matchesSearch && matchesSafety;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PageHeader
        title="Fabric Encyclopedia"
        subtitle="Textile science, skin safety & care guides"
        backHref="/dashboard"
        actions={
          <Link href="/ai-stylist" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-[#EFF6FF] text-[#4A90E2] border border-[#BFDBFE] px-3 py-2 rounded-xl hover:bg-[#E6F4FF] transition">
            Ask AI Stylist →
          </Link>
        }
      />

      <main className="page-container py-6 sm:py-8">
        <div className="card p-4 sm:p-5 flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <BookOpenIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by fabric, fiber type or benefit…"
              aria-label="Search fabrics"
              className="input-field pl-9"
            />
          </div>
          <div className="flex gap-1 bg-slate-50 border border-slate-200 rounded-2xl p-1">
            {["ALL", "SAFE", "MODERATE", "AVOID"].map((s) => (
              <button
                key={s}
                onClick={() => setSafetyFilter(s)}
                aria-pressed={safetyFilter === s}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition min-h-[36px] ${
                  safetyFilter === s
                    ? s === "SAFE"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : s === "MODERATE"
                      ? "bg-amber-500 text-white shadow-sm"
                      : s === "AVOID"
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-[#4A90E2] text-white shadow-sm"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                {s === "ALL" ? "All" : s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((fabric) => (
            <div key={fabric.name} className="card p-6 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{fabric.category}</span>
                  <h2 className="text-base font-extrabold text-slate-900 leading-tight mt-0.5">{fabric.name}</h2>
                </div>
                <span
                  className={`text-[11px] font-black px-2.5 py-1 rounded-full border shrink-0 ${
                    fabric.safety === "SAFE"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : fabric.safety === "MODERATE"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {fabric.safety}
                </span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-1">{fabric.description}</p>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-4 text-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">Safety</span>
                  <span className="text-sm font-black text-slate-900">{fabric.safetyScore}%</span>
                </div>
                <div className="border-x border-slate-200">
                  <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">Comfort</span>
                  <span className="text-sm font-black text-slate-900">{fabric.comfortScore}%</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">Eco</span>
                  <span className="text-sm font-black text-slate-900">{fabric.ecoScore}%</span>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-xs font-bold text-slate-700 block mb-1.5">Best for</span>
                <div className="flex flex-wrap gap-1.5">
                  {fabric.bestFor.map((item) => (
                    <span key={item} className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 text-xs text-slate-500 flex gap-2">
                <ShieldCheckIcon size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <span className="font-bold text-slate-700">Care:</span> {fabric.careTip}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card p-12 text-center mt-6">
            <p className="font-bold text-slate-900">No fabrics match your search</p>
            <p className="text-sm text-slate-500 mt-1">Try a different keyword or filter.</p>
          </div>
        )}
      </main>
    </div>
  );
}
