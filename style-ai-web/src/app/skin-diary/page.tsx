"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  fetchFirestoreDiaryEntries,
  addFirestoreDiaryEntry,
  removeFirestoreDiaryEntry,
} from "@/lib/firestoreService";

interface DiaryEntry {
  id: string;
  date: string;
  fabric: string;
  garment: string;
  reaction: "None - Perfectly Comfortable" | "Mild Itch" | "Redness / Irritation";
  comfortRating: number;
  notes: string;
}

const DEFAULT_ENTRIES: DiaryEntry[] = [
  {
    id: "1",
    date: "Today, 2:30 PM",
    fabric: "100% Organic Cotton",
    garment: "Azure Linen-Blend Shirt",
    reaction: "None - Perfectly Comfortable",
    comfortRating: 5,
    notes: "Wore all day in hot weather. Zero flare-ups or redness.",
  },
  {
    id: "2",
    date: "Yesterday",
    fabric: "Bamboo Viscose",
    garment: "Activewear Training Tee",
    reaction: "None - Perfectly Comfortable",
    comfortRating: 5,
    notes: "Extremely breathable during workout, no sweat rash.",
  },
];

export default function SkinDiaryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>(DEFAULT_ENTRIES);
  const [garment, setGarment] = useState("");
  const [fabric, setFabric] = useState("100% Organic Cotton");
  const [reaction, setReaction] = useState<DiaryEntry["reaction"]>("None - Perfectly Comfortable");
  const [comfortRating, setComfortRating] = useState(5);
  const [notes, setNotes] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    document.title = "Skin Diary | Style AI";
    let active = true;

    async function loadDiary() {
      const loaded: DiaryEntry[] = [];

      if (user?.uid) {
        try {
          const remoteList = await fetchFirestoreDiaryEntries(user.uid);
          for (const item of remoteList) {
            loaded.push({
              id: item.id || `entry-${Date.now()}`,
              date: item.date,
              fabric: item.fabric,
              garment: item.garment,
              reaction: (item.reaction as DiaryEntry["reaction"]) || "None - Perfectly Comfortable",
              comfortRating: item.comfortRating,
              notes: item.notes,
            });
          }
        } catch {}
      }

      try {
        const saved = localStorage.getItem("style_ai_skin_diary");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loaded.push(...parsed);
          }
        }
      } catch {}

      if (active) {
        setEntries(loaded.length > 0 ? loaded : DEFAULT_ENTRIES);
      }
    }

    loadDiary();
    return () => {
      active = false;
    };
  }, [user]);

  async function handleAddEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!garment.trim()) return;

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      date: "Just now",
      garment: garment.trim(),
      fabric,
      reaction,
      comfortRating,
      notes: notes.trim() || "No specific notes recorded.",
    };

    if (user?.uid) {
      try {
        await addFirestoreDiaryEntry(user.uid, {
          date: newEntry.date,
          garment: newEntry.garment,
          fabric: newEntry.fabric,
          reaction: newEntry.reaction,
          comfortRating: newEntry.comfortRating,
          notes: newEntry.notes,
        });
      } catch {}
    }

    setEntries((prev) => {
      const updated = [newEntry, ...prev];
      try {
        localStorage.setItem("style_ai_skin_diary", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setGarment("");
    setNotes("");
    setFormOpen(false);
  }

  async function handleDeleteEntry(id: string) {
    if (user?.uid) {
      removeFirestoreDiaryEntry(user.uid, id).catch(() => {});
    }

    setEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      try {
        localStorage.setItem("style_ai_skin_diary", JSON.stringify(updated));
      } catch {}
      return updated;
    });
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
              <h1 className="text-xl font-extrabold text-slate-900">Skin Comfort Diary</h1>
              <p className="text-xs text-slate-500">Track fabric tolerance, flare-ups & day-to-day comfort</p>
            </div>
          </div>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            {formOpen ? "Close" : "+ New Entry"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Form Modal / Inline Card */}
        {formOpen && (
          <form
            onSubmit={handleAddEntry}
            className="bg-white border border-blue-200 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in"
          >
            <h3 className="font-extrabold text-slate-900 text-base">Log Today&apos;s Outfit Experience</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Garment Name</label>
                <input
                  type="text"
                  value={garment}
                  onChange={(e) => setGarment(e.target.value)}
                  placeholder="e.g. Linen Summer Shirt"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Fabric</label>
                <select
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option>100% Organic Cotton</option>
                  <option>Pure Linen</option>
                  <option>Bamboo Viscose</option>
                  <option>Mulberry Silk</option>
                  <option>Tencel Lyocell</option>
                  <option>Wool / Blend</option>
                  <option>Polyester / Synthetic</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skin Reaction</label>
                <select
                  value={reaction}
                  onChange={(e) => setReaction(e.target.value as DiaryEntry["reaction"])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option>None - Perfectly Comfortable</option>
                  <option>Mild Itch</option>
                  <option>Redness / Irritation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Comfort Rating ({comfortRating} / 5)
                </label>
                <div className="flex gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      aria-label={`Rate ${star} out of 5`}
                      onClick={() => setComfortRating(star)}
                      className={`text-xl transition ${star <= comfortRating ? "text-amber-400" : "text-slate-200"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notes & Weather Context</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Worn during humid afternoon, stayed light and cool..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white text-xs font-bold px-5 py-2 rounded-xl hover:bg-blue-700 transition"
              >
                Save Entry
              </button>
            </div>
          </form>
        )}

        {/* Entries List */}
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">{entry.date}</span>
                  <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-lg">
                    {entry.fabric}
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">{entry.garment}</h4>
                <p className="text-xs text-slate-600">{entry.notes}</p>
              </div>

              <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    entry.reaction.startsWith("None")
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {entry.reaction}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-400 font-bold">
                    {"★".repeat(entry.comfortRating)}
                    <span className="text-slate-200">{"★".repeat(5 - entry.comfortRating)}</span>
                  </span>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    aria-label={`Delete diary entry for ${entry.garment}`}
                    className="text-slate-300 hover:text-red-500 text-xs px-1.5 py-0.5 rounded transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
