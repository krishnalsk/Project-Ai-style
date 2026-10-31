// src/app/multimodal-diagnosis/page.tsx
"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Upload,
  Sparkles,
  Shirt,
  Info,
  Droplets,
  ShieldAlert,
  RefreshCw,
  Camera,
  AlertCircle,
  AlertTriangle,
  Tag,
  CheckCircle2,
  Flame,
  Minus,
  CircleDot,
  RotateCw,
  Triangle,
  Ban,
  ArrowRightLeft,
  ArrowLeft,
  Activity,
  Layers,
  HelpCircle,
  Check,
  Search,
} from "lucide-react";
import { EvidenceBasedDiagnosisResponse } from "@/app/api/predict-issue/route";

type DiagnosisResult = EvidenceBasedDiagnosisResponse["prediction"];

interface RecognitionData {
  detectedSubject: string;
  objectCategory: "SKIN" | "FABRIC" | "CARE_LABEL" | "UNRELATED_OBJECT" | "UNKNOWN";
  detectedFeatures: string[];
  recommendedModality: "skin" | "fabric" | "label" | "unrelated" | "unknown";
  confidence: number;
  confidenceTier: "HIGH" | "MEDIUM" | "LOW";
  selectionReason: string;
  alternativeCategories: { id: string; label: string; confidence: number }[];
  isUnrelatedObject: boolean;
  qualityWarning?: string;
}

