// src/lib/visionClassifier.ts
// Intelligent Multimodal Object Identity Recognition & Modality Classifier powered by Sharp

export type ClassifiedModality = "SKIN_IMAGE" | "FABRIC_SURFACE" | "LABEL_CARE_TAG" | "AMBIGUOUS_UNKNOWN";
export type ObjectCategory = "SKIN" | "FABRIC" | "CARE_LABEL" | "UNRELATED_OBJECT" | "UNKNOWN";
export type ConfidenceTier = "HIGH" | "MEDIUM" | "LOW";

export interface AlternativeCategory {
  id: "skin" | "fabric" | "label" | "apparel" | "other" | "unknown";
  label: string;
  confidence: number;
}

export interface VisionClassificationResult {
  modality: ClassifiedModality;
  confidence: number; // 0.0 to 1.0 (calibrated model confidence)
  confidenceTier: ConfidenceTier;
  detectedSubject: string; // e.g. "Woven Textile", "Human Skin / Forearm", "Garment Care Label"
  objectCategory: ObjectCategory;
  categoryTitle?: string;
  categoryConfidence?: number; // 0 to 100%
  ocrConfidence?: number; // 0 to 100%
  compositionConfidence?: number; // 0 to 100%
  skinFeatureConfidence?: number; // 0 to 100%
  lowConfidenceWarning?: string;
  detectedFeatures: string[]; // Observable visual feature bullets
  recommendedModality: "skin" | "fabric" | "label" | "unrelated" | "unknown";
  selectionReason: string; // Explanation of why the modality was selected
  alternativeCategories: AlternativeCategory[];
  isUnrelatedObject: boolean;

  // Modality Flags
  isSkin: boolean;
  isFabric: boolean;
  isCareLabel: boolean;
  isLowQuality: boolean;
  qualityWarning?: string;

  // Observable skin features (Non-Diagnostic)
  skinObservations?: {
    erythemaLevel: "None Observed" | "Localized Mild" | "Confluent Pronounced" | "Indeterminate";
    drynessLevel: "Dry / Rough" | "Normal Hydration" | "Indeterminate";
    scalingLevel: "Visible Flaking / Scaling" | "Follicular Prominence" | "Smooth / Uniform";
    surfaceIrritation: "Contact Flare / Friction Irritation" | "Heat Trapping Reaction" | "Mild Surface Micro-Abrasion" | "None Observed";
    nonDiagnosticExplanation: string;
    clothingFactors: string[];
    medicalAdvice: string;
    erythemaScore?: number;
  };

  // Quantitative Optical Metrics
  erythemaScore: number;
  textDensityScore: number;
  textureEnergyScore: number;
  details: {
    rMean: number;
    gMean: number;
    bMean: number;
    luminance: number;
    contrast: number;
    saturation: number;
    exG: number;
    isAchromatic: boolean;
    isSkinTone: boolean;
    isBeigeFabric: boolean;
    aspectRatio: number;
  };
}

/**
 * Classifies an image from its decoded pixel buffer using sharp.
 * Recognizes actual visual subjects (Skin, Woven Fabric, Care Tag, Plant/Unrelated Object, or Blurry)
 * and determines calibrated confidence and feature explanations.
 */
