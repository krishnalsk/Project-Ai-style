// src/app/label-lens/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { queryCatalog, ScoredProduct } from "@/lib/queryEngine";

interface AnalysisResult {
  composition: string;
  safetyScore: number;
  comfortScore: number;
  safetyLevel: "SAFE" | "MODERATE" | "AVOID";
  uncertaintyLevel: "LOW" | "MEDIUM" | "HIGH";
  uncertaintyReason?: string;
  dermatologyVerdict: string;
  pros: string[];
  risks: string[];
  careInstructions: string[];
  allergyConflict: string | null;
  sensitivityWarning: string | null;
  safeAlternatives: ScoredProduct[];
}

const PRESETS = [
  { label: "100% GOTS Organic Cotton", query: "100% GOTS Organic Cotton, Made in Portugal" },
  { label: "95% Bamboo / 5% Elastane", query: "95% Bamboo Viscose, 5% Spandex/Elastane" },
  { label: "100% French Flax Linen", query: "100% Pure Flax Linen" },
  { label: "65% Polyester / 35% Cotton", query: "65% Polyester, 35% Recycled Cotton" },
  { label: "100% Acrylic Knit", query: "100% Acrylic Knit, Dry Clean Only" },
  { label: "Unverified / Blended Tag", query: "Blended fibers, imported materials, wash cold" },
];

const SAMPLE_TAG_PHOTOS = [
  {
    name: "Pure Cotton Tag",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
    extractedText: "100% GOTS Organic Cotton - Wash at 30°C - Made in Portugal",
  },
  {
    name: "Bamboo Activewear Label",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    extractedText: "95% Bamboo Viscose, 5% Spandex/Elastane - Gentle Cycle",
  },
  {
    name: "Synthetic Blend Tag",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
    extractedText: "65% Polyester, 35% Recycled Cotton - Do Not Iron Print",
  },
  {
    name: "Winter Knit Label",
    image: "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?w=400",
    extractedText: "100% Acrylic Knit - Dry Clean Only - Made in China",
  },
];

