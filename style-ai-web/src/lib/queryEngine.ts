// src/lib/queryEngine.ts
// Intelligent Retrieval & Multi-Criteria Recommendation Engine for Style AI (1,000-Record Dataset)

import { MOCK_PRODUCTS, Product, FiberDetail } from "./products";

export interface FilterCriteria {
  query?: string;
  category?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  fit?: string;
  size?: string;
  color?: string;
  weather?: string;
  occasion?: string;
  skinType?: string;
  confirmedAllergies?: string[]; // Hard Exclusion Gate
  reportedSensitivities?: string[]; // Soft Penalty
  preferredFabrics?: string[]; // Preference Boost
  excludeMaterials?: string[]; // Chat-driven dynamic exclusion
  inStockOnly?: boolean;
  minSkinSafety?: number;
  minComfort?: number;
  limit?: number;
}

export interface ScoreBreakdown {
  skinSafetyWeight: number; // 40%
  comfortWeight: number; // 25%
  weatherFitWeight: number; // 15%
  bodyFitWeight: number; // 10%
  preferenceBoost: number; // +10%
  sensitivityPenalty: number;
  totalScore: number;
}

export interface ScoredProduct {
  product: Product;
  score: number;
  breakdown: ScoreBreakdown;
  explanation: string;
  passedAllergyGate: boolean;
  sensitivityWarnings: string[];
}

// Precomputed lowercase search index for sub-millisecond query evaluation
const SEARCH_INDEX_MAP = new Map<string, string>();
for (const p of MOCK_PRODUCTS) {
  SEARCH_INDEX_MAP.set(
    p.id,
    `${p.name} ${p.description} ${p.fabric} ${p.category} ${p.subCategory} ${(p.tags || []).join(" ")}`.toLowerCase()
  );
}

export interface QueryResult {
  items: ScoredProduct[];
  totalMatches: number;
  excludedByAllergiesCount: number;
  appliedFilters: string[];
  latencyMs: number;
}

/**
 * Checks if a product triggers any mandatory confirmed allergy.
 * If true, product is immediately purged from recommendation candidates.
 */
export function checkAllergyConflict(product: Product, confirmedAllergies: string[]): { hasConflict: boolean; conflictedAllergen: string | null } {
  if (!confirmedAllergies || confirmedAllergies.length === 0) {
    return { hasConflict: false, conflictedAllergen: null };
  }

  const pFabric = product.fabric.toLowerCase();
  const pAllergens = (product.allergens || []).map((a) => a.toLowerCase());

  for (const allergy of confirmedAllergies) {
    const aLower = allergy.toLowerCase().trim();
    if (!aLower) continue;

    // Direct allergen tag match
    if (pAllergens.some((a) => a.includes(aLower) || aLower.includes(a))) {
      return { hasConflict: true, conflictedAllergen: allergy };
    }

    // Fabric text match
    if (pFabric.includes(aLower)) {
      return { hasConflict: true, conflictedAllergen: allergy };
    }

    // Individual fiber check
    if (product.fibers && product.fibers.length > 0) {
      for (const fiber of product.fibers) {
        if (fiber.name.toLowerCase().includes(aLower)) {
          return { hasConflict: true, conflictedAllergen: allergy };
        }
      }
    }

    // Common synonym cross-checks
    if (aLower.includes("wool") && pFabric.includes("merino")) {
      return { hasConflict: true, conflictedAllergen: "Wool / Lanolin" };
    }
    if ((aLower.includes("spandex") || aLower.includes("latex")) && (pFabric.includes("elastane") || pFabric.includes("spandex"))) {
      return { hasConflict: true, conflictedAllergen: "Latex / Spandex" };
    }
    if (aLower.includes("polyester") && pFabric.includes("polyester")) {
      return { hasConflict: true, conflictedAllergen: "Polyester" };
    }
    if (aLower.includes("synthetic") && (pFabric.includes("acrylic") || pFabric.includes("nylon") || pFabric.includes("polyester"))) {
      return { hasConflict: true, conflictedAllergen: "Synthetic Fibers" };
    }
  }

  return { hasConflict: false, conflictedAllergen: null };
}

/**
 * Evaluates whether a product triggers reported general sensitivities.
 */
