"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AwardIcon } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";

interface Reward {
  id: string;
  title: string;
  cost: number;
  description: string;
  code: string;
}

const REWARDS: Reward[] = [
  { id: "1", title: "₹500 OFF Organic Linen Collection", cost: 300, description: "Valid on all certified 100% flax linen summer shirts and trousers.", code: "ECO-LINEN-500" },
  { id: "2", title: "Free Bamboo Activewear Socks", cost: 200, description: "Complimentary ultra-breathable bamboo running socks with any order.", code: "BAMBOO-GIFT" },
  { id: "3", title: "15% OFF Sensitive Skin Bundle", cost: 500, description: "Applicable on any 3+ organic cotton and modal capsule pieces.", code: "SKIN-SAFE-15" },
];

export default function RewardsPage() {
  const [points, setPoints] = useState(650);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const { show } = useToast();

  useEffect(() => {
    document.title = "Rewards | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Your Style Points and rewards");
  }, []);

  function handleRedeem(reward: Reward) {
    if (points >= reward.cost && !unlocked.includes(reward.id)) {
      setPoints((p) => p - reward.cost);
      setUnlocked((u) => [...u, reward.id]);
      show(`Unlocked ${reward.title}! Code: ${reward.code}`, "success");
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PageHeader
        title="Rewards & Style Points"
        subtitle="Earn points for sustainable fashion & skin health logs"
        backHref="/dashboard"
        actions={<span className="hidden sm:inline-flex text-xs bg-amber-50 text-amber-700 font-bold px-3 py-1.5 rounded-full border border-amber-200">Gold Tier Member</span>}
      />

      <main className="page-container py-6 sm:py-8 space-y-6">
        <div className="card overflow-hidden p-0">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-amber-100 uppercase tracking-widest">Available Balance</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black">{points}</span>
                <span className="text-lg font-bold text-amber-100">Style Points</span>
              </div>
              <p className="text-sm text-amber-100/90 mt-2 max-w-md">Earn +50 pts each time you log in your Skin Diary or complete an AI Stylist session.</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 text-center">
              <span className="text-xs font-bold block text-amber-100">Current Status</span>
              <span className="text-sm font-black mt-0.5 flex items-center gap-1.5 justify-center">
                <AwardIcon size={16} /> Eco Pioneer Level 2
              </span>
            </div>
          </div>
        </div>

        <h2 className="text-base font-extrabold text-slate-900">Redeem Exclusive Vouchers</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REWARDS.map((r) => {
            const isUnlocked = unlocked.includes(r.id);
            const canAfford = points >= r.cost;
            return (
              <div key={r.id} className="card p-6 flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-3">
                  <h3 className="font-extrabold text-slate-900 text-sm flex-1">{r.title}</h3>
                  <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full shrink-0">{r.cost} pts</span>
                </div>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed flex-1">{r.description}</p>
                {isUnlocked ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                    <span className="text-xs text-emerald-700 font-bold block">Coupon Code</span>
                    <span className="font-mono font-bold text-emerald-900 text-sm tracking-wider">{r.code}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRedeem(r)}
                    disabled={!canAfford}
                    className="w-full bg-slate-900 text-white font-bold text-sm py-3 rounded-xl hover:bg-slate-800 transition disabled:opacity-30 disabled:pointer-events-none min-h-[44px]"
                  >
                    {canAfford ? `Redeem for ${r.cost} pts` : `Need ${r.cost - points} more pts`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
