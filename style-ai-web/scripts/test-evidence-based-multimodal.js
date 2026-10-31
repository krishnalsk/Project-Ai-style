// style-ai-web/scripts/test-evidence-based-multimodal.js
// Comprehensive 12-case regression validation suite for evidence-based multimodal evaluation

const { evaluateEvidenceBasedDiagnosis } = require("../src/app/api/predict-issue/route.ts");

let passed = 0;
let failed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`✅ PASS: ${testName} ${details ? "(" + details + ")" : ""}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName} ${details ? "(" + details + ")" : ""}`);
    failed++;
  }
}

console.log("==================================================================");
console.log("🧪 RUNNING EVIDENCE-BASED MULTIMODAL REGRESSION TEST SUITE (12 CASES)");
console.log("==================================================================\n");

const skinPhoto = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/skin_sample_rash_erythema_image_data_stream_long_enough_for_inspection_testing_0123456789";
const fabricPhoto = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/fabric_woven_textile_shirt_sample_image_data_stream_long_enough_for_inspection_testing_0123456789";
const labelPhoto = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/care_tag_wash_label_sample_image_data_stream_long_enough_for_inspection_testing_0123456789";
const ambiguousPhoto = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/ambiguous_blurry_unclear_image_data_stream_long_enough_for_inspection_testing_0123456789";
const corruptedPhoto = "data:image/png;base64,corrupted";

// TEST CASE 1: Skin rash photograph
const res1 = evaluateEvidenceBasedDiagnosis("Itchy red rash on forearm after wearing sweater", skinPhoto, "Sensitive", "Moderate", "skin");
assert(res1.inputModality === "SKIN_IMAGE", "Case 1: Correctly classifies skin photograph as SKIN_IMAGE");
assert(
  !res1.visibleObservations.visualFindings.toLowerCase().includes("textile surface"),
  "Case 1: Never describes skin as a smooth textile surface"
);
assert(
  res1.clinicalNotice.toLowerCase().includes("disclaimer") &&
  res1.clinicalNotice.toLowerCase().includes("cannot confirm a diagnosis"),
  "Case 1: Includes required medical disclaimer and denies clinical confirmation"
);
assert(
  res1.comfortScore.score !== 92.5 && res1.comfortScore.score !== null && res1.comfortScore.score < 60,
  "Case 1: Discards hardcoded 92.5; dynamically scores acute skin irritation",
  `Score: ${res1.comfortScore.score}/100`
);

// TEST CASE 2: Plain fabric photograph
const res2 = evaluateEvidenceBasedDiagnosis("Is this fabric safe for daily wear?", fabricPhoto, "Normal", "Moderate", "fabric");
assert(res2.inputModality === "FABRIC_SURFACE", "Case 2: Correctly identifies plain fabric as FABRIC_SURFACE");
assert(
  res2.verifiedTextileInfo.verificationStatus === "UNVERIFIED_FROM_PHOTO",
  "Case 2: Marks chemical composition as UNVERIFIED_FROM_PHOTO"
);
assert(
  res2.visibleObservations.limitations.toLowerCase().includes("cannot be determined from optical appearance alone"),
  "Case 2: Explicitly states fiber composition cannot be verified by photo alone"
);

// TEST CASE 3: Garment care label
const res3 = evaluateEvidenceBasedDiagnosis("100% GOTS Organic Cotton, wash at 30°C", labelPhoto, "Sensitive", "Moderate", "label");
assert(res3.inputModality === "LABEL_CARE_TAG", "Case 3: Correctly identifies care label as LABEL_CARE_TAG");
assert(
  res3.verifiedTextileInfo.verificationStatus === "VERIFIED_FROM_TAG",
  "Case 3: Marks composition as VERIFIED_FROM_TAG when legible label text is provided"
);
assert(
  res3.comfortScore.score !== null && res3.comfortScore.score > 75,
  "Case 3: Awards high comfort score for verified organic cotton in moderate climate",
  `Score: ${res3.comfortScore.score}/100`
);

// TEST CASE 4: Ambiguous / unclear image
const res4 = evaluateEvidenceBasedDiagnosis("", ambiguousPhoto, "Normal", "Moderate");
assert(res4.inputModality === "AMBIGUOUS_UNKNOWN", "Case 4: Ambiguous image routed to AMBIGUOUS_UNKNOWN");
assert(
  res4.clinicalNotice.toLowerCase().includes("could not be reliably classified"),
  "Case 4: Returns a clear limitation and clarification notice"
);
assert(res4.comfortScore.score !== 92.5, "Case 4: Does NOT output default 92.5 comfort score");

// TEST CASE 5: Missing symptom description (Requirement 4)
const res5 = evaluateEvidenceBasedDiagnosis("", skinPhoto, "Sensitive", "Moderate", "skin");
assert(res5.inputModality === "SKIN_IMAGE", "Case 5: Analyzes skin photo even when text description is empty");
assert(
  res5.userReportedContext.symptomsStatus === "UNKNOWN_NOT_PROVIDED",
  "Case 5: Marks symptomsStatus strictly as UNKNOWN_NOT_PROVIDED"
);
assert(
  res5.userReportedContext.symptoms[0].toLowerCase().includes("unknown"),
  "Case 5: Explains symptoms are unknown rather than inventing discomfort or severity"
);
assert(
  res5.comfortScore.formulaBreakdown.symptomAdjustment === 0,
  "Case 5: Does not invent negative symptom penalty when description is empty (symptomAdjustment = 0)"
);

