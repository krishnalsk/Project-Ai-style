const steps = [
  {
    step: "01",
    title: "Create your profile",
    description: "Skin type, comfort preferences, size and location. One-time setup in under 2 minutes.",
    color: "bg-[#4A90E2]",
  },
  {
    step: "02",
    title: "AI analyses your needs",
    description: "4-step engine: skin-safety (XGBoost), comfort weighting (Random Forest) and live weather.",
    color: "bg-[#3A6BC8]",
  },
  {
    step: "03",
    title: "Get personal recommendations",
    description: "Outfits with Comfort & Skin Safety scores — curated for you, not the masses.",
    color: "bg-indigo-600",
  },
  {
    step: "04",
    title: "Shop & track impact",
    description: "Buy sustainably, earn Style Points and monitor your eco-impact.",
    color: "bg-emerald-600",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-24 bg-[#F8FAFC] border-t border-slate-100">
      <div className="page-container">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold text-[#4A90E2] uppercase tracking-[0.14em] mb-2">How it works</p>
          <h2 className="text-[28px] sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            From profile to perfect outfit in 4 steps
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.step} className="relative card p-6 flex flex-col">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%-12px)] w-6 h-px bg-slate-200" aria-hidden />
              )}
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-white font-extrabold text-xs shadow-md mb-4`}>
                {s.step}
              </div>
              <h3 className="text-[15px] font-extrabold text-slate-900 mb-1.5">{s.title}</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a href="/signup" className="inline-flex items-center gap-2 bg-[#4A90E2] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#3A6BC8] transition shadow-[0_4px_14px_rgba(74,144,226,0.25)]">
            Create your profile <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
