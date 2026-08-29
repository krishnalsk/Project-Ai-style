"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getProductById, getRelatedProducts } from "@/lib/productService";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  HeartIcon,
  ShoppingBagIcon,
  ShieldCheckIcon,
  StarIcon,
  SlidersIcon,
  SparklesIcon,
  TruckIcon
} from "@/components/ui/Icons";

const TRYON_MODELS = [
  { id: "model1", name: "Maya (5'7\", Size S)", size: "S", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80", skinTone: "Fair", fitFeedback: "Ideal fit. Slightly relaxed in shoulders." },
  { id: "model2", name: "Raj (6'0\", Size L)", size: "L", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80", skinTone: "Warm Wheatish", fitFeedback: "Regular fit. Sleeves align perfectly at the wrist." },
  { id: "model3", name: "Asha (5'9\", Size XL)", size: "XL", image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&auto=format&fit=crop&q=80", skinTone: "Dusky", fitFeedback: "Cozy oversized drape. Comfortable chest fit." },
  { id: "model4", name: "Li (5'6\", Size XS)", size: "XS", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80", skinTone: "Light", fitFeedback: "Slightly loose fit. Perfect for a breezy, casual style." }
];

export default function ProductDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const product = getProductById(id);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { show } = useToast();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // E-commerce interactive states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 0, y: 0 });
  const [isHdQuality, setIsHdQuality] = useState(false);

  // Virtual Try-on states
  const [showTryOn, setShowTryOn] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("none");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [overlayScale, setOverlayScale] = useState<number>(1);
  const [overlayX, setOverlayX] = useState<number>(0);
  const [overlayY, setOverlayY] = useState<number>(20);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.85);
  const [tryOnBlendMode, setTryOnBlendMode] = useState<boolean>(true);
  const [tryOnFitMode, setTryOnFitMode] = useState<"slim" | "regular" | "loose">("regular");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Delivery states
  const [pincode, setPincode] = useState("");
  const [pincodeCheckResult, setPincodeCheckResult] = useState<{ checked: boolean; success: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Style AI`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", product.description || `Shop ${product.name} - Skin-safe, sustainable fashion`);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] px-4">
        <div className="card p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-2xl">—</div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-1">Product not found</h2>
          <p className="text-slate-500 text-sm mb-6">This garment ID does not exist in the catalogue.</p>
          <Link href="/shop" className="bg-[#4A90E2] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#3A6BC8] transition inline-flex">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const related = getRelatedProducts(product, 3);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;
  const wished = isInWishlist(product.id);

  // Build full multi-angle list for the gallery
  const imagesList = product.images && product.images.length > 0
    ? product.images
    : [
        product.images[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
        (product.images[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800") + "&fit=crop&crop=center&q=95&w=800",
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800",
        "https://images.unsplash.com/photo-1588636310486-3a5e2ab60d99?w=800"
      ];

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("unsplash.com")) {
      if (isHdQuality) {
        return url.replace("w=800", "w=1600").replace("q=80", "q=95");
      }
      return url.replace("w=1600", "w=800").replace("q=95", "q=80");
    }
    return url;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomCoords({ x, y });
  };

  function validateSelection(): boolean {
    if (!selectedSize) {
      show("Please select a size", "error");
      return false;
    }
    if (!selectedColor) {
      show("Please select a colour", "error");
      return false;
    }
    return true;
  }

  function handleAddToCart() {
    if (!validateSelection()) return;
    addToCart(product!, selectedSize, selectedColor);
    show(`Added ${product!.name} to cart`, "success");
  }

  function handleBuyNow() {
    if (!validateSelection()) return;
    addToCart(product!, selectedSize, selectedColor);
    router.push("/checkout");
  }

  function handleWishlist() {
    if (wished) {
      removeFromWishlist(product!.id);
      show("Removed from wishlist", "info");
    } else {
      addToWishlist(product!);
      show("Saved to wishlist", "success");
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PageHeader
        title={product.name}
        subtitle={`${product.category} · ${product.fabric}`}
        onBack={() => router.back()}
        actions={
          <>
            <button
              onClick={handleWishlist}
              aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition ${wished ? "bg-red-500 text-white border-red-500" : "bg-white text-slate-500 border-slate-200 hover:text-red-500"}`}
            >
              <HeartIcon size={18} className={wished ? "fill-current" : ""} />
            </button>
            <Link href="/cart" aria-label="View cart" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#4A90E2] hover:border-[#4A90E2] transition">
              <ShoppingBagIcon size={18} />
            </Link>
          </>
        }
      />

      <main className="page-container py-6 sm:py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="card overflow-hidden p-0 border border-slate-200 bg-white">
              <div className="flex flex-col md:flex-row gap-4 p-4">
                <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 no-scrollbar">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveImageIndex(idx);
                        setShowTryOn(false);
                      }}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                        activeImageIndex === idx && !showTryOn ? "border-[#4A90E2] shadow-sm scale-102" : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`${product.name} angle ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div 
                  className="relative flex-1 aspect-3/4 rounded-2xl overflow-hidden bg-slate-50 order-1 md:order-2 cursor-crosshair group"
                  onMouseEnter={() => setZoomActive(true)}
                  onMouseLeave={() => setZoomActive(false)}
                  onMouseMove={handleMouseMove}
                >
                  <img
                    src={getImageUrl(imagesList[activeImageIndex])}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-200 ${zoomActive ? "scale-150" : "scale-100"}`}
                    style={zoomActive ? { transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%` } : undefined}
                  />

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
                    <span className="badge badge-green text-xs shadow-sm bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">
                      Comfort {product.comfortScore}%
                    </span>
                    <span className="badge badge-blue text-xs shadow-sm bg-blue-500 text-white font-bold px-2 py-0.5 rounded-full">
                      Skin Safe {product.skinSafetyScore}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Details & Purchase */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <p className="text-xs font-bold text-[#4A90E2] uppercase tracking-wider mb-1">{product.category}</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{product.name}</h1>
              <p className="text-slate-500 text-sm mt-1">{product.fabric} • Hypoallergenic</p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900">₹{product.price.toLocaleString("en-IN")}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-slate-400 line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Size</label>
              <div className="flex flex-wrap gap-2">
                {product.availableSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-12 h-11 rounded-xl text-sm font-bold border transition ${
                      selectedSize === sz
                        ? "bg-[#4A90E2] text-white border-[#4A90E2] shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Colour</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 h-10 rounded-xl text-xs font-bold border transition ${
                      selectedColor === c
                        ? "bg-[#4A90E2] text-white border-[#4A90E2] shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-white text-slate-900 border-2 border-slate-900 hover:bg-slate-50 font-bold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2"
              >
                <ShoppingBagIcon size={18} />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-[#4A90E2] hover:bg-[#3A6BC8] text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md shadow-[#4A90E2]/20 flex items-center justify-center gap-2"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