// TEST CASE 6: Sensitive-skin profile with humid weather
const res6 = evaluateEvidenceBasedDiagnosis(
  "Wearing tight polyester shirt and active rash",
  skinPhoto,
  "Sensitive",
  "Tropical / Humid (35°C)",
  "skin"
);
assert(
  res6.comfortScore.formulaBreakdown.climateAdjustment < 0,
  "Case 6: Dynamic formula applies negative climate penalty for synthetic fabric in tropical heat",
  `Climate adjustment: ${res6.comfortScore.formulaBreakdown.climateAdjustment}`
);
assert(
  res6.comfortScore.score !== null && res6.comfortScore.score <= 30,
  "Case 6: Comfort score heavily penalizes synthetic occlusion in tropical heat",
  `Score: ${res6.comfortScore.score}/100`
);

// TEST CASE 7: API failure / Corrupted image handling
const res7 = evaluateEvidenceBasedDiagnosis("Testing bad image", corruptedPhoto, "Normal", "Moderate");
assert(
  res7.inputModality === "AMBIGUOUS_UNKNOWN",
  "Case 7: Corrupted or truncated payload handled gracefully without crash"
);
assert(
  res7.visibleObservations.limitations.toLowerCase().includes("unable to reliably identify"),
  "Case 7: Advises user of corrupted/low-resolution payload"
);

// TEST CASE 8: Changing an image while keeping the same user settings
const res8_step1 = evaluateEvidenceBasedDiagnosis("Testing shirt", skinPhoto, "Sensitive", "Moderate", "skin");
const res8_step2 = evaluateEvidenceBasedDiagnosis("Testing shirt", fabricPhoto, "Sensitive", "Moderate", "fabric");
assert(
  res8_step1.inputModality === "SKIN_IMAGE" && res8_step2.inputModality === "FABRIC_SURFACE",
  "Case 8: Switching from skin image to fabric image correctly alters analysis modality"
);
assert(
  res8_step1.assessmentTitle !== res8_step2.assessmentTitle,
  "Case 8: Assessment title and conclusions update immediately with image change without stale state leak"
);

// TEST CASE 9: Medical terminology audit (Requirements 2, 3, 8)
const res9 = evaluateEvidenceBasedDiagnosis("Itchy skin redness", skinPhoto, "Sensitive", "Moderate", "skin");
const findings = res9.visibleObservations.visualFindings.toLowerCase();
const limitations = res9.visibleObservations.limitations.toLowerCase();
assert(
  !findings.includes("microvascular dilation") && !findings.includes("clinically graded"),
  "Case 9: Removed unsupported medical jargon (no 'microvascular dilation' or 'clinically graded irritation')"
);
assert(
  findings.includes("localized redness") && findings.includes("surface irregularity"),
  "Case 9: Uses objective descriptive terms (localized redness and surface irregularity)"
);
assert(
  res9.possibleExplanations.hypotheses.every(h => h.includes("possible contributing factor")),
  "Case 9: Friction, detergent residue, and heat are explicitly framed as 'possible contributing factors', not confirmed causes"
);

// TEST CASE 10: Missing fabric data & Indeterminate comfort score (Requirements 6, 7)
const res10 = evaluateEvidenceBasedDiagnosis("", skinPhoto, "Sensitive", "Moderate", "skin");
assert(
  res10.verifiedTextileInfo.verificationStatus === "UNKNOWN",
  "Case 10: Textile composition marked as UNKNOWN when no care tag is present"
);
assert(
  res10.verifiedTextileInfo.fiberComposition.toLowerCase().includes("unknown"),
  "Case 10: Fiber composition is explicitly marked Unknown"
);
assert(
  res10.comfortScore.isReliable === false && res10.comfortScore.ratingBand.includes("Indeterminate"),
  "Case 10: Shows indeterminate rating band when wearing context and symptoms are missing, rather than a misleading score"
);

// TEST CASE 11: Conflicting inputs (Skin photo + Cotton care tag text)
const res11 = evaluateEvidenceBasedDiagnosis("100% Organic Cotton Care Tag Wash at 30C", skinPhoto, "Sensitive", "Moderate", "skin");
assert(
  res11.inputModality === "SKIN_IMAGE",
  "Case 11: Preserves visual skin modality and does not falsely claim a skin photo is a verified label"
);
assert(
  res11.verifiedTextileInfo.verificationStatus === "UNKNOWN",
  "Case 11: Does not certify care tag verification on a photograph of human skin"
);

// TEST CASE 12: Score consistency & Documented rules audit (Requirement 5)
const res12_a = evaluateEvidenceBasedDiagnosis("Itchy rash from polyester sweater", skinPhoto, "Sensitive", "Moderate", "skin");
const res12_b = evaluateEvidenceBasedDiagnosis("Itchy rash from polyester sweater", skinPhoto, "Sensitive", "Moderate", "skin");
assert(
  res12_a.comfortScore.score === res12_b.comfortScore.score,
  "Case 12: Score is deterministic and 100% consistent across multiple invocations with same input",
  `Score A: ${res12_a.comfortScore.score}, Score B: ${res12_b.comfortScore.score}`
);
assert(
  res12_a.comfortScore.documentedRules && res12_a.comfortScore.documentedRules.length >= 4,
  "Case 12: Every penalty/adjustment is accompanied by a documented rule explaining the reason"
);

console.log("\n==================================================================");
console.log(`📊 FINAL REGRESSION RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("==================================================================");

if (failed > 0) {
  process.exit(1);
}
