// src/app/virtual-closet/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";
import {
  fetchFirestoreCloset,
  addFirestoreClosetItem,
  removeFirestoreClosetItem,
} from "@/lib/firestoreService";

export interface ClosetItem {
  id: string;
  name: string;
  fabric: string;
  category: "Tops" | "Bottoms" | "Outerwear" | "Footwear" | "Accessories" | "Dresses" | "Summer" | "Winter" | "Active" | "Casual";
  color: string;
  fit: "Relaxed" | "Loose" | "Regular" | "Slim" | "Oversized";
  laundryStatus: "Clean & Ready" | "In Laundry" | "Dry Cleaning";
  image: string;
  wearCount: number;
  lastWorn: string;
  comfortRating: number;
}

const DEFAULT_CLOSET: ClosetItem[] = [
  {
    id: "c1",
    name: "Azure French Linen Shirt",
    fabric: "100% French Linen",
    category: "Tops",
    color: "Azure Blue",
    fit: "Relaxed",
    laundryStatus: "Clean & Ready",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80",
    wearCount: 8,
    lastWorn: "Today",
    comfortRating: 5,
  },
  {
    id: "c2",
    name: "Organic Cotton Chinos",
    fabric: "100% GOTS Organic Cotton",
    category: "Bottoms",
    color: "Warm Beige",
    fit: "Relaxed",
    laundryStatus: "Clean & Ready",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&auto=format&fit=crop&q=80",
    wearCount: 14,
    lastWorn: "3 days ago",
    comfortRating: 5,
  },
  {
    id: "c3",
    name: "Bamboo Activewear Tee",
    fabric: "95% Bamboo Viscose / 5% Elastane",
    category: "Tops",
    color: "Sage Green",
    fit: "Regular",
    laundryStatus: "In Laundry",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=80",
    wearCount: 22,
    lastWorn: "Yesterday",
    comfortRating: 5,
  },
  {
    id: "c4",
    name: "GOTS Heavy Fleece Hoodie",
    fabric: "100% Organic Cotton Fleece",
    category: "Outerwear",
    color: "Oatmeal",
    fit: "Oversized",
    laundryStatus: "Clean & Ready",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&auto=format&fit=crop&q=80",
    wearCount: 11,
    lastWorn: "Last week",
    comfortRating: 5,
  },
  {
    id: "c5",
    name: "Minimalist Canvas Trainers",
    fabric: "Organic Cotton Canvas + Cork",
    category: "Footwear",
    color: "Ivory White",
    fit: "Regular",
    laundryStatus: "Clean & Ready",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&auto=format&fit=crop&q=80",
    wearCount: 18,
    lastWorn: "2 days ago",
    comfortRating: 4,
  },
];

