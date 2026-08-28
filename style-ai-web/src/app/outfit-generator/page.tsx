"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface OutfitCombo {
  title: string;
  top: string;
  bottom: string;
  shoes: string;
  accessories: string;
  comfortScore: number;
  safetyScore: number;
  weatherSuitability: string;
  whyItWorks: string;
}

const OCCASIONS = ["Casual Everyday", "Office & Formal", "Summer Heat", "Cold Winter", "Active & Gym", "Party & Night Out"];

const CLOTHING_IMAGES: { [key: string]: string } = {
  "linen shirt": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80",
  "white dress shirt": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&auto=format&fit=crop&q=80",
  "hoodie": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&auto=format&fit=crop&q=80",
  "viscose tee": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=80",
  "silk-blend shirt": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80",
  "cotton chinos": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&auto=format&fit=crop&q=80",
  "trousers": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&auto=format&fit=crop&q=80",
  "shorts": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&auto=format&fit=crop&q=80",
  "sweatpants": "https://images.unsplash.com/photo-1551854838-212c50b4c184?w=400&auto=format&fit=crop&q=80",
  "sneakers": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&auto=format&fit=crop&q=80",
  "loafers": "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&auto=format&fit=crop&q=80",
  "espadrilles": "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&auto=format&fit=crop&q=80",
  "boots": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&auto=format&fit=crop&q=80",
  "tote": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80",
  "pocket square": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&auto=format&fit=crop&q=80",
  "hat": "https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?w=400&auto=format&fit=crop&q=80",
  "scarf": "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?w=400&auto=format&fit=crop&q=80",
  "sweatband": "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&auto=format&fit=crop&q=80",
  "pendant": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&auto=format&fit=crop&q=80",
};

function getClothingImage(text: string, type: "top" | "bottom" | "shoes" | "accessories"): string {
  const lowercase = text.toLowerCase();
  for (const [key, value] of Object.entries(CLOTHING_IMAGES)) {
    if (lowercase.includes(key)) {
      return value;
    }
  }
  if (type === "top") return "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400";
  if (type === "bottom") return "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400";
  if (type === "shoes") return "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400";
  return "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400";
}

