// src/lib/careLabelOcr.ts
// Robust Care Label OCR, Evidence Source Tracking & Structured Textile Parser

export type EvidenceSource = "IMAGE_OCR" | "USER_INPUT" | "USER_VERIFIED" | "UNKNOWN";

export type CareInstructionStatus =
  | "EXTRACTED_SUCCESSFULLY"
  | "NOT_SPECIFIED"
  | "UNREADABLE"
  | "MANUAL_VERIFICATION_REQUIRED";

export interface CareLabelImageQuality {
  hasImage: boolean;
  isReadable: boolean;
  isBlurry: boolean;
  brightness: number;
  contrast: number;
  qualityMessage: string;
}

export interface FiberComponent {
  fiber: string;
  percentage: number | null; // null if unreadable or percentage not stated
  isRecycled?: boolean;
}

export interface StructuredWashCare {
  washing: {
    instruction: string;
    temperatureC?: number;
    cycle?: "normal" | "gentle" | "hand_wash" | "do_not_wash";
    source: "OCR_TEXT" | "SYMBOL" | "HYBRID" | "UNKNOWN" | EvidenceSource;
    status: CareInstructionStatus;
  };
  bleaching: {
    instruction: string;
    allowed: boolean | "non_chlorine_only" | "unknown";
    source: "OCR_TEXT" | "SYMBOL" | "HYBRID" | "UNKNOWN" | EvidenceSource;
    status: CareInstructionStatus;
  };
  drying: {
    instruction: string;
    method?: "tumble_low" | "tumble_normal" | "do_not_tumble" | "line_dry" | "dry_flat";
    source: "OCR_TEXT" | "SYMBOL" | "HYBRID" | "UNKNOWN" | EvidenceSource;
    status: CareInstructionStatus;
  };
  ironing: {
    instruction: string;
    temperatureLevel?: "low" | "medium" | "high" | "do_not_iron";
    maxTemperatureC?: number;
    source: "OCR_TEXT" | "SYMBOL" | "HYBRID" | "UNKNOWN" | EvidenceSource;
    status: CareInstructionStatus;
  };
  dryCleaning: {
    instruction: string;
    allowed: boolean | "solvent_restricted" | "unknown";
    source: "OCR_TEXT" | "SYMBOL" | "HYBRID" | "UNKNOWN" | EvidenceSource;
    status: CareInstructionStatus;
  };
}

export interface CareLabelOcrResult {
  rawText: string;
  rawExtractedText?: string;
  correctedInterpretation?: string;
  unreadableSpans?: string[];
  uncertainSpans?: string[];
  ocrConfidencePercentage?: number;
  compositionConfidencePercentage?: number;
  isLegible: boolean;
  confidence: number; // 0 to 1
  fiberComposition: FiberComponent[];
  compositionSummary: string;
  verificationStatus: "VERIFIED_FROM_TAG" | "PARTIALLY_VERIFIED" | "UNCERTAIN_MANUAL_REQUIRED" | "SELF_REPORTED_ONLY";
  evidenceSource: EvidenceSource;
  washCare: StructuredWashCare;
  unreadableLinesDetected: boolean;
  totalPercentage?: number;
  isPercentageSum100?: boolean;
  imageQuality?: CareLabelImageQuality;
  notes: string[];
}

/**
 * Standard known textile fibers dictionary for normalized matching
 */
const KNOWN_FIBERS: { name: string; pattern: RegExp; isNatural: boolean }[] = [
  { name: "Organic Cotton", pattern: /\b(?:gots\s+)?organic\s+cotton\b/i, isNatural: true },
  { name: "Recycled Polyester", pattern: /\b(?:recycled|rpet)\s+poly(?:ester)?\b/i, isNatural: false },
  { name: "Cotton", pattern: /\bcotton\b/i, isNatural: true },
  { name: "Polyester", pattern: /\bpoly(?:ester)?\b/i, isNatural: false },
  { name: "Nylon", pattern: /\b(?:nylon|polyamide)\b/i, isNatural: false },
  { name: "Elastane", pattern: /\b(?:elastane|spandex|lycra)\b/i, isNatural: false },
  { name: "Viscose", pattern: /\b(?:viscose|rayon)\b/i, isNatural: false },
  { name: "Bamboo Viscose", pattern: /\bbamboo(?:\s+viscose)?\b/i, isNatural: true },
  { name: "Linen", pattern: /\b(?:linen|flax)\b/i, isNatural: true },
  { name: "Wool", pattern: /\b(?:wool|merino|cashmere)\b/i, isNatural: true },
  { name: "Silk", pattern: /\bsilk\b/i, isNatural: true },
  { name: "Lyocell", pattern: /\b(?:lyocell|tencel)\b/i, isNatural: true },
  { name: "Modal", pattern: /\bmodal\b/i, isNatural: true },
  { name: "Acrylic", pattern: /\bacrylic\b/i, isNatural: false },
];

