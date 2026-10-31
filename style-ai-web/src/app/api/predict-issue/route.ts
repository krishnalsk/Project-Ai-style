// src/app/api/predict-issue/route.ts
import { NextResponse } from "next/server";
import {
  inspectImageModality,
  inspectImageModalityAsync,
  ImageModality,
  ImageInspectionResult,
} from "@/lib/imageInspector";
import {
  extractFiberComposition,
  extractWashCareInstructions,
  parseCareLabelSync,
  FiberComponent,
  StructuredWashCare,
  EvidenceSource,
  CareInstructionStatus,
} from "@/lib/careLabelOcr";
import { recognizeCareSymbols, RecognizedCareSymbol } from "@/lib/careSymbolClassifier";
import { queryCatalog, ScoredProduct } from "@/lib/queryEngine";

export interface EvidenceBasedDiagnosisResponse {
  status: "success" | "error";
  prediction: {
    imageId: string;
    inputModality: ImageModality;
    modalityConfidence: number;
    assessmentTitle: string;
    clinicalNotice: string;

    // Modality Mismatch Guard & Quality Flags
    mismatchDetected?: boolean;
    mismatchMessage?: string;
    suggestedModality?: ImageModality;
    isLowQuality?: boolean;
    qualityWarning?: string;

    // Visual Inspection Data
    skinObservations?: ImageInspectionResult["skinObservations"];
    weaveCharacteristics?: ImageInspectionResult["weaveCharacteristics"];

    // 5-Category Classification Standardized
    identifiedCategory: {
      categoryKey: "SKIN" | "FABRIC" | "CARE_LABEL" | "UNRELATED_OBJECT" | "UNKNOWN";
      categoryTitle:
        | "Human skin / skin irritation photograph"
        | "Fabric weave or textile surface"
        | "Clothing care label / wash tag"
        | "Other or unrelated object"
        | "Unclear or insufficient-quality image";
      confidence: number;
      selectionReason: string;
      detectedFeatures: string[];
      alternativeCategories: { id: string; label: string; confidence: number }[];
    };

    // Multi-Dimensional Calibrated Confidence Scores
    confidenceScores: {
      categoryClassification: number;
      ocrExtraction: number;
      compositionIdentification: number;
      skinFeatureRecognition: number;
      confidenceDisclaimer: string;
      lowConfidenceWarning?: string;
    };

    // Dedicated Skin Analysis Details
    skinAnalysisDetails?: {
      rednessLevel: "None" | "Mild" | "Moderate" | "Prominent";
      drynessLevel: "None" | "Mild" | "Noticeable Flaking" | "Severe";
      scalingLevel: "None" | "Superficial" | "Plaque-like";
      surfaceIrritation: "Low" | "Moderate" | "High";
      nonDiagnosticExplanation: string;
      clothingFactors: string[];
      medicalAdvisory: string;
      disclaimer: string;
    };

    // Comprehensive Fabric Recommendations with Catalog Integration
    fabricRecommendations: {
      primaryRecommendation: {
        fabric: string;
        garmentType: string;
        reasons: string[];
        potentialDisadvantages: string[];
      };
      alternativeFabrics: {
        fabric: string;
        garmentType: string;
        reasons: string[];
        potentialDisadvantages: string[];
      }[];
      comfortEstimate: {
        score: number | null;
        ratingBand: string;
        assumptions: string[];
      };
      safetyDisclaimer: string;
      catalogProducts: ScoredProduct[];
    };

    // Intelligent Object Identity Recognition (Legacy Compatible)
    imageRecognition?: {
      detectedSubject: string;
      objectCategory: "SKIN" | "FABRIC" | "CARE_LABEL" | "UNRELATED_OBJECT" | "UNKNOWN";
      detectedFeatures: string[];
      recommendedModality: "skin" | "fabric" | "label" | "unrelated" | "unknown";
      confidenceTier: "HIGH" | "MEDIUM" | "LOW";
      selectionReason: string;
      alternativeCategories: { id: string; label: string; confidence: number }[];
      isUnrelatedObject: boolean;
    };

    comfortScore: {
      score: number | null;
      ratingBand:
        | "Optimal (High Comfort)"
        | "Moderate (Monitor Wear)"
        | "Poor (High Friction/Heat Risk)"
        | "Indeterminate (Insufficient Data)";
      isExperimental: true;
      isReliable: boolean;
      formulaBreakdown: {
        baseScore: number;
        fiberAdjustment: number;
        climateAdjustment: number;
        frictionAdjustment: number;
        symptomAdjustment: number;
        uncertaintyAdjustment: number;
      };
      explanation: string;
      documentedRules: string[];
    };

    visibleObservations: {
      subject: string;
      visualFindings: string;
      limitations: string;
    };

    userReportedContext: {
      symptoms: string[];
      symptomsStatus: "REPORTED" | "UNKNOWN_NOT_PROVIDED";
      suspectedGarment: string;
      skinProfile: string;
      ambientClimate: string;
    };

    verifiedTextileInfo: {
      verificationStatus:
        | "VERIFIED_FROM_TAG"
        | "PARTIALLY_VERIFIED"
        | "UNCERTAIN_MANUAL_REQUIRED"
        | "UNVERIFIED_FROM_PHOTO"
        | "SELF_REPORTED_ONLY"
        | "UNKNOWN";
      fiberComposition: string;
      evidenceSource?: EvidenceSource;
      notes: string;
    };

    // Dedicated Care Label OCR & Symbol Analysis
    careLabelAnalysis?: {
      rawText: string;
      rawExtractedText?: string;
      correctedInterpretation?: string;
      unreadableSpans?: string[];
      uncertainSpans?: string[];
      ocrConfidencePercentage?: number;
      compositionConfidencePercentage?: number;
      isLegible: boolean;
      confidence: number;
      fiberComposition: FiberComponent[];
      compositionSummary: string;
      verificationStatus: "VERIFIED_FROM_TAG" | "PARTIALLY_VERIFIED" | "UNCERTAIN_MANUAL_REQUIRED" | "SELF_REPORTED_ONLY";
      evidenceSource: EvidenceSource;
      washCare: StructuredWashCare;
      careSymbols: RecognizedCareSymbol[];
      unreadableLinesDetected: boolean;
      totalPercentage?: number;
      isPercentageSum100?: boolean;
      imageQualityMessage?: string;
      notes: string[];
    };

    possibleExplanations: {
      hypotheses: string[];
      uncertainties: string;
      clinicalRecommendation: string;
    };

    personalizedClothingSuggestions: {
      suggestedFabrics: {
        name: string;
        whyRecommended: string;
        limitations: string;
      }[];
      recommendedWeave: string;
      garmentSilhouettes: string[];
      washCareGuidance: string;
    };
  };
}

/**
 * Calculates a documented, evidence-grounded estimated comfort score.
 * Every adjustment is tied to an explicit, verified user input.
 * Missing data is NEVER penalized with negative adjustments.
 */
