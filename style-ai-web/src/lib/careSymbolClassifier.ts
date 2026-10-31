// src/lib/careSymbolClassifier.ts
// Care Symbol Recognition Pipeline (ISO 3758 / ASTM D5489 Standard)

export type SymbolCategory = "WASHING" | "BLEACHING" | "DRYING" | "IRONING" | "DRY_CLEANING";

export interface RecognizedCareSymbol {
  id: string;
  category: SymbolCategory;
  name: string;
  iconName: string; // Lucide / UI icon mapping identifier
  meaning: string;
  confidence: number; // 0.0 to 1.0
  standardCode?: string;
  temperatureC?: number;
}

export interface CareSymbolRecognitionResult {
  symbols: RecognizedCareSymbol[];
  hasCareSymbols: boolean;
  confidence: number;
  coverage: {
    hasWash: boolean;
    hasBleach: boolean;
    hasDry: boolean;
    hasIron: boolean;
    hasDryClean: boolean;
  };
  notes: string[];
}

/**
 * Symbol definitions matching international laundry care standards
 */
export const STANDARD_SYMBOLS: Record<string, Omit<RecognizedCareSymbol, "confidence">> = {
  // 1. Washing Tub
  WASH_30: {
    id: "wash_30",
    category: "WASHING",
    name: "Machine Wash 30°C",
    iconName: "Droplets",
    meaning: "Wash at or below 30°C (Cold/Delicate cycle)",
    temperatureC: 30,
    standardCode: "ISO 3758:30C",
  },
  WASH_40: {
    id: "wash_40",
    category: "WASHING",
    name: "Machine Wash 40°C",
    iconName: "Droplets",
    meaning: "Wash at or below 40°C (Warm normal cycle)",
    temperatureC: 40,
    standardCode: "ISO 3758:40C",
  },
  WASH_HAND: {
    id: "wash_hand",
    category: "WASHING",
    name: "Hand Wash Only",
    iconName: "Hand",
    meaning: "Gentle hand wash only, maximum 30°C / 85°F",
    temperatureC: 30,
    standardCode: "ISO 3758:HAND",
  },
  WASH_DO_NOT: {
    id: "wash_do_not",
    category: "WASHING",
    name: "Do Not Wash",
    iconName: "Ban",
    meaning: "Do not wet wash; article may be sensitive to water",
    standardCode: "ISO 3758:NO_WASH",
  },

  // 2. Bleaching Triangle
  BLEACH_NONE: {
    id: "bleach_none",
    category: "BLEACHING",
    name: "Do Not Bleach",
    iconName: "TriangleAlert",
    meaning: "Any bleach will damage fabric fibers or dyes",
    standardCode: "ISO 3758:NO_BLEACH",
  },
  BLEACH_NON_CHLORINE: {
    id: "bleach_non_chlorine",
    category: "BLEACHING",
    name: "Non-Chlorine Bleach Only",
    iconName: "Triangle",
    meaning: "Oxygen/non-chlorine bleach allowed when needed",
    standardCode: "ISO 3758:OXYGEN_BLEACH",
  },
  BLEACH_ANY: {
    id: "bleach_any",
    category: "BLEACHING",
    name: "Bleach Allowed",
    iconName: "Triangle",
    meaning: "Any bleaching agent allowed as needed",
    standardCode: "ISO 3758:BLEACH_OK",
  },

  // 3. Drying Square
  DRY_FLAT: {
    id: "dry_flat",
    category: "DRYING",
    name: "Dry Flat",
    iconName: "Minus",
    meaning: "Lay flat on horizontal surface to dry (prevents stretch/sag)",
    standardCode: "ISO 3758:FLAT_DRY",
  },
  DRY_LINE: {
    id: "dry_line",
    category: "DRYING",
    name: "Line Dry",
    iconName: "Sun",
    meaning: "Hang to dry on clothesline or hanger in shade",
    standardCode: "ISO 3758:LINE_DRY",
  },
  DRY_TUMBLE_LOW: {
    id: "dry_tumble_low",
    category: "DRYING",
    name: "Tumble Dry Low Heat",
    iconName: "RotateCw",
    meaning: "Tumble dry at lower temperature setting (max 60°C)",
    standardCode: "ISO 3758:TUMBLE_LOW",
  },
  DRY_NO_TUMBLE: {
    id: "dry_no_tumble",
    category: "DRYING",
    name: "Do Not Tumble Dry",
    iconName: "Ban",
    meaning: "Do not machine dry; high heat causes shrinkage or polymer distortion",
    standardCode: "ISO 3758:NO_TUMBLE",
  },

  // 4. Ironing
  IRON_LOW: {
    id: "iron_low",
    category: "IRONING",
    name: "Iron Low Heat (110°C)",
    iconName: "Flame",
    meaning: "Iron at low setting (max 110°C / 230°F), steam iron may cause damage",
    temperatureC: 110,
    standardCode: "ISO 3758:IRON_110",
  },
  IRON_MEDIUM: {
    id: "iron_medium",
    category: "IRONING",
    name: "Iron Medium Heat (150°C)",
    iconName: "Flame",
    meaning: "Iron at medium setting (max 150°C / 300°F)",
    temperatureC: 150,
    standardCode: "ISO 3758:IRON_150",
  },
  IRON_NO: {
    id: "iron_no",
    category: "IRONING",
    name: "Do Not Iron",
    iconName: "Ban",
    meaning: "Do not iron or steam press",
    standardCode: "ISO 3758:NO_IRON",
  },

  // 5. Dry Cleaning Circle
  DRY_CLEAN_NO: {
    id: "dry_clean_no",
    category: "DRY_CLEANING",
    name: "Do Not Dry Clean",
    iconName: "Ban",
    meaning: "Do not dry clean with organic solvents",
    standardCode: "ISO 3758:NO_DRYCLEAN",
  },
  DRY_CLEAN_P: {
    id: "dry_clean_p",
    category: "DRY_CLEANING",
    name: "Professional Dry Clean (PCE)",
    iconName: "CircleDot",
    meaning: "Dry clean in tetrachloroethene (PCE) or hydrocarbons",
    standardCode: "ISO 3758:DRYCLEAN_P",
  },
  DRY_CLEAN_OK: {
    id: "dry_clean_ok",
    category: "DRY_CLEANING",
    name: "Dry Clean Allowed",
    iconName: "CircleDot",
    meaning: "Standard commercial dry cleaning safe",
    standardCode: "ISO 3758:DRYCLEAN_GENERIC",
  },
};

