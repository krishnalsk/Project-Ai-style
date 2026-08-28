"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AnalyticsPage() {
  useEffect(() => {
    document.title = "Analytics | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Your style analytics");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-4 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Wardrobe & Comfort Analytics</h1>
              <p className="text-xs text-slate-500">Longitudinal comfort trends, skin safety & eco impact</p>
            </div>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
            Monthly Report Ready
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Main Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: "Skin Safety Average", value: "96.4%", change: "+4.2% vs last month", color: "text-emerald-600" },
            { label: "Comfort Rating Avg", value: "4.8 ★", change: "Top 5% of users", color: "text-amber-500" },
            { label: "Natural Fiber Share", value: "88%", change: "+12% Organic cotton", color: "text-blue-600" },
            { label: "Flare-up Frequency", value: "0 in 30 days", change: "Zero skin irritation", color: "text-emerald-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block">{stat.label}</span>
              <span className={`text-2xl font-black block mt-1 ${stat.color}`}>{stat.value}</span>
              <span className="text-[10px] font-bold text-slate-500 block mt-1">{stat.change}</span>
            </div>
          ))}
        </div>

        {/* Fabric Ratio Breakdown */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">Fabric Composition Ratio in Wardrobe</h2>

          <div className="space-y-3">
            {[
              { fabric: "Organic Cotton", share: "52%", status: "Hypoallergenic", color: "bg-emerald-500" },
              { fabric: "French Linen", share: "24%", status: "High Airflow", color: "bg-teal-500" },
              { fabric: "Bamboo Viscose", share: "12%", status: "Antibacterial", color: "bg-blue-500" },
              { fabric: "Spandex / Elastane Blend", share: "12%", status: "Low Synthetic Share", color: "bg-slate-400" },
            ].map((f) => (
              <div key={f.fabric} className="border border-slate-100 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-slate-900 text-sm">{f.fabric}</span>
                  <span className="text-xs font-black text-slate-700">{f.share}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1.5">
                  <div className={`${f.color} h-2.5 rounded-full`} style={{ width: f.share }} />
                </div>
                <span className="text-[11px] text-slate-500 font-medium">{f.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Callout */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-extrabold text-lg mb-1">Looking for even higher comfort scores?</h3>
            <p className="text-xs text-blue-100">Log today&apos;s outfit in your Skin Diary to keep your analytics current.</p>
          </div>
          <Link href="/skin-diary" className="bg-white text-blue-700 font-bold text-xs px-5 py-3 rounded-2xl hover:bg-blue-50 transition shrink-0">
            Log Skin Diary →
          </Link>
        </div>
      </main>
    </div>
  );
}
