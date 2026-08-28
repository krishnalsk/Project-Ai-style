"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { HeartIcon, ShoppingBagIcon, XIcon } from "@/components/ui/Icons";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { show } = useToast();

  useEffect(() => {
    document.title = "Wishlist | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Your saved items");
  }, []);

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <PageHeader title="Wishlist" backHref="/dashboard" />
        <div className="page-container py-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-4">
            <HeartIcon size={28} className="text-slate-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Your wishlist is empty</h2>
          <p className="text-slate-500 text-sm mb-8 max-w-md">Tap the heart on any product to save skin-safe favourites. They sync across sessions.</p>
          <Link href="/shop" className="bg-[#4A90E2] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[#3A6BC8] transition shadow-[0_4px_14px_rgba(74,144,226,0.25)]">
            Browse Shop →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PageHeader
        title={`Saved Wishlist (${wishlist.length})`}
        subtitle="Your skin-safe shortlist"
        backHref="/dashboard"
        actions={<Link href="/shop" className="text-sm font-bold text-[#4A90E2] hover:underline">Explore More</Link>}
      />

      <main className="page-container py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlist.map((item) => (
            <div key={item.id} className="card card-hover p-5 flex flex-col">
              <div className="relative bg-slate-100 border border-slate-100 rounded-2xl h-44 overflow-hidden mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.images[0]} alt={item.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                <button
                  onClick={() => {
                    removeFromWishlist(item.id);
                    show("Removed from wishlist", "info");
                  }}
                  aria-label={`Remove ${item.name} from wishlist`}
                  className="absolute top-2.5 right-2.5 w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 flex items-center justify-center shadow-sm transition"
                >
                  <XIcon size={16} />
                </button>
                <span className={`absolute bottom-2.5 left-2.5 text-[10px] font-bold px-2 py-1 rounded-full border ${item.skinSafety === "SAFE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                  {item.skinSafety || "SAFE"}
                </span>
              </div>

              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.fabric}</span>
              <h3 className="font-extrabold text-slate-900 text-sm mt-0.5 mb-1 line-clamp-1">{item.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 flex-1">{item.description}</p>

              <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                <span className="font-black text-slate-900">₹{item.price.toLocaleString()}</span>
                <button
                  onClick={() => {
                    addToCart(item, item.availableSizes[0] || "M", item.colors[0] || "Natural");
                    removeFromWishlist(item.id);
                    show(`Moved ${item.name} to cart`, "success");
                  }}
                  className="bg-[#4A90E2] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#3A6BC8] transition flex items-center gap-1.5 min-h-[36px]"
                >
                  <ShoppingBagIcon size={14} /> Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
