// src/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { UserProfile } from "@/lib/firebaseAuth";

const ALLERGY_OPTIONS = [
  "Polyester",
  "Wool / Lanolin",
  "Latex / Spandex",
  "Synthetic Dyes",
  "Nickel / Metal Trims",
];

const SENSITIVITY_OPTIONS = [
  "Rough Synthetics",
  "Coarse Wool",
  "Tight Elastic",
  "Chafing Seams",
  "Acrylic Knits",
];

const FIT_OPTIONS: ("Relaxed" | "Loose" | "Regular" | "Slim" | "Oversized")[] = [
  "Relaxed",
  "Loose",
  "Regular",
  "Slim",
  "Oversized",
];

const STYLE_OPTIONS = [
  "Minimalist",
  "Korean Casual",
  "Classic Formal",
  "Athleisure",
  "Resort Wear",
  "Streetwear",
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProfilePage() {
  const { user, profile, loading, updateProfile, logout } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: profile?.fullName || "",
    location: profile?.location || "Mumbai",
    skinType: profile?.skinType || "Sensitive",
    preferredFabric: profile?.preferredFabric || "100% GOTS Organic Cotton",
    size: profile?.size || "M",
    preferredFit: (profile?.preferredFit || "Relaxed") as "Relaxed" | "Loose" | "Regular" | "Slim" | "Oversized",
    budgetMax: profile?.budgetMax || 3500,
    confirmedAllergies: profile?.confirmedAllergies || [],
    reportedSensitivities: profile?.reportedSensitivities || ["Rough Synthetics"],
    stylePreferences: profile?.stylePreferences || ["Minimalist", "Korean Casual"],
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    document.title = "Personalized Profile | Style AI";
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        location: profile.location || "Mumbai",
        skinType: profile.skinType || "Sensitive",
        preferredFabric: profile.preferredFabric || "100% GOTS Organic Cotton",
        size: profile.size || "M",
        preferredFit: (profile.preferredFit || "Relaxed") as "Relaxed" | "Loose" | "Regular" | "Slim" | "Oversized",
        budgetMax: profile.budgetMax || 3500,
        confirmedAllergies: profile.confirmedAllergies || [],
        reportedSensitivities: profile.reportedSensitivities || ["Rough Synthetics"],
        stylePreferences: profile.stylePreferences || ["Minimalist", "Korean Casual"],
      });
    }
  }, [profile]);

  if (loading || !user) return null;

  const displayName = profile?.fullName || user.displayName || user.email || "Stylist";

  // Calculate completeness
  let filledPoints = 0;
  if (formData.fullName) filledPoints += 15;
  if (formData.skinType) filledPoints += 20;
  if (formData.size) filledPoints += 15;
  if (formData.budgetMax) filledPoints += 15;
  if (formData.preferredFit) filledPoints += 15;
  if (formData.confirmedAllergies.length >= 0) filledPoints += 20;
  const completeness = Math.min(100, filledPoints);

  function toggleArrayItem(field: "confirmedAllergies" | "reportedSensitivities" | "stylePreferences", item: string) {
    setFormData((prev) => {
      const exists = prev[field].includes(item);
      const nextArr = exists ? prev[field].filter((x) => x !== item) : [...prev[field], item];
      return { ...prev, [field]: nextArr };
    });
  }

  async function handleSave() {
    setSaving(true);
    await updateProfile(formData);
    setSaving(false);
    setEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              ←
            </Link>
            <h1 className="text-lg font-extrabold text-slate-900">Personalized Style Profile</h1>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
          >
            {editing ? "Cancel" : "✏️ Edit Preferences"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Hero Card */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-black">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">{displayName}</h2>
                <p className="text-blue-100 text-sm font-medium">{user.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs font-bold bg-white/15 backdrop-blur px-2.5 py-1 rounded-lg">
                    🧴 {formData.skinType || "Normal Skin"}
                  </span>
                  <span className="text-xs font-bold bg-white/15 backdrop-blur px-2.5 py-1 rounded-lg">
                    📏 Size {formData.size} ({formData.preferredFit})
                  </span>
                  <span className="text-xs font-bold bg-white/15 backdrop-blur px-2.5 py-1 rounded-lg">
                    💰 Max ₹{formData.budgetMax.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Health Bar */}
            <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/20 w-full sm:w-56">
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span>Profile Accuracy</span>
                <span>{completeness}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <span className="text-[10px] text-blue-100 mt-1 block">
                {completeness === 100 ? "✓ Full personalization active" : "Update allergies & budget for 100% precision"}
              </span>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2">
            <span>✅</span>
            <span>Profile and recommendation constraints successfully saved! All AI Style Chat queries and product rankings are now updated.</span>
          </div>
        )}

        {/* Edit Form */}
        {editing ? (
          <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">Configure Personal Preferences & Health Filters</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                These settings directly enforce hard exclusions in the 1,000-record recommendation engine and AI Stylist.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City / Region (for Live Weather)</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Mumbai, Delhi, Bengaluru"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skin Type & Sensitivities</label>
                <select
                  value={formData.skinType}
                  onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="Sensitive">Sensitive (Dermatitis / Reactive)</option>
                  <option value="Eczema-Prone">Eczema-Prone (Requires Hypoallergenic Natural Fibers)</option>
                  <option value="Dry">Dry / Dehydrated (Requires Low Friction)</option>
                  <option value="Normal">Normal Skin</option>
                  <option value="Combination">Combination / Oily</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Clothing Fit</label>
                <div className="grid grid-cols-3 gap-2">
                  {FIT_OPTIONS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredFit: f })}
                      className={`text-xs font-bold py-2 rounded-xl border transition ${
                        formData.preferredFit === f
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clothing Size</label>
                <div className="flex gap-2">
                  {SIZE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, size: s })}
                      className={`flex-1 text-xs font-bold py-2 rounded-xl border transition ${
                        formData.size === s
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Maximum Budget: ₹{formData.budgetMax.toLocaleString("en-IN")}
                </label>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="250"
                  value={formData.budgetMax}
                  onChange={(e) => setFormData({ ...formData, budgetMax: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-bold mt-1">
                  <span>₹500</span>
                  <span>₹5,000</span>
                  <span>₹10,000</span>
                </div>
              </div>
            </div>

            {/* Confirmed Allergies (Hard Exclusion Gate) */}
            <div className="bg-red-50/60 border border-red-200/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🛡️</span>
                <span className="text-xs font-extrabold text-red-900 uppercase tracking-wider">
                  Mandatory Allergy Exclusions (Hard Clinical Gate)
                </span>
              </div>
              <p className="text-[11px] text-red-700">
                Any garment containing these fibers will be strictly purged from your recommendations before ranking.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {ALLERGY_OPTIONS.map((allergy) => {
                  const selected = formData.confirmedAllergies.includes(allergy);
                  return (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => toggleArrayItem("confirmedAllergies", allergy)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
                        selected
                          ? "bg-red-600 text-white border-red-600 shadow-xs"
                          : "bg-white text-red-900 border-red-200 hover:bg-red-100/50"
                      }`}
                    >
                      <span>{selected ? "✕" : "+"}</span>
                      <span>{allergy}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reported Sensitivities */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                  Reported Skin Sensitivities (Demotion Penalty & Cautions)
                </span>
              </div>
              <p className="text-[11px] text-amber-700">
                Items containing these will receive a comfort score penalty and display explicit warnings.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {SENSITIVITY_OPTIONS.map((sens) => {
                  const selected = formData.reportedSensitivities.includes(sens);
                  return (
                    <button
                      key={sens}
                      type="button"
                      onClick={() => toggleArrayItem("reportedSensitivities", sens)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
                        selected
                          ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                          : "bg-white text-amber-900 border-amber-200 hover:bg-amber-100/50"
                      }`}
                    >
                      <span>{selected ? "✓" : "+"}</span>
                      <span>{sens}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Style Aesthetic Preferences */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                Style Aesthetics & Occasion Preferences
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {STYLE_OPTIONS.map((style) => {
                  const selected = formData.stylePreferences.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleArrayItem("stylePreferences", style)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                        selected
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shadow-xs"
              >
                {saving ? "Saving Preferences..." : "Save Preferences"}
              </button>
            </div>
          </div>
        ) : (
          /* Read-Only Profile View */
          <div className="space-y-6">
            {/* Health & Safety Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-red-100 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🛡️</span>
                  <h4 className="text-xs font-black text-red-950 uppercase tracking-wider">
                    Confirmed Allergies (Strictly Excluded)
                  </h4>
                </div>
                {formData.confirmedAllergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.confirmedAllergies.map((a) => (
                      <span key={a} className="bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                        {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">No confirmed allergies set. Click Edit to configure.</p>
                )}
              </div>

              <div className="bg-white border border-amber-100 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⚠️</span>
                  <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                    Skin Sensitivities (Demoted)
                  </h4>
                </div>
                {formData.reportedSensitivities.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.reportedSensitivities.map((s) => (
                      <span key={s} className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">No sensitivities reported.</p>
                )}
              </div>
            </div>

            {/* Profile Metrics Grid */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
              <h3 className="font-extrabold text-slate-900 mb-4">Saved Sizing & Styling Constraints</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Skin Type", value: formData.skinType },
                  { label: "Clothing Size", value: `Size ${formData.size}` },
                  { label: "Preferred Fit", value: formData.preferredFit },
                  { label: "Max Budget", value: `₹${formData.budgetMax.toLocaleString("en-IN")}` },
                  { label: "Primary Fabric", value: formData.preferredFabric },
                  { label: "Weather City", value: formData.location },
                  { label: "Style Aesthetics", value: formData.stylePreferences.join(", ") || "Minimalist" },
                  { label: "Medical Rating", value: "98% Hypoallergenic" },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                    <span className="text-[11px] font-bold text-slate-400 block">{item.label}</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">{item.value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Hub Navigation */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden">
          {[
            { icon: "🤖", label: "AI Style Chat (1,000-Item Catalog Engine)", href: "/ai-stylist" },
            { icon: "🔍", label: "AI Fabric Scanner & Label Lens", href: "/label-lens" },
            { icon: "👗", label: "Smart Virtual Closet & Outfit Generator", href: "/virtual-closet" },
            { icon: "🌤️", label: "Real-time Climate & Skin Forecast", href: "/skin-forecast" },
            { icon: "🛍️", label: "Full 1,000-Garment Shop", href: "/shop" },
            { icon: "🛒", label: "My Orders & Delivery Tracking", href: "/orders" },
          ].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-blue-50/60 transition ${
                i < 5 ? "border-b border-slate-50" : ""
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-bold text-slate-800 text-sm">{item.label}</span>
              <span className="ml-auto text-slate-400 text-sm">›</span>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={async () => {
            await logout();
            router.replace("/");
          }}
          className="w-full border-2 border-red-100 text-red-500 font-bold py-3.5 rounded-2xl hover:bg-red-50 transition text-sm"
        >
          Sign Out of Account
        </button>
      </main>
    </div>
  );
}
