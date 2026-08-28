// src/lib/productService.ts
// Product service layer handling listing, search, multi-faceted filtering, sorting, and pagination

import { MOCK_PRODUCTS, Product } from "./products";

export interface FilterOptions {
  category?: string;
  fabric?: string;
  minPrice?: number;
  maxPrice?: number;
  minSkinSafety?: number;
  searchQuery?: string;
  sortBy?: "newest" | "price-asc" | "price-desc" | "safety-desc" | "comfort-desc" | "sustainability-desc" | "trend-desc";
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Filter, sort, and paginate products based on provided criteria.
 */
export function getProducts(options: FilterOptions = {}): PaginatedResult<Product> {
  const {
    category = "All",
    fabric = "All",
    minPrice = 0,
    maxPrice = Infinity,
    minSkinSafety = 0,
    searchQuery = "",
    sortBy = "safety-desc",
    page = 1,
    pageSize = 8,
  } = options;

  let result = [...MOCK_PRODUCTS];

  // 1. Search Query Filter
  if (searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.suitableWeather.some((w) => w.toLowerCase().includes(q))
    );
  }

  // 2. Category Filter
  if (category !== "All") {
    result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  // 3. Fabric Filter
  if (fabric !== "All") {
    result = result.filter((p) => p.fabric.toLowerCase().includes(fabric.toLowerCase()));
  }

  // 4. Price Filter
  result = result.filter((p) => p.price >= minPrice && p.price <= maxPrice);

  // 5. Skin Safety Threshold Filter
  if (minSkinSafety > 0) {
    result = result.filter((p) => p.skinSafetyScore >= minSkinSafety);
  }

  // 6. Sorting
  result.sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "safety-desc":
        return b.skinSafetyScore - a.skinSafetyScore;
      case "comfort-desc":
        return b.comfortScore - a.comfortScore;
      case "sustainability-desc":
        return b.sustainabilityScore - a.sustainabilityScore;
      case "trend-desc":
        return b.trendScore - a.trendScore;
      case "newest":
      default:
        return b.id.localeCompare(a.id);
    }
  });

  // 7. Pagination
  const totalItems = result.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const validPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (validPage - 1) * pageSize;
  const paginatedData = result.slice(startIndex, startIndex + pageSize);

  return {
    data: paginatedData,
    totalItems,
    totalPages,
    currentPage: validPage,
    pageSize,
    hasMore: validPage < totalPages,
  };
}

/**
 * Get product by ID.
 */
export function getProductById(id: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id);
}

/**
 * Get related products in the same category or fabric type.
 */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return MOCK_PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.fabric === product.fabric)
  ).slice(0, limit);
}
