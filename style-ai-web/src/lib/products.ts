// src/lib/products.ts
// Product model interface and 1,000-record dataset for Style AI

import { FULL_1000_CATALOG, ProductRecord, FiberDetail } from "./catalogData";

export type { FiberDetail };
export type Product = ProductRecord;

export const CATEGORIES = [
  "All",
  "Tops",
  "Bottoms",
  "Outerwear",
  "Dresses",
  "Activewear",
  "Sleepwear",
  "Footwear",
  "Accessories",
];

export const FABRICS = [
  "All",
  "100% GOTS Organic Cotton",
  "100% Pure French Flax Linen",
  "95% Bamboo Viscose / 5% Elastane",
  "100% Mulberry Silk",
  "100% Tencel Lyocell",
  "70% Organic Cotton / 30% Hemp",
  "60% Recycled Cotton / 40% Recycled Polyester",
  "80% Merino Wool / 20% Mulberry Silk",
  "100% Recycled Technical Polyester",
  "85% Acrylic / 15% Nylon Knit",
];

// 1,000 Verified Production Records
export const MOCK_PRODUCTS: Product[] = FULL_1000_CATALOG;
export const PRODUCTS = MOCK_PRODUCTS;

// Fast O(1) Index Map for ID lookups
const PRODUCT_INDEX = new Map<string, Product>();
for (const p of MOCK_PRODUCTS) {
  PRODUCT_INDEX.set(p.id, p);
}

export function getProductById(id: string): Product | undefined {
  return PRODUCT_INDEX.get(id);
}
