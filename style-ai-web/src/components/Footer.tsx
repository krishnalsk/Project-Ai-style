import Link from "next/link";
import { SparklesIcon } from "./ui/Icons";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#4A90E2] flex items-center justify-center">
                <SparklesIcon size={16} className="text-white" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Style <span className="text-[#4A90E2]">AI</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Smart Comfort Meets Style. Skin-safe, sustainable fashion powered by AI — tailored to your skin, weather and values.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="text-xs font-bold bg-white/10 text-slate-300 px-2.5 py-1 rounded-full">XGBoost Safety</span>
              <span className="text-xs font-bold bg-white/10 text-slate-300 px-2.5 py-1 rounded-full">Random Forest</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/shop" className="hover:text-white transition-colors">Shop Catalog</Link></li>
              <li><Link href="/ai-stylist" className="hover:text-white transition-colors">AI Stylist</Link></li>
              <li><Link href="/fabric-encyclopedia" className="hover:text-white transition-colors">Fabric Encyclopedia</Link></li>
              <li><Link href="/sustainability" className="hover:text-white transition-colors">Sustainability</Link></li>
              <li><Link href="/label-lens" className="hover:text-white transition-colors">Label Lens</Link></li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Tools</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/skin-forecast" className="hover:text-white transition-colors">Skin Forecast</Link></li>
              <li><Link href="/skin-diary" className="hover:text-white transition-colors">Skin Diary</Link></li>
              <li><Link href="/virtual-closet" className="hover:text-white transition-colors">Virtual Closet</Link></li>
              <li><Link href="/outfit-generator" className="hover:text-white transition-colors">Outfit Generator</Link></li>
              <li><Link href="/wash-care" className="hover:text-white transition-colors">Wash Care Guide</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Log In</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/help" className="hover:text-white transition-colors">Help & FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p>© {new Date().getFullYear()} Style AI. All rights reserved.</p>
          <p className="flex items-center gap-1.5">Built for skin safety & comfort <span className="text-red-400">♥</span></p>
        </div>
      </div>
    </footer>
  );
}
