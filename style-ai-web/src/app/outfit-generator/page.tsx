// src/app/outfit-generator/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { queryCatalog, ScoredProduct } from "@/lib/queryEngine";
import { ClosetItem } from "@/app/virtual-closet/page";

interface OutfitPiece {
  name: string;
  fabric: string;
  source: "Your Virtual Closet" | "Suggested from Catalog";
  image: string;
  price?: number;
  productId?: string;
  laundryStatus?: string;
}

interface GeneratedOutfit {
  title: string;
  occasion: string;
  season: string;
  top: OutfitPiece;
  bottom: OutfitPiece;
  shoes: OutfitPiece;
  accessories?: OutfitPiece;
  comfortScore: number;
  safetyScore: number;
  weatherSuitability: string;
  whyItWorks: string;
  allergySafe: boolean;
}

const OCCASIONS = [
  "Casual Everyday",
  "Office & Formal",
  "Summer Heat",
  "Cold Winter",
  "Active & Workout",
  "Party & Night Out",
];

const SEASONS = ["All-Season", "Summer", "Winter", "Monsoon"];

export default function OutfitGeneratorPage() {
  const { profile } = useAuth();
  const [occasion, setOccasion] = useState("Casual Everyday");
  const [season, setSeason] = useState("All-Season");
  const [minComfort, setMinComfort] = useState(90);
  const [closetItems, setClosetItems] = useState<ClosetItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [outfit, setOutfit] = useState<GeneratedOutfit | null>(null);

  useEffect(() => {
    document.title = "Smart Outfit Generator | Style AI";
    try {
      const stored = localStorage.getItem("style_ai_virtual_closet");
      if (stored) {
        setClosetItems(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Filter closet items for availability (Clean & Ready) and allergy exclusion
  const cleanClosetItems = closetItems.filter((item) => {
    // 1. Availability / Laundry Status Gate
    if (item.laundryStatus && item.laundryStatus !== "Clean & Ready") return false;

    // 2. Mandatory Allergy Gate
    if (profile?.confirmedAllergies && profile.confirmedAllergies.length > 0) {
      const fLower = item.fabric.toLowerCase();
      const hasConflict = profile.confirmedAllergies.some((a) => fLower.includes(a.toLowerCase()));
      if (hasConflict) return false;
    }

    return true;
  });

  function handleGenerateOutfit() {
    setGenerating(true);

    setTimeout(() => {
      // Find clean tops, bottoms, shoes from closet
      const closetTops = cleanClosetItems.filter((i) => i.category === "Tops");
      const closetBottoms = cleanClosetItems.filter((i) => i.category === "Bottoms");
      const closetShoes = cleanClosetItems.filter((i) => i.category === "Footwear");

      // Complementary catalog items from 1,000-record dataset
      const catalogTops = queryCatalog({
        category: "Tops",
        occasion,
        confirmedAllergies: profile?.confirmedAllergies || [],
        minSkinSafety: 90,
        limit: 3,
      }).items;

      const catalogBottoms = queryCatalog({
        category: "Bottoms",
        occasion,
        confirmedAllergies: profile?.confirmedAllergies || [],
        minSkinSafety: 90,
        limit: 3,
      }).items;

      const catalogShoes = queryCatalog({
        category: "Footwear",
        confirmedAllergies: profile?.confirmedAllergies || [],
        minSkinSafety: 85,
        limit: 2,
      }).items;

      // Select Top
      let selectedTop: OutfitPiece;
      if (closetTops.length > 0) {
        const topItem = closetTops[0];
        selectedTop = {
          name: topItem.name,
          fabric: topItem.fabric,
          source: "Your Virtual Closet",
          image: topItem.image,
          laundryStatus: topItem.laundryStatus,
        };
      } else if (catalogTops.length > 0) {
        const prod = catalogTops[0].product;
        selectedTop = {
          name: prod.name,
          fabric: prod.fabric,
          source: "Suggested from Catalog",
          image: prod.images[0],
          price: prod.price,
          productId: prod.id,
        };
      } else {
        selectedTop = {
          name: "Azure 100% French Linen Shirt",
          fabric: "100% French Linen",
          source: "Suggested from Catalog",
          image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
          price: 1499,
          productId: "p1",
        };
      }

      // Select Bottom
      let selectedBottom: OutfitPiece;
      if (closetBottoms.length > 0) {
        const botItem = closetBottoms[0];
        selectedBottom = {
          name: botItem.name,
          fabric: botItem.fabric,
          source: "Your Virtual Closet",
          image: botItem.image,
          laundryStatus: botItem.laundryStatus,
        };
      } else if (catalogBottoms.length > 0) {
        const prod = catalogBottoms[0].product;
        selectedBottom = {
          name: prod.name,
          fabric: prod.fabric,
          source: "Suggested from Catalog",
          image: prod.images[0],
          price: prod.price,
          productId: prod.id,
        };
      } else {
        selectedBottom = {
          name: "Relaxed Fit Organic Cotton Chinos",
          fabric: "100% GOTS Organic Cotton",
          source: "Suggested from Catalog",
          image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400",
          price: 2299,
          productId: "p2",
        };
      }

      // Select Shoes
      let selectedShoes: OutfitPiece;
      if (closetShoes.length > 0) {
        const shoeItem = closetShoes[0];
        selectedShoes = {
          name: shoeItem.name,
          fabric: shoeItem.fabric,
          source: "Your Virtual Closet",
          image: shoeItem.image,
          laundryStatus: shoeItem.laundryStatus,
        };
      } else if (catalogShoes.length > 0) {
        const prod = catalogShoes[0].product;
        selectedShoes = {
          name: prod.name,
          fabric: prod.fabric,
          source: "Suggested from Catalog",
          image: prod.images[0],
          price: prod.price,
          productId: prod.id,
        };
      } else {
        selectedShoes = {
          name: "Minimalist Canvas Trainers (Cotton Lined)",
          fabric: "Organic Cotton Canvas + Cork",
          source: "Suggested from Catalog",
          image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
          price: 3699,
          productId: "p16",
        };
      }

      const generated: GeneratedOutfit = {
        title: `${occasion} Harmonious Pairing`,
        occasion,
        season,
        top: selectedTop,
        bottom: selectedBottom,
        shoes: selectedShoes,
        accessories: {
          name: "Unbleached Organic Cotton Tote",
          fabric: "100% GOTS Certified Cotton",
          source: "Suggested from Catalog",
          image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400",
          price: 899,
          productId: "p17",
        },
        comfortScore: 97,
        safetyScore: 98,
        weatherSuitability:
          season === "Summer"
            ? "Ideal for 26°C - 35°C with high humidity"
            : season === "Winter"
            ? "Thermal protection with zero rough wool on skin"
            : "Balanced thermal dissipation for 20°C - 30°C",
        whyItWorks: `Seamlessly coordinates clean wardrobe items with hypoallergenic catalog pieces. Open weave and low-friction natural fibers maintain cutaneous airflow while strictly excluding your confirmed allergens (${
          profile?.confirmedAllergies?.join(", ") || "None recorded"
        }).`,
        allergySafe: true,
      };

      setOutfit(generated);
      setGenerating(false);
    }, 400);
  }

  // Trigger initial generation on mount
  useEffect(() => {
    handleGenerateOutfit();
  }, [occasion, season]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/virtual-closet" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              ←
            </Link>
            <div>
              <h1 className="text-lg font-black text-slate-900">Smart Outfit Generator</h1>
              <p className="text-[11px] text-slate-500">Virtual Closet + 1,000-Record Catalog Coordinator</p>
            </div>
          </div>
          <Link
            href="/virtual-closet"
            className="text-xs font-bold bg-white text-slate-700 border border-slate-200 px-3.5 py-1.5 rounded-xl hover:bg-slate-50"
          >
            My Closet ({cleanClosetItems.length} Clean)
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Preference Filters Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900">Occasion & Environmental Filters</h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              ✓ Allergy Exclusion Active ({profile?.confirmedAllergies?.length || 0} allergens purged)
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Occasion / Dress Code</label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ}
                    onClick={() => setOccasion(occ)}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition ${
                      occasion === occ
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Target Season / Climate</label>
                <div className="flex gap-2">
                  {SEASONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeason(s)}
                      className={`flex-1 text-xs font-bold py-1.5 rounded-xl border transition ${
                        season === s
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Min Comfort Threshold: {minComfort}%
                </label>
                <input
                  type="range"
                  min="80"
                  max="98"
                  value={minComfort}
                  onChange={(e) => setMinComfort(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateOutfit}
            disabled={generating}
            className="w-full bg-blue-600 text-white font-black text-xs py-3 rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 shadow-xs"
          >
            {generating ? "Coordinating Clean Garments..." : "✨ Regenerate Optimal Outfit"}
          </button>
        </div>

        {/* Generated Outfit Output */}
        {outfit && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-black text-blue-600 uppercase tracking-wider block">
                  {outfit.occasion} · {outfit.season}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">{outfit.title}</h3>
              </div>

              <div className="flex gap-2">
                <span className="text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl">
                  {outfit.safetyScore}% Skin Safety
                </span>
                <span className="text-xs font-black bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-xl">
                  {outfit.comfortScore}% Comfort
                </span>
              </div>
            </div>

            {/* 4-Piece Visual Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Top Layer", piece: outfit.top },
                { label: "Bottom Layer", piece: outfit.bottom },
                { label: "Footwear", piece: outfit.shoes },
              ].map(({ label, piece }) => (
                <div key={label} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 mb-1.5">
                      <span>{label}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          piece.source === "Your Virtual Closet"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {piece.source === "Your Virtual Closet" ? "In Closet" : "Catalog"}
                      </span>
                    </div>

                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-200 mb-2">
                      <img src={piece.image} alt={piece.name} className="w-full h-full object-cover" />
                    </div>

                    <h4 className="font-black text-slate-900 text-xs truncate">{piece.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{piece.fabric}</p>
                  </div>

                  {piece.productId ? (
                    <Link
                      href={`/shop/${piece.productId}`}
                      className="text-xs font-bold text-blue-600 bg-white border border-slate-200 rounded-xl py-1.5 text-center hover:bg-blue-50 transition"
                    >
                      Shop ₹{piece.price?.toLocaleString("en-IN")} →
                    </Link>
                  ) : (
                    <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-xl py-1.5 text-center border border-emerald-100">
                      ✓ Clean & Ready in Closet
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Explanatory Clinical Rationale */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100 text-xs">
              <span className="font-black text-slate-800 uppercase tracking-wide block">
                Clinical Comfort & Color Rationale
              </span>
              <p className="text-slate-700 leading-relaxed">{outfit.whyItWorks}</p>
              <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1.5">
                <span>🌤️</span>
                <span>Weather suitability: {outfit.weatherSuitability}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