function calculateEstimatedComfortScore(params: {
  isSkin: boolean;
  isSyntheticReported: boolean;
  isNaturalReported: boolean;
  isNaturalVerifiedFromTag: boolean;
  isThermalReported: boolean;
  isFrictionReported: boolean;
  isChemicalReported: boolean;
  isComfortableReported: boolean;
  isItchyReported: boolean;
  hasSymptomInput: boolean;
  hasGarmentInput: boolean;
  climate?: string;
  modalityConfidence: number;
  evidenceSource?: EvidenceSource;
}) {
  const baseScore = 75;
  let fiberAdjustment = 0;
  let climateAdjustment = 0;
  let frictionAdjustment = 0;
  let symptomAdjustment = 0;
  const uncertaintyAdjustment = 0; // Missing data is NOT converted into a negative penalty
  const documentedRules: string[] = [];

  // Rule 1: Documented Fiber Factor
  if (params.isNaturalVerifiedFromTag) {
    fiberAdjustment += 12;
    documentedRules.push("Fiber Rule: +12 for verified natural cellulosic/protein fibers from care tag.");
  } else if (params.isSyntheticReported && params.isItchyReported) {
    fiberAdjustment -= 18;
    documentedRules.push("Fiber Rule: -18 for reported synthetic garment associated with cutaneous irritation.");
  } else if (params.isNaturalReported && params.evidenceSource === "USER_INPUT") {
    fiberAdjustment += 6;
    documentedRules.push("Fiber Rule: +6 for wearer-reported natural fiber (unverified by care tag photograph).");
  } else {
    documentedRules.push("Fiber Rule: 0 adjustment (fiber composition is unverified or not reported).");
  }

  // Rule 2: Documented Climate Factor (Consistent with User-Selected Ambient Climate)
  const selectedClimate = params.climate || "Moderate (18°C - 24°C)";
  const isWarmHumid = /humid|tropical|hot|30|35|summer/i.test(selectedClimate);
  const isColdDry = /cold|dry|under 15|winter/i.test(selectedClimate);

  if (isWarmHumid) {
    if (params.isSyntheticReported) {
      climateAdjustment -= 15;
      documentedRules.push(`Climate Rule: -15 for reported synthetic fiber worn in tropical/humid weather (${selectedClimate}).`);
    } else if (params.isThermalReported) {
      climateAdjustment -= 10;
      documentedRules.push(`Climate Rule: -10 for wearer-reported heat trapping in tropical/humid weather (${selectedClimate}).`);
    } else {
      documentedRules.push(`Climate Rule: 0 adjustment (ambient climate is ${selectedClimate}; no heat retention symptoms reported).`);
    }
  } else if (isColdDry) {
    if (params.isFrictionReported) {
      climateAdjustment -= 8;
      documentedRules.push(`Climate Rule: -8 for friction aggravated by winter cold dryness (${selectedClimate}).`);
    } else {
      documentedRules.push(`Climate Rule: 0 adjustment (ambient climate is ${selectedClimate}).`);
    }
  } else {
    documentedRules.push(`Climate Rule: 0 adjustment (ambient climate is moderate: ${selectedClimate}).`);
  }

  // Rule 3: Documented Friction & Mechanical Fit Factor
  if (params.isFrictionReported) {
    frictionAdjustment -= 14;
    documentedRules.push("Friction Rule: -14 for explicit user report of collar stiffness, seam chafing, or abrasive weave.");
  } else {
    documentedRules.push("Friction Rule: 0 adjustment (no mechanical friction or collar stiffness reported).");
  }

  // Rule 4: Documented Symptom Factor
  if (params.isItchyReported) {
    symptomAdjustment -= 20;
    documentedRules.push("Symptom Rule: -20 for explicit wearer-reported itching, redness, or cutaneous discomfort.");
  } else if (params.isChemicalReported) {
    symptomAdjustment -= 16;
    documentedRules.push("Symptom Rule: -16 for explicit wearer-reported chemical stinging or dye odor.");
  } else if (params.isComfortableReported) {
    symptomAdjustment += 12;
    documentedRules.push("Symptom Rule: +12 for explicit wearer-reported soft and comfortable experience.");
  } else {
    documentedRules.push("Symptom Rule: 0 adjustment (symptoms are unknown / not reported; no penalty applied).");
  }

  // Check Reliability: If neither symptoms nor garment details were provided
  const hasDocumentedEvidence = params.hasSymptomInput || params.hasGarmentInput || params.isNaturalVerifiedFromTag;
  const isReliable = hasDocumentedEvidence;

  const rawScore = baseScore + fiberAdjustment + climateAdjustment + frictionAdjustment + symptomAdjustment;
  const score = Math.max(15, Math.min(96, Math.round(rawScore * 10) / 10));

  let ratingBand:
    | "Optimal (High Comfort)"
    | "Moderate (Monitor Wear)"
    | "Poor (High Friction/Heat Risk)"
    | "Indeterminate (Insufficient Data)" = "Optimal (High Comfort)";

  if (!isReliable) {
    ratingBand = "Indeterminate (Insufficient Data)";
  } else if (score < 45) {
    ratingBand = "Poor (High Friction/Heat Risk)";
  } else if (score < 75) {
    ratingBand = "Moderate (Monitor Wear)";
  }

  let explanation = isReliable
    ? `Non-clinical estimate calculated from baseline (${baseScore}) with fiber impact (${fiberAdjustment > 0 ? "+" : ""}${fiberAdjustment}), climate impact (${climateAdjustment}), friction impact (${frictionAdjustment}), and symptom impact (${symptomAdjustment}).`
    : `Comfort score: Indeterminate – additional information required. Neither garment fiber data nor symptom descriptions were provided. A reliable comfort index cannot be calculated without wearing context.`;

  if (params.evidenceSource === "USER_INPUT") {
    explanation += " Fiber composition reflects manual wearer input (unverified by care tag photograph).";
  }
  explanation += " Note: Estimated comfort score is a non-clinical algorithm estimate.";

  return {
    score: isReliable ? score : null,
    ratingBand,
    isExperimental: true as const,
    isReliable,
    formulaBreakdown: {
      baseScore,
      fiberAdjustment,
      climateAdjustment,
      frictionAdjustment,
      symptomAdjustment,
      uncertaintyAdjustment,
    },
    explanation,
    documentedRules,
  };
}

/**
 * Builds the comprehensive assessment from the inspected image modality and inputs.
 */