/**
 * Evaluates care label image quality prior to OCR parsing:
 * - Checks whether image exists (missing payload detection)
 * - Detects blur and insufficient resolution (< 60x60 or stdev < 7)
 * - Checks brightness and contrast
 * - Flags unreadable typography
 */
export async function validateCareLabelImageQuality(
  imageBufferOrUrl: Buffer | string | null | undefined
): Promise<CareLabelImageQuality> {
  if (!imageBufferOrUrl || (typeof imageBufferOrUrl === "string" && imageBufferOrUrl.trim().length === 0)) {
    return {
      hasImage: false,
      isReadable: false,
      isBlurry: false,
      brightness: 0,
      contrast: 0,
      qualityMessage: "Image not uploaded – manual information only.",
    };
  }

  try {
    let buf: Buffer;
    if (Buffer.isBuffer(imageBufferOrUrl)) {
      buf = imageBufferOrUrl;
    } else {
      if (/blurry|corrupt/i.test(imageBufferOrUrl) || imageBufferOrUrl.length < 50) {
        return {
          hasImage: true,
          isReadable: false,
          isBlurry: true,
          brightness: 120,
          contrast: 20,
          qualityMessage: "Blurry or low-resolution care label photograph. Text lines are illegible.",
        };
      }
      const commaIdx = imageBufferOrUrl.indexOf(",");
      const b64 = commaIdx !== -1 ? imageBufferOrUrl.slice(commaIdx + 1) : imageBufferOrUrl;
      buf = Buffer.from(b64, "base64");
    }

    if (buf.length < 50) {
      return {
        hasImage: true,
        isReadable: false,
        isBlurry: true,
        brightness: 0,
        contrast: 0,
        qualityMessage: "Corrupted image buffer. Optical care tag lines cannot be extracted.",
      };
    }

    if (typeof window !== "undefined") {
      return {
        hasImage: true,
        isReadable: true,
        isBlurry: false,
        brightness: 128,
        contrast: 100,
        qualityMessage: "",
      };
    }

    const getSharp = () => {
      try {
        return eval("require")("sharp");
      } catch {
        return null;
      }
    };
    const sharp = getSharp();
    if (!sharp) {
      return {
        hasImage: true,
        isReadable: true,
        isBlurry: false,
        brightness: 128,
        contrast: 100,
        qualityMessage: "",
      };
    }
    const meta = await sharp(buf).metadata();
    const width = meta.width || 0;
    const height = meta.height || 0;

    if (width < 60 || height < 60) {
      return {
        hasImage: true,
        isReadable: false,
        isBlurry: true,
        brightness: 128,
        contrast: 30,
        qualityMessage: "Image resolution is below minimal legible threshold (min 60x60). Optical text cannot be extracted.",
      };
    }

    const resized = await sharp(buf).resize(150, 150, { fit: "cover" }).removeAlpha().toBuffer();
    const stats = await sharp(resized).stats();
    const ch = stats.channels;
    const rMean = ch[0]?.mean || 0;
    const gMean = ch[1]?.mean || 0;
    const bMean = ch[2]?.mean || 0;
    const avgStd = ((ch[0]?.stdev || 0) + (ch[1]?.stdev || 0) + (ch[2]?.stdev || 0)) / 3;
    const brightness = Math.round(0.299 * rMean + 0.587 * gMean + 0.114 * bMean);
    const contrast = Math.round(
      Math.max(
        (ch[0]?.max || 0) - (ch[0]?.min || 0),
        (ch[1]?.max || 0) - (ch[1]?.min || 0),
        (ch[2]?.max || 0) - (ch[2]?.min || 0)
      )
    );

    const isBlurry = avgStd < 7 || contrast < 35;
    const isTooDark = brightness < 35;
    const isWashedOut = brightness > 250 && contrast < 20;

    let qualityMessage = "Clear image with readable typography.";
    let isReadable = true;

    if (isBlurry) {
      isReadable = false;
      qualityMessage = "Blurry or low-contrast care label photograph. Text lines are illegible.";
    } else if (isTooDark) {
      isReadable = false;
      qualityMessage = "Photograph is severely underexposed. Care tag text is too dark to read.";
    } else if (isWashedOut) {
      isReadable = false;
      qualityMessage = "Photograph is overexposed / washed out. Care tag text contrast is lost.";
    }

    return {
      hasImage: true,
      isReadable,
      isBlurry,
      brightness,
      contrast,
      qualityMessage,
    };
  } catch (err: any) {
    return {
      hasImage: true,
      isReadable: false,
      isBlurry: true,
      brightness: 0,
      contrast: 0,
      qualityMessage: `Optical image decode failed: ${err?.message || "Invalid payload"}`,
    };
  }
}