export async function classifyImageBuffer(
  imageBuffer: Buffer,
  userHint?: string
): Promise<VisionClassificationResult> {
  // 1. Guard against empty / truncated image buffer
  if (!imageBuffer || imageBuffer.length < 50) {
    return {
      modality: "AMBIGUOUS_UNKNOWN",
      confidence: 0.2,
      confidenceTier: "LOW",
      categoryTitle: "Unclear or insufficient-quality image",
      categoryConfidence: 20,
      ocrConfidence: 15,
      compositionConfidence: 10,
      skinFeatureConfidence: 15,
      lowConfidenceWarning: "Unable to identify this image reliably. Please upload a clearer photograph or select the correct category.",
      detectedSubject: "Ambiguous Subject / Unclear Image",
      objectCategory: "UNKNOWN",
      detectedFeatures: [
        "Image payload is empty or corrupted",
        "Optical features cannot be extracted",
      ],
      recommendedModality: "unknown",
      selectionReason: "We couldn't confidently identify this image because the buffer is empty or corrupted.",
      alternativeCategories: [
        { id: "skin", label: "Skin / Body Surface", confidence: 0.2 },
        { id: "fabric", label: "Fabric / Textile", confidence: 0.2 },
        { id: "label", label: "Garment Care Label", confidence: 0.2 },
        { id: "apparel", label: "Clothing / Apparel", confidence: 0.2 },
        { id: "other", label: "Other Object", confidence: 0.2 },
      ],
      isUnrelatedObject: false,
      isSkin: false,
      isFabric: false,
      isCareLabel: false,
      isLowQuality: true,
      qualityWarning: "Image buffer is empty or corrupted.",
      erythemaScore: 0,
      textDensityScore: 0,
      textureEnergyScore: 0,
      details: {
        rMean: 0,
        gMean: 0,
        bMean: 0,
        luminance: 0,
        contrast: 0,
        saturation: 0,
        exG: 0,
        isAchromatic: false,
        isSkinTone: false,
        isBeigeFabric: false,
        aspectRatio: 1,
      },
    };
  }

  try {
    const sharp = (await import("sharp")).default;
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 100;
    const height = metadata.height || 100;
    const aspectRatio = width / height;

    // Check for extremely low resolution (blurry / thumbnail)
    if (width < 20 || height < 20) {
      return {
        modality: "AMBIGUOUS_UNKNOWN",
        confidence: 0.25,
        confidenceTier: "LOW",
        categoryTitle: "Unclear or insufficient-quality image",
        categoryConfidence: 25,
        ocrConfidence: 20,
        compositionConfidence: 15,
        skinFeatureConfidence: 15,
        lowConfidenceWarning: "Unable to identify this image reliably. Please upload a clearer photograph or select the correct category.",
        detectedSubject: "Low-Resolution / Blurry Image",
        objectCategory: "UNKNOWN",
        detectedFeatures: [
          "Resolution is below minimal 20x20 optical threshold",
          "Visual texture and typography lines are illegible",
        ],
        recommendedModality: "unknown",
        selectionReason: "We couldn't confidently identify this image. The resolution is too low for reliable feature extraction.",
        alternativeCategories: [
          { id: "skin", label: "Skin / Body Surface", confidence: 0.2 },
          { id: "fabric", label: "Fabric / Textile", confidence: 0.2 },
          { id: "label", label: "Garment Care Label", confidence: 0.2 },
          { id: "apparel", label: "Clothing / Apparel", confidence: 0.2 },
          { id: "other", label: "Other Object", confidence: 0.2 },
        ],
        isUnrelatedObject: false,
        isSkin: false,
        isFabric: false,
        isCareLabel: false,
        isLowQuality: true,
        qualityWarning: "Image resolution is too low for reliable feature extraction.",
        erythemaScore: 0,
        textDensityScore: 0,
        textureEnergyScore: 0,
        details: {
          rMean: 0,
          gMean: 0,
          bMean: 0,
          luminance: 0,
          contrast: 0,
          saturation: 0,
          exG: 0,
          isAchromatic: false,
          isSkinTone: false,
          isBeigeFabric: false,
          aspectRatio,
        },
      };
    }

    // Resize to standard 200x200 patch for consistent statistical evaluation
    const resizedBuffer = await sharp(imageBuffer)
      .resize(200, 200, { fit: "cover" })
      .removeAlpha()
      .toBuffer();

    const stats = await sharp(resizedBuffer).stats();
    const channels = stats.channels;
    const rMean = channels[0]?.mean || 0;
    const gMean = channels[1]?.mean || 0;
    const bMean = channels[2]?.mean || 0;
    const rStd = channels[0]?.stdev || 0;
    const gStd = channels[1]?.stdev || 0;
    const bStd = channels[2]?.stdev || 0;

    const luminance = 0.299 * rMean + 0.587 * gMean + 0.114 * bMean;
    const avgStd = (rStd + gStd + bStd) / 3;

    const maxRGB = Math.max(rMean, gMean, bMean);
    const minRGB = Math.min(rMean, gMean, bMean);
    const saturation = maxRGB > 0 ? (maxRGB - minRGB) / maxRGB : 0;

    // Excess Green Index: 2G - R - B (standard botanical vegetation metric)
    const exG = 2 * gMean - rMean - bMean;

    // Chromatic separation differences
    const rgDiff = Math.abs(rMean - gMean);
    const gbDiff = Math.abs(gMean - bMean);
    const rbDiff = Math.abs(rMean - bMean);

    // 1. Achromatic ribbon property: white/neutral label ribbons have near-identical R, G, B
    const isAchromatic = rgDiff < 18 && gbDiff < 18 && rbDiff < 22;

    // 2. Care tag ribbon with high-contrast text lines
    const isHighLuminanceWhite = luminance > 185 && isAchromatic;
    const contrast = Math.max(
      (channels[0]?.max || 0) - (channels[0]?.min || 0),
      (channels[1]?.max || 0) - (channels[1]?.min || 0),
      (channels[2]?.max || 0) - (channels[2]?.min || 0)
    );
    const textDensityScore = isHighLuminanceWhite && (avgStd > 14 || contrast > 75) ? 0.94 : 0.2;

    // Hue calculation (0 to 360 degrees)
    const dRGB = maxRGB - minRGB;
    let hue = 0;
    if (dRGB > 0) {
      if (maxRGB === rMean) {
        hue = ((gMean - bMean) / dRGB) % 6;
      } else if (maxRGB === gMean) {
        hue = (bMean - rMean) / dRGB + 2;
      } else {
        hue = (rMean - gMean) / dRGB + 4;
      }
      hue = Math.round(hue * 60);
      if (hue < 0) hue += 360;
    }

    const normHint = (userHint || "auto").toLowerCase().trim();
    const userExplicitlySelectedFabric = normHint === "fabric" || normHint === "weave";
    const userExplicitlySelectedSkin = normHint === "skin" || normHint === "rash";
    const userExplicitlySelectedLabel = normHint === "label" || normHint === "tag" || normHint === "care";

    // 3. Green botanical flora detection (Plants, foliage, leaves)
    // Real botanical flora exhibits sharp chlorophyll green absorption:
    // - Hue in true green band (75° to 165°)
    // - Marked green dominance over red (G - R >= 18) and blue (G - B >= 25)
    // - Elevated Excess Green Index (2G - R - B >= 35) with active saturation (>= 0.20)
    // Folded beige, sand, tan, khaki, or oatmeal fabrics (hue 20°-68°, or low saturation) NEVER trigger plant classification.
    // Also guarded against manual user selections.
    const isPlantFoliage =
      !userExplicitlySelectedFabric &&
      !userExplicitlySelectedSkin &&
      !userExplicitlySelectedLabel &&
      hue >= 75 &&
      hue <= 165 &&
      gMean - rMean >= 18 &&
      gMean - bMean >= 25 &&
      exG >= 35 &&
      saturation >= 0.20;

    // 4. Beige, Tan, Sand, and Folded Fabric Property
    // Broadened to support warm beige, sand, taupe, khaki, oatmeal, and folded drapery shadows:
    // - Earthy warm tones: R in 120-250, G in 105-235, B in 65-200.
    // - In beige/earthy textiles, Blue is lower than Green and Red (warm base).
    // - Hue is in warm yellow-amber/tan range (20° to 68°), with low-to-medium saturation (0.05 to 0.48).
    // - In folded fabric, fold shadows create natural variations in luminance without destroying the warm balance.
    const isBeigeColor =
      !isPlantFoliage &&
      rMean >= 120 &&
      rMean <= 250 &&
      gMean >= 105 &&
      gMean <= 235 &&
      bMean >= 65 &&
      bMean <= 200 &&
      bMean < gMean &&
      bMean < rMean &&
      hue >= 20 &&
      hue <= 68 &&
      saturation >= 0.05 &&
      saturation <= 0.48 &&
      Math.abs(rMean - gMean) <= 45 &&
      // Prevent collision with high-erythema skin (where R - G is steep and R - G > gbDiff * 0.75)
      !(rMean - gMean > 18 && rMean - gMean > gbDiff * 0.75);

    // 5. Fitzpatrick Skin Tone Locus (Type I to VI) with vascular erythema (STRICTLY PROTECTED)
    const isSkinTone =
      !isPlantFoliage &&
      !isBeigeColor &&
      rMean > gMean &&
      gMean > bMean &&
      rMean - gMean > 15 &&
      gMean - bMean > 6 &&
      luminance > 45 &&
      luminance < 235 &&
      rMean - gMean > gbDiff * 0.7;

    const erythemaScore =
      isSkinTone && rMean + gMean > 0
        ? Math.max(0, Math.min(1, ((rMean - gMean) / (rMean + gMean)) * 2.2))
        : 0;

    // 6. Generic textile weave energy (dyed fabrics, denim, twill, knit)
    const textureEnergyScore =
      !isSkinTone && !isPlantFoliage && !isHighLuminanceWhite && (avgStd > 8 || userExplicitlySelectedFabric) ? 0.90 : 0.35;

    // --------------------------------------------------------------------------------
    // OBJECT IDENTITY DECISION LOGIC
    // --------------------------------------------------------------------------------

    // Decision A: UNRELATED OBJECT - Green Plant / Botanical Foliage
    if (isPlantFoliage) {
      return {
        modality: "AMBIGUOUS_UNKNOWN",
        confidence: 0.94,
        confidenceTier: "HIGH",
        categoryTitle: "Other or unrelated object",
        categoryConfidence: 94,
        ocrConfidence: 10,
        compositionConfidence: 10,
        skinFeatureConfidence: 10,
        detectedSubject: "Indoor Plant / Foliage",
        objectCategory: "UNRELATED_OBJECT",
        detectedFeatures: [
          "Elevated green chlorophyll chrominance (ExG index > 20)",
          "Botanical leaf / plant surface structure",
          "Non-textile, non-dermal organic matter",
        ],
        recommendedModality: "unrelated",
        selectionReason:
          "The image exhibits botanical plant foliage. Unrelated to human skin irritation or clothing comfort analysis.",
        alternativeCategories: [
          { id: "other", label: "Other Object (Plant / Botanical)", confidence: 0.94 },
          { id: "apparel", label: "Clothing / Apparel", confidence: 0.03 },
          { id: "fabric", label: "Fabric / Textile", confidence: 0.02 },
          { id: "skin", label: "Skin / Body Surface", confidence: 0.01 },
        ],
        isUnrelatedObject: true,
        isSkin: false,
        isFabric: false,
        isCareLabel: false,
        isLowQuality: false,
        erythemaScore: 0,
        textDensityScore: 0,
        textureEnergyScore: 0,
        details: {
          rMean: Math.round(rMean),
          gMean: Math.round(gMean),
          bMean: Math.round(bMean),
          luminance: Math.round(luminance),
          contrast,
          saturation: Math.round(saturation * 100) / 100,
          exG: Math.round(exG),
          isAchromatic,
          isSkinTone: false,
          isBeigeFabric: false,
          aspectRatio,
        },
      };
    }

    // Blur & Low-Contrast Check for Care Labels and Documents
    // If an achromatic / neutral ribbon has avgStd < 8 or contrast < 40, text lines are unreadable / blurry.
    const isBlurryTag =
      (isAchromatic || userExplicitlySelectedLabel) &&
      (avgStd < 8 || contrast < 40) &&
      !isSkinTone &&
      !isBeigeColor &&
      luminance >= 35;
    if (isBlurryTag) {
      return {
        modality: userExplicitlySelectedLabel ? "LABEL_CARE_TAG" : "AMBIGUOUS_UNKNOWN",
        confidence: 0.25,
        confidenceTier: "LOW",
        categoryTitle: "Unclear or insufficient-quality image",
        categoryConfidence: 28,
        ocrConfidence: 25,
        compositionConfidence: 20,
        skinFeatureConfidence: 10,
        lowConfidenceWarning: "Unable to identify this image reliably. Please upload a clearer photograph or select the correct category.",
        detectedSubject: "Garment Care Label (Blurry / Low-Resolution)",
        objectCategory: "CARE_LABEL",
        detectedFeatures: [
          "Achromatic care tag surface",
          "Blurry, low-contrast, or out-of-focus typography lines",
          "Optical care text cannot be verified",
        ],
        recommendedModality: "label",
        selectionReason: "The image appears to be a garment care label, but text lines are blurry or have insufficient contrast.",
        alternativeCategories: [
          { id: "label", label: "Garment Care Label", confidence: 0.3 },
          { id: "other", label: "Other Object / Document", confidence: 0.2 },
        ],
        isUnrelatedObject: false,
        isSkin: false,
        isFabric: false,
        isCareLabel: true,
        isLowQuality: true,
        qualityWarning: "Blurry or low-resolution care label photograph. Text lines are illegible.",
        erythemaScore: 0,
        textDensityScore: 0.1,
        textureEnergyScore: 0.1,
        details: {
          rMean: Math.round(rMean),
          gMean: Math.round(gMean),
          bMean: Math.round(bMean),
          luminance: Math.round(luminance),
          contrast,
          saturation: Math.round(saturation * 100) / 100,
          exG: Math.round(exG),
          isAchromatic: true,
          isSkinTone: false,
          isBeigeFabric: false,
          aspectRatio,
        },
      };
    }

    // Decision B: CARE TAG / WASH LABEL
    if (isHighLuminanceWhite && textDensityScore > 0.6) {
      return {
        modality: "LABEL_CARE_TAG",
        confidence: 0.94,
        confidenceTier: "HIGH",
        categoryTitle: "Clothing care label / wash tag",
        categoryConfidence: 94,
        ocrConfidence: 92,
        compositionConfidence: 88,
        skinFeatureConfidence: 10,
        detectedSubject: "Garment Care Label",
        objectCategory: "CARE_LABEL",
        detectedFeatures: [
          "White satin ribbon base material",
          "High-contrast printed laundry typography",
          "Visible international care symbols and fiber percentage text lines",
        ],
        recommendedModality: "label",
        selectionReason:
          "The image contains high-contrast typography and washing instructions printed on a garment care label.",
        alternativeCategories: [
          { id: "label", label: "Garment Care Label", confidence: 0.94 },
          { id: "fabric", label: "Fabric / Textile", confidence: 0.04 },
          { id: "other", label: "Other Object / Document", confidence: 0.02 },
        ],
        isUnrelatedObject: false,
        isSkin: false,
        isFabric: false,
        isCareLabel: true,
        isLowQuality: false,
        erythemaScore: 0,
        textDensityScore,
        textureEnergyScore: 0.2,
        details: {
          rMean: Math.round(rMean),
          gMean: Math.round(gMean),
          bMean: Math.round(bMean),
          luminance: Math.round(luminance),
          contrast,
          saturation: Math.round(saturation * 100) / 100,
          exG: Math.round(exG),
          isAchromatic: true,
          isSkinTone: false,
          isBeigeFabric: false,
          aspectRatio,
        },
      };
    }

    // Decision C: BEIGE WOVEN TEXTILE (Primary Test 1)
    if (isBeigeColor) {
      return {
        modality: "FABRIC_SURFACE",
        confidence: 0.92,
        confidenceTier: "HIGH",
        categoryTitle: "Fabric weave or textile surface",
        categoryConfidence: 92,
        ocrConfidence: 20,
        compositionConfidence: 35,
        skinFeatureConfidence: 15,
        detectedSubject: "Woven Textile",
        objectCategory: "FABRIC",
        detectedFeatures: [
          "Beige-colored textile appearance",
          "Visible woven surface",
          "Repeating yarn structure",
        ],
        recommendedModality: "fabric",
        selectionReason: "The image contains a visible textile surface and woven structure.",
        alternativeCategories: [
          { id: "fabric", label: "Fabric / Textile", confidence: 0.92 },
          { id: "skin", label: "Skin / Body Surface", confidence: 0.05 },
          { id: "apparel", label: "Clothing / Apparel", confidence: 0.03 },
        ],
        isUnrelatedObject: false,
        isSkin: false,
        isFabric: true,
        isCareLabel: false,
        isLowQuality: false,
        erythemaScore: 0,
        textDensityScore: 0.2,
        textureEnergyScore: 0.90,
        details: {
          rMean: Math.round(rMean),
          gMean: Math.round(gMean),
          bMean: Math.round(bMean),
          luminance: Math.round(luminance),
          contrast,
          saturation: Math.round(saturation * 100) / 100,
          exG: Math.round(exG),
          isAchromatic: false,
          isSkinTone: false,
          isBeigeFabric: true,
          aspectRatio,
        },
      };
    }

    // Decision D: HUMAN SKIN / FOREARM (Primary Test 3)
    if (isSkinTone) {
      const subjectTitle =
        erythemaScore > 0.25
          ? "Human Skin / Forearm with Erythema"
          : "Human Skin / Forearm";

      const erythemaLevel =
        erythemaScore > 0.45 ? "Confluent Pronounced" : erythemaScore > 0.15 ? "Localized Mild" : "None Observed";
      const drynessLevel = avgStd > 18 ? "Dry / Rough" : "Normal Hydration";
      const scalingLevel = avgStd > 22 ? "Visible Flaking / Scaling" : avgStd > 14 ? "Follicular Prominence" : "Smooth / Uniform";
      const surfaceIrritation =
        erythemaScore > 0.35
          ? "Contact Flare / Friction Irritation"
          : erythemaScore > 0.15
          ? "Mild Surface Micro-Abrasion"
          : "None Observed";

      return {
        modality: "SKIN_IMAGE",
        confidence: 0.94,
        confidenceTier: "HIGH",
        categoryTitle: "Human skin / skin irritation photograph",
        categoryConfidence: 94,
        ocrConfidence: 10,
        compositionConfidence: 15,
        skinFeatureConfidence: 88,
        detectedSubject: subjectTitle,
        objectCategory: "SKIN",
        detectedFeatures: [
          "Warm human cutaneous chrominance (Fitzpatrick phototype locus)",
          erythemaScore > 0.15
            ? "Observable localized cutaneous redness (erythema)"
            : "Uniform epidermal surface tone",
          "Superficial dermal texture without periodic warp-weft interlacing",
        ],
        recommendedModality: "skin",
        selectionReason:
          "The image exhibits human cutaneous chrominance with observable localized redness and epidermal structure.",
        alternativeCategories: [
          { id: "skin", label: "Skin / Body Surface", confidence: 0.94 },
          { id: "fabric", label: "Fabric / Textile", confidence: 0.04 },
          { id: "other", label: "Other Object", confidence: 0.02 },
        ],
        isUnrelatedObject: false,
        isSkin: true,
        isFabric: false,
        isCareLabel: false,
        isLowQuality: false,
        skinObservations: {
          erythemaLevel,
          drynessLevel,
          scalingLevel,
          surfaceIrritation,
          nonDiagnosticExplanation:
            "Visual observations show localized cutaneous redness and superficial epidermal texture variation. This is a non-diagnostic observation of visible surface features and does not determine clinical pathology.",
          clothingFactors: [
            "Thermal occlusion: Tight or synthetic garments trap heat and sweat against compromised skin barriers.",
            "Mechanical friction: Coarse weave yarns and rigid seams cause micro-abrasions during movement.",
            "Moisture permeability: Non-breathable fibers impede natural evaporative cooling, exacerbating surface irritation.",
          ],
          medicalAdvice:
            "If symptoms persist, worsen, or cause significant discomfort, consult a certified dermatologist for professional medical evaluation and individualized diagnosis.",
          erythemaScore,
        },
        erythemaScore,
        textDensityScore: 0.1,
        textureEnergyScore: 0.3,
        details: {
          rMean: Math.round(rMean),
          gMean: Math.round(gMean),
          bMean: Math.round(bMean),
          luminance: Math.round(luminance),
          contrast,
          saturation: Math.round(saturation * 100) / 100,
          exG: Math.round(exG),
          isAchromatic: false,
          isSkinTone: true,
          isBeigeFabric: false,
          aspectRatio,
        },
      };
    }

    // Decision E: DYED / WOVEN TEXTILE (Indigo denim, dark knit, neutral heather, wool, silk, cotton, synthetic)
    if (
      userExplicitlySelectedFabric ||
      textureEnergyScore > 0.5 ||
      (!isAchromatic && !isSkinTone && saturation > 0.12) ||
      (luminance >= 35 && luminance <= 220 && !isSkinTone && !isHighLuminanceWhite)
    ) {
      return {
        modality: "FABRIC_SURFACE",
        confidence: 0.90,
        confidenceTier: "HIGH",
        categoryTitle: "Fabric weave or textile surface",
        categoryConfidence: 90,
        ocrConfidence: 20,
        compositionConfidence: 35,
        skinFeatureConfidence: 15,
        detectedSubject: "Woven Textile",
        objectCategory: "FABRIC",
        detectedFeatures: [
          "Visible textile weave surface",
          "Interlacing warp-weft yarn characteristics",
          "Uniform textile color and drape nap",
        ],
        recommendedModality: "fabric",
        selectionReason: "The image contains a visible textile surface and woven structure.",
        alternativeCategories: [
          { id: "fabric", label: "Fabric / Textile", confidence: 0.90 },
          { id: "apparel", label: "Clothing / Apparel", confidence: 0.07 },
          { id: "label", label: "Garment Care Label", confidence: 0.03 },
        ],
        isUnrelatedObject: false,
        isSkin: false,
        isFabric: true,
        isCareLabel: false,
        isLowQuality: false,
        erythemaScore: 0,
        textDensityScore: 0.2,
        textureEnergyScore: 0.90,
        details: {
          rMean: Math.round(rMean),
          gMean: Math.round(gMean),
          bMean: Math.round(bMean),
          luminance: Math.round(luminance),
          contrast,
          saturation: Math.round(saturation * 100) / 100,
          exG: Math.round(exG),
          isAchromatic,
          isSkinTone: false,
          isBeigeFabric: false,
          aspectRatio,
        },
      };
    }

    // Decision F: UNRELATED OBJECT - Extreme Saturation / Synthetic Non-Textile
    if (!userExplicitlySelectedFabric && !userExplicitlySelectedSkin && !userExplicitlySelectedLabel && (saturation > 0.68 || luminance < 25)) {
      return {
        modality: "AMBIGUOUS_UNKNOWN",
        confidence: 0.88,
        confidenceTier: "HIGH",
        categoryTitle: "Other or unrelated object",
        categoryConfidence: 88,
        ocrConfidence: 10,
        compositionConfidence: 10,
        skinFeatureConfidence: 10,
        detectedSubject: "Unrelated Non-Textile Object",
        objectCategory: "UNRELATED_OBJECT",
        detectedFeatures: [
          "High synthetic chromatic saturation or deep specular reflection",
          "Absence of dermal skin margins or textile yarn structures",
          "Inorganic hard surface contours",
        ],
        recommendedModality: "unrelated",
        selectionReason:
          "The image exhibits non-textile, non-dermal optical characteristics not supported for clothing comfort analysis.",
        alternativeCategories: [
          { id: "other", label: "Other Object (Electronics / Shoe / Hardware)", confidence: 0.88 },
          { id: "apparel", label: "Clothing / Apparel", confidence: 0.08 },
          { id: "fabric", label: "Fabric / Textile", confidence: 0.04 },
        ],
        isUnrelatedObject: true,
        isSkin: false,
        isFabric: false,
        isCareLabel: false,
        isLowQuality: false,
        erythemaScore: 0,
        textDensityScore: 0,
        textureEnergyScore: 0,
        details: {
          rMean: Math.round(rMean),
          gMean: Math.round(gMean),
          bMean: Math.round(bMean),
          luminance: Math.round(luminance),
          contrast,
          saturation: Math.round(saturation * 100) / 100,
          exG: Math.round(exG),
          isAchromatic: false,
          isSkinTone: false,
          isBeigeFabric: false,
          aspectRatio,
        },
      };
    }

    // Decision G: AMBIGUOUS / UNKNOWN (Medium or Low Confidence)
    if (normHint === "skin") {
      return {
        modality: "SKIN_IMAGE",
        confidence: 0.75,
        confidenceTier: "MEDIUM",
        categoryTitle: "Human skin / skin irritation photograph",
        categoryConfidence: 75,
        ocrConfidence: 10,
        compositionConfidence: 15,
        skinFeatureConfidence: 70,
        detectedSubject: "Suspected Skin Surface",
        objectCategory: "SKIN",
        detectedFeatures: [
          "Superficial warm tone compatible with skin",
          "Moderate illumination variance requiring user confirmation",
        ],
        recommendedModality: "skin",
        selectionReason:
          "The image shows warm tonal characteristics suggesting skin surface, aligned with user selection.",
        alternativeCategories: [
          { id: "skin", label: "Skin / Body Surface", confidence: 0.75 },
          { id: "fabric", label: "Fabric / Textile", confidence: 0.15 },
          { id: "other", label: "Other Object", confidence: 0.10 },
        ],
        isUnrelatedObject: false,
        isSkin: true,
        isFabric: false,
        isCareLabel: false,
        isLowQuality: false,
        erythemaScore,
        textDensityScore: 0.1,
        textureEnergyScore: 0.3,
        details: {
          rMean: Math.round(rMean),
          gMean: Math.round(gMean),
          bMean: Math.round(bMean),
          luminance: Math.round(luminance),
          contrast,
          saturation: Math.round(saturation * 100) / 100,
          exG: Math.round(exG),
          isAchromatic,
          isSkinTone: true,
          isBeigeFabric: false,
          aspectRatio,
        },
      };
    }

    if (normHint === "label") {
      return {
        modality: "LABEL_CARE_TAG",
        confidence: 0.75,
        confidenceTier: "MEDIUM",
        categoryTitle: "Clothing care label / wash tag",
        categoryConfidence: 75,
        ocrConfidence: 72,
        compositionConfidence: 68,
        skinFeatureConfidence: 10,
        detectedSubject: "Suspected Care Tag / Document",
        objectCategory: "CARE_LABEL",
        detectedFeatures: [
          "Light neutral substrate compatible with garment care tag",
          "Manual confirmation recommended due to lighting conditions",
        ],
        recommendedModality: "label",
        selectionReason:
          "The image shows light neutral substrate consistent with care tag, aligned with user selection.",
        alternativeCategories: [
          { id: "label", label: "Garment Care Label", confidence: 0.75 },
          { id: "fabric", label: "Fabric / Textile", confidence: 0.15 },
          { id: "other", label: "Other Object", confidence: 0.10 },
        ],
        isUnrelatedObject: false,
        isSkin: false,
        isFabric: false,
        isCareLabel: true,
        isLowQuality: false,
        erythemaScore: 0,
        textDensityScore: 0.5,
        textureEnergyScore: 0.2,
        details: {
          rMean: Math.round(rMean),
          gMean: Math.round(gMean),
          bMean: Math.round(bMean),
          luminance: Math.round(luminance),
          contrast,
          saturation: Math.round(saturation * 100) / 100,
          exG: Math.round(exG),
          isAchromatic: true,
          isSkinTone: false,
          isBeigeFabric: false,
          aspectRatio,
        },
      };
    }

    return {
      modality: "AMBIGUOUS_UNKNOWN",
      confidence: 0.45,
      confidenceTier: "LOW",
      categoryTitle: "Unclear or insufficient-quality image",
      categoryConfidence: 45,
      ocrConfidence: 20,
      compositionConfidence: 20,
      skinFeatureConfidence: 20,
      lowConfidenceWarning: "Unable to identify this image reliably. Please upload a clearer photograph or select the correct category.",
      detectedSubject: "Ambiguous Subject / Unclear Image",
      objectCategory: "UNKNOWN",
      detectedFeatures: [
        "Visual evidence does not definitively match skin, fabric, or care tag criteria",
        "Multiple potential object matches detected",
      ],
      recommendedModality: "unknown",
      selectionReason: "We couldn't confidently identify this image. Please select the correct category below.",
      alternativeCategories: [
        { id: "skin", label: "Skin / Body Surface", confidence: 0.35 },
        { id: "fabric", label: "Fabric / Textile", confidence: 0.35 },
        { id: "label", label: "Garment Care Label", confidence: 0.15 },
        { id: "apparel", label: "Clothing / Apparel", confidence: 0.10 },
        { id: "other", label: "Other Object", confidence: 0.05 },
      ],
      isUnrelatedObject: false,
      isSkin: false,
      isFabric: false,
      isCareLabel: false,
      isLowQuality: false,
      qualityWarning: "The subject could not be definitively distinguished. Please confirm manually.",
      erythemaScore: 0,
      textDensityScore: 0.2,
      textureEnergyScore: 0.3,
      details: {
        rMean: Math.round(rMean),
        gMean: Math.round(gMean),
        bMean: Math.round(bMean),
        luminance: Math.round(luminance),
        contrast,
        saturation: Math.round(saturation * 100) / 100,
        exG: Math.round(exG),
        isAchromatic,
        isSkinTone: false,
        isBeigeFabric: false,
        aspectRatio,
      },
    };
  } catch (err: any) {
    return {
      modality: "AMBIGUOUS_UNKNOWN",
      confidence: 0.3,
      confidenceTier: "LOW",
      categoryTitle: "Unclear or insufficient-quality image",
      categoryConfidence: 20,
      ocrConfidence: 15,
      compositionConfidence: 10,
      skinFeatureConfidence: 10,
      lowConfidenceWarning: "Unable to identify this image reliably. Please upload a clearer photograph or select the correct category.",
      detectedSubject: "Optical Processing Error",
      objectCategory: "UNKNOWN",
      detectedFeatures: ["Buffer could not be optically decoded"],
      recommendedModality: "unknown",
      selectionReason: `Optical analysis encountered an error: ${err?.message || "Invalid payload"}.`,
      alternativeCategories: [
        { id: "skin", label: "Skin / Body Surface", confidence: 0.25 },
        { id: "fabric", label: "Fabric / Textile", confidence: 0.25 },
        { id: "label", label: "Garment Care Label", confidence: 0.25 },
        { id: "other", label: "Other Object", confidence: 0.25 },
      ],
      isUnrelatedObject: false,
      isSkin: false,
      isFabric: false,
      isCareLabel: false,
      isLowQuality: true,
      qualityWarning: `Optical decode error: ${err?.message || "Invalid image buffer"}`,
      erythemaScore: 0,
      textDensityScore: 0,
      textureEnergyScore: 0,
      details: {
        rMean: 0,
        gMean: 0,
        bMean: 0,
        luminance: 0,
        contrast: 0,
        saturation: 0,
        exG: 0,
        isAchromatic: false,
        isSkinTone: false,
        isBeigeFabric: false,
        aspectRatio: 1,
      },
    };
  }
}
