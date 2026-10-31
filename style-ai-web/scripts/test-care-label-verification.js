// scripts/test-care-label-verification.js
// Verification Suite for Style AI: Care Label Verification, Evidence Source Tracking & Comfort Score

const sharp = require("sharp");
const { validateCareLabelImageQuality, extractFiberComposition, extractWashCareInstructions, parseCareLabel } = require("../src/lib/careLabelOcr.ts");
const { inspectImageModalityAsync } = require("../src/lib/imageInspector.ts");
const { evaluateEvidenceBasedDiagnosisAsync } = require("../src/app/api/predict-issue/route.ts");

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

async function runTestSuite() {
  console.log("================================================================================");
  console.log("🏷️  STYLE AI - CARE LABEL VERIFICATION & COMFORT SCORE VALIDATION SUITE");
  console.log("================================================================================\n");

  const startTime = Date.now();

  // --------------------------------------------------------------------------------
  // SYNTHESIZE OPTICAL TEST IMAGES
  // --------------------------------------------------------------------------------

  // 1. High-contrast readable care tag image (White background with crisp dark text bars)
  const clearCareLabelBuffer = await sharp({
    create: { width: 160, height: 160, channels: 3, background: { r: 248, g: 248, b: 248 } },
  })
    .composite([
      {
        input: Buffer.from(
          '<svg width="160" height="160">' +
            '<rect x="15" y="20" width="130" height="10" fill="#111827"/>' +
            '<rect x="15" y="42" width="105" height="8" fill="#1f2937"/>' +
            '<rect x="15" y="62" width="115" height="8" fill="#1f2937"/>' +
            '<rect x="15" y="82" width="90" height="8" fill="#374151"/>' +
            '<rect x="15" y="102" width="120" height="8" fill="#374151"/>' +
            '<circle cx="30" cy="132" r="8" fill="#111827"/>' +
            '<polygon points="60,124 50,140 70,140" fill="#111827"/>' +
            '<rect x="90" y="124" width="16" height="16" fill="#111827"/>' +
            "</svg>"
        ),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();
  const clearCareLabelDataUrl = `data:image/png;base64,${clearCareLabelBuffer.toString("base64")}`;

  // 2. Extremely blurry / low-contrast care tag image
  const blurryCareLabelBuffer = await sharp({
    create: { width: 160, height: 160, channels: 3, background: { r: 128, g: 128, b: 128 } },
  })
    .composite([
      {
        input: Buffer.from(
          '<svg width="160" height="160">' +
            '<rect x="20" y="20" width="120" height="12" fill="#7d7d7d"/>' +
            '<rect x="20" y="50" width="100" height="10" fill="#828282"/>' +
            "</svg>"
        ),
        top: 0,
        left: 0,
      },
    ])
    .blur(18)
    .png()
    .toBuffer();
  const blurryCareLabelDataUrl = `data:image/png;base64,${blurryCareLabelBuffer.toString("base64")}`;

  // 3. Human skin forearm with localized redness (erythema)
  const skinBuffer = await sharp({
    create: { width: 150, height: 150, channels: 3, background: { r: 218, g: 128, b: 102 } },
  })
    .png()
    .toBuffer();
  const skinDataUrl = `data:image/png;base64,${skinBuffer.toString("base64")}`;

  // 4. Beige folded fabric photograph
  const beigeFabricBuffer = await sharp({
    create: { width: 150, height: 150, channels: 3, background: { r: 185, g: 170, b: 130 } },
  })
    .composite([
      {
        input: Buffer.from(
          '<svg width="150" height="150">' +
            '<line x1="0" y1="30" x2="150" y2="40" stroke="#9e8a60" stroke-width="4"/>' +
            '<line x1="0" y1="80" x2="150" y2="90" stroke="#7d6a42" stroke-width="6"/>' +
            '<line x1="0" y1="120" x2="150" y2="130" stroke="#9e8a60" stroke-width="4"/>' +
            "</svg>"
        ),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();
  const beigeFabricDataUrl = `data:image/png;base64,${beigeFabricBuffer.toString("base64")}`;

  // ================================================================================
  // TEST CASE 1: CLEAR CARE LABEL IMAGE (60% Cotton / 40% Recycled Polyester)
  // ================================================================================
  console.log(">>> TEST CASE 1: Clear Care Label Image (60% Cotton / 40% Recycled Polyester)...");

  // Quality check
  const clearQuality = await validateCareLabelImageQuality(clearCareLabelBuffer);
  assert(clearQuality.hasImage === true, "Test 1: Image presence detected");
  assert(clearQuality.isReadable === true, "Test 1: Image is readable (contrast & sharpness pass)");
  assert(clearQuality.isBlurry === false, "Test 1: Image is not blurry");

  // Fiber composition unit check
  const fiberRes1 = extractFiberComposition("60% Cotton / 40% Recycled Polyester", "IMAGE_OCR", true);
  assert(fiberRes1.fibers.length === 2, "Test 1: Extracted exactly 2 fibers");
  assert(fiberRes1.fibers[0].fiber === "Cotton" && fiberRes1.fibers[0].percentage === 60, "Test 1: 60% Cotton recognized");
  assert(fiberRes1.fibers[1].fiber === "Recycled Polyester" && fiberRes1.fibers[1].percentage === 40, "Test 1: 40% Recycled Polyester recognized");
  assert(fiberRes1.fibers[1].isRecycled === true, "Test 1: Recycled flag set for recycled polyester");
  assert(fiberRes1.totalPercentage === 100, "Test 1: Total percentage is 100%");
  assert(fiberRes1.isPercentageSum100 === true, "Test 1: Percentage sum is exactly 100%");
  assert(fiberRes1.verificationStatus === "VERIFIED_FROM_TAG", "Test 1: Verification status is VERIFIED_FROM_TAG");
  assert(fiberRes1.evidenceSource === "IMAGE_OCR", "Test 1: Evidence source is IMAGE_OCR");

  // Full end-to-end diagnostic pipeline call
  const diag1 = await evaluateEvidenceBasedDiagnosisAsync(
    "60% Cotton / 40% Recycled Polyester",
    clearCareLabelDataUrl,
    "Sensitive / Allergy Prone",
    "Moderate (18°C - 24°C)",
    "label"
  );
  assert(diag1.inputModality === "LABEL_CARE_TAG", "Test 1: Routed to LABEL_CARE_TAG");
  assert(diag1.careLabelAnalysis !== undefined, "Test 1: Care label analysis object populated");
  assert(diag1.careLabelAnalysis.evidenceSource === "IMAGE_OCR", "Test 1: Diagnosis careLabelAnalysis evidenceSource is IMAGE_OCR");
  assert(diag1.careLabelAnalysis.verificationStatus === "VERIFIED_FROM_TAG", "Test 1: Diagnosis verification status is VERIFIED_FROM_TAG");
  assert(diag1.verifiedTextileInfo.verificationStatus === "VERIFIED_FROM_TAG", "Test 1: Tier 3 verification status is VERIFIED_FROM_TAG");
  assert(diag1.verifiedTextileInfo.evidenceSource === "IMAGE_OCR", "Test 1: Tier 3 evidence source is IMAGE_OCR");
  assert(diag1.verifiedTextileInfo.fiberComposition.includes("60% Cotton"), "Test 1: Tier 3 shows 60% Cotton");
  assert(diag1.verifiedTextileInfo.fiberComposition.includes("40% Recycled Polyester"), "Test 1: Tier 3 shows 40% Recycled Polyester");

  // ================================================================================
  // TEST CASE 2: BLURRY CARE LABEL IMAGE
  // ================================================================================
  console.log("\n>>> TEST CASE 2: Blurry Care Label Image Quality Detection...");

  const blurryQuality = await validateCareLabelImageQuality(blurryCareLabelBuffer);
  assert(blurryQuality.hasImage === true, "Test 2: Blurry image presence detected");
  assert(blurryQuality.isBlurry === true, "Test 2: Blurry quality flagged by Sharp contrast/variance filter");
  assert(blurryQuality.isReadable === false, "Test 2: Unreadable flag correctly set");
  assert(blurryQuality.qualityMessage.includes("Blurry") || blurryQuality.qualityMessage.includes("low-resolution"), "Test 2: Descriptive blur warning generated");

  // Extract instructions with isBlurry = true
  const washCareBlurry = extractWashCareInstructions("Machine wash cold", "IMAGE_OCR", true);
  assert(washCareBlurry.washing.status === "UNREADABLE", "Test 2: Washing marked as UNREADABLE on blurry image");
  assert(washCareBlurry.bleaching.status === "UNREADABLE", "Test 2: Bleaching marked as UNREADABLE on blurry image");
  assert(washCareBlurry.drying.status === "UNREADABLE", "Test 2: Drying marked as UNREADABLE on blurry image");
  assert(washCareBlurry.ironing.status === "UNREADABLE", "Test 2: Ironing marked as UNREADABLE on blurry image");
  assert(washCareBlurry.dryCleaning.status === "UNREADABLE", "Test 2: Dry cleaning marked as UNREADABLE on blurry image");

  // Diagnostic call on blurry image
  const diag2 = await evaluateEvidenceBasedDiagnosisAsync(
    "Unreadable blurry label",
    blurryCareLabelDataUrl,
    "Sensitive / Allergy Prone",
    "Moderate (18°C - 24°C)",
    "label"
  );
  assert(diag2.isLowQuality === true, "Test 2: Diagnostic response flags isLowQuality = true");
  assert(diag2.qualityWarning.includes("Blurry") || diag2.qualityWarning.includes("low-resolution") || diag2.qualityWarning.includes("contrast"), "Test 2: Quality warning includes blur/contrast notice");
  assert(diag2.careLabelAnalysis.unreadableLinesDetected === true, "Test 2: Unreadable lines detected");

  // ================================================================================
  // TEST CASE 3: NO IMAGE UPLOADED (Manual Text Only: "60% cotton / 40% recycled polyester")
  // ================================================================================
  console.log("\n>>> TEST CASE 3: No Image Uploaded – Strict Manual Input Invariant...");

  // Missing image quality validation
  const missingQuality = await validateCareLabelImageQuality(null);
  assert(missingQuality.hasImage === false, "Test 3: Missing payload detected");
  assert(missingQuality.isReadable === false, "Test 3: Readable is false when image missing");
  assert(missingQuality.qualityMessage === "Image not uploaded – manual information only.", "Test 3: Exact message: 'Image not uploaded – manual information only.'");

  // Fiber composition with hasImage = false & evidenceSource = USER_INPUT
  const fiberRes3 = extractFiberComposition("60% cotton / 40% recycled polyester", "USER_INPUT", false);
  assert(fiberRes3.evidenceSource === "USER_INPUT", "Test 3: Evidence source is strictly USER_INPUT");
  assert(fiberRes3.verificationStatus === "SELF_REPORTED_ONLY", "Test 3: Verification status is strictly SELF_REPORTED_ONLY");
  assert(fiberRes3.verificationStatus !== "VERIFIED_FROM_TAG", "Test 3: Invariant strictly holds: NEVER VERIFIED_FROM_TAG without image!");
  assert(fiberRes3.qualityMessage === "Image not uploaded – manual information only.", "Test 3: Quality message attached to fiber result");
  assert(fiberRes3.summary.includes("Self-Reported"), "Test 3: Summary contains '(Self-Reported, Unverified by Care Tag Photo)'");

  // Full end-to-end diagnosis with NO IMAGE PAYLOAD
  const diag3 = await evaluateEvidenceBasedDiagnosisAsync(
    "60% cotton / 40% recycled polyester",
    null,
    "Sensitive / Allergy Prone",
    "Moderate (18°C - 24°C)",
    "label"
  );
  assert(diag3.inputModality === "LABEL_CARE_TAG", "Test 3: Modality is LABEL_CARE_TAG");
  assert(diag3.careLabelAnalysis !== undefined, "Test 3: Care label analysis present");
  assert(diag3.careLabelAnalysis.evidenceSource === "USER_INPUT", "Test 3: careLabelAnalysis.evidenceSource is strictly USER_INPUT");
  assert(diag3.careLabelAnalysis.verificationStatus === "SELF_REPORTED_ONLY", "Test 3: careLabelAnalysis.verificationStatus is strictly SELF_REPORTED_ONLY");
  assert(diag3.careLabelAnalysis.verificationStatus !== "VERIFIED_FROM_TAG", "Test 3: careLabelAnalysis is NEVER VERIFIED_FROM_TAG");
  assert(diag3.careLabelAnalysis.imageQualityMessage === "Image not uploaded – manual information only.", "Test 3: Quality message displayed: 'Image not uploaded – manual information only.'");
  assert(diag3.verifiedTextileInfo.verificationStatus === "SELF_REPORTED_ONLY", "Test 3: Tier 3 verificationStatus is SELF_REPORTED_ONLY");
  assert(diag3.verifiedTextileInfo.evidenceSource === "USER_INPUT", "Test 3: Tier 3 evidenceSource is USER_INPUT");
  assert(diag3.assessmentTitle === "Manual Care Label Data (Image Not Uploaded)", "Test 3: Assessment title indicates manual unuploaded state", diag3.assessmentTitle);
  assert(diag3.comfortScore.explanation.includes("Fiber composition reflects manual wearer input"), "Test 3: Comfort score explanation notes manual unverified input");
  assert(diag3.comfortScore.explanation.includes("non-clinical algorithm estimate"), "Test 3: Comfort score labeled as non-clinical estimate");

  // ================================================================================
  // TEST CASE 4: PARTIALLY VISIBLE CARE LABEL (80% Cotton)
  // ================================================================================
  console.log("\n>>> TEST CASE 4: Partially Visible Care Label (80% Cotton)...");

  const fiberRes4 = extractFiberComposition("80% Cotton", "IMAGE_OCR", true);
  assert(fiberRes4.fibers.length === 1, "Test 4: 1 fiber component detected");
  assert(fiberRes4.totalPercentage === 80, "Test 4: Total percentage parsed as 80%");
  assert(fiberRes4.isPercentageSum100 === false, "Test 4: isPercentageSum100 is false");
  assert(fiberRes4.verificationStatus === "PARTIALLY_VERIFIED", "Test 4: Verification status is PARTIALLY_VERIFIED");
  assert(fiberRes4.summary.includes("20% remaining unstated or unreadable"), "Test 4: Summary accurately specifies 20% remaining unstated or unreadable", fiberRes4.summary);

  const diag4 = await evaluateEvidenceBasedDiagnosisAsync(
    "80% Cotton",
    clearCareLabelDataUrl,
    "Sensitive / Allergy Prone",
    "Moderate (18°C - 24°C)",
    "label"
  );
  assert(diag4.careLabelAnalysis.verificationStatus === "PARTIALLY_VERIFIED", "Test 4: Diagnosis careLabelAnalysis status is PARTIALLY_VERIFIED");
  assert(diag4.verifiedTextileInfo.verificationStatus === "PARTIALLY_VERIFIED", "Test 4: Tier 3 status is PARTIALLY_VERIFIED");
  assert(diag4.careLabelAnalysis.totalPercentage === 80, "Test 4: Total percentage is 80");

  // ================================================================================
  // TEST CASE 5: COMPLETE CARE LABEL WITH ALL 5 WASH CARE INSTRUCTIONS
  // ================================================================================
  console.log("\n>>> TEST CASE 5: Complete Care Label with Structured Care Extraction...");

  const fullCareText = "100% Cotton. Machine wash gentle cycle at 30°C. Do not bleach. Tumble dry low heat. Iron medium max 150°C. Do not dry clean.";
  const washCare5 = extractWashCareInstructions(fullCareText, "IMAGE_OCR", false);

  assert(washCare5.washing.status === "EXTRACTED_SUCCESSFULLY", "Test 5: Washing status is EXTRACTED_SUCCESSFULLY");
  assert(washCare5.washing.temperatureC === 30, "Test 5: Washing temperature 30°C extracted");
  assert(washCare5.washing.cycle === "gentle", "Test 5: Gentle wash cycle extracted");

  assert(washCare5.bleaching.status === "EXTRACTED_SUCCESSFULLY", "Test 5: Bleaching status is EXTRACTED_SUCCESSFULLY");
  assert(washCare5.bleaching.allowed === false, "Test 5: Bleaching allowed is false (Do not bleach)");

  assert(washCare5.drying.status === "EXTRACTED_SUCCESSFULLY", "Test 5: Drying status is EXTRACTED_SUCCESSFULLY");
  assert(washCare5.drying.method === "tumble_low", "Test 5: Tumble dry low heat extracted");

  assert(washCare5.ironing.status === "EXTRACTED_SUCCESSFULLY", "Test 5: Ironing status is EXTRACTED_SUCCESSFULLY");
  assert(washCare5.ironing.temperatureLevel === "medium", "Test 5: Ironing level medium extracted");
  assert(washCare5.ironing.maxTemperatureC === 150, "Test 5: Ironing temperature 150°C extracted");

  assert(washCare5.dryCleaning.status === "EXTRACTED_SUCCESSFULLY", "Test 5: Dry cleaning status is EXTRACTED_SUCCESSFULLY");
  assert(washCare5.dryCleaning.allowed === false, "Test 5: Do not dry clean extracted");

  // Full diagnosis on complete tag
  const diag5 = await evaluateEvidenceBasedDiagnosisAsync(
    fullCareText,
    clearCareLabelDataUrl,
    "Sensitive / Allergy Prone",
    "Moderate (18°C - 24°C)",
    "label"
  );
  assert(diag5.careLabelAnalysis.washCare.washing.status === "EXTRACTED_SUCCESSFULLY", "Test 5: Diagnosis washCare washing is EXTRACTED_SUCCESSFULLY");
  assert(diag5.careLabelAnalysis.washCare.bleaching.status === "EXTRACTED_SUCCESSFULLY", "Test 5: Diagnosis washCare bleaching is EXTRACTED_SUCCESSFULLY");
  assert(diag5.careLabelAnalysis.washCare.drying.status === "EXTRACTED_SUCCESSFULLY", "Test 5: Diagnosis washCare drying is EXTRACTED_SUCCESSFULLY");
  assert(diag5.careLabelAnalysis.washCare.ironing.status === "EXTRACTED_SUCCESSFULLY", "Test 5: Diagnosis washCare ironing is EXTRACTED_SUCCESSFULLY");
  assert(diag5.careLabelAnalysis.washCare.dryCleaning.status === "EXTRACTED_SUCCESSFULLY", "Test 5: Diagnosis washCare dryCleaning is EXTRACTED_SUCCESSFULLY");

  // ================================================================================
  // TEST CASE 6: REGRESSION CHECK - SKIN & FABRIC INTEGRITY PRESERVED
  // ================================================================================
  console.log("\n>>> TEST CASE 6: Regression Protection for Skin & Fabric Recognition...");

  // 1. Skin regression check
  const skinInsp = await inspectImageModalityAsync(skinDataUrl, "auto");
  assert(skinInsp.objectCategory === "SKIN", "Test 6 (Skin): Object category remains strictly SKIN");
  assert(skinInsp.modality === "SKIN_IMAGE", "Test 6 (Skin): Modality remains strictly SKIN_IMAGE");
  assert(skinInsp.hasCutaneousRedness === true, "Test 6 (Skin): Cutaneous redness preserved");
  assert(skinInsp.skinObservations !== undefined, "Test 6 (Skin): Skin observations populated");

  const skinDiag = await evaluateEvidenceBasedDiagnosisAsync(
    "Red itchy rash on forearm",
    skinDataUrl,
    "Sensitive / Allergy Prone",
    "Moderate (18°C - 24°C)",
    "skin"
  );
  assert(skinDiag.inputModality === "SKIN_IMAGE", "Test 6 (Skin): Diagnostic modality is SKIN_IMAGE");
  assert(skinDiag.clinicalNotice.includes("Medical Disclaimer"), "Test 6 (Skin): Medical disclaimer preserved");
  assert(skinDiag.comfortScore.score !== null, "Test 6 (Skin): Skin comfort score dynamically evaluated");

  // 2. Fabric regression check
  const fabricInsp = await inspectImageModalityAsync(beigeFabricDataUrl, "auto");
  assert(fabricInsp.objectCategory === "FABRIC", "Test 6 (Fabric): Beige fabric identified as FABRIC");
  assert(fabricInsp.modality === "FABRIC_SURFACE", "Test 6 (Fabric): Modality is FABRIC_SURFACE");

  const fabricDiag = await evaluateEvidenceBasedDiagnosisAsync(
    "",
    beigeFabricDataUrl,
    "Sensitive / Allergy Prone",
    "Moderate (18°C - 24°C)",
    "fabric"
  );
  assert(fabricDiag.inputModality === "FABRIC_SURFACE", "Test 6 (Fabric): Diagnostic modality is FABRIC_SURFACE");
  assert(fabricDiag.clinicalNotice.includes("Textile Limitation"), "Test 6 (Fabric): Textile limitation notice preserved");
  assert(fabricDiag.verifiedTextileInfo.fiberComposition.includes("Composition: Unknown"), "Test 6 (Fabric): Chemical composition remains unverified from optical photo alone");

  // --------------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------------
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log("\n================================================================================");
  console.log(`📊 TEST EXECUTION SUMMARY: ${passed} PASSED / ${failed} FAILED in ${elapsed}s`);
  console.log("================================================================================");

  if (failed > 0) {
    console.error(`\n❌ Validation suite failed with ${failed} failure(s).`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All ${passed} assertions passed successfully! Care label verification and comfort score improvements verified.`);
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error("Test runner threw uncaught exception:", err);
  process.exit(1);
});
