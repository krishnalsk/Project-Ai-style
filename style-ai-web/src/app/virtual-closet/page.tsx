"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShirtIcon, SparklesIcon } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import {
  fetchFirestoreCloset,
  addFirestoreClosetItem,
  removeFirestoreClosetItem,
} from "@/lib/firestoreService";

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
  const { user } = useAuth();
  const [closet, setCloset] = useState<ClosetItem[]>(DEFAULT_CLOSET);
  const [filter, setFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    fabric: "100% GOTS Organic Cotton",
    category: "Casual",
    comfortRating: 5,
  });

  useEffect(() => {
    document.title = "Virtual Closet | Style AI";
    let active = true;

    async function loadCloset() {
      const items: ClosetItem[] = [];

      // 1. Fetch remote items from Firestore if authenticated
      if (user?.uid) {
        try {
          const remoteCloset = await fetchFirestoreCloset(user.uid);
          for (const item of remoteCloset) {
            items.push({
              id: item.id || `fs-${Math.random()}`,
              name: item.name,
              fabric: item.fabric,
              category: item.category,
              image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
              wearCount: item.wearCount || 1,
              lastWorn: item.lastWorn || "Recently",
              comfortRating: item.comfortRating || 5,
            });
          }
        } catch {}
      }

      // 2. Fetch local demo closet items
      try {
        const saved = localStorage.getItem("style_ai_virtual_closet");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            items.push(...parsed);
          }
        }
      } catch {}

      if (active) {
        setCloset(items.length > 0 ? items : DEFAULT_CLOSET);
      }
    }

    loadCloset();
    return () => {
      active = false;
    };
  }, [user]);

  const categories = ["All", ...Array.from(new Set(closet.map((i) => i.category)))];
  const filtered = filter === "All" ? closet : closet.filter((i) => i.category === filter);

  async function removeItem(id: string) {
    if (user?.uid) {
      removeFirestoreClosetItem(user.uid, id).catch(() => {});
    }

    setCloset((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      try {
        localStorage.setItem("style_ai_virtual_closet", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }

  async function handleAddGarment(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    const added: ClosetItem = {
      id: `cl-${Date.now()}`,
      name: newItem.name.trim(),
      fabric: newItem.fabric,
      category: newItem.category,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
      wearCount: 1,
      lastWorn: "Today",
      comfortRating: newItem.comfortRating,
    };

    if (user?.uid) {
      try {
        await addFirestoreClosetItem(user.uid, {
          name: added.name,
          category: added.category,
          fabric: added.fabric,
          wearCount: 1,
          lastWorn: "Today",
          comfortRating: added.comfortRating,
        });
      } catch {}
    }

    setCloset((prev) => {
      const updated = [added, ...prev];
      try {
        localStorage.setItem("style_ai_virtual_closet", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setNewItem({
      name: "",
      fabric: "100% GOTS Organic Cotton",
      category: "Casual",
      comfortRating: 5,
    });
    setShowAddModal(false);
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs font-bold bg-[#4A90E2] text-white px-3.5 py-2 rounded-xl hover:bg-[#3A6BC8] transition shadow-xs"
            >
              + Add Garment
            </button>
            <Link href="/shop" className="text-xs font-bold bg-white text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition">
              Shop Fashion
            </Link>
          </div>
        }
      />

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-900 text-lg">Add Wardrobe Item</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddGarment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Garment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crisp Linen Summer Shirt"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fabric Composition</label>
                <select
                  value={newItem.fabric}
                  onChange={(e) => setNewItem({ ...newItem, fabric: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800"
                >
                  <option value="100% GOTS Organic Cotton">100% GOTS Organic Cotton (Safe)</option>
                  <option value="100% French Linen">100% French Linen (Safe)</option>
                  <option value="95% Bamboo Viscose">95% Bamboo Viscose (Safe)</option>
                  <option value="Tencel Lyocell Blend">Tencel Lyocell Blend (Safe)</option>
                  <option value="Mulberry Silk">Mulberry Silk (Safe)</option>
                  <option value="Cotton / Poly Blend">Cotton / Poly Blend (Moderate)</option>
                  <option value="100% Polyester / Synthetic">100% Polyester / Synthetic (Avoid for sensitive skin)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Season / Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800"
                  >
                    <option value="Casual">Casual</option>
                    <option value="Summer">Summer</option>
                    <option value="Winter">Winter</option>
                    <option value="Active">Active</option>
                    <option value="Formal">Formal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Comfort Rating (1-5)</label>
                  <select
                    value={newItem.comfortRating}
                    onChange={(e) => setNewItem({ ...newItem, comfortRating: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800"
                  >
                    <option value={5}>5 ★ (Silky / Ideal)</option>
                    <option value={4}>4 ★ (Comfortable)</option>
                    <option value={3}>3 ★ (Neutral)</option>
                    <option value={2}>2 ★ (Slight Friction)</option>
                    <option value={1}>1 ★ (Irritating)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#4A90E2] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-[#3A6BC8] transition shadow-xs"
                >
                  Save to Closet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
