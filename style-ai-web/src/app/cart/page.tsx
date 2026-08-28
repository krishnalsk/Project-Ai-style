"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShoppingBagIcon, ShieldCheckIcon, TruckIcon } from "@/components/ui/Icons";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const router = useRouter();

  useEffect(() => {
    document.title = "Cart | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Your shopping cart");
  }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <PageHeader title="My Cart" onBack={() => router.back()} />
        <div className="page-container py-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-4">
            <ShoppingBagIcon size={28} className="text-slate-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 text-sm mb-8 max-w-md">Add skin-safe garments to get started. Your selections save across sessions.</p>
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
        title={`My Cart (${totalItems})`}
        subtitle="Review items before checkout"
        onBack={() => router.back()}
        actions={<Link href="/shop" className="text-sm font-bold text-[#4A90E2] hover:underline">Continue Shopping</Link>}
      />

      <main className="page-container py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.9fr] gap-6">
          {/* Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="card p-5 flex gap-4">
                <div className="w-20 h-20 bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.product.images[0]} alt={item.product.name} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-slate-900 text-sm truncate">{item.product.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.selectedColor} · Size {item.selectedSize} · {item.product.fabric}
                  </p>
                  <span className={`inline-flex mt-2 text-[11px] font-bold px-2 py-1 rounded-full border ${item.product.skinSafety === "SAFE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                    {item.product.skinSafety || (item.product.skinSafetyScore >= 95 ? "SAFE" : "MODERATE")} · {item.product.skinSafetyScore}% Safe
                  </span>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-2 py-1.5">
                      <button
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-white hover:border-slate-300 flex items-center justify-center transition min-w-[32px] min-h-[32px]"
                      >
                        −
                      </button>
                      <span className="font-bold text-slate-900 text-sm w-6 text-center" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:border-[#4A90E2] hover:text-[#4A90E2] flex items-center justify-center transition min-w-[32px] min-h-[32px]"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-xs font-semibold text-slate-400 hover:text-red-600 transition">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="card border-[#BFDBFE] bg-[#EFF6FF]/60 p-4 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#BFDBFE] flex items-center justify-center text-[#4A90E2] shrink-0">
                <ShieldCheckIcon size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">All fabrics safe for your profile</p>
                <p className="text-xs text-slate-600 mt-0.5">We checked skin safety and eco scores before adding to cart.</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-[72px] h-fit">
            <div className="card p-6">
              <h3 className="font-extrabold text-slate-900 mb-5">Order Summary</h3>
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-bold text-slate-900">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1.5"><TruckIcon size={14} /> Delivery</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Eco Packaging</span>
                  <span className="font-bold text-emerald-600">Included</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between font-extrabold text-slate-900 text-base">
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={() => router.push("/checkout")} className="w-full bg-[#4A90E2] text-white font-bold py-3.5 rounded-xl hover:bg-[#3A6BC8] transition shadow-[0_4px_14px_rgba(74,144,226,0.25)] min-h-[48px]">
                Proceed to Checkout →
              </button>
              <div className="mt-4 text-center text-xs text-slate-500 space-y-1">
                <p className="flex items-center justify-center gap-1.5"><ShieldCheckIcon size={12} /> Secure checkout with SSL encryption</p>
                <p>Carbon-neutral delivery · 30-day returns</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