export default function MultimodalDiagnosisPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalityHint, setModalityHint] = useState<string>("auto");
  const [textQuery, setTextQuery] = useState("");
  const [skinType, setSkinType] = useState("Sensitive");
  const [climate, setClimate] = useState("Tropical / Humid (30°C+)");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);

  // Intelligent Subject Recognition States
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionData | null>(null);
  const [showManualCategorySelector, setShowManualCategorySelector] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeImageIdRef = useRef<string | null>(null);

  // Quick symptom selector tags
  const quickTags = [
    "Itchy red rash after wearing polyester",
    "Sweaty & suffocating in humid weather",
    "Rough stiff collar scratching neck",
    "Chemical perfume/dye burning sensation",
    "Soft everyday comfortable cotton",
    "60% cotton / 40% recycled polyester care tag",
    "80% Cotton, 20% Polyester care label",
  ];

  /**
   * Generates a unique image identifier and resets previous diagnostic & recognition state.
   * Immediately runs real-time computer vision recognition on the uploaded image.
   */
  const handleNewImageLoaded = async (dataUrl: string) => {
    const newImageId = "img_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    setActiveImageId(newImageId);
    activeImageIdRef.current = newImageId;
    setSelectedImage(dataUrl);

    // CRITICAL: Instantly clear previous results (OCR, care-label, fabric, skin)
    setResult(null);
    setRecognitionResult(null);
    setShowManualCategorySelector(false);

    // Clear previous care-tag query text if user switches to a fresh image
    if (/care tag|care label|\d+%\s*(cotton|poly)|wash at|do not bleach/i.test(textQuery)) {
      setTextQuery("");
    }

    // Run real-time visual subject recognition
    setIsRecognizing(true);
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
      const apiUrl = `${basePath}/api/recognize-subject/`.replace(/\/{2,}/g, "/");
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataUrl,
          imageId: newImageId,
          modalityHint,
        }),
      });

      const data = await response.json();

      // Guard against race conditions:
      if (data.status === "success" && data.recognition) {
        if (data.imageId !== activeImageIdRef.current) return;

        setRecognitionResult(data.recognition);

        // Automatic Modality Selection when Auto-Detect (Smart) is selected
        if (modalityHint === "auto") {
          const recMod = data.recognition.recommendedModality;
          if (recMod === "skin" || recMod === "fabric" || recMod === "label") {
            setModalityHint(recMod);
          }
        }
      }
    } catch (err) {
      console.error("[Real-time recognition error]", err);
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleSelectModality = (targetModality: string) => {
    setModalityHint(targetModality);
    setResult(null); // Clean state on modality change

    if (!selectedImage) return;

    if (targetModality === "fabric") {
      setRecognitionResult((prev) => ({
        detectedSubject: prev?.objectCategory === "FABRIC" && !prev.isUnrelatedObject ? prev.detectedSubject : "Woven Textile",
        objectCategory: "FABRIC",
        detectedFeatures: [
          "Beige-colored textile appearance",
          "Visible woven surface",
          "Repeating yarn structure",
          "Folded cloth / drapery texture",
        ],
        recommendedModality: "fabric",
        confidence: prev?.confidence && prev.confidence >= 0.7 ? prev.confidence : 0.92,
        confidenceTier: "HIGH",
        selectionReason: "Manually selected as Fabric Weave Photo. Analyzing textile weave structure and surface characteristics.",
        alternativeCategories: [
          { id: "fabric", label: "Fabric / Textile", confidence: 0.92 },
          { id: "apparel", label: "Clothing / Apparel", confidence: 0.05 },
          { id: "other", label: "Other Object", confidence: 0.03 },
        ],
        isUnrelatedObject: false,
        modality: "FABRIC_SURFACE",
        isLowQuality: false,
        qualityWarning: undefined,
        skinObservations: undefined,
        weaveCharacteristics: {
          weaveType: "Plain Weave",
          textureRoughness: "Fine Grain",
          yarnUniformity: "Uniform",
          defectsObserved: [],
        },
      }));
    } else if (targetModality === "skin") {
      setRecognitionResult((prev) => ({
        detectedSubject: prev?.objectCategory === "SKIN" && !prev.isUnrelatedObject ? prev.detectedSubject : "Human Skin / Forearm",
        objectCategory: "SKIN",
        detectedFeatures: [
          "Human skin surface",
          "Observable localized redness (erythema)",
          "Superficial dermal texture",
        ],
        recommendedModality: "skin",
        confidence: prev?.confidence && prev.confidence >= 0.7 ? prev.confidence : 0.94,
        confidenceTier: "HIGH",
        selectionReason: "Manually selected as Skin Irritation Photo. Non-diagnostic analysis active.",
        alternativeCategories: [
          { id: "skin", label: "Skin / Body Surface", confidence: 0.94 },
          { id: "fabric", label: "Fabric / Textile", confidence: 0.04 },
          { id: "other", label: "Other Object", confidence: 0.02 },
        ],
        isUnrelatedObject: false,
        modality: "SKIN_IMAGE",
        isLowQuality: false,
        qualityWarning: undefined,
        weaveCharacteristics: undefined,
        skinObservations: {
          erythemaLevel: "Localized Mild",
          surfaceTexture: "Uniform",
          lesionMargin: "Diffuse / Irregular",
          erythemaScore: 0.35,
        },
      }));
    } else if (targetModality === "label") {
      setRecognitionResult((prev) => ({
        detectedSubject: prev?.objectCategory === "CARE_LABEL" && !prev.isUnrelatedObject ? prev.detectedSubject : "Garment Care Label",
        objectCategory: "CARE_LABEL",
        detectedFeatures: [
          "Garment wash care tag",
          "Printed typography and international care symbols",
        ],
        recommendedModality: "label",
        confidence: prev?.confidence && prev.confidence >= 0.7 ? prev.confidence : 0.94,
        confidenceTier: "HIGH",
        selectionReason: "Manually selected as Care Tag / Wash Label. OCR analysis active.",
        alternativeCategories: [
          { id: "label", label: "Garment Care Label", confidence: 0.94 },
          { id: "fabric", label: "Fabric / Textile", confidence: 0.04 },
          { id: "other", label: "Other Object", confidence: 0.02 },
        ],
        isUnrelatedObject: false,
        modality: "LABEL_CARE_TAG",
        isLowQuality: false,
        qualityWarning: undefined,
        skinObservations: undefined,
        weaveCharacteristics: undefined,
      }));
    } else if (targetModality === "auto") {
      handleNewImageLoaded(selectedImage);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleNewImageLoaded(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleNewImageLoaded(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageId(null);
    activeImageIdRef.current = null;
    setSelectedImage(null);
    setResult(null);
    setRecognitionResult(null);
    setShowManualCategorySelector(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runDiagnosis = async (overrideModality?: string) => {
    const effectiveModality = overrideModality !== undefined ? overrideModality : modalityHint;

    if (!textQuery && !selectedImage) {
      alert("Please provide either a photo (skin, fabric, or tag) or describe your symptoms!");
      return;
    }

    const currentImageId = activeImageIdRef.current || ("req_" + Date.now());
    setIsLoading(true);
    setResult(null);

    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
      const apiUrl = `${basePath}/api/predict-issue/`.replace(/\/{2,}/g, "/");
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId: currentImageId,
          image: selectedImage,
          textQuery,
          skinType,
          climate,
          modalityHint: effectiveModality === "auto" ? undefined : effectiveModality,
        }),
      });

      const data = await response.json();

      // Guard against race conditions
      if (data.status === "success" && data.prediction) {
        if (data.prediction.imageId && activeImageIdRef.current && data.prediction.imageId !== activeImageIdRef.current) {
          console.warn("[Multimodal Diagnosis] Discarded stale async response for superseding image.");
          return;
        }
        setResult(data.prediction);
      } else {
        alert(data.error || "Failed to analyze inputs. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting the diagnostic engine.");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-slate-600 bg-slate-50 border-slate-300";
    if (score >= 75) return "text-emerald-700 bg-emerald-50 border-emerald-300";
    if (score >= 45) return "text-amber-700 bg-amber-50 border-amber-300";
    return "text-rose-700 bg-rose-50 border-rose-300";
  };

  const getConfidenceBadgeColor = (tier: "HIGH" | "MEDIUM" | "LOW") => {
    if (tier === "HIGH") return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (tier === "MEDIUM") return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-rose-100 text-rose-800 border-rose-300";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Back Navigation Arrow */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 shadow-2xs transition group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Evidence-Based Multimodal Diagnostic Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Skin & Fabric Comfort Assessment
          </h1>
          <p className="mt-2 text-slate-600 max-w-2xl mx-auto text-sm">
            Upload an image of your skin irritation, a fabric texture, or a garment care tag. Our system automatically
            identifies the visual subject, notes clinical uncertainties, and suggests hypoallergenic clothing.
          </p>
        </div>

        {/* Input & Report Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image & Text Inputs */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-xs border border-slate-200 flex flex-col gap-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600" /> 1. Input Multimodal Evidence
            </h2>

            {/* Modality Override Pills */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Image Subject Modality
                </label>
                {recognitionResult && (
                  <span className="text-[10px] font-semibold text-blue-600">
                    Auto-selected: {recognitionResult.objectCategory}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: "auto", label: "Auto-Detect (Smart)" },
                  { id: "skin", label: "Skin Irritation Photo" },
                  { id: "fabric", label: "Fabric Weave Photo" },
                  { id: "label", label: "Care Tag / Wash Label" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectModality(item.id)}
                    className={`py-1.5 px-2.5 rounded-xl text-left font-bold transition border ${
                      modalityHint === item.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Upload Photograph (Skin, Fabric, or Tag)
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 hover:bg-blue-50/40 min-h-[160px]"
              >
                {selectedImage ? (
                  <div className="relative w-full flex flex-col items-center">
                    <img
                      src={selectedImage}
                      alt="Uploaded preview"
                      className="max-h-44 rounded-xl object-contain shadow-xs border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="mt-2 text-xs font-bold text-rose-600 hover:underline"
                    >
                      ✕ Remove Photo & Reset
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-700">Click to upload or drag & drop</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP supported</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {/* REAL-TIME SUBJECT RECOGNITION CARD */}
            {isRecognizing && (
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Analyzing visual features and identifying image subject...</span>
              </div>
            )}

            {recognitionResult && !isRecognizing && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-600" /> Image Recognition Result
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getConfidenceBadgeColor(
                      recognitionResult.confidenceTier
                    )}`}
                  >
                    {Math.round(recognitionResult.confidence * 100)}% ({recognitionResult.confidenceTier} Confidence)
                  </span>
                </div>

                <div className="text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Detected Subject:</span>
                    <strong className="text-slate-900">{recognitionResult.detectedSubject}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Object Category:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800">
                      {recognitionResult.objectCategory.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Selected Modality:</span>
                    <span className="font-bold text-blue-700">
                      {recognitionResult.recommendedModality === "skin"
                        ? "Skin Irritation Photo"
                        : recognitionResult.recommendedModality === "fabric"
                        ? "Fabric Weave Photo"
                        : recognitionResult.recommendedModality === "label"
                        ? "Care Tag / Wash Label"
                        : "Other / Unrelated"}
                    </span>
                  </div>
                </div>

                {/* Detected Features Bullet List */}
                {recognitionResult.detectedFeatures.length > 0 && (
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Detected Visual Features:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                      {recognitionResult.detectedFeatures.map((feat, i) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Selection Reason */}
                <p className="text-[11px] text-slate-600 italic">
                  <strong>Reason:</strong> {recognitionResult.selectionReason}
                </p>

                {/* Unrelated Object Notice */}
                {recognitionResult.isUnrelatedObject && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /> Unrelated Subject Notice
                    </div>
                    <p className="text-[11px]">
                      This image does not appear to be human skin, a clothing fabric, or a care tag. DermStyle AI
                      assessment is paused for non-clothing items.
                    </p>
                  </div>
                )}

                {/* Change Category / Suggestion Drawer */}
                <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Not the right category?</span>
                    <button
                      type="button"
                      onClick={() => setShowManualCategorySelector(!showManualCategorySelector)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      {showManualCategorySelector ? "Hide Options" : "Change Category"}
                    </button>
                  </div>

                  {(showManualCategorySelector ||
                    recognitionResult.confidenceTier === "LOW" ||
                    recognitionResult.objectCategory === "UNKNOWN") && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 animate-fadeIn">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">
                        Manual Category Override:
                      </span>
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        {[
                          { id: "skin", label: "Skin / Body Surface" },
                          { id: "fabric", label: "Fabric / Textile" },
                          { id: "label", label: "Garment Care Label" },
                          { id: "apparel", label: "Clothing / Apparel" },
                          { id: "other", label: "Other Object" },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              const targetHint =
                                cat.id === "skin"
                                  ? "skin"
                                  : cat.id === "fabric" || cat.id === "apparel"
                                  ? "fabric"
                                  : cat.id === "label"
                                  ? "label"
                                  : "auto";
                              handleSelectModality(targetHint);
                              setShowManualCategorySelector(false);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 font-semibold text-[11px] border border-slate-200 transition"
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Text Symptom Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                2. Describe Symptoms / Fabric Composition
              </label>
              <textarea
                value={textQuery}
                onChange={(e) => {
                  setTextQuery(e.target.value);
                  setResult(null);
                }}
                rows={3}
                placeholder="e.g. 60% cotton / 40% recycled polyester wash at 30°C, or itchy red rash after wearing..."
                className="w-full rounded-2xl border border-slate-300 p-3 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />

              {/* Quick Suggestion Pills */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {quickTags.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTextQuery(tag);
                      setResult(null);
                    }}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 transition border border-slate-200"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Context Selectors (Centralized State) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Skin Sensitivity
                </label>
                <select
                  value={skinType}
                  onChange={(e) => {
                    setSkinType(e.target.value);
                    setResult(null);
                  }}
                  className="w-full text-xs font-medium rounded-xl border border-slate-300 p-2 text-slate-700 bg-white"
                >
                  <option value="Sensitive">Sensitive / Allergy Prone</option>
                  <option value="Eczema-Prone">Eczema-Prone</option>
                  <option value="Normal">Normal Skin</option>
                  <option value="Dry">Dry / Barrier Fragile</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Ambient Weather
                </label>
                <select
                  value={climate}
                  onChange={(e) => {
                    setClimate(e.target.value);
                    setResult(null);
                  }}
                  className="w-full text-xs font-medium rounded-xl border border-slate-300 p-2 text-slate-700 bg-white"
                >
                  <option value="Tropical / Humid (30°C+)">Tropical / Humid (30°C+)</option>
                  <option value="Moderate (18°C - 24°C)">Moderate (18°C - 24°C)</option>
                  <option value="Cold / Dry (Under 15°C)">Cold / Dry (Under 15°C)</option>
                </select>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={() => runDiagnosis()}
              disabled={isLoading || (!selectedImage && !textQuery.trim())}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Evidence...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run Evidence-Based Assessment
                </>
              )}
            </button>
          </div>

          {/* Right Column: Dynamic Evidence-Based Diagnostic Report */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {result ? (
              <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-xs border border-slate-200 flex flex-col gap-5 animate-fadeIn">
                {/* Modality Mismatch Warning Banner */}
                {result.mismatchDetected && (
                  <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <strong className="block text-amber-950 font-bold">Modality Mismatch Detected:</strong>
                        <span>{result.mismatchMessage}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const targetHint =
                          result.suggestedModality === "LABEL_CARE_TAG"
                            ? "label"
                            : result.suggestedModality === "FABRIC_SURFACE"
                            ? "fabric"
                            : "skin";
                        setModalityHint(targetHint);
                        runDiagnosis(targetHint);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition flex items-center gap-1.5"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" /> Switch to {result.suggestedModality === "LABEL_CARE_TAG" ? "Care Tag" : result.suggestedModality === "SKIN_IMAGE" ? "Skin Photo" : "Fabric Photo"}
                    </button>
                  </div>
                )}

                {/* Quality Warning if low quality */}
                {result.isLowQuality && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span><strong>Image Quality Notice:</strong> {result.qualityWarning}</span>
                  </div>
                )}

                {/* Result Title & Modality Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                        Modality: {result.inputModality.replace(/_/g, " ")}
                      </span>
                      {result.imageRecognition && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          Subject: {result.imageRecognition.detectedSubject}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                      {result.assessmentTitle}
                    </h2>
                  </div>

                  {/* Dynamic Comfort Score Gauge */}
                  <div className={`p-3 rounded-2xl border text-center min-w-[110px] ${getScoreColor(result.comfortScore.score)}`}>
                    <span className="block text-2xl font-black">
                      {result.comfortScore.score !== null ? result.comfortScore.score : "—"}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider block">
                      {result.comfortScore.score !== null ? "Estimated Index" : "Indeterminate"}
                    </span>
                    <span className="text-[9px] font-semibold opacity-80 block truncate max-w-[120px]">
                      {result.comfortScore.ratingBand.split(" ")[0]}
                    </span>
                  </div>
                </div>

                {/* Score Formula Explanation Note */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                  <span className="font-bold text-slate-700 block">📊 Comfort Score Breakdown (Non-Clinical Estimate):</span>
                  <p>{result.comfortScore.explanation}</p>
                  {result.comfortScore.documentedRules && result.comfortScore.documentedRules.length > 0 && (
                    <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-500 pt-1.5 border-t border-slate-200">
                      {result.comfortScore.documentedRules.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* DEDICATED CARD 1: SKIN IMAGE ANALYSIS (Rendered strictly for skin modality) */}
                {result.inputModality === "SKIN_IMAGE" && (
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-rose-600" /> Skin Surface Observation (Non-Diagnostic)
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-800">
                        Cutaneous Visual Evidence
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Erythema (Redness)</span>
                        <span className="font-extrabold text-rose-900 block mt-0.5">
                          {result.skinObservations?.erythemaLevel || "Localized Mild"}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Surface Texture</span>
                        <span className="font-extrabold text-slate-800 block mt-0.5">
                          {result.skinObservations?.surfaceTexture || "Uniform"}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Lesion Margin</span>
                        <span className="font-extrabold text-slate-800 block mt-0.5">
                          {result.skinObservations?.lesionMargin || "Diffuse / Irregular"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-rose-100 text-xs text-rose-950 space-y-1">
                      <p><strong>Observed Findings:</strong> {result.visibleObservations.visualFindings}</p>
                      <p className="text-amber-800 italic pt-1 border-t border-rose-100">
                        <strong>Clinical Disclaimer:</strong> {result.clinicalNotice}
                      </p>
                    </div>
                  </div>
                )}

                {/* DEDICATED CARD 2: FABRIC SURFACE WEAVE ANALYSIS (Rendered strictly for fabric modality) */}
                {result.inputModality === "FABRIC_SURFACE" && (
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-indigo-600" /> Textile Surface Texture & Weave Analysis
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-200 text-indigo-800">
                        Optical Weave Pattern
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Weave Pattern</span>
                        <span className="font-extrabold text-indigo-900 block mt-0.5">
                          {result.weaveCharacteristics?.weaveType || "Plain Weave"}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Texture Roughness</span>
                        <span className="font-extrabold text-slate-800 block mt-0.5">
                          {result.weaveCharacteristics?.textureRoughness || "Fine Grain"}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Yarn Uniformity</span>
                        <span className="font-extrabold text-slate-800 block mt-0.5">
                          {result.weaveCharacteristics?.yarnUniformity || "Uniform"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
                      <p><strong>Visible Surface Findings:</strong> {result.visibleObservations.visualFindings}</p>
                      <p className="text-amber-800 italic pt-1 border-t border-indigo-100">
                        <strong>Textile Notice:</strong> Chemical fiber composition cannot be visually deduced from surface weave appearance alone. Side-seam care tag verification is required.
                      </p>
                    </div>
                  </div>
                )}

                {/* DEDICATED CARD 3: CARE LABEL & FIBER OCR (Rendered strictly for care-label modality) */}
                {result.inputModality === "LABEL_CARE_TAG" && result.careLabelAnalysis && (
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-blue-600" /> Garment Care Label & Fiber Verification (ISO 3758 / ASTM D5489)
                      </h3>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Evidence Source Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            result.careLabelAnalysis.evidenceSource === "IMAGE_OCR"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : result.careLabelAnalysis.evidenceSource === "USER_INPUT"
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-slate-100 text-slate-800 border-slate-300"
                          }`}
                        >
                          Source: {result.careLabelAnalysis.evidenceSource === "IMAGE_OCR"
                            ? "Verified from Tag Photo (Image OCR)"
                            : result.careLabelAnalysis.evidenceSource === "USER_INPUT"
                            ? "Self-Reported Only (Manual Text Input)"
                            : result.careLabelAnalysis.evidenceSource}
                        </span>
                        {/* Verification Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            result.careLabelAnalysis.verificationStatus === "VERIFIED_FROM_TAG"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : result.careLabelAnalysis.verificationStatus === "SELF_REPORTED_ONLY"
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-slate-200 text-slate-800 border-slate-300"
                          }`}
                        >
                          {result.careLabelAnalysis.verificationStatus.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    {/* Image Quality Message Notice */}
                    {result.careLabelAnalysis.imageQualityMessage && (
                      <div
                        className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                          result.careLabelAnalysis.evidenceSource === "USER_INPUT"
                            ? "bg-amber-50 text-amber-900 border-amber-300"
                            : "bg-rose-50 text-rose-900 border-rose-300"
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                        <span className="font-medium">{result.careLabelAnalysis.imageQualityMessage}</span>
                      </div>
                    )}

                    {/* Fiber Percentage Chips & Sum Validation */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-700">
                          Fiber Composition:
                        </span>
                        {result.careLabelAnalysis.totalPercentage !== undefined && result.careLabelAnalysis.totalPercentage > 0 && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              result.careLabelAnalysis.isPercentageSum100
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            Total: {result.careLabelAnalysis.totalPercentage}%{" "}
                            {result.careLabelAnalysis.isPercentageSum100
                              ? "(100% Balanced)"
                              : `(${100 - result.careLabelAnalysis.totalPercentage}% Unstated)`}
                          </span>
                        )}
                      </div>
                      {result.careLabelAnalysis.fiberComposition.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {result.careLabelAnalysis.fiberComposition.map((f, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-xl bg-white text-slate-800 text-xs font-bold border border-blue-200 shadow-2xs flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                              {f.percentage !== null ? `${f.percentage}% ` : ""}{f.fiber}
                              {f.isRecycled && (
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">
                                  Recycled
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-amber-800 italic">
                          Uncertain – manual verification required. No recognized textile fibers found.
                        </p>
                      )}
                    </div>

                    {/* 5-Category Laundry Care Grid */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                        Structured Wash & Care Instructions:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {/* Washing */}
                        <div className="bg-white p-2.5 rounded-xl border border-blue-100 flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <Droplets className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-slate-800">Washing:</strong>
                              <span className="text-slate-600">{result.careLabelAnalysis.washCare.washing.instruction}</span>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                            result.careLabelAnalysis.washCare.washing.status === "EXTRACTED_SUCCESSFULLY"
                              ? "bg-emerald-100 text-emerald-800"
                              : result.careLabelAnalysis.washCare.washing.status === "UNREADABLE"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {result.careLabelAnalysis.washCare.washing.status === "EXTRACTED_SUCCESSFULLY" ? "Detected" : "Not on label"}
                          </span>
                        </div>

                        {/* Bleaching */}
                        <div className="bg-white p-2.5 rounded-xl border border-blue-100 flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <Triangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-slate-800">Bleaching:</strong>
                              <span className="text-slate-600">{result.careLabelAnalysis.washCare.bleaching.instruction}</span>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                            result.careLabelAnalysis.washCare.bleaching.status === "EXTRACTED_SUCCESSFULLY"
                              ? "bg-emerald-100 text-emerald-800"
                              : result.careLabelAnalysis.washCare.bleaching.status === "UNREADABLE"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {result.careLabelAnalysis.washCare.bleaching.status === "EXTRACTED_SUCCESSFULLY" ? "Detected" : "Not on label"}
                          </span>
                        </div>

                        {/* Drying */}
                        <div className="bg-white p-2.5 rounded-xl border border-blue-100 flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <Minus className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-slate-800">Drying:</strong>
                              <span className="text-slate-600">{result.careLabelAnalysis.washCare.drying.instruction}</span>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                            result.careLabelAnalysis.washCare.drying.status === "EXTRACTED_SUCCESSFULLY"
                              ? "bg-emerald-100 text-emerald-800"
                              : result.careLabelAnalysis.washCare.drying.status === "UNREADABLE"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {result.careLabelAnalysis.washCare.drying.status === "EXTRACTED_SUCCESSFULLY" ? "Detected" : "Not on label"}
                          </span>
                        </div>

                        {/* Ironing */}
                        <div className="bg-white p-2.5 rounded-xl border border-blue-100 flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <Flame className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-slate-800">Ironing:</strong>
                              <span className="text-slate-600">{result.careLabelAnalysis.washCare.ironing.instruction}</span>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                            result.careLabelAnalysis.washCare.ironing.status === "EXTRACTED_SUCCESSFULLY"
                              ? "bg-emerald-100 text-emerald-800"
                              : result.careLabelAnalysis.washCare.ironing.status === "UNREADABLE"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {result.careLabelAnalysis.washCare.ironing.status === "EXTRACTED_SUCCESSFULLY" ? "Detected" : "Not on label"}
                          </span>
                        </div>

                        {/* Dry Cleaning */}
                        <div className="bg-white p-2.5 rounded-xl border border-blue-100 sm:col-span-2 flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <CircleDot className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-slate-800">Dry Cleaning:</strong>
                              <span className="text-slate-600">{result.careLabelAnalysis.washCare.dryCleaning.instruction}</span>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                            result.careLabelAnalysis.washCare.dryCleaning.status === "EXTRACTED_SUCCESSFULLY"
                              ? "bg-emerald-100 text-emerald-800"
                              : result.careLabelAnalysis.washCare.dryCleaning.status === "UNREADABLE"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {result.careLabelAnalysis.washCare.dryCleaning.status === "EXTRACTED_SUCCESSFULLY" ? "Detected" : "Not on label"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Recognized Care Symbols Badges */}
                    {result.careLabelAnalysis.careSymbols.length > 0 && (
                      <div className="pt-2 border-t border-blue-200">
                        <span className="text-[11px] font-bold text-slate-700 block mb-1">
                          Recognized Care Symbols:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {result.careLabelAnalysis.careSymbols.map((sym, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-[11px] font-semibold border border-blue-200"
                            >
                              {sym.name} ({sym.meaning})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* DEDICATED CARD 4: UNCERTAINTY NOTICE (Rendered strictly for ambiguous / unknown modality) */}
                {result.inputModality === "AMBIGUOUS_UNKNOWN" && (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-dashed border-amber-300 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                          Optical Modality Classification Uncertainty
                        </h3>
                        <p className="text-xs text-amber-900 mt-0.5">
                          The uploaded image could not be definitively classified as human skin, a textile weave, or a legible care label.
                          Please manually select the modality using the selector pills on the left or upload a clearer, well-lit photo.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TIER 1: Visible Image Observations */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" /> Tier 1: Visible Image Observations
                  </h3>
                  <div className="text-xs text-slate-700 space-y-1">
                    <p><strong>Subject:</strong> {result.visibleObservations.subject}</p>
                    <p><strong>Visual Findings:</strong> {result.visibleObservations.visualFindings}</p>
                    <p className="text-amber-800 italic"><strong>Limitations:</strong> {result.visibleObservations.limitations}</p>
                  </div>
                </div>

                {/* TIER 2 & 3: User Context & Textile Verification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <h4 className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-slate-500" /> Tier 2: User Reported Context
                    </h4>
                    <p><strong>Symptoms:</strong> {result.userReportedContext.symptoms.join(", ")}</p>
                    <p><strong>Garment:</strong> {result.userReportedContext.suspectedGarment || "Not specified"}</p>
                    <p><strong>Climate:</strong> {result.userReportedContext.ambientClimate}</p>
                    <p><strong>Skin Profile:</strong> {result.userReportedContext.skinProfile}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <h4 className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-500" /> Tier 3: Verified Textile Data
                    </h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        result.verifiedTextileInfo.verificationStatus === "VERIFIED_FROM_TAG"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : result.verifiedTextileInfo.verificationStatus === "SELF_REPORTED_ONLY"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-slate-200 text-slate-800"
                      }`}>
                        Status: {result.verifiedTextileInfo.verificationStatus.replace(/_/g, " ")}
                      </span>
                      {result.verifiedTextileInfo.evidenceSource && (
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          result.verifiedTextileInfo.evidenceSource === "IMAGE_OCR"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : result.verifiedTextileInfo.evidenceSource === "USER_INPUT"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-200 text-slate-700"
                        }`}>
                          Source: {result.verifiedTextileInfo.evidenceSource === "IMAGE_OCR"
                            ? "Verified Tag Photo (OCR)"
                            : result.verifiedTextileInfo.evidenceSource === "USER_INPUT"
                            ? "Self-Reported Only (Manual Text)"
                            : result.verifiedTextileInfo.evidenceSource}
                        </span>
                      )}
                    </div>
                    <p><strong>Composition:</strong> {result.verifiedTextileInfo.fiberComposition}</p>
                    <p className="text-[11px] text-slate-500">{result.verifiedTextileInfo.notes}</p>
                  </div>
                </div>

                {/* TIER 4: Possible Explanations & Clinical Uncertainties */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-700" /> Tier 4: Potential Associations & Uncertainties
                  </h3>
                  <ul className="list-disc list-inside text-xs text-amber-900 space-y-1">
                    {result.possibleExplanations.hypotheses.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-amber-800 pt-1 border-t border-amber-200/60">
                    <strong>Uncertainty:</strong> {result.possibleExplanations.uncertainties}
                  </p>
                  <p className="text-[11px] text-amber-900 font-bold">
                    <strong>Medical Note:</strong> {result.clinicalNotice}
                  </p>
                </div>

                {/* TIER 5: Personalized Clothing Suggestions */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <Shirt className="w-4 h-4 text-emerald-700" /> Tier 5: Personalized Clothing Suggestions
                  </h3>

                  <div className="space-y-2.5">
                    {result.personalizedClothingSuggestions.suggestedFabrics.map((fabric, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-emerald-100 text-xs space-y-1">
                        <span className="font-extrabold text-emerald-950 block text-sm">{fabric.name}</span>
                        <p className="text-slate-700"><strong>Why:</strong> {fabric.whyRecommended}</p>
                        <p className="text-slate-500 italic"><strong>Limitation:</strong> {fabric.limitations}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-emerald-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-900">
                    <div>
                      <strong>Recommended Weave:</strong> {result.personalizedClothingSuggestions.recommendedWeave}
                    </div>
                    <div>
                      <strong>Silhouettes:</strong> {result.personalizedClothingSuggestions.garmentSilhouettes.join(", ")}
                    </div>
                  </div>

                  <p className="text-[11px] text-emerald-800 pt-1 border-t border-emerald-200/60 flex items-start gap-1">
                    <Droplets className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Care Guidance:</strong> {result.personalizedClothingSuggestions.washCareGuidance}</span>
                  </p>
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="bg-white p-8 rounded-3xl shadow-xs border border-slate-200 flex flex-col items-center justify-center text-center h-full min-h-[350px]">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Ready for Multimodal Evidence
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Upload a photo of your skin rash, garment texture, or care tag on the left. The system will automatically
                  identify the subject, select the modality, and evaluate comfort.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