export function evaluateSensitivities(product: Product, reportedSensitivities: string[]): string[] {
  if (!reportedSensitivities || reportedSensitivities.length === 0) return [];
  const warnings: string[] = [];
  const pFabric = product.fabric.toLowerCase();

  for (const sens of reportedSensitivities) {
    const sLower = sens.toLowerCase();
    if (pFabric.includes("acrylic") && sLower.includes("acrylic")) {
      warnings.push("Contains acrylic knit which may cause friction itchiness.");
    }
    if (pFabric.includes("wool") && sLower.includes("wool")) {
      warnings.push("Contains wool fiber; recommend wearing a soft cotton base layer.");
    }
    if (pFabric.includes("polyester") && sLower.includes("synthetic")) {
      warnings.push("Contains synthetic polyester; monitor for sweat buildup in hot conditions.");
    }
  }

  return warnings;
}

/**
 * Generates transparent, deterministic explanation for why the product was recommended.
 */
function buildExplanation(product: Product, criteria: FilterCriteria, score: number, allergyConflictFree: boolean): string {
  const reasons: string[] = [];

  if (allergyConflictFree && criteria.confirmedAllergies && criteria.confirmedAllergies.length > 0) {
    reasons.push(`100% free of your confirmed allergies (${criteria.confirmedAllergies.join(", ")})`);
  }

  if (product.skinSafetyScore >= 95) {
    reasons.push(`highest medical skin safety (${product.skinSafetyScore}%) with hypoallergenic ${product.fabric}`);
  } else if (product.skinSafetyScore >= 80) {
    reasons.push(`solid comfort profile with ${product.skinSafetyScore}% skin tolerance`);
  }

  if (criteria.weather && product.suitableWeather.some((w) => w.toLowerCase().includes(criteria.weather!.toLowerCase()))) {
    reasons.push(`optimal thermal ventilation for ${criteria.weather} weather`);
  }

  if (criteria.occasion && product.suitableOccasions?.some((o) => o.toLowerCase().includes(criteria.occasion!.toLowerCase()))) {
    reasons.push(`tailored for ${criteria.occasion}`);
  }

  if (criteria.maxPrice && product.price <= criteria.maxPrice) {
    reasons.push(`within your budget at ₹${product.price.toLocaleString("en-IN")}`);
  }

  return reasons.length > 0
    ? `Recommended because of ${reasons.slice(0, 3).join(", ")}; overall match score ${Math.round(score)}%.`
    : `High overall comfort match (${Math.round(score)}%) with certified ${product.fabric}.`;
}

/**
 * High-performance query and ranking engine over the 1,000-record dataset.
 */