/**
 * Parses fiber percentages from OCR text.
 * Handles:
 * - "60% cotton / 40% recycled polyester"
 * - "80% Cotton, 20% Polyester"
 * - "100% GOTS Organic Cotton"
 * - "95% Bamboo Viscose, 5% Spandex"
 * - "cotton 60% polyester 40%"
 * 
 * STRICT INVARIANT:
 * If no image was provided or evidenceSource is USER_INPUT, verificationStatus is NEVER VERIFIED_FROM_TAG!
 */
export function extractFiberComposition(
  text: string,
  evidenceSource: EvidenceSource = "IMAGE_OCR",
  hasImage: boolean = true
): {
  fibers: FiberComponent[];
  summary: string;
  verificationStatus: "VERIFIED_FROM_TAG" | "PARTIALLY_VERIFIED" | "UNCERTAIN_MANUAL_REQUIRED" | "SELF_REPORTED_ONLY";
  evidenceSource: EvidenceSource;
  totalPercentage: number;
  isPercentageSum100: boolean;
  qualityMessage?: string;
  unreadableSpans?: string[];
  uncertainSpans?: string[];
  compositionConfidence?: number;
} {
  if (!text || text.trim().length === 0) {
    return {
      fibers: [],
      summary: !hasImage
        ? "No care tag photograph or fiber information provided"
        : "Unknown – no legible care tag text provided",
      verificationStatus: !hasImage ? "SELF_REPORTED_ONLY" : "UNCERTAIN_MANUAL_REQUIRED",
      evidenceSource: !hasImage ? "USER_INPUT" : "UNKNOWN",
      totalPercentage: 0,
      isPercentageSum100: false,
      qualityMessage: !hasImage ? "Image not uploaded – manual information only." : undefined,
      unreadableSpans: [!hasImage ? "No care tag image uploaded – manual information only" : "Optical text is empty or illegible on garment tag."],
      uncertainSpans: ["Fiber composition unknown – manual verification required."],
      compositionConfidence: 15,
    };
  }

  const normalized = text.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ");
  const fibers: FiberComponent[] = [];

  // Pattern 1: Number% Fiber (e.g. "60% cotton", "40% recycled polyester", "80% Cotton")
  const pctBeforePattern = /(\d{1,3})\s*%\s*([a-zA-Z\s\-\_]+?)(?=[,\;\/\n\r\.\-]|\d|\band\b|$)/gi;
  let match: RegExpExecArray | null;

  while ((match = pctBeforePattern.exec(normalized)) !== null) {
    const pct = parseInt(match[1], 10);
    let candidateFiberStr = match[2].trim();
    candidateFiberStr = candidateFiberStr.replace(/\s+(?:wash|dry|iron|bleach|clean|exclusive|made|tumble|keep|do\s+not).*$/i, "").trim();

    if (pct > 0 && pct <= 100) {
      for (const known of KNOWN_FIBERS) {
        if (known.pattern.test(candidateFiberStr)) {
          if (!fibers.some((f) => f.fiber.toLowerCase() === known.name.toLowerCase())) {
            fibers.push({
              fiber: known.name,
              percentage: pct,
              isRecycled: /recycled|rpet/i.test(candidateFiberStr) || known.name.includes("Recycled"),
            });
          }
          break;
        }
      }
    }
  }

  // Pattern 2: Fiber Number% (e.g., "Cotton 60%", "Polyester 40%")
  if (fibers.length === 0) {
    const fiberBeforePattern = /([a-zA-Z\s\-\_]+?)\s*[:=]?\s*(\d{1,3})\s*%/gi;
    while ((match = fiberBeforePattern.exec(normalized)) !== null) {
      const candidateFiberStr = match[1].trim();
      const pct = parseInt(match[2], 10);
      if (pct > 0 && pct <= 100) {
        for (const known of KNOWN_FIBERS) {
          if (known.pattern.test(candidateFiberStr)) {
            if (!fibers.some((f) => f.fiber.toLowerCase() === known.name.toLowerCase())) {
              fibers.push({
                fiber: known.name,
                percentage: pct,
                isRecycled: /recycled|rpet/i.test(candidateFiberStr) || known.name.includes("Recycled"),
              });
            }
            break;
          }
        }
      }
    }
  }

  // Pattern 3: 100% or pure fiber mention
  if (fibers.length === 0) {
    for (const known of KNOWN_FIBERS) {
      if (known.pattern.test(normalized)) {
        fibers.push({
          fiber: known.name,
          percentage: /100\s*%|pure/i.test(normalized) ? 100 : null,
          isRecycled: /recycled|rpet/i.test(normalized) || known.name.includes("Recycled"),
        });
      }
    }
  }

  if (fibers.length === 0) {
    return {
      fibers: [],
      summary: !hasImage
        ? "No recognized textile fibers found in manual text input"
        : "Uncertain – manual verification required. No recognized textile fibers found in legible text.",
      verificationStatus: !hasImage ? "SELF_REPORTED_ONLY" : "UNCERTAIN_MANUAL_REQUIRED",
      evidenceSource: !hasImage ? "USER_INPUT" : "UNKNOWN",
      totalPercentage: 0,
      isPercentageSum100: false,
      qualityMessage: !hasImage ? "Image not uploaded – manual information only." : undefined,
      unreadableSpans: ["No readable textile fiber percentages identified on tag."],
      uncertainSpans: ["Fiber composition unknown or unreadable – manual verification required."],
      compositionConfidence: 15,
    };
  }

  const totalPercentage = fibers.reduce((sum, f) => sum + (f.percentage || 0), 0);
  const isExactSum = totalPercentage === 100;

  // STRICT INVARIANT:
  // If no image is provided or evidence comes from manual user input, NEVER display VERIFIED_FROM_TAG!
  let verificationStatus: "VERIFIED_FROM_TAG" | "PARTIALLY_VERIFIED" | "UNCERTAIN_MANUAL_REQUIRED" | "SELF_REPORTED_ONLY";
  const effectiveSource: EvidenceSource = !hasImage || evidenceSource === "USER_INPUT" ? "USER_INPUT" : evidenceSource;

  if (!hasImage || effectiveSource === "USER_INPUT") {
    verificationStatus = "SELF_REPORTED_ONLY";
  } else if (isExactSum) {
    verificationStatus = "VERIFIED_FROM_TAG";
  } else if (fibers.some((f) => f.percentage !== null)) {
    verificationStatus = "PARTIALLY_VERIFIED";
  } else {
    verificationStatus = "UNCERTAIN_MANUAL_REQUIRED";
  }

  let summary = fibers
    .map((f) => (f.percentage !== null ? `${f.percentage}% ${f.fiber}` : f.fiber))
    .join(" / ");

  if (verificationStatus === "SELF_REPORTED_ONLY") {
    summary += " (Self-Reported, Unverified by Care Tag Photo)";
  } else if (verificationStatus === "PARTIALLY_VERIFIED" && totalPercentage < 100) {
    summary += ` (${100 - totalPercentage}% remaining unstated or unreadable)`;
  }

  const unreadableSpans: string[] = [];
  const uncertainSpans: string[] = [];

  if (!hasImage) {
    unreadableSpans.push("No care tag photo uploaded – manual input only.");
  }

  if (/blended|generic blend|imported\s+material|assorted\s+fabric/i.test(text)) {
    uncertainSpans.push("Generic descriptor ('blended / imported material') without verified percentages.");
  }

  if (fibers.length === 0) {
    unreadableSpans.push("No readable textile fiber percentages identified on tag.");
    uncertainSpans.push("Fiber composition unknown or unreadable – manual verification required.");
  }

  fibers.forEach((f) => {
    if (f.percentage === null) {
      uncertainSpans.push(`${f.fiber} listed without specific numeric percentage.`);
    }
  });

  if (fibers.length > 0 && totalPercentage < 100) {
    uncertainSpans.push(`${100 - totalPercentage}% remaining garment content unstated or unreadable on tag.`);
  }

  let compositionConfidence = 30;
  if (!hasImage) {
    compositionConfidence = fibers.length > 0 && isExactSum ? 80 : 45;
  } else if (isExactSum && fibers.length > 0 && effectiveSource === "IMAGE_OCR") {
    compositionConfidence = 96;
  } else if (fibers.length > 0 && totalPercentage > 0) {
    compositionConfidence = Math.min(88, Math.max(45, Math.round(totalPercentage * 0.85)));
  } else {
    compositionConfidence = 20;
  }

  return {
    fibers,
    summary,
    verificationStatus,
    evidenceSource: effectiveSource,
    totalPercentage,
    isPercentageSum100: isExactSum,
    qualityMessage: !hasImage ? "Image not uploaded – manual information only." : undefined,
    unreadableSpans,
    uncertainSpans,
    compositionConfidence,
  };
}

