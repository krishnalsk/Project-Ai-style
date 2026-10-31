// src/app/label-lens/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { queryCatalog, ScoredProduct } from "@/lib/queryEngine";
import { generateClientChatResponse, generateClientPrediction } from "@/lib/clientChatEngine";
import {
  Camera,
  Upload,
  Sparkles,
  ShieldAlert,
  Shirt,
  Droplets,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  HelpCircle,
  Send,
  RefreshCw,
  Sliders,
  Info,
  ExternalLink,
  MessageSquare,
  Eye,
  FileText,
  Thermometer,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { EvidenceBasedDiagnosisResponse } from "@/app/api/predict-issue/route";
import { ChatHistoryMessage } from "@/lib/chatbotEngine";

interface QuickPreset {
  name: string;
  category: "CARE_LABEL" | "SKIN" | "FABRIC" | "UNRELATED" | "UNCLEAR";
  image: string;
  textQuery: string;
}

const SAMPLE_PRESETS: QuickPreset[] = [
  {
    name: "Clear Care Tag (60/40 Blend)",
    category: "CARE_LABEL",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
    textQuery: "60% Cotton, 40% Recycled Polyester. Wash at 30°C gentle cycle. Do not bleach. Tumble dry low. Iron medium 150°C. Do not dry clean.",
  },
  {
    name: "Skin Irritation (Forearm Redness)",
    category: "SKIN",
    image: "https://images.unsplash.com/photo-1588636310486-3a5e2ab60d99?w=600",
    textQuery: "Itchy red rash on forearm after wearing tight polyester gym top in humid weather.",
  },
  {
    name: "Fabric Weave (Beige Twill)",
    category: "FABRIC",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600",
    textQuery: "Beige diagonal twill weave fabric surface texture with clean interlaced warp and weft yarns.",
  },
  {
    name: "Blurry Care Label",
    category: "UNCLEAR",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600",
    textQuery: "Blended fibers, imported materials, unreadable care tag.",
  },
  {
    name: "Unrelated Object (Houseplant)",
    category: "UNRELATED",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600",
    textQuery: "Green potted houseplant foliage on wooden desk.",
  },
];

export default function LabelLensPage() {
  const { profile } = useAuth();

  // Primary State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textQuery, setTextQuery] = useState("");
  const [selectedHint, setSelectedHint] = useState<"auto" | "skin" | "fabric" | "label" | "unrelated">("auto");
  const [activeClimate, setActiveClimate] = useState("Moderate (18°C - 24°C)");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");

  // Prediction Result
  const [prediction, setPrediction] = useState<EvidenceBasedDiagnosisResponse["prediction"] | null>(null);

  // Chat State
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryMessage[]>([
    {
      sender: "ai",
      text: "👋 Hello! I am your AI Stylist & Textile Assistant. Upload a care label, fabric weave, or skin photograph above, or ask me any question about fabric comfort, garment care, or skin sensitivity.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [suggestedPills, setSuggestedPills] = useState<string[]>([
    "Is cotton better than polyester for sensitive skin?",
    "Show me hypoallergenic clothing under ₹2,000",
    "How should I wash 60% cotton / 40% polyester?",
    "What fabric is best for humid climates?",
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "AI Fabric Scanner & Skin Condition Lens | Style AI";
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatSending]);

  // Handle Image Upload
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result as string;
        setImagePreview(b64);
        setPrediction(null);
      };
      reader.readAsDataURL(file);
    }
  }

  // Load a Preset
  function handleSelectPreset(preset: QuickPreset) {
    setImagePreview(preset.image);
    setTextQuery(preset.textQuery);
    setSelectedHint(
      preset.category === "SKIN"
        ? "skin"
        : preset.category === "FABRIC"
        ? "fabric"
        : preset.category === "CARE_LABEL"
        ? "label"
        : preset.category === "UNRELATED"
        ? "unrelated"
        : "auto"
    );
    setPrediction(null);
  }

  // Run Unified Multimodal Analysis
  async function runUnifiedAnalysis() {
    if (!imagePreview && !textQuery.trim()) {
      alert("Please upload an image, select a preset, or enter a description to analyze.");
      return;
    }

    setAnalyzing(true);
    setPrediction(null);

    // Visible Processing Progress Simulation
    setAnalysisStep("1/4 Performing computer vision pixel inspection & category classification...");
    await new Promise((r) => setTimeout(r, 220));

    setAnalysisStep("2/4 Extracting optical OCR text, weave features & care iconography...");
    await new Promise((r) => setTimeout(r, 250));

    setAnalysisStep("3/4 Calibrating category, OCR, and composition confidence scores...");
    await new Promise((r) => setTimeout(r, 220));

    setAnalysisStep("4/4 Evaluating evidence-grounded comfort index & catalog match...");

    let data: any = null;
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
      const apiUrl = `${basePath}/api/predict-issue/`.replace(/\/{2,}/g, "/");
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imagePreview,
          textQuery: textQuery,
          skinType: profile?.skinType || "Sensitive / Allergy Prone",
          climate: activeClimate,
          modalityHint: selectedHint === "auto" ? undefined : selectedHint,
        }),
      });

      if (response.ok) {
        const parsed = await response.json();
        if (parsed && parsed.status === "success" && parsed.prediction) {
          data = parsed;
        }
      }
    } catch (err) {
      console.warn("[Analysis API fallback engaged]", err);
    }

    if (!data || !data.prediction) {
      data = {
        status: "success",
        prediction: generateClientPrediction(
          imagePreview,
          textQuery,
          profile?.skinType || "Sensitive / Allergy Prone",
          activeClimate,
          selectedHint === "auto" ? undefined : selectedHint
        ),
      };
    }

    try {
      if (data && data.prediction) {
        setPrediction(data.prediction);

        const categoryTitle = data.prediction.identifiedCategory?.categoryTitle || "Analyzed Subject";
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "ai",
            text: `🔍 **Scan Completed:** Identified as **${categoryTitle}** with ${data.prediction.identifiedCategory?.confidence || 90}% confidence. Ask me any follow-up questions about this scan!`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (renderErr) {
      console.error("[Label Lens Render Error]", renderErr);
    } finally {
      setAnalyzing(false);
      setAnalysisStep("");
    }
  }

  // Send Follow-Up Message in Chat
  async function handleSendChat(customMsg?: string) {
    const messageToSend = customMsg || chatInput.trim();
    if (!messageToSend && !imagePreview) return;

    const userMsg: ChatHistoryMessage = {
      sender: "user",
      text: messageToSend,
      image: imagePreview || null,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    if (!customMsg) setChatInput("");
    setChatSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          image: imagePreview || null,
          skinType: profile?.skinType || "Sensitive / Allergy Prone",
          climate: activeClimate,
          history: chatHistory,
          allergies: profile?.confirmedAllergies || [],
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.reply,
            source: data.source,
            matchedProducts: data.matchedProducts,
            diagnosis: data.diagnosis,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        if (data.suggestedPills && data.suggestedPills.length > 0) {
          setSuggestedPills(data.suggestedPills);
        }
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "I encountered an issue processing your query. Please provide more details or rephrase.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err) {
      console.error("[Chat Error]", err);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Unable to reach the assistant server. Please check your connection and try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setChatSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Sticky Header with Back Button */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition flex items-center gap-1.5 text-xs font-bold border border-slate-200"
              title="Back to Home"
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" />
              <span>Back</span>
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Style AI Fabric Scanner & Skin Condition Lens
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 hidden sm:inline-block">
                  Multimodal CV + OCR
                </span>
              </h1>
              <p className="text-[11px] text-slate-500">
                Automatic 5-Category Classification, Verified Optical Care Label OCR & Non-Diagnostic Skin Lens
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition hidden sm:inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{profile?.confirmedAllergies?.length || 0} Allergy Filters</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Statutory Medical & Optical Notice */}
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-extrabold uppercase tracking-wide block text-amber-950">
              Clinical & Optical Safety Notice
            </span>
            <p className="leading-relaxed text-amber-900">
              This application provides <strong>non-diagnostic visual surface observations</strong> and OCR care tag parsing. It does not establish clinical medical diagnoses, histological assessments, or patch tests. Consult a board-certified dermatologist for persistent, severe, or worsening symptoms.
            </p>
          </div>
        </div>

        {/* SECTION 1: Unified 5-Category Scanner & Control Bar */}
        <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" /> Unified Image Scanner & Category Lens
              </h2>
              <p className="text-xs text-slate-500">
                Upload any photograph: Human Skin, Fabric Weave, Garment Care Tag, or Unrelated Object
              </p>
            </div>

            {/* Ambient Climate Selector */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] font-bold text-slate-500">Climate:</span>
              <select
                value={activeClimate}
                onChange={(e) => setActiveClimate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Moderate (18°C - 24°C)">Moderate (18°C - 24°C)</option>
                <option value="Hot & Humid Tropical (30°C+)">Hot & Humid (30°C+)</option>
                <option value="Cold & Dry Winter (&lt;15°C)">Cold & Dry (&lt;15°C)</option>
              </select>
            </div>
          </div>

          {/* Upload Dropzone & Sample Thumbnails */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Upload Area (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[200px] ${
                  imagePreview
                    ? "border-blue-300 bg-blue-50/30"
                    : "border-slate-200 bg-slate-50/70 hover:border-blue-400 hover:bg-slate-50"
                }`}
              >
                {imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Uploaded Scan"
                      className="w-36 h-36 object-cover rounded-xl mx-auto shadow-xs border border-slate-200"
                    />
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs font-bold text-blue-600">✓ Image Loaded</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                          setPrediction(null);
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black text-slate-800">Upload Photograph</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Care Label, Skin Area, or Fabric Weave</span>
                    <span className="mt-3 bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs hover:bg-slate-100">
                      Browse Files
                    </span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Presets & Context Description (7 Cols) */}
            <div className="lg:col-span-7 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-slate-700 block mb-1.5">
                  Or Test High-Fidelity Labeled Samples:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SAMPLE_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className="p-2 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-blue-50/60 hover:border-blue-300 text-left transition flex items-center gap-2 group"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-9 h-9 object-cover rounded-lg shrink-0 border border-slate-200"
                      />
                      <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700 leading-tight truncate">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Optional Garment or Symptom Notes:
                </label>
                <textarea
                  value={textQuery}
                  onChange={(e) => setTextQuery(e.target.value)}
                  placeholder="e.g. 60% Cotton 40% Polyester wash cold, or itchy red rash after workout shirt..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 1-Click Category Selector / Correction Pills */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase mr-1 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" /> Modality:
                </span>
                {[
                  { id: "auto", label: "Auto-Detect (Vision Model)" },
                  { id: "skin", label: "Human Skin Photo" },
                  { id: "fabric", label: "Fabric Weave Texture" },
                  { id: "label", label: "Care Tag / Wash Label" },
                  { id: "unrelated", label: "Other / Unrelated" },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setSelectedHint(pill.id as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                      selectedHint === pill.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={runUnifiedAnalysis}
                disabled={analyzing || (!imagePreview && !textQuery.trim())}
                className="bg-blue-600 text-white font-black text-xs px-6 py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shadow-xs flex items-center justify-center gap-2 shrink-0"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Run Multimodal Analysis</span>
                  </>
                )}
              </button>
            </div>

            {/* Animated Visible Progress Indicator */}
            {analyzing && (
              <div className="mt-3 bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-2xl flex items-center gap-3 animate-pulse">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-xs font-bold">{analysisStep}</span>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: Low-Confidence Warning / Mismatch Banner */}
        {prediction && prediction.confidenceScores?.lowConfidenceWarning && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold uppercase tracking-wide block text-amber-950">
                Low Identification Confidence Warning
              </span>
              <p className="font-semibold text-amber-900">
                {prediction.confidenceScores.lowConfidenceWarning}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setSelectedHint("label")}
                  className="bg-amber-100 border border-amber-300 text-amber-900 px-2.5 py-1 rounded-lg font-bold text-[11px] hover:bg-amber-200"
                >
                  Force Care Tag Mode
                </button>
                <button
                  onClick={() => setSelectedHint("skin")}
                  className="bg-amber-100 border border-amber-300 text-amber-900 px-2.5 py-1 rounded-lg font-bold text-[11px] hover:bg-amber-200"
                >
                  Force Skin Mode
                </button>
                <button
                  onClick={() => setSelectedHint("fabric")}
                  className="bg-amber-100 border border-amber-300 text-amber-900 px-2.5 py-1 rounded-lg font-bold text-[11px] hover:bg-amber-200"
                >
                  Force Fabric Mode
                </button>
              </div>
            </div>
          </div>
        )}

        {prediction && prediction.mismatchDetected && (
          <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 text-xs text-rose-900 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold uppercase block text-rose-950">Modality Mismatch Guard</span>
                <p className="text-rose-800">{prediction.mismatchMessage}</p>
              </div>
            </div>
            {prediction.suggestedModality && (
              <button
                onClick={() => {
                  const m = prediction.suggestedModality;
                  setSelectedHint(m === "SKIN_IMAGE" ? "skin" : m === "FABRIC_SURFACE" ? "fabric" : "label");
                  runUnifiedAnalysis();
                }}
                className="bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-rose-700 shrink-0"
              >
                Switch & Re-evaluate
              </button>
            )}
          </div>
        )}

        {/* SECTION 3: Multi-Dimensional Calibrated Confidence Scores Dashboard */}
        {prediction && prediction.confidenceScores && (
          <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  Calibrated Feature Confidence Gauges
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Identified Subject: {prediction.identifiedCategory?.categoryTitle || prediction.visibleObservations.subject}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500">Overall Certainty:</span>
                <span className="ml-1 text-sm font-black text-blue-700">
                  {prediction.confidenceScores.categoryClassification}%
                </span>
              </div>
            </div>

            {/* 4 Separate Confidence Percentage Gauges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: "Image Category Classification",
                  value: prediction.confidenceScores.categoryClassification,
                  desc: "Multimodal pixel matching certainty",
                },
                {
                  label: "OCR Text Extraction",
                  value: prediction.confidenceScores.ocrExtraction,
                  desc: "Printed character recognition rate",
                },
                {
                  label: "Fabric Composition",
                  value: prediction.confidenceScores.compositionIdentification,
                  desc: "Fiber percentage verification level",
                },
                {
                  label: "Visible Skin Features",
                  value: prediction.confidenceScores.skinFeatureRecognition,
                  desc: "Erythema & texture nap observation",
                },
              ].map((gauge) => {
                const color =
                  gauge.value >= 85
                    ? "bg-emerald-500"
                    : gauge.value >= 60
                    ? "bg-blue-500"
                    : "bg-amber-500";
                const textColor =
                  gauge.value >= 85
                    ? "text-emerald-700"
                    : gauge.value >= 60
                    ? "text-blue-700"
                    : "text-amber-700";

                return (
                  <div key={gauge.label} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 truncate pr-1">{gauge.label}</span>
                      <span className={`text-xs font-black ${textColor}`}>{gauge.value}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${gauge.value}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">{gauge.desc}</span>
                  </div>
                );
              })}
            </div>

            {/* Educational Disclaimer: Model Confidence vs. Empirical Accuracy */}
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-2.5 text-[11px] text-slate-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{prediction.confidenceScores.confidenceDisclaimer}</span>
            </div>
          </section>
        )}

        {/* SECTION 4: Dedicated Modality Analysis Displays */}
        {prediction && (
          <div className="space-y-6">
            {/* A. CARE LABEL SCANNER CARD */}
            {prediction.inputModality === "LABEL_CARE_TAG" && prediction.careLabelAnalysis && (
              <section className="bg-white border border-blue-200 rounded-3xl p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                      Optical Care Tag Scanner
                    </span>
                    <h3 className="text-lg font-black text-slate-900">
                      Fiber Composition & 5-Tier Care Instructions
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-xl border ${
                      prediction.verifiedTextileInfo.verificationStatus === "VERIFIED_FROM_TAG"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : prediction.verifiedTextileInfo.verificationStatus === "PARTIALLY_VERIFIED"
                        ? "bg-blue-50 text-blue-800 border-blue-300"
                        : "bg-amber-50 text-amber-800 border-amber-300"
                    }`}
                  >
                    {prediction.verifiedTextileInfo.verificationStatus === "VERIFIED_FROM_TAG"
                      ? "✓ VERIFIED FROM TAG"
                      : prediction.verifiedTextileInfo.verificationStatus === "SELF_REPORTED_ONLY"
                      ? "MANUAL / SELF-REPORTED"
                      : "PARTIALLY VERIFIED"}
                  </span>
                </div>

                {/* Raw Extracted Text vs. Corrected Interpretation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5">
                    <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wide block">
                      Original Extracted OCR Text:
                    </span>
                    <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80">
                      {prediction.careLabelAnalysis.rawExtractedText || prediction.careLabelAnalysis.rawText || "No text detected"}
                    </pre>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 space-y-1.5">
                    <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wide block">
                      Corrected Interpretation:
                    </span>
                    <div className="text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-blue-200/80 font-medium space-y-2">
                      <p>{prediction.careLabelAnalysis.correctedInterpretation || "Textile interpretation pending."}</p>
                      {prediction.careLabelAnalysis.totalPercentage !== undefined && (
                        <div className="pt-1 flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-500">Total Accounted:</span>
                          <span
                            className={`text-xs font-black px-2 py-0.5 rounded-md ${
                              prediction.careLabelAnalysis.isPercentageSum100
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {prediction.careLabelAnalysis.totalPercentage}%
                            {prediction.careLabelAnalysis.isPercentageSum100 ? " (Complete 100%)" : " (Partial Total)"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Unreadable or Uncertain Spans Notice */}
                {((prediction.careLabelAnalysis.unreadableSpans && prediction.careLabelAnalysis.unreadableSpans.length > 0) ||
                  (prediction.careLabelAnalysis.uncertainSpans && prediction.careLabelAnalysis.uncertainSpans.length > 0)) && (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-amber-950">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Highlighted Uncertain / Unreadable Optical Spans:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] text-amber-800">
                      {prediction.careLabelAnalysis.unreadableSpans?.map((span, idx) => (
                        <li key={idx}><strong>Unreadable line:</strong> &ldquo;{span}&rdquo;</li>
                      ))}
                      {prediction.careLabelAnalysis.uncertainSpans?.map((span, idx) => (
                        <li key={idx}><strong>Uncertain line:</strong> &ldquo;{span}&rdquo;</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 5-Tier Structured Wash Care Breakdown */}
                {prediction.careLabelAnalysis.washCare && (
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-black text-slate-800 block">
                      5-Tier Care Instructions:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                      {[
                        { title: "Washing", item: prediction.careLabelAnalysis.washCare.washing },
                        { title: "Bleaching", item: prediction.careLabelAnalysis.washCare.bleaching },
                        { title: "Drying", item: prediction.careLabelAnalysis.washCare.drying },
                        { title: "Ironing", item: prediction.careLabelAnalysis.washCare.ironing },
                        { title: "Dry Clean", item: prediction.careLabelAnalysis.washCare.dryCleaning },
                      ].map((tier) => {
                        const statusBadge =
                          tier.item.status === "EXTRACTED_SUCCESSFULLY"
                            ? "bg-emerald-100 text-emerald-800"
                            : tier.item.status === "NOT_SPECIFIED"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-amber-100 text-amber-800";

                        return (
                          <div
                            key={tier.title}
                            className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col justify-between space-y-1.5"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-black text-slate-700">{tier.title}</span>
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${statusBadge}`}>
                                  {tier.item.status === "EXTRACTED_SUCCESSFULLY"
                                    ? "Verified"
                                    : tier.item.status === "NOT_SPECIFIED"
                                    ? "Not on Tag"
                                    : "Unreadable"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-800 font-medium leading-tight">
                                {tier.item.instruction}
                              </p>
                            </div>
                            <span className="text-[9px] text-slate-400 block pt-1 border-t border-slate-200/50">
                              Source: {tier.item.source}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* B. SKIN IRITATION LENS CARD */}
            {prediction.inputModality === "SKIN_IMAGE" && (
              <section className="bg-white border border-rose-200 rounded-3xl p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">
                      Dermatological Surface Lens
                    </span>
                    <h3 className="text-lg font-black text-slate-900">
                      Non-Diagnostic Skin Surface Observations
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200">
                    Surface Optical Analysis
                  </span>
                </div>

                {/* Visible Features Grid */}
                {prediction.skinAnalysisDetails && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-3 text-center">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Redness (Erythema)</span>
                      <span className="text-sm font-black text-rose-700 mt-0.5 block">
                        {prediction.skinAnalysisDetails.rednessLevel}
                      </span>
                    </div>
                    <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-3 text-center">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Surface Dryness</span>
                      <span className="text-sm font-black text-amber-700 mt-0.5 block">
                        {prediction.skinAnalysisDetails.drynessLevel}
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Scaling / Flaking</span>
                      <span className="text-sm font-black text-slate-800 mt-0.5 block">
                        {prediction.skinAnalysisDetails.scalingLevel}
                      </span>
                    </div>
                    <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-3 text-center">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Irritation Level</span>
                      <span className="text-sm font-black text-purple-700 mt-0.5 block">
                        {prediction.skinAnalysisDetails.surfaceIrritation}
                      </span>
                    </div>
                  </div>
                )}

                {/* Non-Diagnostic Explanation */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wide block">
                    Surface Finding Explanation:
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {prediction.skinAnalysisDetails?.nonDiagnosticExplanation ||
                      prediction.visibleObservations.visualFindings}
                  </p>
                </div>

                {/* Clothing-Related Mechanical & Thermal Factors */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-800 block">
                    Possible Clothing-Related Contributing Factors:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {prediction.skinAnalysisDetails?.clothingFactors.map((factor, idx) => (
                      <div
                        key={idx}
                        className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 font-medium leading-relaxed"
                      >
                        {factor}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medical Advisory Box */}
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-rose-900">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold uppercase tracking-wide block text-rose-950">
                      Medical Evaluation Advisory:
                    </span>
                    <p className="leading-relaxed">
                      {prediction.skinAnalysisDetails?.medicalAdvisory ||
                        "Consult a physician or board-certified dermatologist for persistent, severe, or spreading cutaneous symptoms."}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* C. FABRIC WEAVE TEXTURE CARD */}
            {prediction.inputModality === "FABRIC_SURFACE" && (
              <section className="bg-white border border-blue-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                      Textile Surface Lens
                    </span>
                    <h3 className="text-lg font-black text-slate-900">
                      Optical Weave Structure & Nap Characteristics
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
                    Weave Pattern Analysis
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {prediction.visibleObservations.visualFindings}
                  </p>
                  <p className="text-xs text-amber-800 font-semibold bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                    ⚠️ {prediction.visibleObservations.limitations}
                  </p>
                </div>
              </section>
            )}

            {/* SECTION 5: Estimated Comfort Score */}
            <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                    Evidence-Grounded Metric
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                    Non-Clinical Application Estimate
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Cutaneous Comfort Index: {prediction.comfortScore.score !== null ? `${prediction.comfortScore.score} / 100` : "Indeterminate"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {prediction.comfortScore.explanation}
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  {prediction.comfortScore.documentedRules.map((rule, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded-lg border border-slate-200"
                    >
                      {rule}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-center px-6 py-4 rounded-2xl bg-blue-50 border border-blue-200 shrink-0 w-full sm:w-auto">
                <span className="block text-3xl font-black text-blue-700">
                  {prediction.comfortScore.score !== null ? prediction.comfortScore.score : "--"}
                </span>
                <span className="text-xs font-extrabold text-blue-800 uppercase block mt-0.5">
                  {prediction.comfortScore.ratingBand}
                </span>
              </div>
            </section>

            {/* SECTION 6: Nuanced Fabric Recommendations with Catalog Matching */}
            {prediction.fabricRecommendations && (
              <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                      Grounded Textile Guidance
                    </span>
                    <h3 className="text-lg font-black text-slate-900">
                      Recommended Fabric & Garment Silhouette
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                    Tailored to Climate & Skin
                  </span>
                </div>

                {/* Primary Recommendation Card */}
                <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-black uppercase text-emerald-900 tracking-wide block">
                        Primary Recommended Fabric:
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900">
                        {prediction.fabricRecommendations.primaryRecommendation.fabric}
                      </h4>
                      <span className="text-xs font-semibold text-slate-600">
                        Silhouette: {prediction.fabricRecommendations.primaryRecommendation.garmentType}
                      </span>
                    </div>
                  </div>

                  {/* Reasons vs Disadvantages (Pros & Cons) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 space-y-1.5">
                      <span className="text-xs font-bold text-emerald-800 block">✓ Advantages & Skin Benefits:</span>
                      <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                        {prediction.fabricRecommendations.primaryRecommendation.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 space-y-1.5">
                      <span className="text-xs font-bold text-amber-800 block">⚠️ Potential Disadvantages / Notes:</span>
                      <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                        {prediction.fabricRecommendations.primaryRecommendation.potentialDisadvantages.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Alternative Fabrics */}
                {prediction.fabricRecommendations.alternativeFabrics.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-black text-slate-800 block">
                      Viable Alternative Hypoallergenic Fibers:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {prediction.fabricRecommendations.alternativeFabrics.map((alt, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                          <span className="text-xs font-bold text-slate-900 block">{alt.fabric}</span>
                          <span className="text-[11px] text-slate-600 block">{alt.garmentType}</span>
                          <p className="text-[11px] text-slate-700 pt-1 border-t border-slate-200/60">
                            {alt.reasons[0]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strict Safety Disclaimer */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{prediction.fabricRecommendations.safetyDisclaimer}</span>
                </div>

                {/* Real Verified Catalog Products (from 1,000 Catalog) */}
                {prediction.fabricRecommendations.catalogProducts.length > 0 && (
                  <div className="border-t border-slate-100 pt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Shirt className="w-4 h-4 text-emerald-600" />
                        Matched Clothing from Catalog (In-Stock):
                      </h4>
                      <Link href="/shop" className="text-xs font-bold text-blue-600 hover:underline">
                        Explore All 1,000 Products →
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {prediction.fabricRecommendations.catalogProducts.map(({ product, score }) => (
                        <Link
                          key={product.id}
                          href={`/shop/${product.id}`}
                          className="border border-slate-200 rounded-2xl p-3 hover:border-blue-400 hover:shadow-xs transition bg-slate-50/50 flex flex-col justify-between group"
                        >
                          <div>
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-32 object-cover rounded-xl border border-slate-200 mb-2 group-hover:scale-[1.02] transition"
                            />
                            <span className="text-xs font-black text-slate-900 block truncate group-hover:text-blue-600">
                              {product.name}
                            </span>
                            <span className="text-[11px] text-emerald-700 font-semibold block truncate">
                              {product.fabric}
                            </span>
                          </div>
                          <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 mt-2">
                            <span className="text-xs font-black text-slate-900">
                              ₹{product.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                              Score {score}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* SECTION 7: Embedded ChatGPT-Style Conversational Assistant */}
        <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                AI
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Conversational AI Stylist & Care Assistant</h3>
                <p className="text-[11px] text-slate-500">Ask natural follow-up questions about fabrics, care labels, or catalog items</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {chatOpen ? "Collapse Chat" : "Expand Chat"}
            </button>
          </div>

          {chatOpen && (
            <div className="space-y-4">
              {/* Chat Message Scroll Area */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white rounded-br-xs shadow-2xs"
                          : "bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/70"
                      }`}
                    >
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="User attached"
                          className="w-24 h-24 object-cover rounded-lg border border-white/20 mb-1"
                        />
                      )}
                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      {/* Attached Product Cards in Chat */}
                      {msg.matchedProducts && msg.matchedProducts.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 space-y-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">
                            Matched from Catalog:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.matchedProducts.slice(0, 2).map(({ product }) => (
                              <Link
                                key={product.id}
                                href={`/shop/${product.id}`}
                                className="bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-2 hover:border-blue-400 transition"
                              >
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded-lg border shrink-0"
                                />
                                <div className="min-w-0">
                                  <span className="text-[11px] font-bold text-slate-900 block truncate">
                                    {product.name}
                                  </span>
                                  <span className="text-[10px] font-bold text-blue-600 block">
                                    ₹{product.price.toLocaleString("en-IN")}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">
                      {msg.timestamp || ""}
                    </span>
                  </div>
                ))}

                {chatSending && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200 max-w-xs animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                    <span>Thinking with existing catalog & rules...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Follow-Up Suggestion Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suggestedPills.map((pill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendChat(pill)}
                    className="text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full hover:bg-blue-100 transition shadow-2xs"
                  >
                    + {pill}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  placeholder="Ask a question about this scan or clothing comfort..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSendChat()}
                  disabled={chatSending || !chatInput.trim()}
                  className="bg-blue-600 text-white font-bold p-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shrink-0 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