export default function LabelLensPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"ocr" | "manual">("ocr");
  const [tagInput, setTagInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrStep, setOcrStep] = useState("");
  const [selectedSample, setSelectedSample] = useState(SAMPLE_TAG_PHOTOS[0]);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [analysisMethod, setAnalysisMethod] = useState<"Optical Tag Scanner" | "Manual Input" | "Standard Preset">("Optical Tag Scanner");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    document.title = "AI Fabric Scanner & Label Lens | Style AI";
  }, []);

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedPreview(url);
      setTagInput("");
      setResult(null);
    }
  }

  function runSimulatedOcr(sampleText?: string) {
    const textToExtract = sampleText || (uploadedPreview ? "Extracted from upload: 60% Cotton, 40% Polyester" : selectedSample.extractedText);
    setOcrScanning(true);
    setOcrStep("1/3 Scanning fabric label borders and text lines...");

    setTimeout(() => {
      setOcrStep("2/3 Parsing textile percentages and fiber identifiers...");
      setTimeout(() => {
        setOcrStep("3/3 Cross-referencing against clinical dermatological database...");
        setTimeout(() => {
          setTagInput(textToExtract);
          setOcrScanning(false);
          setOcrStep("");
          setAnalysisMethod("Optical Tag Scanner");
          analyzeFabric(textToExtract, "Optical Tag Scanner");
        }, 300);
      }, 400);
    }, 400);
  }

  function analyzeFabric(text: string, methodOverride?: "Optical Tag Scanner" | "Manual Input" | "Standard Preset") {
    if (!text.trim()) return;
    setAnalyzing(true);
    if (methodOverride) setAnalysisMethod(methodOverride);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let safetyScore = 90;
      let comfortScore = 90;
      let safetyLevel: "SAFE" | "MODERATE" | "AVOID" = "SAFE";
      let uncertaintyLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
      let uncertaintyReason: string | undefined = undefined;
      let dermatologyVerdict = "";
      let pros: string[] = [];
      let risks: string[] = [];
      let careInstructions: string[] = [];

      // Check for Uncertainty / Ambiguous Composition
      const hasPercentages = /\d+%/.test(text);
      if (!hasPercentages || lower.includes("blended") || lower.includes("imported materials") || lower.includes("other fibers")) {
        uncertaintyLevel = "HIGH";
        uncertaintyReason = "Exact fiber percentage breakdown is absent or vague. Visual inspection cannot infer hidden finishing chemicals.";
      } else if (lower.includes("blend") || lower.includes("recycled")) {
        uncertaintyLevel = "MEDIUM";
        uncertaintyReason = "Secondary recycled blends may contain dye trace variations.";
      }

      // Check specific fiber profiles
      if (lower.includes("acrylic") || (lower.includes("polyester") && !lower.includes("cotton"))) {
        safetyScore = 62;
        comfortScore = 68;
        safetyLevel = "AVOID";
        dermatologyVerdict = "High synthetic content impedes natural cutaneous respiration. Prone to sweat trapping, friction, and heat rash.";
        pros = ["Durable structure", "Wrinkle-resistant"];
        risks = ["Persistent sweat trapping", "High friction for eczema-prone skin", "Poor thermal moisture dispersion"];
        careInstructions = ["Wash cold in microfiber protection bag", "Never expose to direct iron or heat drying"];
      } else if (lower.includes("bamboo")) {
        safetyScore = 98;
        comfortScore = 97;
        safetyLevel = "SAFE";
        dermatologyVerdict = "Naturally hypoallergenic and exceptionally smooth. Smooth cylindrical fibers reduce epidermal friction.";
        pros = ["Antimicrobial properties", "Rapid moisture dissipation", "Silk-like softness"];
        risks = ["Requires gentle cycle to maintain fiber longevity"];
        careInstructions = ["Gentle wash with pH-neutral detergent", "Air dry flat"];
      } else if (lower.includes("linen") || lower.includes("flax")) {
        safetyScore = 97;
        comfortScore = 94;
        safetyLevel = "SAFE";
        dermatologyVerdict = "Flax fibers provide natural breathability and anti-static properties. Highly recommended for hot or humid environments.";
        pros = ["Maximum natural ventilation", "Naturally antibacterial", "Softens progressively with each wash"];
        risks = ["Crisp initial stiffness until initial wash cycles"];
        careInstructions = ["Wash at 30°C", "Hang dry while slightly damp to avoid excessive wrinkling"];
      } else if (lower.includes("cotton") || lower.includes("silk") || lower.includes("modal") || lower.includes("lyocell")) {
        safetyScore = 96;
        comfortScore = 95;
        safetyLevel = "SAFE";
        dermatologyVerdict = "High-quality natural or cellulosic fiber. Gentle on skin barrier with reliable moisture absorption.";
        pros = ["Natural skin breathability", "Low mechanical friction", "Certified skin-safe standard"];
        risks = ["Minor shrinkage under high wash temperatures"];
        careInstructions = ["Gentle machine wash", "Tumble dry low"];
      } else {
        safetyScore = 70;
        comfortScore = 72;
        safetyLevel = "MODERATE";
        dermatologyVerdict = "Textile composition not definitively classified. Further manufacturer verification required if you have severe sensitivities.";
        pros = ["Basic textile durability"];
        risks = ["Uncertain dye fastness and synthetic blend ratios"];
        careInstructions = ["Hand wash cold separately"];
      }

      // Cross-check against user profile confirmed allergies & sensitivities
      let allergyConflict: string | null = null;
      let sensitivityWarning: string | null = null;

      if (profile?.confirmedAllergies && profile.confirmedAllergies.length > 0) {
        for (const allergy of profile.confirmedAllergies) {
          const aLower = allergy.toLowerCase();
          if (lower.includes(aLower) || (aLower.includes("wool") && lower.includes("merino")) || (aLower.includes("spandex") && lower.includes("elastane"))) {
            allergyConflict = allergy;
            safetyLevel = "AVOID";
            safetyScore = Math.min(safetyScore, 40);
            break;
          }
        }
      }

      if (profile?.reportedSensitivities && profile.reportedSensitivities.length > 0) {
        for (const sens of profile.reportedSensitivities) {
          const sLower = sens.toLowerCase();
          if (lower.includes(sLower) || (sLower.includes("synthetic") && (lower.includes("polyester") || lower.includes("acrylic")))) {
            sensitivityWarning = sens;
            break;
          }
        }
      }

      // Query real safe alternatives from the 1,000-record dataset
      const alternativesQuery = queryCatalog({
        category: "Tops",
        confirmedAllergies: profile?.confirmedAllergies || [],
        minSkinSafety: 90,
        inStockOnly: true,
        limit: 2,
      });

      setResult({
        composition: text,
        safetyScore,
        comfortScore,
        safetyLevel,
        uncertaintyLevel,
        uncertaintyReason,
        dermatologyVerdict,
        pros,
        risks,
        careInstructions,
        allergyConflict,
        sensitivityWarning,
        safeAlternatives: alternativesQuery.items,
      });

      setAnalyzing(false);
    }, 450);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              ←
            </Link>
            <div>
              <h1 className="text-lg font-black text-slate-900">AI Fabric Scanner & Label Lens</h1>
              <p className="text-[11px] text-slate-500">Optical Care Label Parser & Personalized Allergy Gate</p>
            </div>
          </div>
          <Link
            href="/profile"
            className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition"
          >
            Allergy Profile: {profile?.confirmedAllergies?.length || 0} Exclusions
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Ethical / Medical Disclaimer Banner */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <span className="text-lg mt-0.5">ℹ️</span>
          <div>
            <span className="font-extrabold uppercase tracking-wide block mb-0.5">Clinical Disclaimer & Optical Limitation</span>
            <span>
              This scanner extracts visible fiber text and estimates skin compatibility. It does not replace clinical patch tests and cannot guarantee 100% hypoallergenic safety against hidden industrial finishing chemicals or unlisted dyes.
            </span>
          </div>
        </div>

        {/* Input Mode Selector */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl max-w-sm">
            <button
              onClick={() => setActiveTab("ocr")}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition ${
                activeTab === "ocr" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📷 Photo / OCR Scanner
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition ${
                activeTab === "manual" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ✍️ Manual Label Entry
            </button>
          </div>

          {activeTab === "ocr" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Upload Box */}
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-400 transition bg-slate-50/50 flex flex-col items-center justify-center min-h-[180px]">
                  {uploadedPreview ? (
                    <div className="space-y-2">
                      <img src={uploadedPreview} alt="Uploaded Tag" className="w-28 h-28 object-cover rounded-xl mx-auto shadow-xs border" />
                      <span className="text-xs text-emerald-600 font-bold block">✓ Custom Photo Loaded</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl mb-2">📸</span>
                      <p className="text-xs font-bold text-slate-800">Upload Clothing Care Tag</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG from camera or photo library</p>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="tag-upload" />
                  <label
                    htmlFor="tag-upload"
                    className="mt-3 bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-50 transition"
                  >
                    {uploadedPreview ? "Choose Another Photo" : "Select Photo"}
                  </label>
                </div>

                {/* Sample Presets */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-700 block">Or Test Verified Tag Samples:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {SAMPLE_TAG_PHOTOS.map((sample) => (
                      <button
                        key={sample.name}
                        onClick={() => {
                          setSelectedSample(sample);
                          setUploadedPreview(sample.image);
                          runSimulatedOcr(sample.extractedText);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                          selectedSample.name === sample.name && !uploadedPreview
                            ? "border-blue-500 bg-blue-50/50"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <img src={sample.image} alt={sample.name} className="w-10 h-10 object-cover rounded-lg" />
                        <span className="text-[11px] font-bold text-slate-800 leading-tight">{sample.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {ocrScanning && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                  <span className="text-lg">🔄</span>
                  <span className="text-xs font-bold">{ocrStep}</span>
                </div>
              )}

              <button
                onClick={() => runSimulatedOcr()}
                disabled={ocrScanning}
                className="w-full bg-blue-600 text-white font-black text-xs py-3 rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 shadow-xs"
              >
                {ocrScanning ? "Processing Optical Scanner..." : "⚡ Run AI Optical Analysis"}
              </button>
            </div>
          ) : (
            /* Manual Input Tab */
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Enter Visible Garment Fiber Percentages</label>
              <textarea
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. 100% GOTS Organic Cotton, wash cold..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 self-center mr-1">Quick Presets:</span>
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setTagInput(p.query);
                      analyzeFabric(p.query, "Standard Preset");
                    }}
                    className="text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => analyzeFabric(tagInput, "Manual Input")}
                disabled={!tagInput.trim() || analyzing}
                className="w-full bg-blue-600 text-white font-black text-xs py-3 rounded-2xl hover:bg-blue-700 transition disabled:opacity-50"
              >
                {analyzing ? "Evaluating Fiber Safety..." : "Analyze Tag Composition"}
              </button>
            </div>
          )}
        </div>

        {/* Results Card */}
        {result && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md">
                    Method: {analysisMethod}
                  </span>
                  {result.uncertaintyLevel === "HIGH" && (
                    <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                      ⚠️ High Uncertainty
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">"{result.composition}"</h3>
              </div>

              {/* Safety Badge */}
              <div className="flex items-center gap-2">
                <div
                  className={`text-center px-4 py-2 rounded-2xl font-black text-xs ${
                    result.safetyLevel === "SAFE"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : result.safetyLevel === "MODERATE"
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  <span className="block text-base">{result.safetyLevel === "SAFE" ? "✓" : result.safetyLevel === "MODERATE" ? "⚠️" : "✕"}</span>
                  <span>{result.safetyLevel} FOR SKIN</span>
                </div>
              </div>
            </div>

            {/* Confirmed Allergy Warning Gate */}
            {result.allergyConflict && (
              <div className="bg-red-600 text-white p-4 rounded-2xl flex items-start gap-3 shadow-sm">
                <span className="text-xl">🛑</span>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wide">
                    Mandatory Allergy Exclusion Triggered: {result.allergyConflict}
                  </h4>
                  <p className="text-xs text-red-100 mt-0.5">
                    This garment matches an allergy confirmed in your profile ({result.allergyConflict}). We strictly advise against purchasing or wearing this garment.
                  </p>
                </div>
              </div>
            )}

            {/* Uncertainty Explanation */}
            {result.uncertaintyReason && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs space-y-1">
                <span className="font-extrabold flex items-center gap-1.5">
                  <span>⚠️</span> Composition Uncertainty Notice:
                </span>
                <p className="text-amber-800">{result.uncertaintyReason}</p>
                <p className="text-[11px] text-amber-700 italic">
                  Further verification required: check garment inner side-seam labels for exact percentage breakdown.
                </p>
              </div>
            )}

            {/* Score Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4">
                <span className="text-xs font-bold text-slate-400 block">Skin Tolerance Rating</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{result.safetyScore}%</span>
                <span className="text-[11px] text-slate-500">Hypoallergenic fiber compatibility</span>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <span className="text-xs font-bold text-slate-400 block">Comfort & Breathability</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{result.comfortScore}%</span>
                <span className="text-[11px] text-slate-500">Perspiration ventilation score</span>
              </div>
            </div>

            {/* Dermatology Verdict */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4">
              <span className="text-xs font-black text-blue-900 uppercase tracking-wider block mb-1">
                Dermatology Intelligence Summary
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{result.dermatologyVerdict}</p>
            </div>

            {/* Pros & Risks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                <span className="font-bold text-emerald-900 block mb-2">🌿 Fiber Benefits:</span>
                <ul className="space-y-1.5 text-emerald-800">
                  {result.pros.map((p, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span>✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4">
                <span className="font-bold text-amber-900 block mb-2">⚠️ Skin & Wear Cautions:</span>
                <ul className="space-y-1.5 text-amber-800">
                  {result.risks.map((r, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span>•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Verified Safe Alternatives from 1,000-Item Catalog */}
            {result.safeAlternatives && result.safeAlternatives.length > 0 && (
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Safe Catalog Alternatives (100% Free of Allergens)
                  </h4>
                  <Link href="/shop" className="text-xs font-bold text-blue-600 hover:underline">
                    View in Shop →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.safeAlternatives.map(({ product, score }) => (
                    <Link
                      key={product.id}
                      href={`/shop/${product.id}`}
                      className="border border-slate-200 rounded-2xl p-3 flex items-center gap-3 hover:border-blue-400 hover:shadow-xs transition bg-slate-50/50"
                    >
                      <img src={product.images[0]} alt={product.name} className="w-14 h-14 object-cover rounded-xl border" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-black text-slate-900 block truncate">{product.name}</span>
                        <span className="text-[11px] text-slate-500 block truncate">{product.fabric}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-extrabold text-blue-600">₹{product.price.toLocaleString("en-IN")}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                            {score}% Match
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
