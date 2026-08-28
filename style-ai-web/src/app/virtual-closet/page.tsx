"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShirtIcon, SparklesIcon } from "@/components/ui/Icons";

interface ClosetItem {
  id: string;
  name: string;
  fabric: string;
  category: string;
  image: string;
  wearCount: number;
  lastWorn: string;
  comfortRating: number;
}

const DEFAULT_CLOSET: ClosetItem[] = [
  { id: "c1", name: "Azure Linen Shirt", fabric: "100% French Linen", category: "Summer", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80", wearCount: 8, lastWorn: "Today", comfortRating: 5 },
  { id: "c2", name: "Organic Cotton Hoodie", fabric: "100% Organic Cotton", category: "Winter", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&auto=format&fit=crop&q=80", wearCount: 14, lastWorn: "3 days ago", comfortRating: 5 },
  { id: "c3", name: "Bamboo Activewear Tee", fabric: "95% Bamboo Viscose", category: "Active", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=80", wearCount: 22, lastWorn: "Yesterday", comfortRating: 5 },
];

export default function VirtualClosetPage() {
  const [closet, setCloset] = useState<ClosetItem[]>(DEFAULT_CLOSET);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    document.title = "Virtual Closet | Style AI";
  }, []);

  const categories = ["All", ...Array.from(new Set(closet.map((i) => i.category)))];
  const filtered = filter === "All" ? closet : closet.filter((i) => i.category === filter);

  function removeItem(id: string) {
    setCloset((prev) => prev.filter((i) => i.id !== id));
  }

  const totalWears = closet.reduce((s, i) => s + i.wearCount, 0);
  const avgComfort = closet.length ? (closet.reduce((s, i) => s + i.comfortRating, 0) / closet.length).toFixed(1) : "—";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PageHeader
        title="Virtual Closet"
        subtitle={`${closet.length} items · ${totalWears} total wears`}
        backHref="/dashboard"
        actions={
          <Link href="/shop" className="text-xs font-bold bg-[#4A90E2] text-white px-4 py-2 rounded-xl hover:bg-[#3A6BC8] transition">
            + Add Items
          </Link>
        }
      />

      <main className="page-container py-6 sm:py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Pieces", value: closet.length, sub: "in wardrobe" },
            { label: "Total Wears", value: totalWears, sub: "all time" },
            { label: "Avg Comfort", value: `${avgComfort}★`, sub: "comfort rating" },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <span className="text-[11px] font-bold text-slate-400 block tracking-wider uppercase">{s.label}</span>
              <span className="text-2xl font-black text-slate-900 block mt-0.5">{s.value}</span>
              <span className="text-xs text-slate-500">{s.sub}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              aria-pressed={filter === cat}
              className={`shrink-0 text-xs font-bold px-4 py-2 rounded-xl transition border min-h-[36px] ${filter === cat ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-700 hover:border-[#4A90E2] hover:text-[#4A90E2]"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <ShirtIcon size={24} className="text-slate-400" />
            </div>
            <p className="font-bold text-slate-900">Your closet is empty</p>
            <p className="text-sm text-slate-500 mt-1 mb-6">Add skin-safe fashion from the shop to track your wardrobe.</p>
            <Link href="/shop" className="bg-[#4A90E2] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#3A6BC8] transition inline-flex">
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => (
              <div key={item.id} className="card card-hover overflow-hidden p-0">
                <div className="h-44 bg-slate-100 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name} from closet`}
                    className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-white/90 backdrop-blur border border-slate-200 text-slate-500 hover:text-red-600 flex items-center justify-center shadow-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="font-extrabold text-slate-900 text-sm mb-0.5">{item.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">{item.fabric}</p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex gap-3 text-slate-600 font-medium">
                      <span>{item.wearCount} wears</span>
                      <span className="text-slate-300">·</span>
                      <span>{item.lastWorn}</span>
                    </div>
                    <span className="text-amber-500 font-bold">{"★".repeat(item.comfortRating)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 card p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#4A90E2] to-[#3A6BC8] p-6 text-white">
            <h3 className="font-extrabold flex items-center gap-2">
              <SparklesIcon size={18} /> AI Style Suggestion
            </h3>
            <p className="text-white/90 text-sm leading-relaxed mt-2">
              Based on your closet, you wear natural fabrics 100% of the time. Consider adding a versatile <strong>Tencel Lyocell chino</strong> for formal occasions — it matches your skin safety preference perfectly.
            </p>
            <Link href="/shop" className="mt-4 bg-white text-[#4A90E2] font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-50 transition inline-flex">
              Shop Tencel Picks →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