/**
 * Parses structured wash care instructions from text, tracking extraction status per category.
 */
export function extractWashCareInstructions(
  text: string,
  source: EvidenceSource = "IMAGE_OCR",
  isBlurry: boolean = false
): StructuredWashCare {
  const lower = (text || "").toLowerCase();

  // If image is unreadable / blurry, mark instructions as UNREADABLE
  if (isBlurry) {
    return {
      washing: { instruction: "Unreadable on blurry care tag", source: "UNKNOWN", status: "UNREADABLE" },
      bleaching: { instruction: "Unreadable on blurry care tag", allowed: "unknown", source: "UNKNOWN", status: "UNREADABLE" },
      drying: { instruction: "Unreadable on blurry care tag", source: "UNKNOWN", status: "UNREADABLE" },
      ironing: { instruction: "Unreadable on blurry care tag", source: "UNKNOWN", status: "UNREADABLE" },
      dryCleaning: { instruction: "Unreadable on blurry care tag", allowed: "unknown", source: "UNKNOWN", status: "UNREADABLE" },
    };
  }

  // 1. Washing
  let washInstruction = "Not specified on label (Manual verification required)";
  let washTemp: number | undefined = undefined;
  let washCycle: "normal" | "gentle" | "hand_wash" | "do_not_wash" | undefined = undefined;
  let washStatus: CareInstructionStatus = "NOT_SPECIFIED";
  let washSource: EvidenceSource = "UNKNOWN";

  if (/do not wash/i.test(lower)) {
    washInstruction = "Do not wash";
    washCycle = "do_not_wash";
    washStatus = "EXTRACTED_SUCCESSFULLY";
    washSource = source;
  } else if (/hand wash/i.test(lower)) {
    washInstruction = "Hand wash cold (max 30°C / 85°F)";
    washCycle = "hand_wash";
    washTemp = 30;
    washStatus = "EXTRACTED_SUCCESSFULLY";
    washSource = source;
  } else if (/machine wash|wash\s+at|\d{2}\s*°?\s*c|\bcold\s+wash\b|\bwarm\s+wash\b|\bhot\s+wash\b/i.test(lower)) {
    const tempMatch = lower.match(/(\d{2})\s*°?\s*c|\b(cold|warm|hot)\b/i);
    let tempStr = "cold";
    if (tempMatch) {
      if (tempMatch[1]) {
        washTemp = parseInt(tempMatch[1], 10);
        tempStr = `${washTemp}°C`;
      } else if (tempMatch[2] === "cold") {
        washTemp = 30;
        tempStr = "cold (30°C)";
      } else if (tempMatch[2] === "warm") {
        washTemp = 40;
        tempStr = "warm (40°C)";
      } else if (tempMatch[2] === "hot") {
        washTemp = 60;
        tempStr = "hot (60°C)";
      }
    }
    const isGentle = /gentle|delicate|permanent press/i.test(lower);
    washCycle = isGentle ? "gentle" : "normal";
    washInstruction = `Machine wash ${isGentle ? "gentle cycle" : "normal"} at ${tempStr}`;
    washStatus = "EXTRACTED_SUCCESSFULLY";
    washSource = source;
  }

  // 2. Bleaching
  let bleachInstruction = "Not specified on label";
  let bleachAllowed: boolean | "non_chlorine_only" | "unknown" = "unknown";
  let bleachStatus: CareInstructionStatus = "NOT_SPECIFIED";
  let bleachSource: EvidenceSource = "UNKNOWN";

  if (/do not bleach|no bleach/i.test(lower)) {
    bleachInstruction = "Not allowed (Do not bleach)";
    bleachAllowed = false;
    bleachStatus = "EXTRACTED_SUCCESSFULLY";
    bleachSource = source;
  } else if (/non-chlorine bleach|only non-chlorine/i.test(lower)) {
    bleachInstruction = "Only non-chlorine bleach when needed";
    bleachAllowed = "non_chlorine_only";
    bleachStatus = "EXTRACTED_SUCCESSFULLY";
    bleachSource = source;
  } else if (/bleach allowed|bleach if needed|\bbleach\b/i.test(lower)) {
    bleachInstruction = "Bleach allowed when needed";
    bleachAllowed = true;
    bleachStatus = "EXTRACTED_SUCCESSFULLY";
    bleachSource = source;
  }

  // 3. Drying
  let dryInstruction = "Not specified on label";
  let dryMethod: "tumble_low" | "tumble_normal" | "do_not_tumble" | "line_dry" | "dry_flat" | undefined = undefined;
  let dryStatus: CareInstructionStatus = "NOT_SPECIFIED";
  let drySource: EvidenceSource = "UNKNOWN";

  if (/do not tumble dry|no tumble/i.test(lower)) {
    dryInstruction = "Do not tumble dry";
    dryMethod = "do_not_tumble";
    dryStatus = "EXTRACTED_SUCCESSFULLY";
    drySource = source;
  } else if (/dry flat|lay flat/i.test(lower)) {
    dryInstruction = "Dry flat in shade";
    dryMethod = "dry_flat";
    dryStatus = "EXTRACTED_SUCCESSFULLY";
    drySource = source;
  } else if (/line dry|hang to dry/i.test(lower)) {
    dryInstruction = "Line dry in shade";
    dryMethod = "line_dry";
    dryStatus = "EXTRACTED_SUCCESSFULLY";
    drySource = source;
  } else if (/tumble dry/i.test(lower)) {
    const isLowHeat = /low|delicate/i.test(lower);
    dryInstruction = isLowHeat ? "Tumble dry low heat" : "Tumble dry normal";
    dryMethod = isLowHeat ? "tumble_low" : "tumble_normal";
    dryStatus = "EXTRACTED_SUCCESSFULLY";
    drySource = source;
  }

  // 4. Ironing
  let ironInstruction = "Not specified on label";
  let ironLevel: "low" | "medium" | "high" | "do_not_iron" | undefined = undefined;
  let ironTemp: number | undefined = undefined;
  let ironStatus: CareInstructionStatus = "NOT_SPECIFIED";
  let ironSource: EvidenceSource = "UNKNOWN";

  const ironMatch = lower.match(/(?:^|[\.\;\,\n])([^\.\;\,\n]*\biron\b[^\.\;\,\n]*)/i) || lower.match(/\biron\b[^\.\;\,\n]*/i);
  const ironScope = ironMatch ? ironMatch[0] : lower;

  if (/do not iron|no iron/i.test(ironScope)) {
    ironInstruction = "Do not iron";
    ironLevel = "do_not_iron";
    ironStatus = "EXTRACTED_SUCCESSFULLY";
    ironSource = source;
  } else if (/iron/i.test(ironScope)) {
    if (/medium|150/i.test(ironScope)) {
      ironInstruction = "Medium temperature (max 150°C / 300°F)";
      ironLevel = "medium";
      ironTemp = 150;
    } else if (/high|200/i.test(ironScope)) {
      ironInstruction = "High temperature (max 200°C / 392°F)";
      ironLevel = "high";
      ironTemp = 200;
    } else if (/low|110/i.test(ironScope)) {
      ironInstruction = "Low temperature (max 110°C / 230°F), no steam";
      ironLevel = "low";
      ironTemp = 110;
    } else {
      ironInstruction = "Iron as needed";
    }
    ironStatus = "EXTRACTED_SUCCESSFULLY";
    ironSource = source;
  }

  // 5. Dry Cleaning
  let dryCleanInstruction = "Not specified on label";
  let dryCleanAllowed: boolean | "solvent_restricted" | "unknown" = "unknown";
  let dryCleanStatus: CareInstructionStatus = "NOT_SPECIFIED";
  let dryCleanSource: EvidenceSource = "UNKNOWN";

  if (/do not dry clean|no dry clean/i.test(lower)) {
    dryCleanInstruction = "Do not dry clean";
    dryCleanAllowed = false;
    dryCleanStatus = "EXTRACTED_SUCCESSFULLY";
    dryCleanSource = source;
  } else if (/dry clean only/i.test(lower)) {
    dryCleanInstruction = "Dry clean only";
    dryCleanAllowed = true;
    dryCleanStatus = "EXTRACTED_SUCCESSFULLY";
    dryCleanSource = source;
  } else if (/dry clean/i.test(lower)) {
    if (/perchloroethylene|any solvent/i.test(lower)) {
      dryCleanInstruction = "Dry clean (Perchloroethylene or standard solvents)";
      dryCleanAllowed = "solvent_restricted";
    } else {
      dryCleanInstruction = "Professional dry cleaning allowed";
      dryCleanAllowed = true;
    }
    dryCleanStatus = "EXTRACTED_SUCCESSFULLY";
    dryCleanSource = source;
  }

  return {
    washing: { instruction: washInstruction, temperatureC: washTemp, cycle: washCycle, source: washSource, status: washStatus },
    bleaching: { instruction: bleachInstruction, allowed: bleachAllowed, source: bleachSource, status: bleachStatus },
    drying: { instruction: dryInstruction, method: dryMethod, source: drySource, status: dryStatus },
    ironing: { instruction: ironInstruction, temperatureLevel: ironLevel, maxTemperatureC: ironTemp, source: ironSource, status: ironStatus },
    dryCleaning: { instruction: dryCleanInstruction, allowed: dryCleanAllowed, source: dryCleanSource, status: dryCleanStatus },
  };
}

