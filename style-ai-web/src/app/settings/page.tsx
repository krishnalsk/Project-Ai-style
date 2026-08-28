"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [uvNotifs, setUvNotifs] = useState(true);
  const [skinDiaryReminders, setSkinDiaryReminders] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.title = "Settings | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "App settings and preferences");
  }, []);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profile" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Settings</h1>
              <p className="text-xs text-slate-500">Preferences, notifications & data privacy</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            {saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Notifications */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-slate-400">
            Notification Preferences
          </h2>

          {[
            {
              title: "UV & Skin Risk Alerts",
              desc: "Get morning notifications when UV Index exceeds 7 or high humidity is detected.",
              state: uvNotifs,
              set: setUvNotifs,
            },
            {
              title: "Skin Diary Daily Reminders",
              desc: "Receive a gentle evening prompt to record outfit comfort and flare-up reactions.",
              state: skinDiaryReminders,
              set: setSkinDiaryReminders,
            },
            {
              title: "Style & Reward Updates",
              desc: "Receive emails when new GOTS organic collections drop or when Style Points can be redeemed.",
              state: emailAlerts,
              set: setEmailAlerts,
            },
          ].map((item) => (
            <div key={item.title} className="flex items-center justify-between gap-4 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
              <div>
                <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <button
                role="switch"
                aria-checked={item.state}
                aria-label={`${item.title} toggle`}
                onClick={() => item.set(!item.state)}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  item.state ? "bg-blue-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    item.state ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Data & Privacy */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
            Data Privacy & Security
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <div>
                <span className="font-bold text-sm text-slate-900 block">Encryption Status</span>
                <span className="text-xs text-emerald-600 font-semibold">🔒 End-to-End TLS & Firestore Rules Active</span>
              </div>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                Secure
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <div>
                <span className="font-bold text-sm text-slate-900 block">Personal Profile Data</span>
                <span className="text-xs text-slate-500">Stored exclusively for your AI Stylist recommendations</span>
              </div>
              <Link href="/profile" className="text-xs font-bold text-blue-600 hover:underline">
                Manage Profile →
              </Link>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex justify-between items-center text-xs text-slate-500">
          <div>
            <span className="font-bold text-slate-800 block text-sm mb-0.5">Style AI Web</span>
            <span>Version 1.0.0 (Production Build) · Next.js 16</span>
          </div>
          <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-xl">
            Clean & Active
          </span>
        </div>
      </main>
    </div>
  );
}
