import Link from "next/link";
import { ShieldCheckIcon, LeafIcon, SparklesIcon, ScanIcon } from "./ui/Icons";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#E6F4FF]/60 to-[#EFF6FF] pt-16 sm:pt-20 pb-20 sm:pb-28">
      {/* Decorative blobs — hidden from screen readers */}
      <div className="absolute -top-32 -right-32 w-[560px] h-[560px] bg-[#4A90E2]/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-40 -left-32 w-[520px] h-[520px] bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[900px] h-[1px] bg-gradient-to-r from-transparent via-[#4A90E2]/10 to-transparent pointer-events-none" aria-hidden="true" />

      <div className="relative page-container text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white border border-[#BFDBFE] text-[#4A90E2] text-xs font-bold px-4 py-2 rounded-full mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#4A90E2] animate-pulse" aria-hidden="true" />
          AI-Powered Fashion Intelligence
          <span className="hidden sm:inline-flex items-center gap-1 bg-[#E6F4FF] text-[#4A90E2] px-2 py-0.5 rounded-full text-[10px]">Claude + Gemini</span>
        </div>

        {/* Headline */}
        <h1 className="text-[34px] sm:text-6xl font-extrabold tracking-tight leading-[1.05] text-slate-900 max-w-3xl mx-auto">
          Smart Comfort
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A90E2] to-[#3A6BC8]">Meets Style</span>
        </h1>

        {/* Sub-headline */}
        <p className="mt-5 text-[15px] sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Style AI recommends outfits tailored to your skin type, comfort score and sustainability values — not just what&apos;s trending.
          <span className="hidden sm:inline"> Backed by skin-safety science and real weather data.</span>
        </p>

        {/* CTA Row */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="w-full sm:w-auto bg-[#4A90E2] text-white font-bold px-8 py-3.5 rounded-2xl shadow-[0_8px_24px_rgba(74,144,226,0.3)] hover:bg-[#3A6BC8] hover:shadow-[0_12px_32px_rgba(74,144,226,0.4)] hover:-translate-y-0.5 transition-all text-[15px] flex items-center justify-center gap-2"
          >
            <SparklesIcon size={18} />
            Get Your Style Profile
          </Link>
          <Link
            href="/ai-stylist"
            className="w-full sm:w-auto bg-white border-[1.5px] border-slate-200 text-slate-900 font-bold px-8 py-3.5 rounded-2xl hover:border-[#4A90E2] hover:text-[#4A90E2] hover:bg-[#EFF6FF] transition-all text-[15px] flex items-center justify-center gap-2"
          >
            Try AI Stylist
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Trust strip — icon + label (accessible SVGs, not emoji) */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3">
          {[
            { icon: ShieldCheckIcon, label: "Skin Safety First" },
            { icon: LeafIcon, label: "Sustainability Tracker" },
            { icon: SparklesIcon, label: "AI Stylist Chat" },
            { icon: ScanIcon, label: "Label Lens Scanner" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2 bg-white border border-slate-100 rounded-full px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="w-7 h-7 rounded-full bg-[#E6F4FF] flex items-center justify-center text-[#4A90E2] shrink-0">
                <Icon size={14} />
              </span>
              {label}
            </span>
          ))}
        </div>

        {/* Visual preview — floating cards */}
        <div className="mt-12 hidden lg:flex justify-center gap-4">
          {[
            { title: "Live Skin Forecast", sub: "Humidity 65% · UV 7 — Avoid synthetics", accent: "bg-amber-50 border-amber-200" },
            { title: "98% Skin Safe", sub: "Organic Cotton · Hypoallergenic", accent: "bg-emerald-50 border-emerald-200" },
            { title: "Eco Impact", sub: "1,850 L water saved per item", accent: "bg-sky-50 border-sky-200" },
          ].map((card) => (
            <div key={card.title} className={`card px-5 py-4 flex items-center gap-3 text-left min-w-[220px] ${card.accent}`}>
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0">
                <ShieldCheckIcon size={18} className="text-[#4A90E2]" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900">{card.title}</p>
                <p className="text-xs text-slate-500">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