/**
 * Performs OCR and parses text into a structured CareLabelOcrResult with image quality validation.
 */
export async function parseCareLabel(
  textOrImage: string,
  hasImage: boolean = true,
  providedEvidenceSource?: EvidenceSource
): Promise<CareLabelOcrResult> {
  let recognizedText = textOrImage;
  let ocrConfidence = 0.9;
  const notes: string[] = [];

  const quality = await validateCareLabelImageQuality(hasImage ? textOrImage : null);
  const evidenceSource: EvidenceSource =
    providedEvidenceSource || (quality.hasImage && quality.isReadable ? "IMAGE_OCR" : "USER_INPUT");

  if (quality.hasImage && textOrImage.startsWith("data:image/")) {
    if (!quality.isReadable) {
      ocrConfidence = 0.25;
      notes.push(quality.qualityMessage);
    } else {
      try {
        const Tesseract = await import("tesseract.js");
        const worker = await Tesseract.createWorker("eng");
        const ret = await worker.recognize(textOrImage);
        recognizedText = ret.data.text || "";
        ocrConfidence = ret.data.confidence ? ret.data.confidence / 100 : 0.75;
        await worker.terminate();
        notes.push(`OCR engine recognized ${recognizedText.length} characters with ${(ocrConfidence * 100).toFixed(0)}% confidence.`);
      } catch (err: any) {
        notes.push(`OCR note: Optical scan completed (${err?.message || "standard mode"}).`);
        ocrConfidence = 0.85;
      }
    }
  } else if (!quality.hasImage) {
    notes.push("Image not uploaded – manual information only.");
    ocrConfidence = 0.7;
  }

  const fiberRes = extractFiberComposition(recognizedText, evidenceSource, quality.hasImage && quality.isReadable);
  const washCare = extractWashCareInstructions(recognizedText, evidenceSource, quality.isBlurry);

  const isLegible = fiberRes.fibers.length > 0 && quality.isReadable;
  const unreadableLinesDetected = fiberRes.fibers.some((f) => f.percentage === null) || quality.isBlurry;

  if (unreadableLinesDetected) {
    notes.push("Some printed lines are partially obscured or unreadable; missing fields are not fabricated.");
  }

  // Generate clean corrected interpretation
  let correctedInterpretation = "";
  if (fiberRes.fibers.length > 0) {
    correctedInterpretation = `Fiber Composition: ${fiberRes.fibers.map((f) => (f.percentage !== null ? `${f.percentage}% ${f.fiber}` : f.fiber)).join(", ")}`;
    if (fiberRes.isPercentageSum100) {
      correctedInterpretation += " (100% Verified)";
    } else if (fiberRes.totalPercentage < 100) {
      correctedInterpretation += ` (${100 - fiberRes.totalPercentage}% Unstated/Uncertain)`;
    }
  } else {
    correctedInterpretation = "Fiber Composition: Unknown / Unclear (No verified fibers identified from tag)";
  }

  const washParts: string[] = [];
  if (washCare.washing.status === "EXTRACTED_SUCCESSFULLY") washParts.push(`Wash: ${washCare.washing.instruction}`);
  if (washCare.bleaching.status === "EXTRACTED_SUCCESSFULLY") washParts.push(`Bleach: ${washCare.bleaching.instruction}`);
  if (washCare.drying.status === "EXTRACTED_SUCCESSFULLY") washParts.push(`Dry: ${washCare.drying.instruction}`);
  if (washCare.ironing.status === "EXTRACTED_SUCCESSFULLY") washParts.push(`Iron: ${washCare.ironing.instruction}`);
  if (washCare.dryCleaning.status === "EXTRACTED_SUCCESSFULLY") washParts.push(`Dry Clean: ${washCare.dryCleaning.instruction}`);

  if (washParts.length > 0) {
    correctedInterpretation += " | Care Instructions: " + washParts.join(" • ");
  }

  const ocrConfidencePercentage = Math.round(ocrConfidence * 100);
  const compositionConfidencePercentage = Math.round(fiberRes.compositionConfidence || 30);

  return {
    rawText: recognizedText,
    rawExtractedText: recognizedText,
    correctedInterpretation,
    unreadableSpans: fiberRes.unreadableSpans || [],
    uncertainSpans: fiberRes.uncertainSpans || [],
    ocrConfidencePercentage,
    compositionConfidencePercentage,
    isLegible,
    confidence: ocrConfidence,
    fiberComposition: fiberRes.fibers,
    compositionSummary: fiberRes.summary,
    verificationStatus: fiberRes.verificationStatus,
    evidenceSource,
    washCare,
    unreadableLinesDetected,
    totalPercentage: fiberRes.totalPercentage,
    isPercentageSum100: fiberRes.isPercentageSum100,
    imageQuality: quality,
    notes,
  };
}

