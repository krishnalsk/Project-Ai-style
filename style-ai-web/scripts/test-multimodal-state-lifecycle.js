// scripts/test-multimodal-state-lifecycle.js
// Comprehensive Multimodal Classification & State Lifecycle Verification Suite

const sharp = require("sharp");
const {
  evaluateEvidenceBasedDiagnosis,
  evaluateEvidenceBasedDiagnosisAsync,
} = require("../src/app/api/predict-issue/route.ts");
const { classifyImageBuffer } = require("../src/lib/visionClassifier.ts");
const { inspectImageModalityAsync } = require("../src/lib/imageInspector.ts");

let passed = 0;
let failed = 0;

function assert(condition, testName, details) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName} ${details ? "— " + details : ""}`);
    failed++;
  }
}

async function runLifecycleSuite() {
  console.log("================================================================================");
  console.log("🧪 DERMSTYLE AI - MULTIMODAL CLASSIFICATION & STATE LIFECYCLE VERIFICATION");
  console.log("================================================================================\n");

  // Generate real synthesized JPEG buffers using Sharp
  // 1. Skin photograph: Fitzpatrick Type II/III with erythema (R > G > B, warm red-orange chrominance)
  const skinBuffer = await sharp({
    create: { width: 120, height: 120, channels: 3, background: { r: 218, g: 128, b: 102 } },
  })
    .jpeg()
    .toBuffer();
  const skinDataUrl = `data:image/jpeg;base64,${skinBuffer.toString("base64")}`;

  // 2. Fabric weave photograph: Dyed woven cotton/denim (cool indigo blue, non-skin, non-white)
  const fabricBuffer = await sharp({
    create: { width: 120, height: 120, channels: 3, background: { r: 45, g: 85, b: 165 } },
  })
    .jpeg()
    .toBuffer();
  const fabricDataUrl = `data:image/jpeg;base64,${fabricBuffer.toString("base64")}`;

  // 3. Care label photograph: White satin ribbon (high luminance > 200, achromatic) + black text lines
  const careLabelBuffer = await sharp({
    create: { width: 150, height: 150, channels: 3, background: { r: 248, g: 248, b: 248 } },
  })
    .composite([
      {
        input: Buffer.from(
          '<svg width="150" height="150">' +
            '<rect x="15" y="20" width="120" height="12" fill="#111"/>' +
            '<rect x="15" y="45" width="100" height="10" fill="#222"/>' +
            '<rect x="15" y="70" width="110" height="10" fill="#222"/>' +
            '<rect x="15" y="95" width="80" height="10" fill="#333"/>' +
            "</svg>"
        ),
        top: 0,
        left: 0,
      },
    ])
    .jpeg()
    .toBuffer();
  const careLabelDataUrl = `data:image/jpeg;base64,${careLabelBuffer.toString("base64")}`;

  // 4. Blurry / corrupted payload
  const blurryDataUrl = "data:image/jpeg;base64,corrupt_payload_too_small";

  // --------------------------------------------------------------------------------
  // TEST A: Skin photograph analysis with "Skin Irritation Photo" selected
  // --------------------------------------------------------------------------------
  console.log(">>> RUNNING TEST A: Skin photograph with 'skin' modality selected...");
  const resA = await evaluateEvidenceBasedDiagnosisAsync(
    "Mild itchy erythema on inner forearm",
    skinDataUrl,
    "Sensitive",
    "Moderate (18°C - 24°C)",
    "skin",
    "img_test_skin_001"
  );

  assert(
    resA.inputModality === "SKIN_IMAGE",
    "Test A: Classifies real skin buffer as SKIN_IMAGE",
    `Got: ${resA.inputModality}`
  );
  assert(
    resA.mismatchDetected === false,
    "Test A: NO false-positive modality mismatch warning when Skin is selected on skin photo",
    `mismatchDetected was: ${resA.mismatchDetected}`
  );
  assert(
    resA.careLabelAnalysis === undefined,
    "Test A: Care label analysis is STRICTLY undefined for a skin photograph",
    `careLabelAnalysis was: ${JSON.stringify(resA.careLabelAnalysis)}`
  );
  assert(
    resA.skinObservations !== undefined && resA.skinObservations.erythemaLevel !== undefined,
    "Test A: Populates structured skin visual observations (erythemaLevel)",
    `skinObservations: ${JSON.stringify(resA.skinObservations)}`
  );
  assert(
    resA.clinicalNotice.includes("Medical Disclaimer"),
    "Test A: Mandates clinical disclaimer without diagnosing diseases"
  );
  assert(
    resA.imageId === "img_test_skin_001",
    "Test A: Result is securely bound to the active imageId"
  );

  // --------------------------------------------------------------------------------
  // TEST B: Fabric photograph analysis with "Fabric Weave Photo" selected
  // --------------------------------------------------------------------------------
  console.log("\n>>> RUNNING TEST B: Fabric weave photograph with 'fabric' modality selected...");
  const resB = await evaluateEvidenceBasedDiagnosisAsync(
    "Casual blue shirt textile",
    fabricDataUrl,
    "Normal",
    "Moderate (18°C - 24°C)",
    "fabric",
    "img_test_fabric_002"
  );

  assert(
    resB.inputModality === "FABRIC_SURFACE",
    "Test B: Classifies real fabric buffer as FABRIC_SURFACE",
    `Got: ${resB.inputModality}`
  );
  assert(
    resB.mismatchDetected === false,
    "Test B: NO mismatch warning when Fabric is selected on fabric photo"
  );
  assert(
    resB.careLabelAnalysis === undefined,
    "Test B: Care label analysis is STRICTLY undefined for fabric weave photo"
  );
  assert(
    resB.skinObservations === undefined,
    "Test B: Skin observations are STRICTLY undefined for fabric photo"
  );
  assert(
    resB.weaveCharacteristics !== undefined && resB.weaveCharacteristics.weaveType === "Plain Weave",
    "Test B: Populates optical weave structure characteristics"
  );
  assert(
    resB.verifiedTextileInfo.verificationStatus === "UNVERIFIED_FROM_PHOTO",
    "Test B: Verified textile status is UNVERIFIED_FROM_PHOTO"
  );

  // --------------------------------------------------------------------------------
  // TEST C: Clothing care-label photograph with OCR & care symbols
  // --------------------------------------------------------------------------------
  console.log("\n>>> RUNNING TEST C: Care tag photograph with OCR & Care Symbols...");
  const resC = await evaluateEvidenceBasedDiagnosisAsync(
    "60% cotton / 40% recycled polyester wash 30C do not bleach",
    careLabelDataUrl,
    "Normal",
    "Moderate (18°C - 24°C)",
    "label",
    "img_test_label_003"
  );

  assert(
    resC.inputModality === "LABEL_CARE_TAG",
    "Test C: Classifies care tag as LABEL_CARE_TAG",
    `Got: ${resC.inputModality}`
  );
  assert(
    resC.careLabelAnalysis !== undefined,
    "Test C: Dedicated careLabelAnalysis object is populated"
  );
  assert(
    resC.careLabelAnalysis.compositionSummary === "60% Cotton / 40% Recycled Polyester",
    "Test C: Extracts exact 60% Cotton / 40% Recycled Polyester",
    `Got: ${resC.careLabelAnalysis?.compositionSummary}`
  );
  assert(
    resC.careLabelAnalysis.washCare.washing.instruction.includes("30°C"),
    "Test C: Extracts washing at 30°C instruction"
  );
  assert(
    resC.careLabelAnalysis.washCare.bleaching.instruction.toLowerCase().includes("not allowed"),
    "Test C: Identifies do not bleach instruction"
  );
  assert(
    resC.careLabelAnalysis.careSymbols.length > 0,
    "Test C: Care symbols recognized from label iconography"
  );

  // --------------------------------------------------------------------------------
  // TEST D: Ambiguous / corrupted photograph
  // --------------------------------------------------------------------------------
  console.log("\n>>> RUNNING TEST D: Ambiguous / low-quality photograph handling...");
  const resD = await evaluateEvidenceBasedDiagnosisAsync(
    "Checking low-res file",
    blurryDataUrl,
    "Normal",
    "Moderate (18°C - 24°C)",
    "auto",
    "img_test_ambig_004"
  );

  assert(
    resD.inputModality === "AMBIGUOUS_UNKNOWN",
    "Test D: Routes corrupted/low-res photo to AMBIGUOUS_UNKNOWN",
    `Got: ${resD.inputModality}`
  );
  assert(
    resD.isLowQuality === true,
    "Test D: Flags isLowQuality as true"
  );
  assert(
    resD.careLabelAnalysis === undefined,
    "Test D: Care label analysis is STRICTLY undefined for ambiguous upload"
  );

  // --------------------------------------------------------------------------------
  // TEST E: State Lifecycle: Upload Care Tag, then Replace with Skin Photo
  // --------------------------------------------------------------------------------
  console.log("\n>>> RUNNING TEST E: Replace Care Tag with Skin Photo (Stale State Purge)...");

  // Step 1: User uploads a care tag
  const tagUploadId = "img_tag_step1";
  const step1Result = await evaluateEvidenceBasedDiagnosisAsync(
    "60% cotton / 40% polyester care tag",
    careLabelDataUrl,
    "Sensitive",
    "Moderate (18°C - 24°C)",
    "label",
    tagUploadId
  );
  assert(
    step1Result.inputModality === "LABEL_CARE_TAG" && step1Result.careLabelAnalysis !== undefined,
    "Test E (Step 1): First upload successfully processes care tag"
  );

  // Step 2: User replaces photo with human skin
  const skinUploadId = "img_skin_step2";
  const step2Result = await evaluateEvidenceBasedDiagnosisAsync(
    "Red itchy rash on elbow",
    skinBuffer.toString("base64"),
    "Sensitive",
    "Moderate (18°C - 24°C)",
    "skin",
    skinUploadId
  );

  assert(
    step2Result.imageId === skinUploadId,
    "Test E (Step 2): New result is bound to the new skin imageId",
    `Expected: ${skinUploadId}, Got: ${step2Result.imageId}`
  );
  assert(
    step2Result.inputModality === "SKIN_IMAGE",
    "Test E (Step 2): Correctly updates modality to SKIN_IMAGE"
  );
  assert(
    step2Result.careLabelAnalysis === undefined,
    "Test E (Step 2): Previous care label analysis is COMPLETELY PURGED (undefined)"
  );
  assert(
    step2Result.verifiedTextileInfo.fiberComposition === "Unknown (No readable garment label provided)",
    "Test E (Step 2): Textile composition reverts to Unknown"
  );
  assert(
    step2Result.skinObservations !== undefined,
    "Test E (Step 2): Skin visual observations are active"
  );

  // --------------------------------------------------------------------------------
  // TEST F: State Lifecycle: Replace Skin Photo with Fabric Texture
  // --------------------------------------------------------------------------------
  console.log("\n>>> RUNNING TEST F: Replace Skin Photo with Fabric Texture...");
  const fabricUploadId = "img_fabric_step3";
  const step3Result = await evaluateEvidenceBasedDiagnosisAsync(
    "Plain twill cotton shirt texture",
    fabricDataUrl,
    "Normal",
    "Moderate (18°C - 24°C)",
    "fabric",
    fabricUploadId
  );

  assert(
    step3Result.imageId === fabricUploadId,
    "Test F: Result is bound to fabric upload ID"
  );
  assert(
    step3Result.inputModality === "FABRIC_SURFACE",
    "Test F: Modality switches to FABRIC_SURFACE"
  );
  assert(
    step3Result.skinObservations === undefined,
    "Test F: Skin observations are COMPLETELY PURGED (undefined)"
  );
  assert(
    step3Result.weaveCharacteristics !== undefined,
    "Test F: Weave analysis is active"
  );

  // --------------------------------------------------------------------------------
  // TEST G: Modality Mismatch Guard (Fabric selected, Care Tag uploaded)
  // --------------------------------------------------------------------------------
  console.log("\n>>> RUNNING TEST G: Modality Mismatch Detection...");
  const resMismatch = await evaluateEvidenceBasedDiagnosisAsync(
    "Casual work shirt",
    careLabelDataUrl,
    "Normal",
    "Moderate (18°C - 24°C)",
    "fabric", // User claims it's fabric, but photo is a care tag!
    "img_test_mismatch_005"
  );

  assert(
    resMismatch.mismatchDetected === true,
    "Test G: Detects genuine modality mismatch (Fabric selected on Care Tag image)"
  );
  assert(
    resMismatch.mismatchMessage.includes("Uploaded image appears to be a Care Tag / Wash Label, but Fabric Weave Photo is selected"),
    "Test G: Provides accurate warning message"
  );
  assert(
    resMismatch.suggestedModality === "LABEL_CARE_TAG",
    "Test G: Suggests switching to LABEL_CARE_TAG"
  );
  assert(
    resMismatch.inputModality === "LABEL_CARE_TAG",
    "Test G: Routes to detected Care Label to prevent fabricating weave observations"
  );

  // --------------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`🎯 LIFECYCLE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runLifecycleSuite().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
