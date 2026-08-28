"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  type: "order" | "ai" | "skin" | "reward" | "promo";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL: Notification[] = [
  { id: "1", type: "order", title: "Order Delivered!", body: "Your Azure Linen Shirt has been delivered. Rate your experience!", time: "2h ago", read: false },
  { id: "2", type: "ai", title: "AI Style Tip", body: "UV index is 8 today in your area. Wear light linen or bamboo to protect your skin.", time: "5h ago", read: false },
  { id: "3", type: "skin", title: "Skin Diary Reminder", body: "Don't forget to log today's outfit comfort. It helps us improve your recommendations.", time: "Yesterday", read: false },
  { id: "4", type: "reward", title: "🎉 150 Style Points Earned!", body: "You earned 150 Style Points from your last order. Redeem for exclusive discounts.", time: "2 days ago", read: true },
  { id: "5", type: "promo", title: "New Summer Linen Collection", body: "GOTS-certified pure linen shirts just dropped. Skin-safe & eco-certified. Shop now!", time: "3 days ago", read: true },
];

const TYPE_ICONS = { order: "📦", ai: "🤖", skin: "🧴", reward: "🎁", promo: "🛍️" };
const TYPE_COLORS = {
  order: "bg-blue-50 border-blue-100",
  ai: "bg-indigo-50 border-indigo-100",
  skin: "bg-rose-50 border-rose-100",
  reward: "bg-amber-50 border-amber-100",
  promo: "bg-emerald-50 border-emerald-100",
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(INITIAL);
  const unreadCount = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    document.title = "Notifications | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Your notifications");
  }, []);

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">←</Link>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-xs font-bold text-blue-600">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs font-bold text-blue-600 hover:underline">
              Mark all read
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-3">
        {notifs.map((n) => (
          <button
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`w-full text-left border rounded-2xl p-4 shadow-xs transition hover:shadow-sm flex gap-4 ${
              n.read ? "bg-white border-slate-100 opacity-75" : `${TYPE_COLORS[n.type]}`
            }`}
          >
            <div className="text-2xl shrink-0 mt-0.5">{TYPE_ICONS[n.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-extrabold text-slate-900 ${!n.read ? "text-slate-900" : "text-slate-600"}`}>
                  {n.title}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400">{n.time}</span>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
            </div>
          </button>
        ))}
      </main>
    </div>
  );
}
