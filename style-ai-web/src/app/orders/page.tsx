"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { getOrders } from "@/lib/firestoreService";

interface Order {
  id: string;
  date: string;
  product: string;
  image: string;
  status: "Delivered" | "In Transit" | "Processing";
  amount: number;
  points: number;
  isSimulated?: boolean;
}

const MOCK_ORDERS: Order[] = [
  { id: "#ST001", date: "23 Aug 2026", product: "Azure Linen Shirt", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80", status: "Delivered", amount: 1499, points: 150, isSimulated: true },
  { id: "#ST002", date: "20 Aug 2026", product: "Bamboo Activewear Tee", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=80", status: "In Transit", amount: 899, points: 90, isSimulated: true },
  { id: "#ST003", date: "15 Aug 2026", product: "Organic Cotton Hoodie", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&auto=format&fit=crop&q=80", status: "Delivered", amount: 2299, points: 230, isSimulated: true },
];

const STATUS_STYLES = {
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Transit": "bg-[#EFF6FF] text-[#4A90E2] border-[#BFDBFE]",
  Processing: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  useEffect(() => {
    document.title = "My Orders | Style AI";
    let active = true;

    async function loadOrders() {
      const userOrders: Order[] = [];

      // 1. Fetch remote orders from Firestore if authenticated
      if (user?.uid) {
        try {
          const remoteList = await getOrders(user.uid);
          for (const ro of remoteList) {
            userOrders.push({
              id: ro.id || `#FS${Math.floor(1000 + Math.random() * 9000)}`,
              date: ro.date || "Recent",
              product: ro.items?.[0]?.name ? `${ro.items[0].name}${ro.items.length > 1 ? ` (+${ro.items.length - 1} more)` : ""}` : "Skin-Safe Garment",
              image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
              status: (ro.status as Order["status"]) || "Processing",
              amount: ro.totalAmount || 0,
              points: ro.pointsEarned || Math.round((ro.totalAmount || 0) * 0.1),
              isSimulated: false,
            });
          }
        } catch {}
      }

      // 2. Fetch local demo orders
      try {
        const saved = localStorage.getItem("style_ai_user_orders");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            userOrders.push(...parsed.map((o: Order) => ({ ...o, isSimulated: true })));
          }
        }
      } catch {}

      if (active) {
        setOrders([...userOrders, ...MOCK_ORDERS]);
      }
    }

    loadOrders();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PageHeader title="My Orders" subtitle={`${orders.length} orders placed`} backHref="/profile" actions={<Link href="/shop" className="text-xs font-bold text-[#4A90E2] hover:underline">Shop More →</Link>} />

      <main className="page-container py-6 sm:py-8 space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={order.image} alt={order.product} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 text-sm truncate">{order.product}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Order {order.id} · {order.date}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-xs text-emerald-600 font-bold">+{order.points} Style Points earned</p>
                    {order.isSimulated && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        🧪 Demo Simulation
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-slate-900">₹{order.amount.toLocaleString()}</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full mt-1 inline-block border ${STATUS_STYLES[order.status]}`}>{order.status}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 mt-3">
              {["Order Placed", "Packed", "Shipped", "Delivered"].map((s, i) => {
                const stepsDone = order.status === "Delivered" ? 4 : order.status === "In Transit" ? 3 : 2;
                const active = i < stepsDone;
                return (
                  <div key={s} className="flex-1 flex flex-col items-center">
                    <div className={`w-full h-1.5 rounded-full ${active ? "bg-[#4A90E2]" : "bg-slate-100"}`} />
                    <span className={`text-[9px] font-bold mt-1 text-center ${active ? "text-[#4A90E2]" : "text-slate-300"}`}>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="card bg-[#EFF6FF] border-[#BFDBFE] p-5 text-center">
          <p className="text-sm font-bold text-[#4A90E2] mb-1">Every eco-certified purchase earns Style Points</p>
          <p className="text-xs text-slate-600 mb-3">Redeem them for exclusive discounts in Rewards.</p>
          <Link href="/rewards" className="text-xs font-bold text-[#4A90E2] hover:underline">View Rewards →</Link>
        </div>
      </main>
    </div>
  );
}
