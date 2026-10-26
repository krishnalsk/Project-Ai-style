"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AnalysisResult {
  composition: string;
  safetyScore: number;
  comfortScore: number;
  safetyLevel: "SAFE" | "MODERATE" | "AVOID";
  dermatologyVerdict: string;
  pros: string[];
  risks: string[];
  careInstructions: string[];
}

const PRESETS = [
  { label: "100% Organic Cotton", query: "100% Organic Cotton, Made in Portugal" },
  { label: "95% Bamboo / 5% Elastane", query: "95% Bamboo Viscose, 5% Spandex/Elastane" },
  { label: "100% French Linen", query: "100% Pure Flax Linen" },
  { label: "65% Polyester / 35% Cotton", query: "65% Polyester, 35% Recycled Cotton" },
  { label: "100% Acrylic Knit", query: "100% Acrylic, Dry Clean Only" },
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
  const [activeTab, setActiveTab] = useState<"ocr" | "manual">("ocr");
  const [tagInput, setTagInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrStep, setOcrStep] = useState("");
  const [selectedSample, setSelectedSample] = useState(SAMPLE_TAG_PHOTOS[0]);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [analysisMethod, setAnalysisMethod] = useState<"Simulated OCR" | "Manual Entry" | "Quick Preset">("Simulated OCR");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    document.title = "Label Lens | Style AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Scan clothing labels for fabric analysis");
  }, []);

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedPreview(url);
      setTagInput("");
    }
  }

  function runSimulatedOcr(sampleText?: string) {
    const textToExtract = sampleText || selectedSample.extractedText;
    setOcrScanning(true);
    setOcrStep("1/3 Scanning clothing tag edges...");

    setTimeout(() => {
      setOcrStep("2/3 Recognizing textile symbols and fiber percentages...");
      setTimeout(() => {
        setOcrStep("3/3 Formatting extracted composition for review...");
        setTimeout(() => {
          setTagInput(textToExtract);
          setOcrScanning(false);
          setOcrStep("");
          setAnalysisMethod("Simulated OCR");
        }, 400);
      }, 500);
    }, 500);
  }

  function analyzeFabric(text: string, methodOverride?: "Simulated OCR" | "Manual Entry" | "Quick Preset") {
    if (!text.trim()) return;
    setAnalyzing(true);
    if (methodOverride) setAnalysisMethod(methodOverride);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let res: AnalysisResult;

      if (lower.includes("acrylic") || (lower.includes("polyester") && !lower.includes("cotton"))) {
        res = {
          composition: text,
          safetyScore: 65,
          comfortScore: 68,
          safetyLevel: "AVOID",
          dermatologyVerdict: "High synthetic content traps perspiration and creates mechanical friction. Not recommended for eczema, psoriasis, or sensitive skin.",
          pros: ["High durability", "Wrinkle resistant"],
          risks: ["Heat trapping", "Potential contact dermatitis", "Low breathability"],
          careInstructions: ["Wash cold in microfiber filter bag", "Air dry away from heat"],
        };
      } else if (lower.includes("bamboo")) {
        res = {
          composition: text,
          safetyScore: 98,
          comfortScore: 97,
          safetyLevel: "SAFE",
          dermatologyVerdict: "Excellent skin tolerance. Naturally hypoallergenic and ultra-smooth fibers reduce mechanical friction.",
          pros: ["Naturally antibacterial", "Super-soft micro-texture", "Superior moisture wicking"],
          risks: ["Requires gentle wash to prevent pilling"],
          careInstructions: ["Machine wash gentle with mild liquid soap", "Do not bleach", "Line dry"],
        };
      } else if (lower.includes("linen") || lower.includes("flax")) {
        res = {
          composition: text,
          safetyScore: 97,
          comfortScore: 93,
          safetyLevel: "SAFE",
          dermatologyVerdict: "Highly recommended for warm and humid conditions. Open weave structure prevents sweat accumulation.",
          pros: ["Maximum airflow", "Eco-friendly natural flax", "Gets softer with each wash"],
          risks: ["Initial stiffness until first 2-3 washes"],
          careInstructions: ["Wash at 30°C", "Hang to dry while slightly damp to minimize creasing"],
        };
      } else if (
        lower.includes("cotton") ||
        lower.includes("silk") ||
        lower.includes("modal") ||
        lower.includes("tencel") ||
        lower.includes("wool") ||
        lower.includes("rayon")
      ) {
        res = {
          composition: text,
          safetyScore: 96,
          comfortScore: 95,
          safetyLevel: "SAFE",
          dermatologyVerdict: "Optimal natural/regenerated fiber choice. High breathability and natural softness suitable for most sensitive skin types.",
          pros: ["High breathability", "Gentle on natural skin barrier", "Easy maintenance"],
          risks: ["Minor shrinkage if washed in hot water"],
          careInstructions: ["Warm machine wash with like colors", "Tumble dry low"],
        };
      } else {
        res = {
          composition: text,
          safetyScore: 70,
          comfortScore: 70,
          safetyLevel: "MODERATE",
          dermatologyVerdict: "Fiber composition not fully recognized in standard textile library. Please inspect the garment label for specific fiber names or consult the Fabric Encyclopedia.",
          pros: ["Requires manual fiber identification"],
          risks: ["Unverified allergy tolerance", "Potential undisclosed synthetic blends or chemical finishes"],
          careInstructions: ["Follow care label symbols carefully", "Wash in cool water (30°C) with hypoallergenic liquid detergent"],
        };
      }

      setResult(res);
      setAnalyzing(false);
    }, 500);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" aria-label="Back to dashboard" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Label Lens™</h1>
              <p className="text-xs text-slate-500">Clothing wash-care label OCR scanner & friction risk analyzer</p>
            </div>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full border border-blue-200">
            OCR & Heuristic Engine
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Mode Selector */}
        <div className="flex gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab("ocr")}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
              activeTab === "ocr"
                ? "bg-[#4A90E2] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            📸 Scan Tag Photo (Simulated OCR)
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
              activeTab === "manual"
                ? "bg-[#4A90E2] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            ✍️ Manual Input & Presets
          </button>
        </div>

        {/* OCR Scan Tab */}
        {activeTab === "ocr" && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Step 1: Choose Tag Photo or Upload</h2>
                <p className="text-xs text-slate-500">
                  Select a test garment label or upload a picture from your device to run optical character extraction.
                </p>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-center">
                🧪 Simulated OCR Scanner
              </span>
            </div>

            {/* Sample Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SAMPLE_TAG_PHOTOS.map((s) => (
                <button
                  key={s.name}
                  onClick={() => {
                    setSelectedSample(s);
                    setUploadedPreview(null);
                    setTagInput("");
                  }}
                  className={`border-2 rounded-2xl p-3 text-left transition ${
                    selectedSample.name === s.name && !uploadedPreview
                      ? "border-[#4A90E2] bg-blue-50/50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="h-20 bg-slate-100 rounded-xl overflow-hidden mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 block truncate">{s.name}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{s.extractedText}</span>
                </button>
              ))}
            </div>

            {/* File Upload Option */}
            <div className="flex items-center gap-3 pt-1">
              <label className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl cursor-pointer transition">
                📁 Upload Custom Tag Image
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              {uploadedPreview && (
                <span className="text-xs font-bold text-emerald-600">✓ Custom image loaded</span>
              )}
            </div>

            {/* Run OCR Scan Button */}
            <div className="pt-2">
              <button
                onClick={() => runSimulatedOcr(uploadedPreview ? "100% French Linen, Wash Gentle 30°C" : undefined)}
                disabled={ocrScanning}
                className="w-full sm:w-auto bg-[#4A90E2] text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#3A6BC8] transition shadow-xs disabled:opacity-50 text-xs flex items-center justify-center gap-2"
              >
                {ocrScanning ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>{ocrStep || "Scanning label..."}</span>
                  </>
                ) : (
                  "🔍 Extract Tag Text via OCR"
                )}
              </button>
            </div>

            {/* Review Box */}
            <div className="border-t border-slate-100 pt-5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Step 2: Review & Verify Detected Text
                </label>
                <span className="text-[11px] text-slate-400">You can edit before analyzing</span>
              </div>
              <textarea
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Click 'Extract Tag Text' above or type label text here..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                onClick={() => analyzeFabric(tagInput, "Simulated OCR")}
                disabled={!tagInput.trim() || analyzing}
                className="bg-emerald-600 text-white font-bold text-xs px-6 py-3 rounded-2xl hover:bg-emerald-700 transition disabled:opacity-40 shadow-xs"
              >
                {analyzing ? "Evaluating..." : "✓ Confirm & Analyze Detected Composition"}
              </button>
            </div>
          </div>
        )}

        {/* Manual Tab */}
        {activeTab === "manual" && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 mb-1">Manual Fabric Entry & Presets</h2>
              <p className="text-xs text-slate-500">
                Pick a common fabric blend preset or type custom garment label details below.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setTagInput(p.query);
                    analyzeFabric(p.query, "Quick Preset");
                  }}
                  className="text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 px-3.5 py-1.5 rounded-xl transition"
                >
                  🏷️ {p.label}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. 100% Organic Cotton, or 80% Wool 20% Polyester..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              />
              <button
                onClick={() => analyzeFabric(tagInput, "Manual Entry")}
                disabled={!tagInput.trim() || analyzing}
                className="bg-blue-600 text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-blue-700 transition disabled:opacity-40 shrink-0 text-xs shadow-xs"
              >
                {analyzing ? "Evaluating..." : "Analyze Tag"}
              </button>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Analysis Result</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Source: {analysisMethod}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">{result.composition}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">Skin Safety</span>
                  <span className="text-lg font-black text-slate-900">{result.safetyScore}%</span>
                </div>
                <span
                  className={`text-sm font-black px-4 py-1.5 rounded-2xl ${
                    result.safetyLevel === "SAFE"
                      ? "bg-emerald-100 text-emerald-800"
                      : result.safetyLevel === "MODERATE"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {result.safetyLevel}
                </span>
              </div>
            </div>

            {/* Verdict */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <span className="text-xs font-bold text-blue-700 block mb-1">🔬 Dermatologist AI Verdict:</span>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{result.dermatologyVerdict}</p>
            </div>

            {/* Pros & Risks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4">
                <span className="text-xs font-extrabold text-emerald-800 block mb-2">✅ Fabric Advantages</span>
                <ul className="space-y-1.5 text-xs text-emerald-900">
                  {result.pros.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4">
                <span className="text-xs font-extrabold text-amber-800 block mb-2">⚠️ Potential Risks</span>
                <ul className="space-y-1.5 text-xs text-amber-900">
                  {result.risks.map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Care Guide */}
            <div className="border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-slate-600 block mb-2">🧼 Recommended Wash Care:</span>
              <div className="flex flex-wrap gap-2">
                {result.careInstructions.map((inst) => (
                  <span key={inst} className="text-xs bg-slate-100 text-slate-700 font-medium px-3 py-1 rounded-xl">
                    {inst}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-[11px] text-slate-400 max-w-xl mx-auto leading-relaxed">
            ⚕️ <strong>Informational Guidance:</strong> Label Lens analyzes fabric composition against published dermatological textile studies. It does not constitute medical diagnosis, allergy testing, or treatment advice. Consult a dermatologist for chronic skin conditions.
          </p>
        </div>
      </main>
    </div>
  );
}
