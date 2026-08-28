import { SparklesIcon, SunIcon, ScanIcon, LeafIcon, BookOpenIcon, AwardIcon } from "./ui/Icons";

const features = [
  {
    Icon: SparklesIcon,
    title: "AI Stylist Chat",
    description: "Instant outfit recommendations. Tell it your skin type, occasion and weather — it does the rest.",
    tag: "Claude & Gemini",
    accent: "bg-[#E6F4FF] text-[#4A90E2]",
  },
  {
    Icon: SunIcon,
    title: "Live Skin Forecast",
    description: "Real-time UV and humidity analysis recommends the safest fabrics for your skin today.",
    tag: "Skin Safety Engine",
    accent: "bg-amber-50 text-amber-600",
  },
  {
    Icon: ScanIcon,
    title: "Label Lens",
    description: "Scan any clothing label to see fabric composition and skin compatibility in seconds.",
    tag: "OCR + AI Analysis",
    accent: "bg-sky-50 text-sky-600",
  },
  {
    Icon: LeafIcon,
    title: "Sustainability Tracker",
    description: "See carbon and water impact per purchase. Earn Style Points for eco-friendly choices.",
    tag: "Green Fashion",
    accent: "bg-emerald-50 text-emerald-600",
  },
  {
    Icon: BookOpenIcon,
    title: "Fabric Encyclopedia",
    description: "Deep-dive into textiles — learn which fabrics suit sensitive skin, heat or sport.",
    tag: "Knowledge Base",
    accent: "bg-violet-50 text-violet-600",
  },
  {
    Icon: AwardIcon,
    title: "Rewards & Style Points",
    description: "Earn points through sustainable shopping and skin-health tracking, redeemable for coupons.",
    tag: "Gamified Experience",
    accent: "bg-amber-50 text-amber-600",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-24 bg-white">
      <div className="page-container">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold text-[#4A90E2] uppercase tracking-[0.14em] mb-2">What We Offer</p>
          <h2 className="text-[28px] sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Everything you need to dress smarter
          </h2>
          <p className="mt-3 text-slate-500 text-[15px] leading-relaxed">
            Style AI combines skin science, AI and sustainability to give you truly personal fashion — not just trends.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative card card-hover p-6 flex flex-col"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.accent}`}>
                <f.Icon size={20} />
              </div>
              <h3 className="text-[15px] font-extrabold text-slate-900 mb-1.5">{f.title}</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed flex-1">{f.description}</p>
              <span className="mt-4 inline-flex self-start bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-1 rounded-full">
                {f.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