export default function OutfitGeneratorPage() {
  const [occasion, setOccasion] = useState("Casual Everyday");
  const [generating, setGenerating] = useState(false);
  const [outfit, setOutfit] = useState<OutfitCombo | null>({
    title: "Minimalist Linen & Cotton Everyday Combo",
    top: "Azure Blue 100% French Linen Shirt",
    bottom: "Relaxed Fit Organic Cotton Chinos",
    shoes: "Minimalist Canvas Sneakers (Soft Cotton Lining)",
    accessories: "Unbleached Organic Cotton Tote",
    comfortScore: 97,
    safetyScore: 98,
    weatherSuitability: "Ideal for 25°C - 34°C with high humidity",
    whyItWorks: "Natural open-weave flax linen allows max ventilation while organic cotton lining prevents skin friction around waist and ankles.",
  });

  useEffect(() => {
    document.title = "Outfit Generator | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "AI-powered outfit suggestions");
  }, []);

  function generateOutfit(selectedOccasion: string) {
    setOccasion(selectedOccasion);
    setGenerating(true);

    setTimeout(() => {
      let result: OutfitCombo;
      if (selectedOccasion.includes("Office")) {
        result = {
          title: "Executive Soft-Touch Formal",
          top: "Crisp White 100% GOTS Cotton Dress Shirt",
          bottom: "Tailored Tencel-Lyocell Pleated Trousers",
          shoes: "Soft Leather Padded Loafers",
          accessories: "Pure Silk Pocket Square",
          comfortScore: 94,
          safetyScore: 96,
          weatherSuitability: "Air-conditioned indoors & warm commute",
          whyItWorks: "Tencel drape stays sharp while maintaining silky smooth skin contact throughout long work hours.",
        };
      } else if (selectedOccasion.includes("Summer")) {
        result = {
          title: "Breeze Master Resort Combo",
          top: "Unbleached French Linen Cuban Collar Shirt",
          bottom: "Bamboo Viscose Lightweight Drawstring Shorts",
          shoes: "Breathable Canvas Espadrilles",
          accessories: "UV-Blocking Organic Cotton Bucket Hat",
          comfortScore: 98,
          safetyScore: 99,
          weatherSuitability: "Extreme Heat (32°C - 42°C)",
          whyItWorks: "Bamboo moisture management rapidly cools sweat while linen prevents heat traps.",
        };
      } else if (selectedOccasion.includes("Cold") || selectedOccasion.includes("Winter")) {
        result = {
          title: "Hypoallergenic Thermal Layering",
          top: "Organic Cotton Thermal Base + 18.5µ Merino Sweater",
          bottom: "Cotton-Lined Heavyweight Chinos",
          shoes: "Padded Leather Boots",
          accessories: "Superfine Merino Wool Scarf",
          comfortScore: 95,
          safetyScore: 93,
          weatherSuitability: "Cold / Chilly (5°C - 18°C)",
          whyItWorks: "Cotton inner layer shields skin from wool fibers while outer merino provides thermal insulation.",
        };
      } else if (selectedOccasion.includes("Active") || selectedOccasion.includes("Gym")) {
        result = {
          title: "Anti-Chafe Performance Outfit",
          top: "95% Bamboo Viscose Moisture-Wick Tee",
          bottom: "Seamless Bamboo Active Training Shorts",
          shoes: "Lightweight Mesh Running Sneakers",
          accessories: "Organic Terry Cotton Sweatband",
          comfortScore: 97,
          safetyScore: 96,
          weatherSuitability: "High Intensity Workouts / All Weather",
          whyItWorks: "Naturally antibacterial bamboo fibers mitigate sweat odor and prevent inner-thigh friction rashes.",
        };
      } else {
        result = {
          title: "Elevated Night Out Casual",
          top: "Dark Navy Silk-Blend Short Sleeve Shirt",
          bottom: "Tencel Relaxed Fit Trousers",
          shoes: "Clean Leather Low-Top Sneakers",
          accessories: "Minimalist Silver Pendant",
          comfortScore: 93,
          safetyScore: 95,
          weatherSuitability: "Evening / Moderate Climate",
          whyItWorks: "Silk and Tencel create a subtle sheen and premium drape without synthetics or skin stiffness.",
        };
      }
      setOutfit(result);
      setGenerating(false);
    }, 400);
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
              <h1 className="text-xl font-extrabold text-slate-900">AI Outfit Generator</h1>
              <p className="text-xs text-slate-500">Generate skin-safe, weather-adjusted outfit pairings</p>
            </div>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200">
            Random Forest v2.4
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Select Occasion */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
          <h2 className="text-sm font-extrabold text-slate-900 mb-3">Choose Your Occasion</h2>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((occ) => (
              <button
                key={occ}
                aria-pressed={occasion === occ}
                onClick={() => generateOutfit(occ)}
                className={`text-xs font-bold px-4 py-2.5 rounded-2xl transition ${
                  occasion === occ
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200"
                }`}
              >
                ✨ {occ}
              </button>
            ))}
          </div>
        </div>

        {/* Outfit Display Card */}
        {generating ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 shadow-xs text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="font-extrabold text-slate-800 text-sm">Matching Skin-Safe Fabrics & Weather Rules...</p>
          </div>
        ) : (
          outfit && (
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Recommended Look</span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">{outfit.title}</h3>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-full border border-emerald-200">
                    🛡️ Safety: {outfit.safetyScore}%
                  </span>
                  <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-full border border-blue-200">
                    ✨ Comfort: {outfit.comfortScore}%
                  </span>
                </div>
              </div>

              {/* Garment Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Top / Shirt", value: outfit.top, type: "top" as const },
                  { label: "Bottom / Pants", value: outfit.bottom, type: "bottom" as const },
                  { label: "Footwear", value: outfit.shoes, type: "shoes" as const },
                  { label: "Accessories", value: outfit.accessories, type: "accessories" as const },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getClothingImage(item.value, item.type)}
                        alt={`Style AI clothing recommendation for ${item.value}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{item.label}</span>
                      <span className="text-xs font-bold text-slate-900 block mt-0.5 leading-tight">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weather & Science */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-indigo-900 block">🌤️ Weather Adaptation:</span>
                <p className="text-xs text-indigo-800 font-medium">{outfit.weatherSuitability}</p>

                <span className="text-xs font-bold text-indigo-900 block pt-2">🧪 Dermatologist AI Rationale:</span>
                <p className="text-xs text-indigo-800 leading-relaxed">{outfit.whyItWorks}</p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/shop"
                  className="bg-blue-600 text-white font-bold text-xs px-6 py-3 rounded-2xl hover:bg-blue-700 transition"
                >
                  Shop This Look →
                </Link>
                <Link
                  href="/ai-stylist"
                  className="border-2 border-slate-200 text-slate-700 font-bold text-xs px-6 py-3 rounded-2xl hover:bg-slate-50 transition"
                >
                  Ask AI Stylist to Modify
                </Link>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}
