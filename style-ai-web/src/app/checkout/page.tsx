"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShieldCheckIcon, LeafIcon } from "@/components/ui/Icons";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { show } = useToast();
  const [step, setStep] = useState<"address" | "payment" | "success">("address");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    document.title = "Checkout | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Complete your order");
  }, []);

  const [address, setAddress] = useState({ name: "", phone: "", line1: "", city: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("upi");

  function validateAddress(): boolean {
    if (!address.name.trim() || !address.phone.trim() || !address.line1.trim() || !address.city.trim() || !address.pincode.trim()) {
      show("Please fill all delivery fields", "error");
      return false;
    }
    if (!/^\d{10}$/.test(address.phone.replace(/\s/g, ""))) {
      show("Enter a valid 10-digit mobile number", "error");
      return false;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      show("Enter a valid 6-digit pincode", "error");
      return false;
    }
    return true;
  }

  function handlePlaceOrder() {
    if (!validateAddress()) return;
    if (items.length === 0) {
      show("Your cart is empty", "error");
      return;
    }
    setPlacing(true);
    setTimeout(() => {
      clearCart();
      setStep("success");
      setPlacing(false);
    }, 1200);
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-10">
        <div className="card max-w-md w-full p-8 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon size={28} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Order Confirmed!</h1>
          <p className="text-slate-500 text-sm leading-relaxed">Your eco-certified garments are being prepared with zero-waste packaging.</p>
          <p className="mt-3 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 inline-flex items-center gap-1.5">
            <LeafIcon size={14} /> +150 Style Points earned
          </p>
          <div className="flex flex-col gap-3 mt-8">
            <Link href="/dashboard" className="bg-[#4A90E2] text-white font-bold py-3 rounded-xl hover:bg-[#3A6BC8] transition text-center">
              Back to Dashboard
            </Link>
            <Link href="/shop" className="border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition text-center">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PageHeader title="Checkout" subtitle={`${items.length} items · ₹${totalPrice.toLocaleString()}`} onBack={() => router.back()} />

      <main className="page-container py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.9fr] gap-6">
          <div className="space-y-5">
            {/* Delivery Address */}
            <div className="card p-6">
              <h2 className="font-extrabold text-slate-900 text-sm mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#4A90E2] text-white rounded-full text-xs flex items-center justify-center font-black">1</span>
                Delivery Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "name", label: "Full Name", placeholder: "Your name", type: "text" },
                  { key: "phone", label: "Mobile", placeholder: "10-digit number", type: "tel" },
                  { key: "line1", label: "Street & Area", placeholder: "Street, area, landmark", type: "text" },
                  { key: "city", label: "City", placeholder: "Mumbai", type: "text" },
                  { key: "pincode", label: "Pincode", placeholder: "400001", type: "text" },
                ].map((f) => (
                  <div key={f.key} className={f.key === "line1" ? "sm:col-span-2" : ""}>
                    <label htmlFor={`addr-${f.key}`} className="block text-xs font-bold text-slate-700 mb-1.5">
                      {f.label}
                    </label>
                    <input
                      id={`addr-${f.key}`}
                      type={f.type}
                      value={address[f.key as keyof typeof address]}
                      onChange={(e) => setAddress({ ...address, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="input-field"
                      autoComplete={f.key === "name" ? "name" : f.key === "phone" ? "tel" : "address-line1"}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="card p-6">
              <h2 className="font-extrabold text-slate-900 text-sm mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#4A90E2] text-white rounded-full text-xs flex items-center justify-center font-black">2</span>
                Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { id: "upi", label: "UPI / PhonePe / GPay", desc: "Instant UPI — recommended" },
                  { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, Rupay" },
                  { id: "cod", label: "Cash on Delivery", desc: "Pay on delivery" },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 border-2 rounded-2xl p-4 cursor-pointer transition ${paymentMethod === opt.id ? "border-[#4A90E2] bg-[#EFF6FF]" : "border-slate-200 hover:border-slate-300 bg-white"}`}
                  >
                    <input type="radio" name="payment" value={opt.id} checked={paymentMethod === opt.id} onChange={() => setPaymentMethod(opt.id)} className="accent-[#4A90E2] w-4 h-4" />
                    <div>
                      <span className="text-sm font-bold text-slate-900">{opt.label}</span>
                      <span className="block text-xs text-slate-500">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="h-fit lg:sticky lg:top-[72px]">
            <div className="card p-6">
              <h3 className="font-extrabold text-slate-900 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4 max-h-[260px] overflow-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.selectedSize}`} className="flex items-center gap-2 text-xs text-slate-600">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.product.images[0]} alt={item.product.name} className="w-8 h-8 rounded-lg object-cover border border-slate-100 shrink-0" loading="lazy" />
                    <span className="truncate flex-1">{item.product.name} × {item.quantity}</span>
                    <span className="font-bold shrink-0 text-slate-900">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                {items.length === 0 && <p className="text-xs text-slate-500">No items in cart.</p>}
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between font-extrabold text-slate-900 mb-5">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full bg-[#4A90E2] text-white font-bold py-3.5 rounded-xl hover:bg-[#3A6BC8] transition disabled:opacity-60 flex items-center justify-center gap-2 min-h-[48px] shadow-[0_4px_14px_rgba(74,144,226,0.25)]"
              >
                {placing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden /> Placing Order…
                  </>
                ) : (
                  "Place Order →"
                )}
              </button>
              <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1.5">
                <LeafIcon size={12} /> Eco-friendly packaging included
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