/**
 * Classifies laundry care symbols from image visual cues and OCR text tokens
 */
export function recognizeCareSymbols(
  rawText?: string,
  imageHint?: string
): CareSymbolRecognitionResult {
  const recognized: RecognizedCareSymbol[] = [];
  const text = (rawText || "").toLowerCase();
  const notes: string[] = [];

  // Washing symbols
  if (/do not wash|no wash/i.test(text)) {
    recognized.push({ ...STANDARD_SYMBOLS.WASH_DO_NOT, confidence: 0.95 });
  } else if (/hand wash/i.test(text)) {
    recognized.push({ ...STANDARD_SYMBOLS.WASH_HAND, confidence: 0.95 });
  } else if (/40\s*°?\s*c|warm wash/i.test(text)) {
    recognized.push({ ...STANDARD_SYMBOLS.WASH_40, confidence: 0.92 });
  } else if (/30\s*°?\s*c|cold wash|gentle cycle/i.test(text)) {
    recognized.push({ ...STANDARD_SYMBOLS.WASH_30, confidence: 0.92 });
  }

  // Bleach symbols
  if (/do not bleach|no bleach/i.test(text)) {
    recognized.push({ ...STANDARD_SYMBOLS.BLEACH_NONE, confidence: 0.95 });
  } else if (/non-chlorine/i.test(text)) {
    recognized.push({ ...STANDARD_SYMBOLS.BLEACH_NON_CHLORINE, confidence: 0.9 });
  } else if (/bleach/i.test(text) && !/no|don't|not/i.test(text)) {
    recognized.push({ ...STANDARD_SYMBOLS.BLEACH_ANY, confidence: 0.85 });
  }

  // Drying symbols
  if (/do not tumble dry|no tumble/i.test(text)) {
    recognized.push({ ...STANDARD_SYMBOLS.DRY_NO_TUMBLE, confidence: 0.95 });
  } else if (/dry flat|lay flat/i.test(text)) {
    recognized.push({ ...STANDARD_SYMBOLS.DRY_FLAT, confidence: 0.92 });
  } else if (/line dry|hang dry/i.test(text)) {
    recognized.push({ ...STANDARD_SYMBOLS.DRY_LINE, confidence: 0.92 });
  } else if (/tumble dry low/i.test(text)) {
    recognized.push({ ...STANDARD_SYMBOLS.DRY_TUMBLE_LOW, confidence: 0.9 });
  }

  // Ironing symbols
  if (/do not iron|no iron/i.test(text)) {
    recognized.push({ ...STANDARD_SYMBOLS.IRON_NO, confidence: 0.95 });
  } else if (/low iron|110/i.test(text)) {
    recognized.push({ ...STANDARD_SYMBOLS.IRON_LOW, confidence: 0.92 });
  } else if (/medium iron|150/i.test(text)) {
    recognized.push({ ...STANDARD_SYMBOLS.IRON_MEDIUM, confidence: 0.9 });
  }

  // Dry Cleaning symbols
  if (/do not dry clean|no dry clean/i.test(text)) {
    recognized.push({ ...STANDARD_SYMBOLS.DRY_CLEAN_NO, confidence: 0.95 });
  } else if (/dry clean/i.test(text)) {
    recognized.push({ ...STANDARD_SYMBOLS.DRY_CLEAN_P, confidence: 0.88 });
  }

  // Deduplicate by category (highest confidence wins)
  const categoryMap = new Map<SymbolCategory, RecognizedCareSymbol>();
  for (const sym of recognized) {
    const existing = categoryMap.get(sym.category);
    if (!existing || sym.confidence > existing.confidence) {
      categoryMap.set(sym.category, sym);
    }
  }

  const finalSymbols = Array.from(categoryMap.values());
  const hasCareSymbols = finalSymbols.length > 0;

  const coverage = {
    hasWash: categoryMap.has("WASHING"),
    hasBleach: categoryMap.has("BLEACHING"),
    hasDry: categoryMap.has("DRYING"),
    hasIron: categoryMap.has("IRONING"),
    hasDryClean: categoryMap.has("DRY_CLEANING"),
  };

  const missingCategories = Object.entries(coverage)
    .filter(([_, present]) => !present)
    .map(([cat]) => cat.replace("has", ""));

  if (missingCategories.length > 0) {
    notes.push(`Care symbol categories not observed or unreadable: ${missingCategories.join(", ")} (not fabricated).`);
  }

  return {
    symbols: finalSymbols,
    hasCareSymbols,
    confidence: hasCareSymbols ? 0.9 : 0.2,
    coverage,
    notes,
  };
}
