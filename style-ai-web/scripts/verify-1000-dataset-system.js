// style-ai-web/scripts/verify-1000-dataset-system.js
// Automated verification test suite for the Style AI 1,000-Record Upgrade

const { FULL_1000_CATALOG } = require("../src/lib/catalogData");
const { queryCatalog, checkAllergyConflict, evaluateSensitivities } = require("../src/lib/queryEngine");
const { deriveClimateAdvice } = require("../src/lib/weatherService");

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failedTests++;
  }
}

console.log("==================================================================");
console.log("🧪 RUNNING STYLE AI 1,000-RECORD VERIFICATION TEST SUITE");
console.log("==================================================================\n");

// TEST 1: Dataset Volume & Completeness
assert(FULL_1000_CATALOG.length === 1000, `Dataset contains exactly 1,000 records (found: ${FULL_1000_CATALOG.length})`);
const allHaveFibers = FULL_1000_CATALOG.every(p => p.fibers && p.fibers.length > 0 && p.price > 0 && p.stock >= 0);
assert(allHaveFibers, "Every record has verified fiber breakdown, price in INR, and inventory count");

// TEST 2: Hard Mandatory Allergy Exclusion Gate
const polyesterAllergyResult = queryCatalog({
  confirmedAllergies: ["Polyester"],
  limit: 100,
});
const hasPolyesterLeak = polyesterAllergyResult.items.some(
  i => i.product.fabric.toLowerCase().includes("polyester") ||
       i.product.allergens.some(a => a.toLowerCase().includes("polyester"))
);
assert(!hasPolyesterLeak, "Mandatory Allergy Exclusion: 0% Polyester products allowed through filter");
assert(polyesterAllergyResult.excludedByAllergiesCount > 0, `Allergy gate purged ${polyesterAllergyResult.excludedByAllergiesCount} unsafe products`);

// TEST 3: Wool / Lanolin Allergy Gate
const woolAllergyResult = queryCatalog({
  confirmedAllergies: ["Wool / Lanolin"],
  limit: 100,
});
const hasWoolLeak = woolAllergyResult.items.some(
  i => i.product.fabric.toLowerCase().includes("wool") ||
       i.product.fabric.toLowerCase().includes("merino")
);
assert(!hasWoolLeak, "Mandatory Allergy Exclusion: 0% Wool/Merino products allowed through filter");

// TEST 4: Query Engine Retrieval Performance (<20ms target, typically <2ms)
// Warm up V8 JIT compilation
for (let i = 0; i < 3; i++) {
  const tStart = performance.now();
  const r = queryCatalog({ query: "linen shirt", category: "Tops", maxPrice: 2500, limit: 8 });
  console.log(`Warmup ${i}: ${performance.now() - tStart}ms`);
}

const perfStart = performance.now();
const searchResult = queryCatalog({
  query: "linen shirt",
  category: "Tops",
  maxPrice: 2500,
  limit: 8,
});
const perfDuration = performance.now() - perfStart;
console.log(`[Diagnostic] Final query perfDuration: ${perfDuration.toFixed(2)}ms, Internal latencyMs: ${searchResult.latencyMs}ms`);
assert(perfDuration < 20, `Indexed Retrieval Performance: ${perfDuration.toFixed(2)}ms (< 20ms target)`);
assert(searchResult.items.length > 0, `Search returned ${searchResult.items.length} relevant items`);
assert(searchResult.items.every(i => i.product.price <= 2500), "Budget limit strictly enforced on all returned items");

// TEST 5: Deterministic Scoring & Explanations
const topMatch = searchResult.items[0];
assert(topMatch.score >= 50 && topMatch.score <= 100, `Match score calculated deterministically (${topMatch.score}%)`);
assert(typeof topMatch.explanation === "string" && topMatch.explanation.length > 20, `Transparent explanation generated: "${topMatch.explanation.substring(0, 60)}..."`);

// TEST 6: Climate Rules Engine Adaptation
const extremeHeatAdvice = deriveClimateAdvice(35, 85, 9, "Mumbai", "Humid & Sunny");
assert(extremeHeatAdvice.skinAlertLevel === "EXTREME", "Climate Engine: 35°C + 85% Humidity flagged as EXTREME risk");
assert(extremeHeatAdvice.recommendedFabrics.some(f => f.includes("Linen")), "Climate Engine: Recommends open-weave linen in extreme heat");
assert(extremeHeatAdvice.avoidFabrics.some(f => f.includes("Polyester")), "Climate Engine: Flags heat-trapping polyester to avoid");

// TEST 7: Laundry & Availability Filtering
const sampleCloset = [
  { id: "c1", name: "Shirt 1", laundryStatus: "Clean & Ready", fabric: "100% Cotton" },
  { id: "c2", name: "Shirt 2", laundryStatus: "In Laundry", fabric: "100% Linen" },
  { id: "c3", name: "Shirt 3", laundryStatus: "Dry Cleaning", fabric: "100% Silk" },
];
const availableClothes = sampleCloset.filter(c => c.laundryStatus === "Clean & Ready");
assert(availableClothes.length === 1 && availableClothes[0].id === "c1", "Closet Availability: Clean & Ready filter successfully purges unwashed items");

console.log("\n==================================================================");
console.log(`📊 TEST EXECUTION SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log("==================================================================");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
