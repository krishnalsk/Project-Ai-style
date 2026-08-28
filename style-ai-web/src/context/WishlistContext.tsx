"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { Product } from "@/lib/products";

interface WishlistContextValue {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextValue>({
  wishlist: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isInWishlist: () => false,
  clearWishlist: () => {},
});

const STORAGE_KEY = "styleai_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setWishlist(JSON.parse(raw));
    } catch {
      // Corrupted data — start fresh
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Storage full — silent fail
    }
  }, [wishlist]);

  const addToWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const clearWishlist = useCallback(() => setWishlist([]), []);

  const wishlistIds = useMemo(() => new Set(wishlist.map((p) => p.id)), [wishlist]);

  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlistIds.has(productId);
  }, [wishlistIds]);

  const value = useMemo(
    () => ({ wishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist }),
    [wishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  return useContext(WishlistContext);
}