export default function VirtualClosetPage() {
  const { user } = useAuth();
  const [closet, setCloset] = useState<ClosetItem[]>(DEFAULT_CLOSET);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterLaundry, setFilterLaundry] = useState<"All" | "Clean & Ready" | "In Laundry">("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    fabric: "100% GOTS Organic Cotton",
    category: "Tops" as ClosetItem["category"],
    color: "Ivory White",
    fit: "Relaxed" as ClosetItem["fit"],
    comfortRating: 5,
    laundryStatus: "Clean & Ready" as ClosetItem["laundryStatus"],
  });

  useEffect(() => {
    document.title = "Smart Virtual Closet | Style AI";

    try {
      const stored = localStorage.getItem("style_ai_virtual_closet");
      if (stored) {
        setCloset(JSON.parse(stored));
      } else {
        localStorage.setItem("style_ai_virtual_closet", JSON.stringify(DEFAULT_CLOSET));
      }
    } catch {}

    async function loadRemote() {
      if (user?.uid) {
        try {
          const remoteCloset = await fetchFirestoreCloset(user.uid);
          if (remoteCloset && remoteCloset.length > 0) {
            const mapped: ClosetItem[] = remoteCloset.map((r, i) => ({
              id: r.id || `fs-${i}`,
              name: r.name,
              fabric: r.fabric,
              category: (r.category as ClosetItem["category"]) || "Tops",
              color: "Ivory White",
              fit: "Relaxed",
              laundryStatus: "Clean & Ready",
              image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
              wearCount: r.wearCount || 1,
              lastWorn: r.lastWorn || "Recent",
              comfortRating: r.comfortRating || 5,
            }));
            setCloset((prev) => {
              const combined = [...mapped, ...prev.filter((p) => !mapped.some((m) => m.name === p.name))];
              try {
                localStorage.setItem("style_ai_virtual_closet", JSON.stringify(combined));
              } catch {}
              return combined;
            });
          }
        } catch {}
      }
    }

    loadRemote();
  }, [user]);

  function toggleLaundryStatus(id: string) {
    setCloset((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const nextStatus: ClosetItem["laundryStatus"] =
            item.laundryStatus === "Clean & Ready" ? "In Laundry" : "Clean & Ready";
          return { ...item, laundryStatus: nextStatus };
        }
        return item;
      });
      try {
        localStorage.setItem("style_ai_virtual_closet", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }

  async function handleRemove(id: string) {
    setCloset((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      try {
        localStorage.setItem("style_ai_virtual_closet", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (user?.uid) {
      try {
        await removeFirestoreClosetItem(user.uid, id);
      } catch {}
    }
  }

  async function handleAddGarment(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    const added: ClosetItem = {
      id: `closet-${Date.now()}`,
      name: newItem.name.trim(),
      fabric: newItem.fabric,
      category: newItem.category,
      color: newItem.color,
      fit: newItem.fit,
      laundryStatus: newItem.laundryStatus,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
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
      category: "Tops",
      color: "Ivory White",
      fit: "Relaxed",
      comfortRating: 5,
      laundryStatus: "Clean & Ready",
    });
    setShowAddModal(false);
  }

  // Filter items
  const filteredItems = closet.filter((item) => {
    if (filterCategory !== "All" && item.category !== filterCategory) return false;
    if (filterLaundry !== "All" && item.laundryStatus !== filterLaundry) return false;
    return true;
  });

  const cleanCount = closet.filter((i) => i.laundryStatus === "Clean & Ready").length;
  const laundryCount = closet.filter((i) => i.laundryStatus !== "Clean & Ready").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <PageHeader
        title="Smart Virtual Closet"
        subtitle={`${closet.length} Wardrobe Pieces · ${cleanCount} Clean & Ready · ${laundryCount} in Laundry`}
        backHref="/dashboard"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/outfit-generator"
              className="text-xs font-black bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition shadow-xs flex items-center gap-1.5"
            >
              <span>✨</span>
              <span>Generate Outfits</span>
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs font-bold bg-white text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition"
            >
              + Add Garment
            </button>
          </div>
        }
      />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Availability & Laundry Notice */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-black text-slate-900">Garment Availability & Laundry Intelligence</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              The Outfit Generator only pairs clothes marked <span className="text-emerald-600 font-bold">Clean & Ready</span> and respects your confirmed allergy exclusions.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterLaundry("All")}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                filterLaundry === "All" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              All ({closet.length})
            </button>
            <button
              onClick={() => setFilterLaundry("Clean & Ready")}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                filterLaundry === "Clean & Ready" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              ✨ Clean & Ready ({cleanCount})
            </button>
            <button
              onClick={() => setFilterLaundry("In Laundry")}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                filterLaundry === "In Laundry" ? "bg-amber-600 text-white border-amber-600" : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              🧺 In Laundry ({laundryCount})
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["All", "Tops", "Bottoms", "Outerwear", "Footwear", "Accessories"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border whitespace-nowrap transition ${
                filterCategory === cat
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Closet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group">
              <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  <span className="text-[10px] font-black bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-slate-800 shadow-xs">
                    {item.category}
                  </span>
                </div>
                <button
                  onClick={() => toggleLaundryStatus(item.id)}
                  className={`absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs backdrop-blur transition cursor-pointer ${
                    item.laundryStatus === "Clean & Ready"
                      ? "bg-emerald-600/90 text-white hover:bg-emerald-700"
                      : "bg-amber-600/90 text-white hover:bg-amber-700"
                  }`}
                >
                  {item.laundryStatus === "Clean & Ready" ? "✨ Ready" : "🧺 Laundry"}
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-black text-slate-900 text-sm truncate">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{item.fabric}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                      {item.color || "Ivory"}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                      {item.fit || "Relaxed"} Fit
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Worn {item.wearCount}x</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLaundryStatus(item.id)}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      {item.laundryStatus === "Clean & Ready" ? "Send to Wash" : "Mark Clean"}
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-slate-300 hover:text-red-500 transition text-sm ml-1"
                      title="Remove Garment"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Garment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">Add Garment to Virtual Closet</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
              </div>

              <form onSubmit={handleAddGarment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Garment Name</label>
                  <input
                    type="text"
                    required
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g. Crisp White Cotton Oxford"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value as ClosetItem["category"] })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                    >
                      <option value="Tops">Tops</option>
                      <option value="Bottoms">Bottoms</option>
                      <option value="Outerwear">Outerwear</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary Color</label>
                    <input
                      type="text"
                      value={newItem.color}
                      onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fabric Composition</label>
                  <input
                    type="text"
                    value={newItem.fabric}
                    onChange={(e) => setNewItem({ ...newItem, fabric: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Fit</label>
                    <select
                      value={newItem.fit}
                      onChange={(e) => setNewItem({ ...newItem, fit: e.target.value as ClosetItem["fit"] })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                    >
                      <option value="Relaxed">Relaxed</option>
                      <option value="Loose">Loose</option>
                      <option value="Regular">Regular</option>
                      <option value="Slim">Slim</option>
                      <option value="Oversized">Oversized</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Laundry Status</label>
                    <select
                      value={newItem.laundryStatus}
                      onChange={(e) => setNewItem({ ...newItem, laundryStatus: e.target.value as ClosetItem["laundryStatus"] })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                    >
                      <option value="Clean & Ready">Clean & Ready</option>
                      <option value="In Laundry">In Laundry</option>
                      <option value="Dry Cleaning">Dry Cleaning</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white font-bold text-xs px-5 py-2 rounded-xl hover:bg-blue-700 shadow-xs"
                  >
                    Save to Closet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
