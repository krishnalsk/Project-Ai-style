"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MOCK_PRODUCTS, Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { 
  HeartIcon, 
  ShoppingBagIcon, 
  StarIcon, 
  CheckIcon 
} from "@/components/ui/Icons";

interface Coupon {
  code: string;
  discount: string;
  minPurchase: string;
  category: string;
  tag: string;
}

const EXCLUSIVE_COUPONS: Coupon[] = [
  { code: "LINEN500", discount: "Flat ₹500 OFF", minPurchase: "On orders above ₹1,999", category: "Flax Linen Collection", tag: "Hot Seller" },
  { code: "ECOCOTTON", discount: "Extra 15% OFF", minPurchase: "No minimum purchase limit", category: "Organic Cotton Essentials", tag: "Eczema Friendly" },
  { code: "BAMBOO30", discount: "Extra 30% OFF", minPurchase: "On activewear orders above ₹1,499", category: "Bamboo Activewear", tag: "Anti-Chafe Spec" },
  { code: "FESTIVESAFE", discount: "Save ₹300", minPurchase: "On orders above ₹1,299", category: "Mulberry Silk & Festive Wear", tag: "Limited Time" }
];

export default function DealsPage() {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { show } = useToast();

  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  // Countdown timer effect
  useEffect(() => {
    document.title = "Lightning Deals & Offers Zone | Style AI";
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 }; // Reset to daily cycle
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Filter products that have originalPrice (discounted items)
  const deals: Product[] = MOCK_PRODUCTS.filter(
    (p) => p.originalPrice && p.originalPrice > p.price
  );

  // Pick the top deal of the day
  const dealOfTheDay = deals[0] || MOCK_PRODUCTS[0];
  const dealOfTheDayDiscount = dealOfTheDay.originalPrice
    ? Math.round(((dealOfTheDay.originalPrice - dealOfTheDay.price) / dealOfTheDay.originalPrice) * 100)
    : 30;

  function copyToClipboard(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    show(`Coupon "${code}" copied successfully!`, "success");
    setTimeout(() => setCopiedCode(null), 2500);
  }

  function handleQuickAdd(product: Product) {
    addToCart(product, product.availableSizes[0] || "M", product.colors[0] || "Natural");
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    show(`Added ${product.name} to cart!`, "success");
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  }

  function toggleWishlist(product: Product) {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      show("Removed from wishlist", "info");
    } else {
      addToWishlist(product);
      show("Added to wishlist", "success");
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PageHeader
        title="Lightning Deals & Offers Zone"
        subtitle="Exclusive daily savings on premium, skin-safe organic clothing"
        backHref="/dashboard"
        actions={
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 font-extrabold text-[11px] px-3 py-1.5 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            LIVE SALE
          </div>
        }
      />

      <main className="page-container py-6 sm:py-8 space-y-8">
        
        {/* Deal Header Banner with Countdown Timer */}
        <div className="card overflow-hidden border-orange-100 bg-gradient-to-r from-slate-900 via-[#1A2E40] to-[#0D3B66] p-6 sm:p-8 text-white relative shadow-md">
          <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-black tracking-widest text-orange-400 uppercase bg-orange-950/40 border border-orange-500/30 px-3 py-1 rounded-full">
                ⚡ Limited Time Lightning Deals
              </span>
              <h2 className="text-2xl sm:text-4xl font-black mt-3 tracking-tight">Super Saver Shopping Festival</h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-lg">
                Dress comfortably in hypoallergenic organic fibers. Save extra with SBI card discounts, style coin vouchers, and free express shipping.
              </p>
            </div>

            {/* Countdown Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 text-center min-w-[220px]">
              <span className="text-xs text-orange-300 font-extrabold tracking-wider uppercase block mb-2">Deals Expire In</span>
              <div className="flex items-center justify-center gap-2">
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight">{String(timeLeft.hours).padStart(2, "0")}</span>
                  <span className="text-[10px] text-slate-300 font-bold uppercase mt-0.5">Hrs</span>
                </div>
                <span className="text-xl font-bold text-orange-400 animate-pulse">:</span>
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight">{String(timeLeft.minutes).padStart(2, "0")}</span>
                  <span className="text-[10px] text-slate-300 font-bold uppercase mt-0.5">Min</span>
                </div>
                <span className="text-xl font-bold text-orange-400 animate-pulse">:</span>
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight">{String(timeLeft.seconds).padStart(2, "0")}</span>
                  <span className="text-[10px] text-slate-300 font-bold uppercase mt-0.5">Sec</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Deal of the Day (Amazon Style Box) */}
        {dealOfTheDay && (
          <div className="card p-6 sm:p-8 bg-white border border-slate-100 shadow-xs">
            <span className="inline-block text-[11px] font-black text-white bg-red-600 px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              Deal of the Day
            </span>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Image */}
              <div className="lg:col-span-5 relative bg-slate-50 rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5] border border-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={dealOfTheDay.images[0]} 
                  alt={dealOfTheDay.name} 
                  className="w-full h-full object-cover" 
                />
                <span className="absolute top-4 left-4 bg-orange-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
                  -{dealOfTheDayDiscount}% OFF
                </span>
                <span className="absolute top-4 right-4 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black px-3 py-1 rounded-full backdrop-blur">
                  {dealOfTheDay.skinSafetyScore}% Skin Safe
                </span>
              </div>

              {/* Specs & Buy Box */}
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest block">{dealOfTheDay.fabric}</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{dealOfTheDay.name}</h3>
                
                {/* Rating & Brand details */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md font-bold">
                    <StarIcon size={12} /> 4.9
                  </div>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-500 font-medium">1,402 reviews</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-emerald-600 font-extrabold">95% Eco Score</span>
                </div>

                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{dealOfTheDay.description}</p>

                {/* Price block */}
                <div className="flex items-baseline gap-2 pt-2 border-t border-slate-100">
                  <span className="text-3xl font-black text-slate-900">₹{dealOfTheDay.price.toLocaleString()}</span>
                  {dealOfTheDay.originalPrice && (
                    <span className="text-sm text-slate-400 line-through">₹{dealOfTheDay.originalPrice.toLocaleString()}</span>
                  )}
                  <span className="text-xs font-extrabold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full ml-1">
                    Save ₹{(dealOfTheDay.originalPrice || 0) - dealOfTheDay.price}
                  </span>
                </div>

                {/* Bank Partner Offers */}
                <div className="bg-[#EFF6FF] border border-blue-100 rounded-2xl p-4 space-y-2">
                  <span className="text-xs font-bold text-blue-800 block">💳 Partner Bank Offers Available:</span>
                  <ul className="text-[11px] text-blue-700 font-medium space-y-1">
                    <li>• 10% Instant Discount on SBI Credit Card transactions (Min purchase ₹1,200)</li>
                    <li>• 5% Unlimited Cashback on Style AI Axis Bank Credit Cards</li>
                    <li>• Save extra ₹100 using 50 Style Coins in your wallet</li>
                  </ul>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => handleQuickAdd(dealOfTheDay)}
                    className={`flex-1 font-black text-sm px-6 py-3.5 rounded-xl transition shadow-xs flex items-center justify-center gap-2 ${
                      addedItems[dealOfTheDay.id] 
                        ? "bg-emerald-600 text-white" 
                        : "bg-[#4A90E2] text-white hover:bg-[#3A6BC8]"
                    }`}
                  >
                    <ShoppingBagIcon size={16} />
                    {addedItems[dealOfTheDay.id] ? "Added ✓" : "Buy Deal Now"}
                  </button>
                  <button
                    onClick={() => toggleWishlist(dealOfTheDay)}
                    aria-label="Add to wishlist"
                    className={`p-3.5 rounded-xl border flex items-center justify-center transition ${
                      isInWishlist(dealOfTheDay.id)
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-white border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200"
                    }`}
                  >
                    <HeartIcon size={20} className={isInWishlist(dealOfTheDay.id) ? "fill-current" : ""} />
                  </button>
                  <Link
                    href={`/shop/${dealOfTheDay.id}`}
                    className="border border-slate-200 hover:border-slate-300 text-slate-700 bg-white font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center"
                  >
                    Product details →
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Coupons Zone (Amazon/Flipkart Collect Vouchers) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Style Vouchers & Coupons</h3>
            <span className="text-xs text-slate-400 font-medium">Click coupon code to copy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EXCLUSIVE_COUPONS.map((c) => {
              const isCopied = copiedCode === c.code;
              return (
                <div 
                  key={c.code}
                  className="card p-5 bg-white border border-dashed border-slate-200 hover:border-orange-300 relative flex flex-col justify-between overflow-hidden shadow-xs cursor-pointer select-none"
                  onClick={() => copyToClipboard(c.code)}
                >
                  {/* Left notch decoration */}
                  <div className="absolute left-[-8px] top-1/2 transform -translate-y-1/2 w-4 h-6 bg-[#F8FAFC] border-r border-slate-200 rounded-r-full" />
                  {/* Right notch decoration */}
                  <div className="absolute right-[-8px] top-1/2 transform -translate-y-1/2 w-4 h-6 bg-[#F8FAFC] border-l border-slate-200 rounded-l-full" />

                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">
                      {c.tag}
                    </span>
                    <h4 className="text-lg font-black text-slate-900">{c.discount}</h4>
                    <p className="text-[11px] font-bold text-slate-400">{c.category}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">{c.minPurchase}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-600 tracking-wider">
                      Code: <strong className="text-slate-800">{c.code}</strong>
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full transition flex items-center gap-1 ${
                      isCopied 
                        ? "bg-emerald-50 text-emerald-700" 
                        : "bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                    }`}>
                      {isCopied ? <><CheckIcon size={10} /> Copied</> : "Collect"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Curated Lightning Deals Grid */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Today&apos;s Lightning Deals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {deals.slice(1).map((p) => {
              const wished = isInWishlist(p.id);
              const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : null;
              
              return (
                <div key={p.id} className="group card card-hover flex flex-col justify-between overflow-hidden relative">
                  
                  {/* Image container */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={p.images[0]} 
                      alt={p.name} 
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    
                    {/* Discount badge */}
                    {discount && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                        -{discount}% OFF
                      </span>
                    )}

                    {/* Skin Safe Tag */}
                    <span className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50/95 text-emerald-700 border border-emerald-100 backdrop-blur">
                      {p.skinSafetyScore}% Safe
                    </span>

                    {/* Wishlist button */}
                    <button
                      onClick={() => toggleWishlist(p)}
                      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                      className={`absolute bottom-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center shadow-md border backdrop-blur transition ${
                        wished ? "bg-red-500 text-white border-red-500" : "bg-white/95 text-slate-500 border-white hover:text-red-500 hover:border-red-200"
                      }`}
                    >
                      <HeartIcon size={14} className={wished ? "fill-current" : ""} />
                    </button>

                    {/* Lightning Deal Tag */}
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 text-white text-[9px] font-black px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
                      ⚡ LIGHTNING DEAL
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate mb-1">
                      {p.fabric}
                    </span>

                    <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1 leading-tight group-hover:text-[#4A90E2] transition mb-1.5">
                      {p.name}
                    </h4>

                    {/* Mini rating block */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-3">
                      <span className="flex items-center gap-0.5 text-amber-500 font-bold bg-amber-50 px-1 rounded">
                        ★ 4.8
                      </span>
                      <span>(128)</span>
                    </div>

                    {/* Eco Score badge */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 mb-4 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-bold">ECO-SCORE:</span>
                      <span className="font-black text-slate-700">{p.sustainabilityScore}%</span>
                    </div>

                    {/* Price and Action Footer */}
                    <div className="flex items-center justify-between gap-1 mt-auto pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-base font-black text-slate-900">₹{p.price.toLocaleString()}</span>
                        {p.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through block leading-none">
                            ₹{p.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <Link
                          href={`/shop/${p.id}`}
                          className="text-[10px] font-bold border border-slate-200 text-slate-600 px-3 py-2 rounded-xl hover:border-[#4A90E2] hover:text-[#4A90E2] transition min-h-[36px] flex items-center justify-center"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleQuickAdd(p)}
                          className={`text-[10px] font-black px-3 py-2 rounded-xl transition min-h-[36px] ${
                            addedItems[p.id] 
                              ? "bg-emerald-600 text-white" 
                              : "bg-[#4A90E2] text-white hover:bg-[#3A6BC8]"
                          }`}
                        >
                          {addedItems[p.id] ? "Added ✓" : "Add"}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
