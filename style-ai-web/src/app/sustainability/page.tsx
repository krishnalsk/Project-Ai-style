"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DropletsIcon, LeafIcon, AwardIcon } from "@/components/ui/Icons";

export default function SustainabilityPage() {
  const [itemsPurchased, setItemsPurchased] = useState(4);

  useEffect(() => {
    document.title = "Sustainability | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Track your eco-impact");
  }, []);

  const waterSavedLiters = itemsPurchased * 1850;
  const carbonOffsetKg = (itemsPurchased * 4.2).toFixed(1);
  const ecoScore = Math.min(96, 75 + itemsPurchased * 4);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PageHeader
        title="Sustainability Dashboard"
        subtitle="Track your environmental footprint & sustainable choices"
        backHref="/dashboard"
        actions={<span className="hidden sm:inline-flex text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-full border border-emerald-200">Eco-Certified</span>}
      />

      <main className="page-container py-6 sm:py-8 space-y-6">
        <div className="card overflow-hidden p-0">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest">Wardrobe Eco-Rating</span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1">Sustainable Wardrobe Level</h2>
              <p className="text-emerald-100 text-sm mt-2 max-w-md">Your preference for organic cotton and linen has diverted pollutants from freshwater ecosystems.</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[120px]">
              <span className="text-xs text-emerald-100 font-bold block">Eco-Score</span>
              <span className="text-4xl font-black">{ecoScore}</span>
              <span className="text-xs text-emerald-200 block">/ 100</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="card p-6">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center mb-3">
              <DropletsIcon size={20} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Water Conserved</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{waterSavedLiters.toLocaleString()} L</h3>
            <p className="text-slate-500 text-xs mt-1">Compared to conventional chemical-dyed polyester</p>
          </div>

          <div className="card p-6">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-3">
              <LeafIcon size={20} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Carbon Diverted</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{carbonOffsetKg} kg CO₂</h3>
            <p className="text-slate-500 text-xs mt-1">Equivalent to planting 3 mature urban trees</p>
          </div>

          <div className="card p-6">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-3">
              <AwardIcon size={20} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Style Points</span>
            <h3 className="text-2xl font-black text-[#4A90E2] mt-1">{itemsPurchased * 150} pts</h3>
            <p className="text-slate-500 text-xs mt-1">Redeemable for skin-care and organic fashion discounts</p>
          </div>
        </div>

        <div className="card p-6 sm:p-8">
          <h3 className="text-base font-extrabold text-slate-900">Top Sustainable Fibers in Your Wardrobe</h3>
          <p className="text-slate-500 text-sm mb-6">Ranked by lifecycle water usage, biodegradability and skin safety.</p>
          <div className="space-y-4">
            {[
              { name: "French Linen (Flax)", share: "45%", impact: "Zero irrigation required, 100% biodegradable", color: "bg-emerald-500" },
              { name: "GOTS Certified Organic Cotton", share: "35%", impact: "91% less water than conventional cotton", color: "bg-teal-500" },
              { name: "Tencel Lyocell", share: "15%", impact: "99.5% closed-loop solvent recycling", color: "bg-[#4A90E2]" },
              { name: "Recycled Wool", share: "5%", impact: "Zero chemical shearing, diverted landfill textile", color: "bg-indigo-500" },
            ].map((f) => (
              <div key={f.name} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-slate-900">{f.name}</span>
                  <span className="text-xs font-extrabold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-full">{f.share}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div className={`${f.color} h-2 rounded-full transition-all`} style={{ width: f.share }} />
                </div>
                <span className="text-xs text-slate-500">{f.impact}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-slate-50 border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-sm text-slate-900">Simulate wardrobe expansion</span>
            <p className="text-xs text-slate-500">Calculate cumulative eco-savings when choosing sustainable pieces.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label="Decrease garments"
              onClick={() => setItemsPurchased((p) => Math.max(1, p - 1))}
              className="w-10 h-10 bg-white border border-slate-200 rounded-xl font-black text-slate-700 hover:bg-slate-50 transition min-w-[40px] min-h-[40px]"
            >
              −
            </button>
            <span className="font-extrabold text-sm text-slate-900 min-w-[90px] text-center">{itemsPurchased} garments</span>
            <button
              aria-label="Increase garments"
              onClick={() => setItemsPurchased((p) => p + 1)}
              className="w-10 h-10 bg-white border border-slate-200 rounded-xl font-black text-slate-700 hover:bg-slate-50 transition min-w-[40px] min-h-[40px]"
            >
              +
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
