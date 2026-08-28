"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getProducts } from "@/lib/productService";
import { CATEGORIES, FABRICS, Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchIcon, HeartIcon, ShoppingBagIcon, SlidersIcon } from "@/components/ui/Icons";

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { show } = useToast();
  const [added, setAdded] = useState(false);
  const wished = isInWishlist(product.id);

  function handleQuickAdd() {
    addToCart(product, product.availableSizes[0] || "M", product.colors[0] || "Natural");
    setAdded(true);
    show(`Added ${product.name} to cart`, "success");
    setTimeout(() => setAdded(false), 1500);
  }

  function toggleWishlist() {
    if (wished) {
      removeFromWishlist(product.id);
      show("Removed from wishlist", "info");
    } else {
      addToWishlist(product);
      show("Saved to wishlist", "success");
    }
  }

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;

  return (
    <div className="group card card-hover overflow-hidden flex flex-col">
      {/* Real Clothing Image */}
      <div className="relative bg-slate-100 h-52 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
          }}
        />
        <span className="hidden absolute inset-0 bg-gradient-to-br from-slate-50 to-[#EFF6FF] flex items-center justify-center text-6xl" aria-hidden>
          {product.emoji || "👔"}
        </span>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" aria-hidden />
        {discount && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-black px-2 py-1 rounded-full shadow-sm">
            -{discount}% OFF
          </span>
        )}
        <span
          className={`absolute top-3 right-3 text-[11px] font-black px-2.5 py-1 rounded-full border shadow-sm backdrop-blur ${
            product.skinSafetyScore >= 95
              ? "bg-emerald-50/90 text-emerald-700 border-emerald-200"
              : product.skinSafetyScore >= 85
              ? "bg-amber-50/90 text-amber-700 border-amber-200"
              : "bg-red-50/90 text-red-700 border-red-200"
          }`}
        >
          {product.skinSafetyScore}% Safe
        </span>
        <button
          onClick={toggleWishlist}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute bottom-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center shadow-md border backdrop-blur transition ${
            wished ? "bg-red-500 text-white border-red-500" : "bg-white/90 text-slate-600 border-white hover:text-red-500 hover:border-red-200"
          }`}
        >
          <HeartIcon size={16} className={wished ? "fill-current" : ""} />
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">{product.fabric}</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${product.stock > 10 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>

        <h3 className="font-extrabold text-slate-900 text-[15px] leading-tight mb-1 group-hover:text-[#4A90E2] transition line-clamp-1">
          {product.name}
        </h3>
        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-3 flex-1">{product.description}</p>

        {/* Scores */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-50 rounded-2xl p-2.5 mb-4 text-center border border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Comfort</span>
            <span className="text-xs font-black text-slate-900">{product.comfortScore}%</span>
          </div>
          <div className="border-x border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Eco</span>
            <span className="text-xs font-black text-slate-900">{product.sustainabilityScore}%</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Fit</span>
            <span className="text-xs font-black text-slate-900">{product.bodyFitScore}%</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-lg font-black text-slate-900">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && <span className="text-xs text-slate-400 line-through ml-2">₹{product.originalPrice.toLocaleString()}</span>}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/shop/${product.id}`}
              className="text-xs font-bold border border-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl hover:border-[#4A90E2] hover:text-[#4A90E2] hover:bg-[#EFF6FF] transition min-h-[40px] flex items-center"
            >
              View
            </Link>
            <button
              onClick={handleQuickAdd}
              className={`text-xs font-bold px-3.5 py-2.5 rounded-xl transition min-h-[40px] ${added ? "bg-emerald-600 text-white" : "bg-[#4A90E2] text-white hover:bg-[#3A6BC8]"}`}
            >
              {added ? "Added ✓" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const [category, setCategory] = useState("All");
  const [fabric, setFabric] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<"safety-desc" | "comfort-desc" | "sustainability-desc" | "price-asc" | "price-desc" | "newest">("safety-desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = "Shop | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Browse skin-safe, sustainable fashion");
  }, []);

  const paginatedResult = getProducts({ category, fabric, searchQuery, maxPrice, sortBy, page, pageSize: 6 });
  const { data: products, totalItems, totalPages, currentPage } = paginatedResult;
  const { totalItems: cartCount } = useCart();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PageHeader
        title="Style AI Catalog"
        subtitle="Skin-safe, eco-certified fashion — filtered for you"
        backHref="/dashboard"
        actions={
          <Link href="/cart" aria-label={`Cart, ${cartCount} items`} className="relative p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#4A90E2] hover:text-[#4A90E2] transition flex items-center gap-2">
            <ShoppingBagIcon size={18} />
            <span className="hidden sm:inline text-sm font-bold">Cart</span>
            {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#4A90E2] text-white text-xs font-bold flex items-center justify-center">{cartCount}</span>}
          </Link>
        }
      />

      <main className="page-container py-6 sm:py-8">
        {/* Controls */}
        <div className="card p-5 sm:p-6 mb-6 space-y-4">
          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, fabric, weather, category…"
                aria-label="Search garments"
                className="input-field pl-10"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as "safety-desc" | "comfort-desc" | "sustainability-desc" | "price-asc" | "price-desc" | "newest");
                setPage(1);
              }}
              aria-label="Sort products"
              className="input-field sm:w-[260px] font-semibold text-slate-700"
            >
              <option value="safety-desc">Sort: Skin Safety ↓</option>
              <option value="comfort-desc">Sort: Comfort ↓</option>
              <option value="sustainability-desc">Sort: Eco Score ↓</option>
              <option value="price-asc">Sort: Price Low → High</option>
              <option value="price-desc">Sort: Price High → Low</option>
              <option value="newest">Sort: Newest First</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <SlidersIcon size={14} /> Category
            </span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                  aria-pressed={category === cat}
                  className={`text-xs font-bold px-4 py-2.5 rounded-xl transition border min-h-[36px] ${
                    category === cat
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white border-slate-200 text-slate-700 hover:border-[#4A90E2] hover:text-[#4A90E2]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Fabric & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div>
              <label htmlFor="fabric-filter" className="block text-xs font-bold text-slate-700 mb-1.5">
                Fabric Type
              </label>
              <select
                id="fabric-filter"
                value={fabric}
                onChange={(e) => {
                  setFabric(e.target.value);
                  setPage(1);
                }}
                className="input-field text-xs font-semibold"
              >
                {FABRICS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <label htmlFor="price-range">Max Price</label>
                <span className="text-[#4A90E2] font-extrabold">Under ₹{maxPrice.toLocaleString()}</span>
              </div>
              <input
                id="price-range"
                type="range"
                min={300}
                max={5000}
                step={100}
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(parseInt(e.target.value));
                  setPage(1);
                }}
                className="w-full accent-[#4A90E2] h-2"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>₹300</span>
                <span>₹5,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">
            Showing <span className="font-bold text-slate-900">{products.length}</span> of <span className="font-bold text-slate-900">{totalItems}</span> garments
          </p>
          <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Grid */}
        {products.length === 0 ? (
          <div className="card p-10 sm:p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <SearchIcon size={24} className="text-slate-400" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-1">No garments match your filters</h3>
            <p className="text-slate-500 text-sm mb-6">Try broadening price range or resetting fabric selection.</p>
            <button
              onClick={() => {
                setCategory("All");
                setFabric("All");
                setSearchQuery("");
                setMaxPrice(5000);
                setPage(1);
              }}
              className="bg-[#4A90E2] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#3A6BC8] transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 border-t border-slate-200 pt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border border-slate-200 text-slate-700 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 transition disabled:opacity-40 disabled:pointer-events-none min-h-[44px]"
            >
              ← Previous
            </button>
            <span className="text-sm font-bold text-slate-600 px-3">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-[#4A90E2] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#3A6BC8] transition disabled:opacity-40 disabled:pointer-events-none min-h-[44px]"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
