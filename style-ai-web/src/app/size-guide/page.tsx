"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SizeGuidePage() {
  const [chest, setChest] = useState(38);
  const [waist, setWaist] = useState(32);
  const [fitPreference, setFitPreference] = useState<"Slim" | "Regular" | "Relaxed / Oversized">("Regular");

  useEffect(() => {
    document.title = "Size Guide | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Find your perfect fit");
  }, []);

  let recommendedSize = "M";
  if (chest <= 36 && waist <= 30) recommendedSize = "S";
  else if (chest <= 38 && waist <= 32) recommendedSize = "M";
  else if (chest <= 41 && waist <= 35) recommendedSize = "L";
  else if (chest <= 44 && waist <= 38) recommendedSize = "XL";
  else recommendedSize = "XXL";

  if (fitPreference === "Relaxed / Oversized") {
    if (recommendedSize === "S") recommendedSize = "M";
    else if (recommendedSize === "M") recommendedSize = "L";
    else if (recommendedSize === "L") recommendedSize = "XL";
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/shop" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Interactive Size & Fit Guide</h1>
              <p className="text-xs text-slate-500">Calculate recommended size to avoid fabric tightness & skin chafing</p>
            </div>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full border border-blue-200">
            Fit Engine
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Fit Calculator Input Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
          <h2 className="text-base font-extrabold text-slate-900">Enter Your Body Measurements</h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Chest Circumference: {chest} inches</span>
                <span className="text-slate-400">{chest * 2.54} cm</span>
              </div>
              <input
                type="range"
                min="32"
                max="50"
                value={chest}
                onChange={(e) => setChest(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Waist Circumference: {waist} inches</span>
                <span className="text-slate-400">{waist * 2.54} cm</span>
              </div>
              <input
                type="range"
                min="26"
                max="46"
                value={waist}
                onChange={(e) => setWaist(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Preferred Fit Silhouette</label>
              <div className="flex gap-2">
                {(["Slim", "Regular", "Relaxed / Oversized"] as const).map((fit) => (
                  <button
                    key={fit}
                    onClick={() => setFitPreference(fit)}
                    className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition border ${
                      fitPreference === fit
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Result */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs text-center space-y-4">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Recommended Garment Size</span>
          <div className="w-20 h-20 bg-blue-50 border border-blue-200 rounded-3xl flex items-center justify-center text-3xl font-black text-blue-700 mx-auto">
            {recommendedSize}
          </div>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Based on a {chest}&quot; chest and {waist}&quot; waist with a {fitPreference.toLowerCase()} fit. Loose garments reduce mechanical friction for sensitive skin.
          </p>

          <Link href="/shop" className="bg-blue-600 text-white font-bold text-xs px-8 py-3.5 rounded-2xl hover:bg-blue-700 transition inline-block">
            Shop Size {recommendedSize} Garments →
          </Link>
        </div>
      </main>
    </div>
  );
}
