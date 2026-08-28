"use client";

import { useEffect } from "react";
import Link from "next/link";

interface Symbol {
  icon: string;
  name: string;
  meaning: string;
  category: "Wash" | "Dry" | "Iron" | "Bleach" | "Professional";
}

const SYMBOLS: Symbol[] = [
  // Wash
  { icon: "🫧", name: "Machine Wash 30°C", meaning: "Use cold machine wash, gentle cycle. Best for organic cotton and Tencel.", category: "Wash" },
  { icon: "🫧", name: "Machine Wash 40°C", meaning: "Standard warm wash. Safe for most conventional cotton garments.", category: "Wash" },
  { icon: "🤲", name: "Hand Wash Only", meaning: "Delicate hand wash in cold water with pH-neutral soap. For silk, bamboo, and fine merino.", category: "Wash" },
  { icon: "🚫", name: "Do Not Wash", meaning: "Dry clean only. Avoid water contact to prevent damage to structured garments.", category: "Wash" },
  // Dry
  { icon: "🔄", name: "Tumble Dry Low", meaning: "Use dryer on low heat setting. Add a dryer ball to fluff natural fibers like linen.", category: "Dry" },
  { icon: "☁️", name: "Line Dry / Air Dry", meaning: "Hang to dry naturally. Preserves bamboo and Tencel fiber integrity and reduces energy use.", category: "Dry" },
  { icon: "🚫", name: "Do Not Tumble Dry", meaning: "Heat-sensitive fabrics like silk and superfine merino must always air-dry to prevent shrinkage.", category: "Dry" },
  { icon: "📐", name: "Dry Flat", meaning: "Reshape while damp and dry horizontally. Prevents merino knitwear from stretching out.", category: "Dry" },
  // Iron
  { icon: "🔥", name: "Iron Low Heat (110°C)", meaning: "Gentle iron for synthetic blends and delicate silk. Always use a pressing cloth.", category: "Iron" },
  { icon: "🌡️", name: "Iron Medium (150°C)", meaning: "Cotton and linen — iron slightly damp for best crease removal.", category: "Iron" },
  { icon: "💧", name: "Steam Iron", meaning: "Use steam to naturally relax fiber structure without direct contact pressure.", category: "Iron" },
  { icon: "🚫", name: "Do Not Iron", meaning: "Polyester and acrylic melt under direct heat. Never iron printed graphics.", category: "Iron" },
  // Bleach
  { icon: "🧪", name: "Do Not Bleach", meaning: "Chlorine bleach destroys natural dyes and weakens organic cotton fibers.", category: "Bleach" },
  { icon: "✅", name: "Oxygen Bleach OK", meaning: "Non-chlorine, oxygen-based whitening is safe for most undyed natural fabrics.", category: "Bleach" },
  // Professional
  { icon: "👔", name: "Dry Clean Only", meaning: "Professional cleaning required. Common for tailored suits, structured silk dresses.", category: "Professional" },
  { icon: "💧", name: "Wet Clean Allowed", meaning: "Professional wet cleaning is a gentler, eco-friendly alternative to solvent dry cleaning.", category: "Professional" },
];

const CATEGORIES = ["All", "Wash", "Dry", "Iron", "Bleach", "Professional"] as const;

export default function WashCareGuidePage() {
  useEffect(() => {
    document.title = "Wash Care Guide | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Fabric care instructions");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-4 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">←</Link>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Wash Care Guide</h1>
              <p className="text-xs text-slate-500">Decode every symbol on your garment labels</p>
            </div>
          </div>
          <Link href="/label-lens" className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-100 transition border border-blue-100">
            Scan a Label 🔍
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Intro Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white mb-8 shadow-md">
          <h2 className="text-xl font-extrabold mb-2">Extend the Life of Every Garment</h2>
          <p className="text-blue-100 text-sm leading-relaxed max-w-xl">
            Proper fabric care directly impacts skin safety. Incorrect washing can break down hypoallergenic coatings, release microplastics, and cause irritation-triggering residue buildup.
          </p>
        </div>

        {/* Category Sections */}
        {CATEGORIES.filter((c) => c !== "All").map((cat) => (
          <div key={cat} className="mb-8">
            <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-600 rounded-full inline-block" />
              {cat} Instructions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SYMBOLS.filter((s) => s.category === cat).map((symbol) => (
                <div key={symbol.name} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {symbol.icon}
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-sm">{symbol.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{symbol.meaning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Pro tips */}
        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6">
          <h3 className="font-extrabold text-amber-900 text-base mb-4">💡 Pro Skin-Care Laundry Tips</h3>
          <ul className="space-y-2">
            {[
              "Use pH-neutral, fragrance-free detergent if you have eczema or dermatitis.",
              "Always double-rinse to remove all detergent residue — a major irritation cause.",
              "Wash new garments before first wear to remove manufacturing chemicals.",
              "Turn dark garments inside-out to preserve dye integrity and reduce microplastic shedding.",
              "Fabric softeners coat fibers with chemicals that block breathability — skip them for bamboo and linen.",
            ].map((tip) => (
              <li key={tip} className="flex gap-2 text-xs text-amber-800">
                <span className="shrink-0 text-amber-500 font-black">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