export function queryCatalog(criteria: FilterCriteria = {}): QueryResult {
  const startTime = performance.now();
  const appliedFilters: string[] = [];
  let excludedByAllergiesCount = 0;

  // 1. Initial Candidate Pool
  let candidates = MOCK_PRODUCTS;

  // 2. HARD FILTER: Mandatory Confirmed Allergy Exclusion Gate
  if (criteria.confirmedAllergies && criteria.confirmedAllergies.length > 0) {
    appliedFilters.push(`Exclude Allergens: ${criteria.confirmedAllergies.join(", ")}`);
    candidates = candidates.filter((product) => {
      const { hasConflict } = checkAllergyConflict(product, criteria.confirmedAllergies!);
      if (hasConflict) {
        excludedByAllergiesCount++;
        return false;
      }
      return true;
    });
  }

  // 3. HARD FILTER: Dynamic Chat Exclusions (e.g. "no wool", "no polyester")
  if (criteria.excludeMaterials && criteria.excludeMaterials.length > 0) {
    appliedFilters.push(`Exclude: ${criteria.excludeMaterials.join(", ")}`);
    candidates = candidates.filter((p) => {
      const pFab = p.fabric.toLowerCase();
      return !criteria.excludeMaterials!.some((ex) => pFab.includes(ex.toLowerCase()));
    });
  }

  // 4. HARD FILTER: Category
  if (criteria.category && criteria.category !== "All") {
    appliedFilters.push(`Category: ${criteria.category}`);
    candidates = candidates.filter((p) => p.category.toLowerCase() === criteria.category!.toLowerCase());
  }

  // 5. HARD FILTER: Price Range
  if (criteria.minPrice !== undefined && criteria.minPrice > 0) {
    appliedFilters.push(`Min Price: ₹${criteria.minPrice}`);
    candidates = candidates.filter((p) => p.price >= criteria.minPrice!);
  }
  if (criteria.maxPrice !== undefined && criteria.maxPrice < Infinity) {
    appliedFilters.push(`Max Price: ₹${criteria.maxPrice}`);
    candidates = candidates.filter((p) => p.price <= criteria.maxPrice!);
  }

  // 6. HARD FILTER: In-Stock Gate
  if (criteria.inStockOnly) {
    appliedFilters.push("In Stock Only");
    candidates = candidates.filter((p) => p.stock > 0);
  }

  // 7. HARD FILTER: Available Size
  if (criteria.size) {
    appliedFilters.push(`Size: ${criteria.size}`);
    candidates = candidates.filter((p) => p.availableSizes.includes(criteria.size!));
  }

  // 8. HARD FILTER: Minimum Skin Safety Score
  if (criteria.minSkinSafety && criteria.minSkinSafety > 0) {
    appliedFilters.push(`Min Safety: ${criteria.minSkinSafety}%`);
    candidates = candidates.filter((p) => p.skinSafetyScore >= criteria.minSkinSafety!);
  }

  // 9. Free-text Search using Precomputed Index
  if (criteria.query && criteria.query.trim().length > 0) {
    const qTerms = criteria.query.toLowerCase().trim().split(/\s+/);
    appliedFilters.push(`Search: "${criteria.query}"`);
    candidates = candidates.filter((p) => {
      const combined = SEARCH_INDEX_MAP.get(p.id) || "";
      return qTerms.every((term) => combined.includes(term));
    });
  }

  // 10. MULTI-CRITERIA SCORING & WEIGHTING ALGORITHM
  const scoredCandidates: ScoredProduct[] = candidates.map((product) => {
    // A. Skin Safety Weight (40 points max)
    const skinSafetyWeight = (product.skinSafetyScore / 100) * 40;

    // B. Comfort Weight (25 points max)
    const comfortWeight = (product.comfortScore / 100) * 25;

    // C. Weather Fit Weight (15 points max)
    let weatherFitScore = 10;
    if (criteria.weather) {
      const wLower = criteria.weather.toLowerCase();
      if (product.suitableWeather.some((w) => w.toLowerCase().includes(wLower))) {
        weatherFitScore = 15;
      } else if (wLower === "hot" && product.fabric.includes("Linen")) {
        weatherFitScore = 15;
      } else if (wLower === "cold" && (product.fabric.includes("Fleece") || product.fabric.includes("Thermal"))) {
        weatherFitScore = 15;
      }
    }
    const weatherFitWeight = weatherFitScore;

    // D. Body Fit Preference Match (10 points max)
    let bodyFitWeight = 7;
    if (criteria.fit && product.fit) {
      bodyFitWeight = criteria.fit.toLowerCase() === product.fit.toLowerCase() ? 10 : 7;
    }

    // E. Preferred Fabric Boost (+10 points bonus)
    let preferenceBoost = 0;
    if (criteria.preferredFabrics && criteria.preferredFabrics.length > 0) {
      const matched = criteria.preferredFabrics.some((pref) => product.fabric.toLowerCase().includes(pref.toLowerCase()));
      if (matched) preferenceBoost = 10;
    }

    // F. Sensitivity Demotion Penalty (-15 points per trigger)
    const sensitivityWarnings = evaluateSensitivities(product, criteria.reportedSensitivities || []);
    const sensitivityPenalty = sensitivityWarnings.length * 15;

    // G. Total Score Summation (Clamped 0 - 100)
    const rawTotal = skinSafetyWeight + comfortWeight + weatherFitWeight + bodyFitWeight + preferenceBoost - sensitivityPenalty;
    const finalScore = Math.max(10, Math.min(100, Math.round(rawTotal)));

    const breakdown: ScoreBreakdown = {
      skinSafetyWeight: Math.round(skinSafetyWeight),
      comfortWeight: Math.round(comfortWeight),
      weatherFitWeight: Math.round(weatherFitWeight),
      bodyFitWeight: Math.round(bodyFitWeight),
      preferenceBoost,
      sensitivityPenalty,
      totalScore: finalScore,
    };

    return {
      product,
      score: finalScore,
      breakdown,
      explanation: "",
      passedAllergyGate: true,
      sensitivityWarnings,
    };
  });

  // 11. Sort by Highest Match Score
  scoredCandidates.sort((a, b) => b.score - a.score || b.product.skinSafetyScore - a.product.skinSafetyScore);

  const limit = criteria.limit || 8;
  const paginatedItems = scoredCandidates.slice(0, limit).map((item) => ({
    ...item,
    explanation: buildExplanation(item.product, criteria, item.score, true),
  }));
  const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    items: paginatedItems,
    totalMatches: scoredCandidates.length,
    excludedByAllergiesCount,
    appliedFilters,
    latencyMs,
  };
}
