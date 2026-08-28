"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { logout, saveUserProfile } from "@/lib/firebaseAuth";

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const defaultForm = {
    fullName: profile?.fullName || "",
    location: profile?.location || "",
    skinType: profile?.skinType || "",
    preferredFabric: profile?.preferredFabric || "",
    size: profile?.size || "",
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    document.title = "Profile | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Manage your profile");
  }, []);

  if (loading || !user) return null;

  const displayName = profile?.fullName || user.displayName || user.email || "Stylist";

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await saveUserProfile(user.uid, formData);
    await refreshProfile();
    setEditing(false);
    setSaving(false);
  }

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  const menuItems = [
    { icon: "🛒", label: "My Orders", href: "/orders" },
    { icon: "🌤️", label: "Live Skin Forecast", href: "/skin-forecast" },
    { icon: "🔍", label: "Label Lens", href: "/label-lens" },
    { icon: "📖", label: "Fabric Encyclopedia", href: "/fabric-encyclopedia" },
    { icon: "🌿", label: "Sustainability Dashboard", href: "/sustainability" },
    { icon: "📓", label: "Skin Comfort Diary", href: "/skin-diary" },
    { icon: "🎁", label: "Rewards & Style Points", href: "/rewards" },
    { icon: "🛍️", label: "Browse Shop", href: "/shop" },
    { icon: "⚙️", label: "Settings & Preferences", href: "/settings" },
    { icon: "❓", label: "Help Center & FAQ", href: "/help" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">←</Link>
            <h1 className="text-lg font-extrabold text-slate-900">Profile</h1>
          </div>
          <button
            onClick={() => {
              if (!editing) {
                setFormData({
                  fullName: profile?.fullName || "",
                  location: profile?.location || "",
                  skinType: profile?.skinType || "",
                  preferredFabric: profile?.preferredFabric || "",
                  size: profile?.size || "",
                });
              }
              setEditing(!editing);
            }}
            className="text-xs font-bold bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
          >
            {editing ? "Cancel" : "✏️ Edit"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Hero */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-black">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">{displayName}</h2>
              <p className="text-blue-100 text-sm">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-white/15 rounded-lg px-2 py-0.5">🧴 {profile?.skinType || "Skin type not set"}</span>
                <span className="text-xs bg-white/15 rounded-lg px-2 py-0.5">✨ {profile?.comfortScore ?? 92}% Comfort</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {editing ? (
          <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900">Edit Your Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "fullName", label: "Full Name", placeholder: "Your name" },
                { key: "location", label: "City / Location", placeholder: "e.g. Mumbai" },
                { key: "skinType", label: "Skin Type", placeholder: "e.g. Sensitive" },
                { key: "preferredFabric", label: "Preferred Fabric", placeholder: "e.g. Organic Cotton" },
                { key: "size", label: "Clothing Size", placeholder: "e.g. M" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{f.label}</label>
                  <input
                    type="text"
                    value={formData[f.key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          /* Profile Details Grid */
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
            <h3 className="font-extrabold text-slate-900 mb-4">Style Profile</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Skin Type", value: profile?.skinType },
                { label: "Preferred Fabric", value: profile?.preferredFabric },
                { label: "Size", value: profile?.size },
                { label: "Location", value: profile?.location },
                { label: "Age", value: profile?.age },
                { label: "Comfort Score", value: profile?.comfortScore ? `${profile.comfortScore}%` : undefined },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-slate-400 block">{item.label}</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{item.value || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden">
          {menuItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-blue-50 transition ${
                i < menuItems.length - 1 ? "border-b border-slate-50" : ""
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-bold text-slate-800 text-sm">{item.label}</span>
              <span className="ml-auto text-slate-400">›</span>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full border-2 border-red-100 text-red-500 font-bold py-3.5 rounded-2xl hover:bg-red-50 transition text-sm"
        >
          Log Out
        </button>
      </main>
    </div>
  );
}
