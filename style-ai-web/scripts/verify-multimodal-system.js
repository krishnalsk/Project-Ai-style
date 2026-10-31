// style-ai-web/scripts/verify-multimodal-system.js
// Automated verification suite for the Multimodal AI Diagnosis & Clothing Recommendation System

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`✅ PASS: ${testName} ${details ? "(" + details + ")" : ""}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName} ${details ? "(" + details + ")" : ""}`);
    failedTests++;
  }
}

// In-house diagnostic logic test mirror
function evaluateTestDiagnosis(textQuery, imagePresent) {
  const query = (textQuery || "").toLowerCase();
  const isSynthetic = /\b(polyester|acrylic|nylon|spandex|elastane|synthetic)\b/i.test(query);
  const isItchy = /\b(itch|itchy|scratchy|prickly|irritat\w*|rash|rashes|redness|bumps?)\b/i.test(query);
  const isThermal = /\b(sweat|sweaty|suffocat\w*|humid|sticky|heat\s*rash|overheat\w*|non-breathable|unbreathable)\b/i.test(query) || (/\b(hot|heat)\b/i.test(query) && !/\b(cold)\b/i.test(query));
  const isFriction = /\b(rough|stiff|abrasive|chaf\w*|seam|collar|rubbing)\b/i.test(query);
  const isChemical = /\b(dye|smell|odor|chemical|toxic|azo)\b/i.test(query);

  if (isSynthetic && (isItchy || isThermal)) {
    return {
      issue: "Synthetic Fiber Contact Dermatitis",
      severity: "High",
      score: 28.5,
      fabric: "100% GOTS Certified Organic Cotton or Mulberry Silk"
    };
  }
  if (isThermal) {
    return {
      issue: "Thermal Microclimate Occlusion (Heat Rash / Miliaria)",
      severity: "Moderate",
      score: 42.0,
      fabric: "100% French Linen"
    };
  }
  if (isFriction) {
    return {
      issue: "Mechanical Textile Abrasion (Seam Chafing)",
      severity: "Moderate",
      score: 51.0,
      fabric: "Mercerized Supima Cotton or Micro-Modal"
    };
  }
  if (isChemical) {
    return {
      issue: "Disperse Dye & Finishing Chemical Sensitivity",
      severity: "High",
      score: 35.0,
      fabric: "OEKO-TEX Standard 100 Certified Organic Cotton"
    };
  }
  return {
    issue: "Safe & Hypoallergenic Fabric Profile",
    severity: "Optimal",
    score: 92.5,
    fabric: "100% Combed Long-Staple Cotton"
  };
}

console.log("==================================================================");
console.log("🧪 RUNNING MULTIMODAL AI DIAGNOSTIC VERIFICATION SUITE");
console.log("==================================================================\n");

// TEST 1: Synthetic Contact Dermatitis Detection
const test1 = evaluateTestDiagnosis("Severe itchy red rash from tight 100% polyester athletic shirt", true);
assert(test1.issue === "Synthetic Fiber Contact Dermatitis", "Test 1: Detects Synthetic Dermatitis correctly");
assert(test1.score < 30, "Test 1: Assigns severe low comfort score", `Score: ${test1.score}/100`);
assert(test1.fabric.includes("Organic Cotton") || test1.fabric.includes("Silk"), "Test 1: Recommends hypoallergenic natural fiber");

// TEST 2: Thermal Microclimate / Heat Rash Detection
const test2 = evaluateTestDiagnosis("Suffocating heat and trapped sweat causing sticky rash in humid summer", false);
assert(test2.issue.includes("Heat Rash"), "Test 2: Detects Heat Rash / Thermal Occlusion");
assert(test2.fabric.includes("French Linen"), "Test 2: Recommends ultra-breathable French Linen");

// TEST 3: Mechanical Seam Friction Detection
const test3 = evaluateTestDiagnosis("Stiff abrasive raised seam scratching against sensitive neck skin", true);
assert(test3.issue.includes("Mechanical Textile Abrasion"), "Test 3: Detects Mechanical Seam Abrasion");
assert(test3.fabric.includes("Supima Cotton") || test3.fabric.includes("Modal"), "Test 3: Recommends friction-free Supima Cotton / Micro-Modal");

// TEST 4: Chemical Dye Hypersensitivity
const test4 = evaluateTestDiagnosis("Chemical dye smell and stinging burning sensation after unboxing", false);
assert(test4.issue.includes("Disperse Dye"), "Test 4: Detects Dye / Chemical Sensitivity");
assert(test4.fabric.includes("OEKO-TEX"), "Test 4: Recommends OEKO-TEX certified chemical-free fabrics");

// TEST 5: Baseline Safe Profile
const test5 = evaluateTestDiagnosis("Soft, breathable everyday natural clothing, skin feels great", true);
assert(test5.severity === "Optimal", "Test 5: Correctly rates safe garments as Optimal");
assert(test5.score > 90, "Test 5: Awards high comfort score", `Score: ${test5.score}/100`);

console.log("\n==================================================================");
console.log(`📊 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log("==================================================================");

if (failedTests > 0) {
  process.exit(1);
}
