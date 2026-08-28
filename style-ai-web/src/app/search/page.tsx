"use client";

import { useState } from "react";
import Link from "next/link";
import { PRODUCTS, Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/Toast";
import { SearchIcon, ShirtIcon } from "@/components/ui/Icons";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { addToCart } = useCart();
  const { show } = useToast();
  const [added, setAdded] = useState<string | null>(null);

  const results: Product[] = query.trim().length >= 2
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.fabric.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  function handleQuickAdd(product: Product) {
    addToCart(product, product.availableSizes[1] ?? product.availableSizes[0], product.colors[0]);
    setAdded(product.id);
    show(`Added ${product.name} to cart`, "success");
    setTimeout(() => setAdded(null), 1500);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="sticky top-0 z-30 glass">
        <div className="page-container flex items-center gap-3 py-3">
          <Link href="/dashboard" aria-label="Back to dashboard" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition shrink-0">
            ←
          </Link>
          <div className="relative flex-1">
            <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fabrics, styles, skin conditions…"
              aria-label="Search catalog"
              className="input-field pl-10"
            />
          </div>
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search" className="shrink-0 w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center">
              ✕
            </button>
          )}
        </div>
      </header>

      <main className="page-container py-6 sm:py-8">
        {query.length === 0 && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Popular searches</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {["Organic Cotton", "Sensitive Skin", "Summer Linen", "Bamboo", "Korean Style", "Dermatitis Safe", "Eco-Certified"].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-[#4A90E2] hover:text-[#4A90E2] hover:bg-[#EFF6FF] px-4 py-2.5 rounded-full transition"
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Browse categories</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Summer Collection", cat: "Summer" },
                { label: "Winter Warmth", cat: "Winter" },
                { label: "Active & Sport", cat: "Active" },
                { label: "Formal Wear", cat: "Formal" },
                { label: "Casual Everyday", cat: "Casual" },
                { label: "All Products", cat: "All" },
              ].map((c) => (
                <Link key={c.cat} href={`/shop?category=${c.cat}`} className="card p-4 hover:border-[#4A90E2]/30 flex items-center gap-3 group">
                  <span className="w-10 h-10 rounded-xl bg-[#E6F4FF] border border-[#BFDBFE] flex items-center justify-center text-[#4A90E2] group-hover:bg-[#4A90E2] group-hover:text-white transition">
                    <ShirtIcon size={18} />
                  </span>
                  <span className="font-bold text-slate-800 text-sm">{c.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {query.length >= 2 && (
          <div>
            <p className="text-sm text-slate-600 mb-4">
              <span className="font-bold text-slate-900">{results.length}</span> results for &ldquo;{query}&rdquo;
            </p>
            {results.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <SearchIcon size={20} className="text-slate-400" />
                </div>
                <p className="font-bold text-slate-900">No results found</p>
                <p className="text-sm text-slate-500 mt-1">Try searching by fabric, skin condition or style</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((p) => (
                  <div key={p.id} className="card p-4 flex items-center gap-4 hover:border-[#4A90E2]/20">
                    <div className="w-14 h-14 bg-slate-100 border border-slate-100 rounded-xl overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-slate-900 text-sm truncate">{p.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.skinSafety === "SAFE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{p.skinSafety}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{p.fabric}</p>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">Comfort {p.comfortScore}% · Eco {p.sustainabilityScore}%</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="font-black text-slate-900 text-sm">₹{p.price.toLocaleString()}</span>
                      <div className="flex gap-1.5">
                        <Link href={`/shop/${p.id}`} className="text-xs font-bold border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:border-[#4A90E2] hover:text-[#4A90E2] transition">
                          View
                        </Link>
                        <button
                          onClick={() => handleQuickAdd(p)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition min-h-[28px] ${added === p.id ? "bg-emerald-600 text-white" : "bg-[#4A90E2] text-white hover:bg-[#3A6BC8]"}`}
                        >
                          {added === p.id ? "✓" : "+ Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
