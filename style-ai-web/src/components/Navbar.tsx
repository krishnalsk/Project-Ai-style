"use client";

import Link from "next/link";
import { useState, useCallback, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { SearchIcon, ShoppingBagIcon, HeartIcon, MenuIcon, XIcon, UserIcon } from "./ui/Icons";
import Logo from "./Logo";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const { user } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = useCallback(() => setMobileOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setMobileOpen(false), []);

  // Close on Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen, closeMenu]);

  // Close on click outside
  useEffect(() => {
    if (!mobileOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen, closeMenu]);

  return (
    <nav className="sticky top-0 z-50 glass" role="navigation" aria-label="Main navigation">
      <div className="page-container">
        <div className="flex items-center justify-between h-[64px]">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/shop" className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              Shop
            </Link>
            <Link href="/deals" className="px-3.5 py-2 rounded-xl text-sm font-bold text-orange-600 hover:text-orange-850 hover:bg-orange-50 transition-colors flex items-center gap-1">
              🔥 Deals
            </Link>
            <Link href="/ai-stylist" className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              AI Stylist
            </Link>
            <Link href="/fabric-encyclopedia" className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              Encyclopedia
            </Link>
            <Link href="/skin-forecast" className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              Forecast
            </Link>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/search" aria-label="Search products" className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
              <SearchIcon size={18} />
            </Link>
            <Link
              href="/wishlist"
              aria-label={`Wishlist, ${wishlist.length} items`}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <HeartIcon size={18} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center" aria-hidden>
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              aria-label={`Shopping cart, ${totalItems} items`}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <ShoppingBagIcon size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#4A90E2] text-white text-[10px] font-bold flex items-center justify-center" aria-hidden>
                  {totalItems}
                </span>
              )}
            </Link>
            <div className="w-px h-6 bg-slate-200 mx-1" aria-hidden="true" />
            {user ? (
              <Link
                href="/dashboard"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                aria-label="Go to dashboard"
              >
                <UserIcon size={18} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition">
                  Log in
                </Link>
                <Link href="/signup" className="bg-[#4A90E2] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#3A6BC8] shadow-[0_4px_14px_rgba(74,144,226,0.25)] hover:shadow-[0_6px_20px_rgba(74,144,226,0.35)] transition-all">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 transition"
            onClick={toggleMenu}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        ref={menuRef}
        id="mobile-menu"
        className={`md:hidden border-t border-slate-100 bg-white px-4 py-4 flex flex-col gap-1 transition-all duration-200 ${
          mobileOpen ? "block" : "hidden"
        }`}
        role="menu"
        aria-hidden={!mobileOpen}
      >
        <Link href="/shop" onClick={closeMenu} className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50" role="menuitem">Shop</Link>
        <Link href="/deals" onClick={closeMenu} className="px-3 py-2.5 rounded-xl text-sm font-bold text-orange-600 hover:bg-orange-50" role="menuitem">🔥 Deals</Link>
        <Link href="/ai-stylist" onClick={closeMenu} className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50" role="menuitem">AI Stylist</Link>
        <Link href="/fabric-encyclopedia" onClick={closeMenu} className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50" role="menuitem">Encyclopedia</Link>
        <Link href="/skin-forecast" onClick={closeMenu} className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50" role="menuitem">Forecast</Link>
        <div className="h-px bg-slate-100 my-2" />
        {user ? (
          <Link href="/dashboard" onClick={closeMenu} className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50" role="menuitem">Dashboard</Link>
        ) : (
          <div className="flex gap-2">
            <Link href="/login" onClick={closeMenu} className="flex-1 text-center text-sm font-semibold text-slate-700 border border-slate-200 py-2.5 rounded-xl" role="menuitem">Log in</Link>
            <Link href="/signup" onClick={closeMenu} className="flex-1 text-center bg-[#4A90E2] text-white text-sm font-bold py-2.5 rounded-xl" role="menuitem">Get Started</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
