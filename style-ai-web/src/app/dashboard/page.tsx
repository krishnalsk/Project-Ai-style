"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/lib/firebaseAuth";
import Link from "next/link";
import { SearchIcon, BellIcon, HeartIcon, ShoppingBagIcon, UserIcon, SparklesIcon, ShieldCheckIcon, LeafIcon, SunIcon, ScanIcon, BookOpenIcon, AwardIcon, ShirtIcon, BarChartIcon } from "@/components/ui/Icons";

const META_TITLE = "Dashboard | Style AI";
const META_DESC = "Your Style AI dashboard with personalized recommendations";

const QUICK_ACTIONS = [
  { title: "AI Stylist", desc: "Personalized outfit recommendations", href: "/ai-stylist", Icon: SparklesIcon, accent: "bg-[#E6F4FF] text-[#4A90E2] border-[#BFDBFE]" },
  { title: "Lightning Deals", desc: "Exclusive daily offers & coupons", href: "/deals", Icon: AwardIcon, accent: "bg-orange-50 text-orange-600 border-orange-200" },
  { title: "Skin Forecast", desc: "Live UV, humidity & safety alerts", href: "/skin-forecast", Icon: SunIcon, accent: "bg-sky-50 text-sky-600 border-sky-200" },
  { title: "Label Lens", desc: "Scan fabric labels for compatibility", href: "/label-lens", Icon: ScanIcon, accent: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { title: "Fabric Encyclopedia", desc: "Learn about skin-safe textiles", href: "/fabric-encyclopedia", Icon: BookOpenIcon, accent: "bg-violet-50 text-violet-600 border-violet-200" },
  { title: "Sustainability", desc: "Track your eco-fashion impact", href: "/sustainability", Icon: LeafIcon, accent: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { title: "Skin Diary", desc: "Log daily comfort & reactions", href: "/skin-diary", Icon: ShieldCheckIcon, accent: "bg-rose-50 text-rose-600 border-rose-200" },
  { title: "Rewards", desc: "Redeem Style Points for coupons", href: "/rewards", Icon: AwardIcon, accent: "bg-amber-50 text-amber-600 border-amber-200" },
  { title: "Outfit Generator", desc: "Weather-adapted skin-safe looks", href: "/outfit-generator", Icon: ShirtIcon, accent: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  { title: "Virtual Closet", desc: "Manage & track your wardrobe", href: "/virtual-closet", Icon: ShirtIcon, accent: "bg-cyan-50 text-cyan-600 border-cyan-200" },
  { title: "Wash Care Guide", desc: "Decode garment care symbols", href: "/wash-care", Icon: BookOpenIcon, accent: "bg-orange-50 text-orange-600 border-orange-200" },
  { title: "Allergy Checker", desc: "Fabric allergy & flare-up risk", href: "/allergy-checker", Icon: ShieldCheckIcon, accent: "bg-red-50 text-red-600 border-red-200" },
  { title: "Analytics", desc: "Sustainability & comfort report", href: "/analytics", Icon: BarChartIcon, accent: "bg-teal-50 text-teal-600 border-teal-200" },
  { title: "Saved Wishlist", desc: "Bookmarked skin-safe garments", href: "/wishlist", Icon: HeartIcon, accent: "bg-pink-50 text-pink-600 border-pink-200" },
  { title: "Fabric Matchup", desc: "Compare safety & breathability", href: "/fabric-compare", Icon: BookOpenIcon, accent: "bg-blue-50 text-blue-600 border-blue-200" },
  { title: "Style Quiz", desc: "3-question fabric & aesthetic match", href: "/quiz", Icon: SparklesIcon, accent: "bg-purple-50 text-purple-600 border-purple-200" },
];

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.title = META_TITLE;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", META_DESC);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-[#4A90E2] rounded-full animate-spin" aria-hidden />
          <p className="text-slate-500 text-sm font-medium">Loading your style profile…</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  const displayName = profile?.fullName || user.displayName || user.email || "Stylist";
  const skinType = profile?.skinType || "Not set";
  const comfortScore = profile?.comfortScore ?? 92;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 glass">
        <div className="page-container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#4A90E2] flex items-center justify-center shadow-sm">
              <SparklesIcon size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Style <span className="text-[#4A90E2]">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-slate-600 font-medium hidden lg:block mr-2">Hey, {displayName.split(" ")[0]}</span>
            <Link href="/search" aria-label="Search" className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
              <SearchIcon size={18} />
            </Link>
            <Link href="/notifications" aria-label="Notifications" className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
              <BellIcon size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" aria-hidden />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="w-9 h-9 rounded-xl hidden sm:flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
              <HeartIcon size={18} />
            </Link>
            <Link href="/cart" aria-label="Cart" className="w-9 h-9 rounded-xl hidden sm:flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
              <ShoppingBagIcon size={18} />
            </Link>
            <Link href="/profile" aria-label="Profile" className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
              <UserIcon size={18} />
            </Link>
            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex text-sm font-bold text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition ml-1"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="page-container py-8 sm:py-10">
        {/* Welcome Banner */}
        <div className="card overflow-hidden p-0 mb-8">
          <div className="bg-gradient-to-r from-[#4A90E2] to-[#3A6BC8] p-6 sm:p-8 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" aria-hidden />
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">Welcome back</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{displayName}</h1>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="bg-white/15 backdrop-blur border border-white/20 rounded-full px-3 py-1.5 text-xs font-semibold">Skin: {skinType}</span>
              <span className="bg-white/15 backdrop-blur border border-white/20 rounded-full px-3 py-1.5 text-xs font-semibold">Comfort {comfortScore}%</span>
              <span className="bg-white/15 backdrop-blur border border-white/20 rounded-full px-3 py-1.5 text-xs font-semibold">{profile?.location || "Location not set"}</span>
            </div>
          </div>
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex flex-wrap gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Skin Safety Engine active</span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span>4-step AI · XGBoost + Random Forest + Weather rules</span>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Quick Actions</h2>
          <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full">{QUICK_ACTIONS.length} tools</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {QUICK_ACTIONS.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="card card-hover p-5 flex gap-4 items-start group"
            >
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${item.accent}`}>
                <item.Icon size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-[#4A90E2] transition">{item.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Profile Setup Notice */}
        {!profile?.skinType && (
          <div className="card border-amber-200 bg-amber-50/50 p-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldCheckIcon size={20} />
            </div>
            <div>
              <p className="font-bold text-amber-900 text-sm">Complete your Style Profile</p>
              <p className="text-amber-800/80 text-sm mt-1">Set your skin type and preferences to unlock AI-powered recommendations.</p>
              <Link href="/onboarding" className="inline-flex mt-3 bg-amber-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-amber-600 transition">
                Complete Setup →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