function buildDiagnosisFromInspection(
  inspection: ImageInspectionResult,
  textQuery: string,
  skinType?: string,
  climate?: string,
  imageId?: string,
  modalityHint?: string,
  hasImagePayload: boolean = true
): EvidenceBasedDiagnosisResponse["prediction"] {
  const activeImageId = imageId || ("img_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8));
  const query = (textQuery || "").toLowerCase().trim();
  const hasText = query.length > 0;
  const activeClimate = climate && climate.trim().length > 0 ? climate : "Moderate (18°C - 24°C)";
  const activeSkinProfile = skinType && skinType.trim().length > 0 ? skinType : "Sensitive / Allergy Prone";

  // Extract Documented Symptom & Garment Indicators from Text
  const isSynthetic = /\b(polyester|acrylic|nylon|spandex|elastane|synthetic)\b/i.test(query);
  const isNatural = /\b(cotton|organic cotton|linen|flax|silk|bamboo|lyocell|tencel|modal)\b/i.test(query);
  const isItchy = /\b(itch|itchy|scratchy|prickly|irritat\w*|rash|rashes|redness|bumps?)\b/i.test(query);
  const isThermal =
    /\b(sweat|sweaty|suffocat\w*|humid|sticky|heat\s*rash|overheat\w*|non-breathable|unbreathable)\b/i.test(query) ||
    (/\b(hot|heat)\b/i.test(query) && !/\b(cold)\b/i.test(query));
  const isFriction = /\b(rough|stiff|abrasive|chaf\w*|seam|collar|rubbing)\b/i.test(query);
  const isChemical = /\b(dye|smell|odor|chemical|toxic|azo)\b/i.test(query);
  const isComfortable =
    (/\b(comfortable|soft|breathable|gentle|fine|smooth|good)\b/i.test(query) || isNatural) &&
    !isItchy &&
    !isSynthetic;

  const detectedSymptoms: string[] = [];
  if (isItchy) detectedSymptoms.push("Cutaneous itching / prickliness");
  if (isThermal) detectedSymptoms.push("Sweat accumulation / thermal trapping");
  if (isFriction) detectedSymptoms.push("Mechanical seam chafing / rubbing");
  if (isChemical) detectedSymptoms.push("Stinging sensation / suspected chemical residue");

  const hasSymptomInput = detectedSymptoms.length > 0;
  const hasGarmentInput = isSynthetic || isNatural;

  // Modality Determination: Respect mismatch guard, manual user selection, and image inspection
  const normUserHint = (
    modalityHint ||
    (inspection.userSelectedModality === "FABRIC_SURFACE"
      ? "fabric"
      : inspection.userSelectedModality === "SKIN_IMAGE"
      ? "skin"
      : inspection.userSelectedModality === "LABEL_CARE_TAG"
      ? "label"
      : "")
  ).toLowerCase().trim();
  const userExplicitlyChoseFabric = normUserHint === "fabric" || normUserHint === "weave";
  const userExplicitlyChoseSkin = normUserHint === "skin" || normUserHint === "rash";
  const userExplicitlyChoseLabel = normUserHint === "label" || normUserHint === "tag" || normUserHint === "care";

  const isCareLabelModality = inspection.modality === "LABEL_CARE_TAG" || (userExplicitlyChoseLabel && !inspection.mismatchDetected);
  const isFabricModality = (inspection.modality === "FABRIC_SURFACE" || userExplicitlyChoseFabric) && !isCareLabelModality;
  const isSkinModality = (inspection.modality === "SKIN_IMAGE" || userExplicitlyChoseSkin) && !isCareLabelModality && !isFabricModality;

  // Optical Care Label Extraction: ONLY performed if Care Label modality is active
  let careLabelAnalysis: EvidenceBasedDiagnosisResponse["prediction"]["careLabelAnalysis"] = undefined;
  const effectiveEvidenceSource: EvidenceSource = !hasImagePayload
    ? (hasText ? "USER_INPUT" : "UNKNOWN")
    : (isCareLabelModality ? "IMAGE_OCR" : "UNKNOWN");

  if (isCareLabelModality) {
    const textToParse = query.length > 0 ? textQuery : inspection.visualObservations;
    const parsedLabel = parseCareLabelSync(textToParse, hasImagePayload, effectiveEvidenceSource);
    const symbolRes = recognizeCareSymbols(textToParse);

    const imageQualityMessage = !hasImagePayload
      ? "Image not uploaded – manual information only."
      : inspection.isLowQuality
      ? inspection.qualityWarning || "Blurry or low-resolution care label photograph. Text lines are illegible."
      : undefined;

    careLabelAnalysis = {
      rawText: parsedLabel.rawExtractedText || textToParse,
      rawExtractedText: parsedLabel.rawExtractedText || textToParse,
      correctedInterpretation: parsedLabel.correctedInterpretation,
      unreadableSpans: parsedLabel.unreadableSpans,
      uncertainSpans: parsedLabel.uncertainSpans,
      ocrConfidencePercentage: parsedLabel.ocrConfidencePercentage,
      compositionConfidencePercentage: parsedLabel.compositionConfidencePercentage,
      isLegible: parsedLabel.isLegible,
      confidence: hasImagePayload ? ((parsedLabel.ocrConfidencePercentage || 92) / 100) : 0.5,
      fiberComposition: parsedLabel.fiberComposition,
      compositionSummary: parsedLabel.compositionSummary,
      verificationStatus: parsedLabel.verificationStatus,
      evidenceSource: effectiveEvidenceSource,
      washCare: parsedLabel.washCare,
      careSymbols: symbolRes.symbols,
      unreadableLinesDetected: (parsedLabel.unreadableSpans?.length || 0) > 0 || parsedLabel.verificationStatus !== "VERIFIED_FROM_TAG",
      totalPercentage: parsedLabel.totalPercentage,
      isPercentageSum100: parsedLabel.isPercentageSum100,
      imageQualityMessage,
      notes: [
        parsedLabel.verificationStatus === "VERIFIED_FROM_TAG"
          ? "All fiber percentages verified from readable optical tag text."
          : parsedLabel.verificationStatus === "SELF_REPORTED_ONLY"
          ? "Fiber composition is self-reported and unverified by care tag optical photograph."
          : "Some textile lines remain unreadable; missing percentages are not fabricated.",
        ...parsedLabel.notes.filter((n) => !n.includes("verified")),
        ...symbolRes.notes,
      ],
    };
  }

  // Compute Documented Comfort Score
  const isNaturalVerifiedFromTag =
    isCareLabelModality &&
    hasImagePayload &&
    effectiveEvidenceSource === "IMAGE_OCR" &&
    careLabelAnalysis?.verificationStatus === "VERIFIED_FROM_TAG" &&
    isNatural &&
    !isSynthetic;

  const comfortScore = calculateEstimatedComfortScore({
    isSkin: isSkinModality,
    isSyntheticReported: isSynthetic,
    isNaturalReported: isNatural,
    isNaturalVerifiedFromTag,
    isThermalReported: isThermal,
    isFrictionReported: isFriction,
    isChemicalReported: isChemical,
    isComfortableReported: isComfortable,
    isItchyReported: isItchy,
    hasSymptomInput,
    hasGarmentInput,
    climate: activeClimate,
    modalityConfidence: inspection.confidence,
    evidenceSource: effectiveEvidenceSource,
  });

  // 5-Category Classification Standardized
  const categoryKey: "SKIN" | "FABRIC" | "CARE_LABEL" | "UNRELATED_OBJECT" | "UNKNOWN" =
    inspection.isUnrelatedObject && !userExplicitlyChoseFabric && !userExplicitlyChoseSkin && !userExplicitlyChoseLabel
      ? "UNRELATED_OBJECT"
      : isSkinModality
      ? "SKIN"
      : isFabricModality
      ? "FABRIC"
      : isCareLabelModality
      ? "CARE_LABEL"
      : inspection.isLowQuality
      ? "UNKNOWN"
      : "UNKNOWN";

  const categoryTitle:
    | "Human skin / skin irritation photograph"
    | "Fabric weave or textile surface"
    | "Clothing care label / wash tag"
    | "Other or unrelated object"
    | "Unclear or insufficient-quality image" =
    categoryKey === "SKIN"
      ? "Human skin / skin irritation photograph"
      : categoryKey === "FABRIC"
      ? "Fabric weave or textile surface"
      : categoryKey === "CARE_LABEL"
      ? "Clothing care label / wash tag"
      : categoryKey === "UNRELATED_OBJECT"
      ? "Other or unrelated object"
      : "Unclear or insufficient-quality image";

  const categoryConfidence = inspection.categoryConfidence ?? Math.round(inspection.confidence * 100);
  const ocrConfidence = inspection.ocrConfidence ?? (isCareLabelModality ? (careLabelAnalysis?.ocrConfidencePercentage ?? 92) : 20);
  const compositionConfidence = inspection.compositionConfidence ?? (isCareLabelModality ? (careLabelAnalysis?.compositionConfidencePercentage ?? 88) : isFabricModality ? 35 : 15);
  const skinFeatureConfidence = inspection.skinFeatureConfidence ?? (isSkinModality ? 88 : 15);

  const isLowConfidence =
    categoryConfidence < 50 ||
    inspection.isLowQuality ||
    categoryKey === "UNKNOWN";

  const lowConfidenceWarning = isLowConfidence
    ? "Unable to identify this image reliably. Please upload a clearer photograph or select the correct category."
    : undefined;

  const confidenceDisclaimer =
    "Important: A model's confidence score represents algorithmic feature certainty, not empirical clinical accuracy. Accuracy can only be measured against a representative, labeled test dataset.";

  const confidenceScores = {
    categoryClassification: categoryConfidence,
    ocrExtraction: ocrConfidence,
    compositionIdentification: compositionConfidence,
    skinFeatureRecognition: skinFeatureConfidence,
    confidenceDisclaimer,
    lowConfidenceWarning,
  };

  const identifiedCategory = {
    categoryKey,
    categoryTitle,
    confidence: categoryConfidence,
    selectionReason: inspection.selectionReason || "Identified through multimodal computer vision analysis.",
    detectedFeatures: inspection.detectedFeatures || [],
    alternativeCategories: inspection.alternativeCategories || [
      { id: "skin", label: "Skin / Body Surface", confidence: categoryKey === "SKIN" ? 94 : 5 },
      { id: "fabric", label: "Fabric Weave / Surface", confidence: categoryKey === "FABRIC" ? 92 : 5 },
      { id: "label", label: "Care Label / Wash Tag", confidence: categoryKey === "CARE_LABEL" ? 94 : 5 },
      { id: "other", label: "Other / Unrelated Object", confidence: categoryKey === "UNRELATED_OBJECT" ? 94 : 5 },
    ],
  };

  // Skin Analysis Details (Non-diagnostic)
  const skinObs = inspection.skinObservations as any;
  const rawRedness = String(skinObs?.erythemaObservation || skinObs?.erythemaLevel || "").toLowerCase();
  const rednessLevel: "None" | "Mild" | "Moderate" | "Prominent" =
    rawRedness.includes("pronounced") || rawRedness.includes("confluent") || rawRedness.includes("severe")
      ? "Prominent"
      : rawRedness.includes("mild")
      ? "Mild"
      : rawRedness.includes("moderate")
      ? "Moderate"
      : rawRedness.includes("none")
      ? "None"
      : isSkinModality
      ? "Moderate"
      : "None";

  const rawDryness = String(skinObs?.drynessLevel || "").toLowerCase();
  const drynessLevel: "None" | "Mild" | "Noticeable Flaking" | "Severe" =
    rawDryness.includes("severe")
      ? "Severe"
      : rawDryness.includes("flaking") || rawDryness.includes("noticeable")
      ? "Noticeable Flaking"
      : rawDryness.includes("mild")
      ? "Mild"
      : rawDryness.includes("none")
      ? "None"
      : isSkinModality
      ? "Mild"
      : "None";

  const rawScaling = String(skinObs?.scalingLevel || "").toLowerCase();
  const scalingLevel: "None" | "Superficial" | "Plaque-like" =
    rawScaling.includes("plaque")
      ? "Plaque-like"
      : rawScaling.includes("superficial") || rawScaling.includes("flaking")
      ? "Superficial"
      : rawScaling.includes("none")
      ? "None"
      : isSkinModality
      ? "Superficial"
      : "None";

  const rawIrritation = String(skinObs?.surfaceIrritation || "").toLowerCase();
  const surfaceIrritation: "Low" | "Moderate" | "High" =
    rawIrritation.includes("high") || rawIrritation.includes("severe")
      ? "High"
      : rawIrritation.includes("moderate")
      ? "Moderate"
      : rawIrritation.includes("low")
      ? "Low"
      : isSkinModality
      ? "Moderate"
      : "Low";

  const skinAnalysisDetails = {
    rednessLevel,
    drynessLevel,
    scalingLevel,
    surfaceIrritation,
    nonDiagnosticExplanation:
      skinObs?.nonDiagnosticExplanation ||
      "Visible localized redness (erythema) and superficial cutaneous irregularity observed in the photograph. This observation describes surface coloration and does not confirm a specific medical condition or histological pathology.",
    clothingFactors: skinObs?.clothingFactors || [
      "Mechanical friction from abrasive fabric weaves, raised seams, or stiff garment collars.",
      "Perspiration entrapment and heat retention under synthetic or occlusive fibers.",
      "Chemical surfactant or fragrance residue from laundry detergents remaining on clothing fibers.",
    ],
    medicalAdvisory:
      skinObs?.medicalAdvice ||
      "Consult a board-certified dermatologist or medical professional for persistent, severe, or worsening skin symptoms.",
    disclaimer:
      "Non-diagnostic visual observation only. This application does not diagnose medical conditions, prescribe treatments, or substitute for physician evaluation.",
  };

  // Fabric Recommendations Grounded in Existing 1,000-Record Catalog
  let recFabric = "100% GOTS Certified Organic Cotton";
  let recGarment = "Relaxed-fit camp collar shirt / breathable lounge set";
  let reasons = [
    "Soft, natural cellulosic fibers with predictable moisture absorption and minimal static friction.",
    "Free from synthetic polymer occlusion, allowing cutaneous heat dissipation.",
    "Certified non-toxic processing minimizes chemical irritant residues.",
  ];
  let disadvantages = [
    "Dries slower than technical synthetics during heavy perspiration.",
    "May wrinkle easily without chemical cross-linking resin finishes.",
  ];

  if (/humid|tropical|hot|summer/i.test(activeClimate)) {
    recFabric = "100% Pure French Flax Linen";
    recGarment = "Loose unstructured summer shirt / relaxed linen trousers";
    reasons = [
      "Natural hollow-core flax fibers offer superior moisture evaporation and passive airflow.",
      "Does not cling to skin during high humidity or perspiration.",
    ];
    disadvantages = [
      "Raw linen can feel crisp initially before multiple wash softenings.",
      "Has low elasticity and creases readily.",
    ];
  } else if (/cold|winter|dry/i.test(activeClimate)) {
    recFabric = "80% Merino Wool / 20% Mulberry Silk";
    recGarment = "Ultra-fine gauge base layer / crewneck knit";
    reasons = [
      "Naturally thermo-regulating keratin fibers trap body heat while remaining breathable.",
      "Silk filament content smooths fiber surface to minimize mechanical prickle.",
    ];
    disadvantages = [
      "Individuals with severe atopic dermatitis or lanolin allergy must verify skin tolerance first.",
      "Requires delicate cold-water hand washing or wool cycle.",
    ];
  }

  const catalogQueryRes = queryCatalog({
    query: recFabric.toLowerCase().includes("cotton") ? "cotton" : recFabric.toLowerCase().includes("linen") ? "linen" : "silk",
    minComfort: 75,
    inStockOnly: true,
    limit: 4,
  });

  const fabricRecommendations = {
    primaryRecommendation: {
      fabric: recFabric,
      garmentType: recGarment,
      reasons,
      potentialDisadvantages: disadvantages,
    },
    alternativeFabrics: [
      {
        fabric: "100% Mulberry Silk",
        garmentType: "Seamless base layer / silk camisole or sleepwear",
        reasons: ["Continuous protein filament with the lowest coefficient of mechanical friction."],
        potentialDisadvantages: ["Delicate fabric care requiring pH-neutral detergent and gentle cycle."],
      },
      {
        fabric: "100% Tencel Lyocell",
        garmentType: "Soft drape casual tee / relaxed trousers",
        reasons: ["Exceptionally smooth closed-loop cellulose fiber with high hygroscopic moisture management."],
        potentialDisadvantages: ["Can experience fibrillar surface pilling if washed on aggressive cycles."],
      },
    ],
    comfortEstimate: {
      score: comfortScore.score,
      ratingBand: comfortScore.ratingBand,
      assumptions: [
        "Assumes relaxed to loose garment fit without tight elastic bands or abrasive inner seams.",
        "Assumes garment is laundered with hypoallergenic, fragrance-free liquid detergent.",
        "Score represents algorithmic comfort estimation, not an allergy-free guarantee.",
      ],
    },
    safetyDisclaimer:
      "Important: No fabric is 100% allergy-free or guaranteed safe for every person. Cutaneous responses vary based on individual contact sensitivities, dye formulations, and textile finishing agents.",
    catalogProducts: catalogQueryRes.items.slice(0, 4),
  };

  const imageRecognition = {
    detectedSubject: userExplicitlyChoseFabric && inspection.objectCategory === "UNRELATED_OBJECT"
      ? "Woven Textile"
      : userExplicitlyChoseSkin && inspection.objectCategory === "UNRELATED_OBJECT"
      ? "Human Skin Surface"
      : userExplicitlyChoseLabel && inspection.objectCategory === "UNRELATED_OBJECT"
      ? "Garment Care Label"
      : inspection.detectedSubject || "Unknown Subject",
    objectCategory: userExplicitlyChoseFabric && inspection.objectCategory === "UNRELATED_OBJECT"
      ? ("FABRIC" as const)
      : userExplicitlyChoseSkin && inspection.objectCategory === "UNRELATED_OBJECT"
      ? ("SKIN" as const)
      : userExplicitlyChoseLabel && inspection.objectCategory === "UNRELATED_OBJECT"
      ? ("CARE_LABEL" as const)
      : inspection.objectCategory || ("UNKNOWN" as const),
    detectedFeatures: inspection.detectedFeatures || [],
    recommendedModality: userExplicitlyChoseFabric && inspection.isUnrelatedObject
      ? ("fabric" as const)
      : userExplicitlyChoseSkin && inspection.isUnrelatedObject
      ? ("skin" as const)
      : userExplicitlyChoseLabel && inspection.isUnrelatedObject
      ? ("label" as const)
      : inspection.recommendedModality || ("unknown" as const),
    confidenceTier: inspection.confidenceTier || "LOW",
    selectionReason: userExplicitlyChoseFabric && inspection.isUnrelatedObject
      ? "User manually selected Fabric Weave Photo. Analyzing textile weave structure."
      : inspection.selectionReason || "Visual feature analysis.",
    alternativeCategories: inspection.alternativeCategories || [],
    isUnrelatedObject: (userExplicitlyChoseFabric || userExplicitlyChoseSkin || userExplicitlyChoseLabel)
      ? false
      : Boolean(inspection.isUnrelatedObject),
  };

  // BRANCH UNRELATED: UNRELATED OBJECT DETECTED (Plants, Electronics, Shoes, etc.)
  // Only pause assessment if the detected object is genuinely unrelated AND user did not manually override
  if (inspection.isUnrelatedObject && !userExplicitlyChoseFabric && !userExplicitlyChoseSkin && !userExplicitlyChoseLabel) {
    return {
      imageId: activeImageId,
      inputModality: "AMBIGUOUS_UNKNOWN",
      modalityConfidence: inspection.confidence || 0.9,
      assessmentTitle: "Unrelated Object Detected (Assessment Paused)",
      clinicalNotice:
        "Object Notice: The uploaded image appears to be an unrelated object (e.g. plant, electronics, or accessory) rather than human skin, a clothing fabric, or a care tag. Dermatological and textile comfort assessments are paused for unrelated items.",
      identifiedCategory,
      confidenceScores,
      fabricRecommendations,
      comfortScore: {
        score: null,
        ratingBand: "Indeterminate (Insufficient Data)",
        isExperimental: true,
        isReliable: false,
        formulaBreakdown: {
          baseScore: 75,
          fiberAdjustment: 0,
          climateAdjustment: 0,
          frictionAdjustment: 0,
          symptomAdjustment: 0,
          uncertaintyAdjustment: 0,
        },
        explanation: "Comfort score: Indeterminate. An unrelated object cannot be assessed for cutaneous skin tolerance or garment comfort.",
        documentedRules: ["Unrelated Object: Comfort score cannot be calculated for non-apparel items."],
      },
      imageRecognition,
      mismatchDetected: false,
      isLowQuality: false,
      qualityWarning: "The image exhibits an unrelated non-clothing object.",
      skinObservations: undefined,
      weaveCharacteristics: undefined,
      careLabelAnalysis: undefined,
      visibleObservations: {
        subject: inspection.detectedSubject || "Unrelated Object",
        visualFindings:
          inspection.selectionReason ||
          "The image contains an object unrelated to skin or textile comfort diagnostics.",
        limitations:
          "DermStyle AI evaluates human skin irritation, fabric weave textures, and garment care labels. Unrelated objects cannot be evaluated.",
      },
      userReportedContext: {
        symptoms: ["Assessment paused for unrelated object"],
        symptomsStatus: "UNKNOWN_NOT_PROVIDED",
        suspectedGarment: "Non-apparel object",
        skinProfile: activeSkinProfile,
        ambientClimate: activeClimate,
      },
      verifiedTextileInfo: {
        verificationStatus: "UNKNOWN",
        fiberComposition: "Not Applicable (Unrelated Object)",
        notes: "Please upload an image of human skin, a fabric weave, or a garment care tag.",
      },
      possibleExplanations: {
        hypotheses: ["The uploaded image is not applicable to skin sensitivity or textile tolerance evaluation."],
        uncertainties: "Non-clothing and non-skin subjects cannot be clinically evaluated.",
        clinicalRecommendation: "Upload an image of your clothing care tag or fabric surface to evaluate garment comfort.",
      },
      personalizedClothingSuggestions: {
        suggestedFabrics: [
          {
            name: "100% GOTS Certified Organic Cotton",
            whyRecommended: "Universal hypoallergenic baseline fiber for daily wear.",
            limitations: "Check garment labels for synthetic sewing thread.",
          },
        ],
        recommendedWeave: "Plain Breathable Weave",
        garmentSilhouettes: ["Comfort-fit apparel"],
        washCareGuidance: "Wash with mild hypoallergenic detergent.",
      },
    };
  }

  // BRANCH A: SKIN PHOTOGRAPH
  if (isSkinModality) {
    const suspectedGarment = isSynthetic
      ? "User-reported synthetic garment (polyester/nylon) — unverified by care label"
      : isNatural
      ? "User-reported natural garment — unverified by care label"
      : "Unknown (No garment reported)";

    return {
      imageId: activeImageId,
      inputModality: "SKIN_IMAGE",
      modalityConfidence: inspection.confidence,
      assessmentTitle: "Skin Surface Observation & Textile Comfort Evaluation",
      clinicalNotice:
        "Medical Disclaimer: This photographic evaluation provides non-clinical visual observations only and cannot confirm a diagnosis or confirm a medical diagnosis. Consult a board-certified dermatologist for persistent, severe, or worsening symptoms.",
      identifiedCategory,
      confidenceScores,
      skinAnalysisDetails,
      fabricRecommendations,
      comfortScore,
      imageRecognition,
      mismatchDetected: inspection.mismatchDetected,
      mismatchMessage: inspection.mismatchMessage,
      suggestedModality: inspection.suggestedModality,
      isLowQuality: inspection.isLowQuality,
      qualityWarning: inspection.qualityWarning,
      skinObservations: inspection.skinObservations,
      visibleObservations: {
        subject: "Human Skin Surface",
        visualFindings:
          inspection.visualObservations ||
          "Visible localized redness (erythema) and superficial surface irregularity observed in the photograph.",
        limitations:
          inspection.limitations ||
          "Microvascular dilation, histological changes, immunological mechanisms, or clinical irritation grades cannot be established from a photographic image.",
      },
      userReportedContext: {
        symptoms: hasSymptomInput ? detectedSymptoms : ["Unknown (No symptoms reported)"],
        symptomsStatus: hasSymptomInput ? "REPORTED" : "UNKNOWN_NOT_PROVIDED",
        suspectedGarment,
        skinProfile: activeSkinProfile,
        ambientClimate: activeClimate,
      },
      verifiedTextileInfo: {
        verificationStatus: "UNKNOWN",
        fiberComposition: "Unknown (No readable garment label provided)",
        notes:
          "A skin photograph cannot provide textile composition data. Composition remains unknown until supported by readable care label information.",
      },
      careLabelAnalysis: undefined,
      weaveCharacteristics: undefined,
      possibleExplanations: {
        hypotheses: [
          "Mechanical friction from clothing seams, coarse weave textures, or tight garment fit (possible contributing factor).",
          "Perspiration accumulation and heat retention beneath occlusive or non-breathable fabrics (possible contributing factor).",
          "Laundry detergent, bleach, or fabric softener residues remaining on textile fibers (possible contributing factor).",
          "Non-textile environmental factors, temperature fluctuations, or general cutaneous sensitivity (possible contributing factor).",
        ],
        uncertainties:
          "The underlying cause cannot be confirmed from an image. Friction, detergent residue, and heat are evaluated as possible contributing factors, not confirmed causes.",
        clinicalRecommendation:
          "Consult a board-certified dermatologist for a clinical diagnosis. Consider wearing loose, soft garments and avoiding rough seams over the affected area.",
      },
      personalizedClothingSuggestions: {
        suggestedFabrics: [
          {
            name: "100% GOTS Certified Organic Cotton",
            whyRecommended: "Soft natural cellulosic fibers with high moisture absorption and low static generation.",
            limitations: "Ensure fabrics are undyed or OEKO-TEX certified; dye finishes can still trigger individual sensitivities.",
          },
          {
            name: "Pure Mulberry Silk",
            whyRecommended: "Smooth, continuous filament structure with low coefficient of surface friction.",
            limitations: "Requires gentle maintenance; individuals sensitive to silk sericin residue should use pre-washed silk.",
          },
          {
            name: "French Flax Linen",
            whyRecommended: "Naturally breathable hollow-core structure for high evaporative airflow in warm conditions.",
            limitations: "Choose pre-washed softened linen; unwashed raw linen may initially feel crisp.",
          },
        ],
        recommendedWeave: "Loose Jersey Knit or Open Chambray (minimizes raised abrasive seams)",
        garmentSilhouettes: ["Relaxed-fit camp collar shirts", "Unstructured breathable tops", "Seamless base layers"],
        washCareGuidance: "Wash with mild, fragrance-free, dye-free liquid detergent. Double-rinse to eliminate laundry surfactant residues.",
      },
    };
  }

  // BRANCH B: FABRIC SURFACE PHOTOGRAPH
  if (isFabricModality) {
    return {
      imageId: activeImageId,
      inputModality: "FABRIC_SURFACE",
      modalityConfidence: inspection.confidence,
      assessmentTitle: "Textile Surface Texture & Weave Analysis",
      clinicalNotice:
        "Textile Limitation: Visual texture from an optical photograph does NOT confirm internal fiber chemical composition (e.g. 100% Cotton vs. Polyester/Cotton blend). Check the garment wash care label for verified percentages.",
      identifiedCategory,
      confidenceScores,
      fabricRecommendations,
      comfortScore,
      imageRecognition,
      mismatchDetected: inspection.mismatchDetected,
      mismatchMessage: inspection.mismatchMessage,
      suggestedModality: inspection.suggestedModality,
      isLowQuality: inspection.isLowQuality,
      qualityWarning: inspection.qualityWarning,
      weaveCharacteristics: inspection.weaveCharacteristics,
      visibleObservations: {
        subject: "Textile / Apparel Surface",
        visualFindings:
          inspection.visualObservations ||
          "Visible textile weave structure and surface interlacing pattern observed in the photograph. Clean interlaced warp and weft yarns with uniform texture nap.",
        limitations:
          "Composition: Unknown – photographic appearance cannot establish chemical fiber identity. Chemical fiber identity, synthetic polymer ratios, and dye formulations cannot be determined from optical appearance alone.",
      },
      userReportedContext: {
        symptoms: hasSymptomInput ? detectedSymptoms : ["Unknown (No symptoms reported)"],
        symptomsStatus: hasSymptomInput ? "REPORTED" : "UNKNOWN_NOT_PROVIDED",
        suspectedGarment: hasGarmentInput ? textQuery : "Garment shown in photograph",
        skinProfile: activeSkinProfile,
        ambientClimate: activeClimate,
      },
      verifiedTextileInfo: {
        verificationStatus: "UNVERIFIED_FROM_PHOTO",
        fiberComposition: "Composition: Unknown – photographic appearance cannot establish chemical fiber identity.",
        notes:
          "Visual texture shows weave pattern only. Composition remains unknown without readable care label verification.",
      },
      careLabelAnalysis: undefined,
      skinObservations: undefined,
      possibleExplanations: {
        hypotheses: [
          "If the textile contains high synthetic content, it may impede evaporative moisture transfer during warm weather.",
          "If the textile is natural cellulose, it provides favorable vapor breathability for sensitive skin.",
        ],
        uncertainties:
          "Exact skin comfort depends on verified fiber percentages, garment fit, and laundry care history.",
        clinicalRecommendation:
          "Check the garment's side-seam care label for verified fiber composition before prolonged wear.",
      },
      personalizedClothingSuggestions: {
        suggestedFabrics: [
          {
            name: "Long-Staple Combed Cotton",
            whyRecommended: "Gentle on skin barriers with predictable natural moisture balance.",
            limitations: "Dries slower than technical synthetics during intense aerobic exertion.",
          },
          {
            name: "Tencel Lyocell",
            whyRecommended: "Smooth closed-loop cellulose fiber with natural thermal regulation.",
            limitations: "Ensure loose garment silhouette to prevent seam tension.",
          },
        ],
        recommendedWeave: "Fine Interlock or Lightweight Plain Weave",
        garmentSilhouettes: ["Classic relaxed crewneck", "Comfort-cut casual shirts"],
        washCareGuidance: "Wash inside-out on gentle cycle at 30°C to preserve smooth surface finish.",
      },
    };
  }

  // BRANCH C: CARE LABEL / WASH TAG
  if (isCareLabelModality) {
    const isLegible = careLabelAnalysis?.isLegible || (hasText && (isNatural || isSynthetic));
    const fiberText = careLabelAnalysis?.compositionSummary || (isLegible ? textQuery : "Unknown (Label text unread or not provided)");
    
    // Strict Invariant: NEVER display VERIFIED_FROM_TAG when information comes only from manual text input or image is missing
    const verifStatus = (!hasImagePayload || effectiveEvidenceSource === "USER_INPUT")
      ? "SELF_REPORTED_ONLY"
      : (careLabelAnalysis?.verificationStatus || (isLegible ? "VERIFIED_FROM_TAG" : "UNKNOWN"));

    const assessmentTitle = !hasImagePayload
      ? "Manual Care Label Data (Image Not Uploaded)"
      : "Garment Care Label & Fiber Verification";

    const qualityWarning = !hasImagePayload
      ? "Image not uploaded – manual information only."
      : inspection.qualityWarning;

    return {
      imageId: activeImageId,
      inputModality: "LABEL_CARE_TAG",
      modalityConfidence: hasImagePayload ? inspection.confidence : 0.5,
      assessmentTitle,
      clinicalNotice:
        "Analysis based on legible optical label text and care symbols. Undisclosed textile finishing chemicals, sizing agents, and disperse dyes may not appear on standard care tags.",
      identifiedCategory,
      confidenceScores,
      fabricRecommendations,
      comfortScore,
      imageRecognition: {
        ...imageRecognition,
        detectedSubject: !hasImagePayload ? "No Image (Manual Input)" : imageRecognition.detectedSubject,
      },
      mismatchDetected: inspection.mismatchDetected,
      mismatchMessage: inspection.mismatchMessage,
      suggestedModality: inspection.suggestedModality,
      isLowQuality: !hasImagePayload ? false : inspection.isLowQuality,
      qualityWarning,
      careLabelAnalysis,
      skinObservations: undefined,
      weaveCharacteristics: undefined,
      visibleObservations: {
        subject: !hasImagePayload ? "Manual Care Label Input" : "Garment Wash Care Label",
        visualFindings: !hasImagePayload
          ? "No photograph uploaded. Evaluating manually entered textile specifications."
          : (inspection.visualObservations || "Printed care label text visible with fiber composition declarations and care iconography."),
        limitations: !hasImagePayload
          ? "Image not uploaded – manual information only. Optical verification cannot be performed without a photograph of the physical care label."
          : "Partially obscured, faded, or cut labels cannot be fully verified. Missing fields remain unverified.",
      },
      userReportedContext: {
        symptoms: hasSymptomInput ? detectedSymptoms : ["Routine label inspection (no symptoms reported)"],
        symptomsStatus: hasSymptomInput ? "REPORTED" : "UNKNOWN_NOT_PROVIDED",
        suspectedGarment: "Item attached to care label",
        skinProfile: activeSkinProfile,
        ambientClimate: activeClimate,
      },
      verifiedTextileInfo: {
        verificationStatus: verifStatus,
        fiberComposition: fiberText,
        evidenceSource: effectiveEvidenceSource,
        notes: !hasImagePayload
          ? "Image not uploaded – manual information only. Composition is unverified by optical care tag photograph."
          : verifStatus === "VERIFIED_FROM_TAG"
          ? "Fiber composition verified from legible care tag text."
          : verifStatus === "SELF_REPORTED_ONLY"
          ? "Fiber composition is self-reported and unverified by care tag optical photograph."
          : "Label text was not provided or could not be deciphered. Percentages are not fabricated.",
      },
      possibleExplanations: {
        hypotheses: [
          isSynthetic
            ? "Garment tag indicates synthetic polymer content; may restrict moisture evaporation in humid environments."
            : "Garment tag indicates predominantly natural fibers, offering favorable skin compatibility.",
        ],
        uncertainties:
          "Care labels declare bulk fiber mass; chemical finishes (softeners, anti-wrinkle coatings) are not listed on tags.",
        clinicalRecommendation:
          "Follow manufacturer wash temperature closely to prevent fiber degradation and chemical breakdown.",
      },
      personalizedClothingSuggestions: {
        suggestedFabrics: [
          {
            name: "Certified Organic Cotton (GOTS)",
            whyRecommended: "Independent audit guarantees absence of toxic pesticides and heavy metal dyes.",
            limitations: "Inspect seams for synthetic sewing thread (polyester core thread is common).",
          },
        ],
        recommendedWeave: "Breathable Slub or Chambray",
        garmentSilhouettes: ["Ergonomic tagless tops", "Relaxed fit trousers"],
        washCareGuidance: "Pre-wash new garments twice before first wear to flush manufacturing chemical residues.",
      },
    };
  }

  // BRANCH D: AMBIGUOUS / UNKNOWN
  return {
    imageId: activeImageId,
    inputModality: "AMBIGUOUS_UNKNOWN",
    modalityConfidence: inspection.confidence || 0.4,
    assessmentTitle: "Ambiguous Image & Symptom Assessment",
    clinicalNotice:
      "Image Quality Notice: The uploaded image could not be reliably classified as human skin, a textile weave, or a legible care label. Please provide a clear, well-lit photograph or select the input type.",
    identifiedCategory,
    confidenceScores,
    fabricRecommendations,
    comfortScore,
    imageRecognition,
    mismatchDetected: inspection.mismatchDetected,
    mismatchMessage: inspection.mismatchMessage,
    suggestedModality: inspection.suggestedModality,
    isLowQuality: inspection.isLowQuality,
    qualityWarning:
      inspection.qualityWarning ||
      "Subject matter is ambiguous or illumination is insufficient for reliable feature extraction.",
    skinObservations: undefined,
    weaveCharacteristics: undefined,
    careLabelAnalysis: undefined,
    visibleObservations: {
      subject: "Unclassified Subject",
      visualFindings:
        inspection.visualObservations ||
        "Subject matter is ambiguous or illumination is insufficient for reliable feature extraction. No conclusive skin redness or textile weave structure could be validated.",
      limitations:
        inspection.limitations || "Definitive optical assessment is paused to prevent incorrect or misleading conclusions.",
    },
    userReportedContext: {
      symptoms: hasSymptomInput ? detectedSymptoms : ["Unknown (No symptoms reported)"],
      symptomsStatus: hasSymptomInput ? "REPORTED" : "UNKNOWN_NOT_PROVIDED",
      suspectedGarment: hasGarmentInput ? textQuery : "Unknown (Not specified)",
      skinProfile: activeSkinProfile,
      ambientClimate: activeClimate,
    },
    verifiedTextileInfo: {
      verificationStatus: !hasImagePayload && hasText ? "SELF_REPORTED_ONLY" : "UNKNOWN",
      fiberComposition: !hasImagePayload && hasText ? textQuery : "Unknown (Image unverified)",
      evidenceSource: !hasImagePayload && hasText ? "USER_INPUT" : "UNKNOWN",
      notes: !hasImagePayload
        ? "Image not uploaded – manual information only. Composition is unverified by optical care tag photograph."
        : "Please upload a focused photo of your clothing care tag or fabric texture.",
    },
    possibleExplanations: {
      hypotheses: [
        "Assessment is limited by available input evidence. General recommendations are based on user-provided profile context.",
      ],
      uncertainties: "Both photographic evidence and fiber composition remain unconfirmed.",
      clinicalRecommendation: "Re-upload a clear photograph with steady focus.",
    },
    personalizedClothingSuggestions: {
      suggestedFabrics: [
        {
          name: "Natural Breathable Cotton",
          whyRecommended: "Universally versatile and well-tolerated baseline natural fiber.",
          limitations: "Check garment labels to avoid unlisted polyester lining.",
        },
      ],
      recommendedWeave: "Plain Breathable Weave",
      garmentSilhouettes: ["Comfort-fit apparel"],
      washCareGuidance: "Wash with mild hypoallergenic detergent.",
    },
  };
}

/**
 * Asynchronous evidence-based diagnosis with Sharp computer vision pixel analysis.
 */
export async function evaluateEvidenceBasedDiagnosisAsync(
  textQuery: string,
  imagePayload: string | null | undefined,
  skinType?: string,
  climate?: string,
  modalityHint?: string,
  imageId?: string
): Promise<EvidenceBasedDiagnosisResponse["prediction"]> {
  const query = (textQuery || "").toLowerCase().trim();
  const hasImage = Boolean(
    imagePayload &&
    typeof imagePayload === "string" &&
    imagePayload.trim().length > 0 &&
    !imagePayload.startsWith("data:image/empty") &&
    imagePayload.length > 50
  );

  let effectiveHint = modalityHint;
  if (!effectiveHint) {
    if (/rash|itch|redness|skin|bumps|eczema|arm|neck|back/i.test(query)) {
      effectiveHint = "skin";
    } else if (/tag|label|wash|care|cotton|poly|%/i.test(query)) {
      effectiveHint = "label";
    }
  }

  const inspection = await inspectImageModalityAsync(imagePayload, effectiveHint);
  return buildDiagnosisFromInspection(inspection, textQuery, skinType, climate, imageId, effectiveHint, hasImage);
}

/**
 * Synchronous evidence-based diagnosis (backward compatibility and test runner).
 */
export function evaluateEvidenceBasedDiagnosis(
  textQuery: string,
  imagePayload: string | null | undefined,
  skinType?: string,
  climate?: string,
  modalityHint?: string,
  imageId?: string
): EvidenceBasedDiagnosisResponse["prediction"] {
  const query = (textQuery || "").toLowerCase().trim();
  const hasImage = Boolean(
    imagePayload &&
    typeof imagePayload === "string" &&
    imagePayload.trim().length > 0 &&
    !imagePayload.startsWith("data:image/empty") &&
    imagePayload.length > 50
  );

  let effectiveHint = modalityHint;
  if (!effectiveHint) {
    if (/rash|itch|redness|skin|bumps|eczema|arm|neck|back/i.test(query)) {
      effectiveHint = "skin";
    } else if (/tag|label|wash|care|cotton|poly|%/i.test(query)) {
      effectiveHint = "label";
    }
  }

  const inspection = inspectImageModality(imagePayload, effectiveHint);
  return buildDiagnosisFromInspection(inspection, textQuery, skinType, climate, imageId, effectiveHint, hasImage);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image, textQuery, skinType, climate, modalityHint, imageId } = body;

    if (!textQuery && !image) {
      return NextResponse.json(
        { status: "error", error: "Please provide either an image, a description, or both." },
        { status: 400 }
      );
    }

    const prediction = await evaluateEvidenceBasedDiagnosisAsync(
      textQuery || "",
      image,
      skinType,
      climate,
      modalityHint,
      imageId
    );

    return NextResponse.json({
      status: "success",
      prediction,
    });
  } catch (error: any) {
    console.error("[Evidence-Based Multimodal API Error]", error);
    return NextResponse.json(
      { status: "error", error: "Failed to process multimodal diagnosis." },
      { status: 500 }
    );
  }
}
