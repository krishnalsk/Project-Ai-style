"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const product = getProductById(params.id as string);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { show } = useToast();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // New E-commerce interactive states
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

  // Upgrades image URL to HD
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

  // Zoom lens mouse tracker
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
          
          {/* LEFT COLUMN: E-Commerce Multi-Angle Gallery & Try-on Studio */}
          <div className="lg:col-span-6 space-y-4">
            <div className="card overflow-hidden p-0 border border-slate-200 bg-white">
              
              <div className="flex flex-col md:flex-row gap-4 p-4">
                {/* Thumbnails Sidebar - Amazon Style */}
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
                  
                  {/* Studio Mode Button */}
                  <button
                    onClick={() => {
                      setShowTryOn(true);
                      if (selectedModel === "none") setSelectedModel("model1");
                    }}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition flex flex-col items-center justify-center bg-slate-950 text-white ${
                      showTryOn ? "border-amber-500 ring-2 ring-amber-400/50" : "border-slate-800 hover:bg-slate-900"
                    }`}
                  >
                    <span className="text-xl">✨</span>
                    <span className="text-[10px] font-black tracking-wide uppercase">Try-On</span>
                  </button>
                </div>

                {/* Active Image Box */}
                <div className="flex-1 order-1 md:order-2">
                  <div className="relative bg-slate-50 h-[380px] lg:h-[480px] rounded-2xl overflow-hidden border border-slate-100">
                    
                    {!showTryOn ? (
                      /* Hover Zoom Magnifier Container */
                      <div
                        className="relative w-full h-full cursor-crosshair overflow-hidden"
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setZoomActive(true)}
                        onMouseLeave={() => setZoomActive(false)}
                      >
                        <img
                          src={getImageUrl(imagesList[activeImageIndex])}
                          alt={product.name}
                          className="w-full h-full object-cover transition-opacity duration-300"
                          loading="eager"
                        />

                        {/* Hover Lens Magnifier */}
                        {zoomActive && (
                          <div
                            className="absolute pointer-events-none border-2 border-white rounded-full shadow-2xl hidden md:block"
                            style={{
                              width: "160px",
                              height: "160px",
                              left: `${zoomCoords.x}%`,
                              top: `${zoomCoords.y}%`,
                              transform: "translate(-80px, -80px)",
                              backgroundImage: `url(${getImageUrl(imagesList[activeImageIndex])})`,
                              backgroundPosition: `${zoomCoords.x}% ${zoomCoords.y}%`,
                              backgroundSize: "300%",
                              boxShadow: "0 0 0 4px rgba(255,255,255,0.4), 0 12px 30px rgba(0,0,0,0.3)",
                              zIndex: 30,
                            }}
                          />
                        )}

                        <div className="absolute bottom-4 right-4 bg-slate-900/75 backdrop-blur text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider select-none">
                          🔍 Hover to Inspect Fabric
                        </div>
                      </div>
                    ) : (
                      /* VIRTUAL TRY-ON STUDIO VIEW */
                      <div className="relative w-full h-full bg-slate-950 flex flex-col justify-between text-white p-4">
                        <div className="flex items-center justify-between z-10">
                          <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                            ✨ Fit Studio Active
                          </span>
                          <button
                            onClick={() => setShowTryOn(false)}
                            className="text-white hover:text-slate-300 bg-slate-800/80 p-1 rounded-full border border-white/10 text-xs w-6 h-6 flex items-center justify-center font-bold"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Try on canvas */}
                        <div className="relative flex-1 flex items-center justify-center overflow-hidden my-3 border border-white/5 rounded-2xl bg-slate-900 shadow-inner">
                          {selectedModel !== "none" && (
                            <div className="relative w-full h-full flex items-center justify-center">
                              {selectedModel === "user" ? (
                                userPhoto ? (
                                  <img src={userPhoto} alt="User selfie for try-on" className="h-full object-contain" />
                                ) : (
                                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                                    <span className="text-4xl mb-2">📸</span>
                                    <p className="text-xs font-bold">No selfie uploaded yet</p>
                                    <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Use the camera selector below to upload your photo to preview the fit!</p>
                                  </div>
                                )
                              ) : (
                                <img
                                  src={TRYON_MODELS.find(m => m.id === selectedModel)?.image}
                                  alt="Try-on model representation"
                                  className="h-full object-contain"
                                />
                              )}

                              {/* Clothing Overlay layered on top */}
                              {(selectedModel !== "user" || userPhoto) && (
                                <div
                                  className="absolute pointer-events-none transition-all duration-75"
                                  style={{
                                    top: `${overlayY}%`,
                                    left: `calc(50% + ${overlayX}px)`,
                                    transform: `translate(-50%, -30%) scale(${overlayScale})`,
                                    width: "55%",
                                    height: "55%",
                                    backgroundImage: `url(${imagesList[0]})`,
                                    backgroundSize: "contain",
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                    opacity: overlayOpacity,
                                    mixBlendMode: tryOnBlendMode ? "multiply" : "normal",
                                    filter: tryOnBlendMode ? "contrast(1.1) saturate(1.05)" : "none",
                                  }}
                                />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Fitting comment banner */}
                        {selectedModel !== "user" && selectedModel !== "none" && (
                          <div className="bg-slate-900/90 border border-white/10 rounded-xl p-2.5 text-[11px] text-slate-200 z-10">
                            <span className="font-bold text-amber-400">Model Sizing Insight: </span>
                            {TRYON_MODELS.find(m => m.id === selectedModel)?.fitFeedback}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quality and studio toggles */}
                  <div className="flex gap-2 items-center justify-between mt-3 bg-slate-50 p-2.5 border border-slate-200 rounded-xl">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsHdQuality(!isHdQuality)}
                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition ${
                          isHdQuality
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {isHdQuality ? "✨ Ultra HD (1600p) Active" : "⚙️ Load Super-Res HD"}
                      </button>
                      <button
                        onClick={() => {
                          setShowTryOn(!showTryOn);
                          if (!showTryOn && selectedModel === "none") {
                            setSelectedModel("model1");
                          }
                        }}
                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition ${
                          showTryOn
                            ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                            : "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
                        }`}
                      >
                        {showTryOn ? "🛍️ View Original Look" : "✨ Try-On Studio"}
                      </button>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
                      Style AI Core
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Try-on Fitting Room Control Panel */}
            {showTryOn && (
              <div className="card p-5 border border-slate-200 space-y-4 bg-slate-50/50">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>👗</span> Interactive Fitting Studio Controls
                  </h3>
                  <button
                    onClick={() => {
                      setOverlayScale(1);
                      setOverlayX(0);
                      setOverlayY(20);
                      setOverlayOpacity(0.85);
                      setTryOnBlendMode(true);
                      setTryOnFitMode("regular");
                    }}
                    className="text-[10px] text-slate-500 hover:text-[#4A90E2] font-bold border border-slate-200 bg-white px-2.5 py-1 rounded-lg"
                  >
                    Reset Fit
                  </button>
                </div>

                {/* Diverse model selection */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-2">Select a model size:</span>
                  <div className="grid grid-cols-5 gap-2">
                    {TRYON_MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedModel(m.id)}
                        className={`flex flex-col items-center p-1.5 rounded-xl border-2 transition ${
                          selectedModel === m.id ? "border-amber-500 bg-amber-50/20" : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden mb-1">
                          <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[9px] font-black text-slate-950 line-clamp-1">{m.name.split(" ")[0]}</span>
                        <span className="text-[8px] text-slate-500 font-bold">Size {m.size}</span>
                      </button>
                    ))}

                    {/* Selfie upload option */}
                    <label
                      className={`flex flex-col items-center justify-center p-1.5 rounded-xl border-2 border-dashed cursor-pointer transition ${
                        selectedModel === "user" ? "border-amber-500 bg-amber-50/20" : "border-slate-300 bg-white hover:border-[#4A90E2]/50"
                      }`}
                      onClick={() => setSelectedModel("user")}
                    >
                      <span className="text-sm">📸</span>
                      <span className="text-[9px] font-bold text-slate-900 mt-1">My Selfie</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setUserPhoto(event.target.result as string);
                                setSelectedModel("user");
                                show("Selfie uploaded! Garment overlaid.", "success");
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Manual Calibration tools */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Garment Scale: {Math.round(overlayScale * 100)}%</label>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={overlayScale}
                        onChange={(e) => setOverlayScale(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4A90E2]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Overlay Height: {overlayY}%</label>
                      <input
                        type="range"
                        min="5"
                        max="60"
                        step="1"
                        value={overlayY}
                        onChange={(e) => setOverlayY(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4A90E2]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Horizontal Shift: {overlayX}px</label>
                      <input
                        type="range"
                        min="-80"
                        max="80"
                        step="2"
                        value={overlayX}
                        onChange={(e) => setOverlayX(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4A90E2]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Blending Opacity: {Math.round(overlayOpacity * 100)}%</label>
                      <input
                        type="range"
                        min="0.4"
                        max="1.0"
                        step="0.05"
                        value={overlayOpacity}
                        onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4A90E2]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-700">Quick Fit:</span>
                      {["slim", "regular", "loose"].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => {
                            setTryOnFitMode(mode as any);
                            if (mode === "slim") setOverlayScale(0.85);
                            else if (mode === "regular") setOverlayScale(1.0);
                            else setOverlayScale(1.15);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border capitalize transition ${
                            tryOnFitMode === mode ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 select-none">
                      <input
                        type="checkbox"
                        checked={tryOnBlendMode}
                        onChange={(e) => setTryOnBlendMode(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#4A90E2] border-slate-300 focus:ring-[#4A90E2]"
                      />
                      <span>Shading Blend Overlay</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Product Details & Amazon/Flipkart E-Commerce Widgets */}
          <div className="lg:col-span-6 card p-6 sm:p-7 flex flex-col space-y-6 border border-slate-200 bg-white">
            <div className="space-y-5">
              
              {/* Product header & rating badges */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#4A90E2] uppercase tracking-wider">{product.category} Collection</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold border border-slate-200/60 uppercase">Style ID: {product.id.toUpperCase()}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">{product.name}</h1>
                
                {/* Rating & dermatological safety badge - Amazon Style */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <div className="flex items-center bg-[#0EA75A] text-white text-[11px] font-black px-2 py-0.5 rounded gap-0.5 shadow-xs">
                    <span>4.8</span>
                    <StarIcon size={10} className="fill-current text-white" />
                  </div>
                  <span className="text-xs text-slate-500 font-bold hover:text-[#4A90E2] hover:underline cursor-pointer">182 ratings & 44 reviews</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs font-bold text-[#0EA75A] bg-[#E8F8F1] border border-[#0EA75A]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    🛡️ Skin-Safe Certified
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-500 mt-3">Fabric blend: <span className="text-slate-800">{product.fabric}</span></p>
              </div>

              {/* Multi-attribute smart scores */}
              <div className="grid grid-cols-5 gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
                {[
                  { label: "Safety", value: product.skinSafetyScore, color: "text-emerald-600" },
                  { label: "Comfort", value: product.comfortScore, color: "text-[#4A90E2]" },
                  { label: "Eco", value: product.sustainabilityScore, color: "text-teal-600" },
                  { label: "Fit", value: product.bodyFitScore, color: "text-indigo-600" },
                  { label: "Trend", value: product.trendScore, color: "text-purple-600" },
                ].map((s) => (
                  <div key={s.label}>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">{s.label}</span>
                    <span className={`text-sm font-black ${s.color}`}>{s.value}%</span>
                  </div>
                ))}
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>

              {/* Weather suitability tags */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">Ideal Climate Adaptability</span>
                <div className="flex flex-wrap gap-1.5">
                  {product.suitableWeather.map((w) => (
                    <span key={w} className="text-xs bg-[#EFF6FF] text-[#4A90E2] font-semibold px-3 py-1 rounded-full border border-[#BFDBFE]">
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              {/* Colors selection */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Colour <span className="text-[#4A90E2] font-black">{selectedColor || "— Select"}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      aria-pressed={selectedColor === c}
                      className={`text-xs font-bold px-4 py-2 rounded-xl border-2 transition min-h-[40px] ${
                        selectedColor === c ? "border-[#4A90E2] bg-[#EFF6FF] text-[#4A90E2]" : "border-slate-200 text-slate-700 hover:border-[#4A90E2]/30 hover:bg-slate-50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes selection */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Size <span className="text-[#4A90E2] font-black">{selectedSize || "— Select"}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.availableSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      aria-pressed={selectedSize === s}
                      className={`min-w-[48px] text-xs font-bold py-2 rounded-xl border-2 transition min-h-[40px] ${
                        selectedSize === s ? "border-[#4A90E2] bg-[#EFF6FF] text-[#4A90E2]" : "border-slate-200 text-slate-700 hover:border-[#4A90E2]/30"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flipkart style Bank Offers section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block">🏷️ Available E-Commerce Offers</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="border border-slate-200 bg-white rounded-xl p-3 text-xs space-y-1 hover:border-[#4A90E2]/50 transition cursor-pointer">
                    <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider block w-fit">Bank Offer</span>
                    <p className="font-bold text-slate-900">10% Instant Discount</p>
                    <p className="text-slate-500 text-[10px] leading-tight">On SBI/HDFC Credit Cards. Min transaction ₹2,499. T&C Apply.</p>
                  </div>
                  <div className="border border-slate-200 bg-white rounded-xl p-3 text-xs space-y-1 hover:border-[#4A90E2]/50 transition cursor-pointer">
                    <span className="font-bold text-[#4A90E2] bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider block w-fit">Partner Offer</span>
                    <p className="font-bold text-slate-900">5% Unlimited Cashback</p>
                    <p className="text-slate-500 text-[10px] leading-tight">Get 5% Unlimited cashback on Style AI Axis Bank Credit Card.</p>
                  </div>
                </div>
              </div>

              {/* Delivery checker widget */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <TruckIcon size={16} className="text-slate-500" />
                  <span>Check Delivery Timelines</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter pincode (e.g. 560001)"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-[#4A90E2]"
                  />
                  <button
                    onClick={() => {
                      if (!pincode) return;
                      const isIndianFormat = /^[1-9][0-9]{5}$/.test(pincode.trim());
                      if (isIndianFormat) {
                        const startsWith5 = pincode.startsWith("5");
                        setPincodeCheckResult({
                          checked: true,
                          success: true,
                          msg: startsWith5
                            ? "🚀 FREE Delivery Tomorrow! Express delivery active."
                            : "📦 FREE Delivery by Wednesday. Cash on Delivery available."
                        });
                      } else {
                        setPincodeCheckResult({
                          checked: true,
                          success: true,
                          msg: "📦 Standard Shipping: Delivery in 3-5 business days."
                        });
                      }
                    }}
                    className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition"
                  >
                    Check
                  </button>
                </div>
                {pincodeCheckResult?.checked && (
                  <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <span>✓</span> {pincodeCheckResult.msg}
                  </p>
                )}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[9px] text-slate-400 font-bold border-t border-slate-200">
                  <div>🛡️ 10 DAYS RETURN</div>
                  <div>💳 COD AVAILABLE</div>
                  <div>🌱 ECO-PACKAGING</div>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 block">📐 Technical Specifications</span>
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  {[
                    { key: "Material Composition", val: product.fabric },
                    { key: "Eco & Skin Certifications", val: product.skinSafetyScore >= 95 ? "GOTS Organic & OEKO-TEX Standard 100" : "OEKO-TEX Certified Soft Weave" },
                    { key: "Weave Structure & Weight", val: "165 GSM (Lightweight & Highly Breathable)" },
                    { key: "Dermatological Suitability", val: "Approved for Eczema & Sensitive Skin (0% harsh synthetic dyes)" },
                    { key: "Dye Process", val: "100% Bio-based Organic Plant Dyes" },
                    { key: "Care Guidelines", val: "Machine wash cold inside-out, tumble dry low, warm iron" }
                  ].map((spec, idx) => (
                    <div key={spec.key} className={`grid grid-cols-3 text-[11px] p-2.5 ${idx % 2 === 0 ? "bg-slate-50/40" : "bg-white"} ${idx !== 5 ? "border-b border-slate-100" : ""}`}>
                      <span className="font-bold text-slate-400 col-span-1">{spec.key}</span>
                      <span className="font-medium text-slate-800 col-span-2 pl-2">{spec.val}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Price & CTA section */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-slate-400 line-through text-sm">₹{product.originalPrice.toLocaleString()}</span>
                    <span className="text-emerald-600 font-extrabold text-xs bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">{discount}% OFF</span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="border-2 border-[#4A90E2] text-[#4A90E2] py-3 rounded-xl font-bold text-sm hover:bg-[#EFF6FF] transition min-h-[48px] flex items-center justify-center gap-1.5"
                >
                  <ShoppingBagIcon size={16} /> Add to Cart
                </button>
                <button onClick={handleBuyNow} className="bg-[#4A90E2] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#3A6BC8] transition shadow-[0_4px_14px_rgba(74,144,226,0.25)] min-h-[48px]">
                  Buy Now →
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-500 font-bold">Standard Free Delivery · Fully Carbon-Offset Shipping</p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="border-t border-slate-200 pt-8">
            <h3 className="text-lg font-extrabold text-slate-900 mb-5">Similar skin-safe recommendations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((rel) => (
                <Link key={rel.id} href={`/shop/${rel.id}`} className="card card-hover p-5 flex flex-col">
                  <div className="bg-slate-100 border border-slate-100 rounded-2xl h-36 overflow-hidden mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={rel.images[0]} alt={rel.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{rel.fabric}</span>
                  <h4 className="font-extrabold text-slate-900 text-sm mt-0.5 line-clamp-1">{rel.name}</h4>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                    <span className="font-black text-slate-900 text-sm">₹{rel.price.toLocaleString()}</span>
                    <span className="text-xs font-bold text-[#4A90E2]">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