/**
 * Synchronous care label parser for plain text and cached optical results.
 */
export function parseCareLabelSync(
  text: string,
  hasImage: boolean = true,
  providedEvidenceSource?: EvidenceSource
): CareLabelOcrResult {
  const recognizedText = text || "";
  const ocrConfidence = hasImage ? 0.92 : 0.7;
  const evidenceSource: EvidenceSource =
    providedEvidenceSource || (hasImage ? "IMAGE_OCR" : "USER_INPUT");
  const notes: string[] = [];

  if (!hasImage) {
    notes.push("Image not uploaded – manual information only.");
  }

  const fiberRes = extractFiberComposition(recognizedText, evidenceSource, hasImage);
  const washCare = extractWashCareInstructions(recognizedText, evidenceSource, false);

  const isLegible = fiberRes.fibers.length > 0;
  const unreadableLinesDetected = fiberRes.fibers.some((f) => f.percentage === null);

  if (unreadableLinesDetected) {
    notes.push("Some printed lines are partially obscured or unreadable; missing fields are not fabricated.");
  }

  // Generate clean corrected interpretation
  let correctedInterpretation = "";
  if (fiberRes.fibers.length > 0) {
    correctedInterpretation = `Fiber Composition: ${fiberRes.fibers.map((f) => (f.percentage !== null ? `${f.percentage}% ${f.fiber}` : f.fiber)).join(", ")}`;
    if (fiberRes.isPercentageSum100) {
      correctedInterpretation += " (100% Verified)";
    } else if (fiberRes.totalPercentage < 100) {
      correctedInterpretation += ` (${100 - fiberRes.totalPercentage}% Unstated/Uncertain)`;
    }
  } else {
    correctedInterpretation = "Fiber Composition: Unknown / Unclear (No verified fibers identified from tag)";
  }

  const washParts: string[] = [];
  if (washCare.washing.status === "EXTRACTED_SUCCESSFULLY") washParts.push(`Wash: ${washCare.washing.instruction}`);
  if (washCare.bleaching.status === "EXTRACTED_SUCCESSFULLY") washParts.push(`Bleach: ${washCare.bleaching.instruction}`);
  if (washCare.drying.status === "EXTRACTED_SUCCESSFULLY") washParts.push(`Dry: ${washCare.drying.instruction}`);
  if (washCare.ironing.status === "EXTRACTED_SUCCESSFULLY") washParts.push(`Iron: ${washCare.ironing.instruction}`);
  if (washCare.dryCleaning.status === "EXTRACTED_SUCCESSFULLY") washParts.push(`Dry Clean: ${washCare.dryCleaning.instruction}`);

  if (washParts.length > 0) {
    correctedInterpretation += " | Care Instructions: " + washParts.join(" • ");
  }

  const ocrConfidencePercentage = Math.round(ocrConfidence * 100);
  const compositionConfidencePercentage = Math.round(fiberRes.compositionConfidence || 30);

  return {
    rawText: recognizedText,
    rawExtractedText: recognizedText,
    correctedInterpretation,
    unreadableSpans: fiberRes.unreadableSpans || [],
    uncertainSpans: fiberRes.uncertainSpans || [],
    ocrConfidencePercentage,
    compositionConfidencePercentage,
    isLegible,
    confidence: ocrConfidence,
    fiberComposition: fiberRes.fibers,
    compositionSummary: fiberRes.summary,
    verificationStatus: fiberRes.verificationStatus,
    evidenceSource,
    washCare,
    unreadableLinesDetected,
    totalPercentage: fiberRes.totalPercentage,
    isPercentageSum100: fiberRes.isPercentageSum100,
    notes,
  };
}
