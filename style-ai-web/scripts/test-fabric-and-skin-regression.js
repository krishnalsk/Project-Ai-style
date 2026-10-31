// scripts/test-fabric-and-skin-regression.js
// Verification Suite for Style AI: Fabric Recognition, Skin Preservation & Modality Synchronization

const sharp = require("sharp");
const { inspectImageModalityAsync } = require("../src/lib/imageInspector.ts");
const { classifyImageBuffer } = require("../src/lib/visionClassifier.ts");
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

async function runRegressionSuite() {
  console.log("================================================================================");
  console.log("🔬 DERMSTYLE AI - FABRIC RECOGNITION & SKIN PRESERVATION REGRESSION SUITE");
  console.log("================================================================================\n");

  const startTime = Date.now();

  // --------------------------------------------------------------------------------
  // SYNTHESIZE OPTICAL TEST BUFFERS
  // --------------------------------------------------------------------------------

  // 1. Forearm human skin with localized erythema (Fitzpatrick locus)
  // R=218, G=128, B=102 -> R > G > B, R-G = 90, G-B = 26
  const skinBuffer = await sharp({
    create: { width: 150, height: 150, channels: 3, background: { r: 218, g: 128, b: 102 } },
  })
    .png()
    .toBuffer();
  const skinDataUrl = `data:image/png;base64,${skinBuffer.toString("base64")}`;

  // 2. Beige folded fabric photograph:
  // Realistic beige / khaki folded textile with shadow gradient:
  // Base earthy sand color (R=185, G=170, B=130) with fold creases
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

  // 3. Shadowed / olive-tan folded fabric under interior lighting where G slightly exceeds R:
  // R=142, G=148, B=100 (Previously triggered plant false-positive!)
  const shadowedBeigeBuffer = await sharp({
    create: { width: 150, height: 150, channels: 3, background: { r: 142, g: 148, b: 100 } },
  })
    .composite([
      {
        input: Buffer.from(
          '<svg width="150" height="150">' +
            '<line x1="10" y1="0" x2="20" y2="150" stroke="#756b40" stroke-width="5"/>' +
            '<line x1="75" y1="0" x2="85" y2="150" stroke="#635930" stroke-width="7"/>' +
            "</svg>"
        ),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();
  const shadowedBeigeDataUrl = `data:image/png;base64,${shadowedBeigeBuffer.toString("base64")}`;

  // 4. Botanical green plant / foliage: R=40, G=175, B=50 (High chlorophyll chrominance)
  const plantBuffer = await sharp({
    create: { width: 150, height: 150, channels: 3, background: { r: 40, g: 175, b: 50 } },
  })
    .png()
    .toBuffer();
  const plantDataUrl = `data:image/png;base64,${plantBuffer.toString("base64")}`;

  // 5. White printed care label with washing instructions:
  const careLabelBuffer = await sharp({
    create: { width: 150, height: 150, channels: 3, background: { r: 246, g: 246, b: 246 } },
  })
    .composite([
      {
        input: Buffer.from(
          '<svg width="150" height="150">' +
            '<rect x="20" y="20" width="110" height="8" fill="#111"/>' +
            '<rect x="20" y="40" width="85" height="8" fill="#222"/>' +
            '<rect x="20" y="60" width="95" height="8" fill="#222"/>' +
            "</svg>"
        ),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();
  const careLabelDataUrl = `data:image/png;base64,${careLabelBuffer.toString("base64")}`;

  // --------------------------------------------------------------------------------
  // TEST A: SKIN RECOGNITION (STRICT PRIORITY 1 - PROTECTED)
  // --------------------------------------------------------------------------------
  console.log(">>> TEST A: Skin Recognition Preservation (Protected Component)...");

  const skinInsp = await inspectImageModalityAsync(skinDataUrl, "auto");
  assert(skinInsp.objectCategory === "SKIN", "Test A: Object Category is strictly 'SKIN'");
  assert(skinInsp.modality === "SKIN_IMAGE", "Test A: Routes modality to 'SKIN_IMAGE'");
  assert(skinInsp.detectedSubject.includes("Skin"), "Test A: Subject identifies as Skin Surface", skinInsp.detectedSubject);
  assert(skinInsp.hasCutaneousRedness === true, "Test A: Observable cutaneous redness detected");
  assert(skinInsp.isUnrelatedObject === false, "Test A: Skin is NEVER marked as unrelated object");
  assert(skinInsp.skinObservations !== undefined, "Test A: Skin observations structure is fully populated");
  assert(skinInsp.skinObservations.erythemaLevel === "Localized Mild" || skinInsp.skinObservations.erythemaLevel === "Confluent Pronounced", "Test A: Erythema level graded");

  // Run full 5-tier diagnostic on skin
  const skinDiag = await evaluateEvidenceBasedDiagnosisAsync(
    "Mild itching and redness on forearm",
    skinDataUrl,
    "Sensitive / Allergy Prone",
    "Moderate (18°C - 24°C)",
    "skin"
  );
  assert(skinDiag.inputModality === "SKIN_IMAGE", "Test A: Diagnostic input modality is SKIN_IMAGE");
  assert(skinDiag.clinicalNotice.includes("Medical Disclaimer"), "Test A: Statutory medical disclaimer preserved");
  assert(skinDiag.comfortScore.score !== null, "Test A: Comfort score computed dynamically", skinDiag.comfortScore.score);
  assert(skinDiag.visibleObservations.subject === "Human Skin Surface", "Test A: Visible observations subject is Human Skin Surface");
  assert(skinDiag.careLabelAnalysis === undefined, "Test A: Care label OCR is STRICTLY undefined for skin");

  // --------------------------------------------------------------------------------
  // TEST B: FABRIC RECOGNITION (PRIORITY 2 & PRIORITY 3)
  // --------------------------------------------------------------------------------
  console.log("\n>>> TEST B: Fabric Recognition & Manual Modality Override...");

  // B1: Beige folded fabric under Auto-Detect
  const beigeAutoInsp = await inspectImageModalityAsync(beigeFabricDataUrl, "auto");
  assert(beigeAutoInsp.objectCategory === "FABRIC", "Test B1: Beige folded fabric is categorized as 'FABRIC' under Auto-Detect", beigeAutoInsp.objectCategory);
  assert(beigeAutoInsp.modality === "FABRIC_SURFACE", "Test B1: Modality is 'FABRIC_SURFACE'");
  assert(beigeAutoInsp.isUnrelatedObject === false, "Test B1: Beige folded fabric is NOT marked as unrelated object");
  assert(!beigeAutoInsp.detectedSubject.includes("Plant"), "Test B1: Beige fabric is NOT identified as Indoor Plant / Foliage", beigeAutoInsp.detectedSubject);

  // B2: Shadowed folded fabric (Where G slightly exceeds R) under Auto-Detect
  const shadowAutoInsp = await inspectImageModalityAsync(shadowedBeigeDataUrl, "auto");
  assert(shadowAutoInsp.objectCategory === "FABRIC", "Test B2: Shadowed crease fabric is categorized as 'FABRIC' (not plant)", shadowAutoInsp.objectCategory);
  assert(shadowAutoInsp.isUnrelatedObject === false, "Test B2: Shadowed crease fabric is NOT unrelated object");

  // B3: Manual selection of "Fabric Weave Photo"
  const beigeManualInsp = await inspectImageModalityAsync(beigeFabricDataUrl, "fabric");
  assert(beigeManualInsp.objectCategory === "FABRIC", "Test B3: Manual 'fabric' selection produces 'FABRIC' category");
  assert(beigeManualInsp.modality === "FABRIC_SURFACE", "Test B3: Manual selection produces 'FABRIC_SURFACE'");
  assert(beigeManualInsp.isUnrelatedObject === false, "Test B3: isUnrelatedObject is strictly false");

  // B4: Run 5-tier diagnostic on beige folded fabric with "fabric" modality
  const fabricDiag = await evaluateEvidenceBasedDiagnosisAsync(
    "Casual beige shirt fabric",
    beigeFabricDataUrl,
    "Normal",
    "Moderate (18°C - 24°C)",
    "fabric"
  );
  assert(fabricDiag.inputModality === "FABRIC_SURFACE", "Test B4: 5-tier report activates FABRIC_SURFACE");
  assert(fabricDiag.assessmentTitle === "Textile Surface Texture & Weave Analysis", "Test B4: Assessment title is Textile Surface Texture & Weave Analysis");
  assert(!fabricDiag.assessmentTitle.includes("Paused"), "Test B4: Assessment is NOT paused");
  assert(fabricDiag.verifiedTextileInfo.fiberComposition.includes("Composition: Unknown"), "Test B4: Safe disclaimer: Composition Unknown from optical photo alone");
  assert(fabricDiag.personalizedClothingSuggestions.suggestedFabrics.length > 0, "Test B4: Tier 5 clothing suggestions populated");

  // --------------------------------------------------------------------------------
  // TEST C: OTHER IMAGES (PLANT, PAPER/LABEL)
  // --------------------------------------------------------------------------------
  console.log("\n>>> TEST C: Accurate Discrimination of Plants and Care Tags...");

  // C1: True green botanical plant
  const plantInsp = await inspectImageModalityAsync(plantDataUrl, "auto");
  assert(plantInsp.objectCategory === "UNRELATED_OBJECT", "Test C1: True green plant is categorized as 'UNRELATED_OBJECT'");
  assert(plantInsp.detectedSubject === "Indoor Plant / Foliage", "Test C1: Detected subject is 'Indoor Plant / Foliage'");
  assert(plantInsp.isUnrelatedObject === true, "Test C1: isUnrelatedObject flag is true for plant");

  const plantDiag = await evaluateEvidenceBasedDiagnosisAsync(
    "",
    plantDataUrl,
    "Normal",
    "Moderate (18°C - 24°C)",
    "auto"
  );
  assert(plantDiag.assessmentTitle.includes("Assessment Paused"), "Test C1: Diagnostic assessment is paused for unrelated plant");
  assert(plantDiag.comfortScore.score === null, "Test C1: Comfort score is null (Indeterminate) for plant");

  // C2: Care Label
  const labelInsp = await inspectImageModalityAsync(careLabelDataUrl, "auto");
  assert(labelInsp.objectCategory === "CARE_LABEL", "Test C2: Care label is categorized as 'CARE_LABEL'");
  assert(labelInsp.modality === "LABEL_CARE_TAG", "Test C2: Modality is 'LABEL_CARE_TAG'");
  assert(labelInsp.isUnrelatedObject === false, "Test C2: Care label is NOT an unrelated object");

  // --------------------------------------------------------------------------------
  // TEST D: MODALITY SWITCHING & STALE STATE ELIMINATION
  // --------------------------------------------------------------------------------
  console.log("\n>>> TEST D: Modality Switching & Stale State Elimination...");

  // Step 1: Auto-Detect on Fabric -> evaluates as FABRIC_SURFACE
  const step1 = await inspectImageModalityAsync(beigeFabricDataUrl, "auto");
  assert(step1.objectCategory === "FABRIC", "Test D (Step 1): Auto detects beige fabric as FABRIC");
  assert(step1.modality === "FABRIC_SURFACE", "Test D (Step 1): Auto modality is FABRIC_SURFACE");

  // Step 2: Switch to Skin Photo with Skin Modality -> runs Skin analysis, no fabric residue
  const step2 = await evaluateEvidenceBasedDiagnosisAsync(
    "Mild itching on arm",
    skinDataUrl,
    "Sensitive",
    "Moderate (18°C - 24°C)",
    "skin",
    "skin_session_1"
  );
  assert(step2.inputModality === "SKIN_IMAGE", "Test D (Step 2): Modality switches to SKIN_IMAGE");
  assert(step2.skinObservations !== undefined, "Test D (Step 2): Skin visual observations active");
  assert(step2.weaveCharacteristics === undefined, "Test D (Step 2): Previous fabric weave characteristics purged (undefined)");
  assert(step2.careLabelAnalysis === undefined, "Test D (Step 2): Care label analysis is undefined");

  // Step 3: Switch to Fabric Weave Photo with Fabric Modality -> runs Fabric analysis, no skin residue
  const step3 = await evaluateEvidenceBasedDiagnosisAsync(
    "Casual beige shirt weave",
    beigeFabricDataUrl,
    "Normal",
    "Moderate (18°C - 24°C)",
    "fabric",
    "fabric_session_2"
  );
  assert(step3.inputModality === "FABRIC_SURFACE", "Test D (Step 3): Modality switches to FABRIC_SURFACE");
  assert(step3.weaveCharacteristics !== undefined, "Test D (Step 3): Weave characteristics active");
  assert(step3.skinObservations === undefined, "Test D (Step 3): Previous skin observations purged (undefined)");
  assert(!step3.assessmentTitle.includes("Paused"), "Test D (Step 3): Fabric assessment is active and NOT paused");

  // Step 4: Switch to Care Tag Photo with Care Tag Modality -> runs Care Tag OCR, no fabric/skin residue
  const step4 = await evaluateEvidenceBasedDiagnosisAsync(
    "100% Cotton care tag",
    careLabelDataUrl,
    "Normal",
    "Moderate (18°C - 24°C)",
    "label",
    "label_session_3"
  );
  assert(step4.inputModality === "LABEL_CARE_TAG", "Test D (Step 4): Modality switches to LABEL_CARE_TAG");
  assert(step4.careLabelAnalysis !== undefined, "Test D (Step 4): Care label analysis active");
  assert(step4.skinObservations === undefined, "Test D (Step 4): Skin observations strictly purged");

  // Step 5: Modality Mismatch Guard (Fabric selected on Care Tag image)
  const step5 = await inspectImageModalityAsync(careLabelDataUrl, "fabric");
  assert(step5.mismatchDetected === true, "Test D (Step 5): Detects mismatch when Fabric is selected on Care Tag");
  assert(step5.suggestedModality === "LABEL_CARE_TAG", "Test D (Step 5): Accurately suggests switching to LABEL_CARE_TAG");

  const duration = Date.now() - startTime;
  console.log("\n================================================================================");
  console.log(`🎯 REGRESSION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`⏱ Total Execution Time: ${duration}ms (Avg ${(duration / (passed + failed)).toFixed(1)}ms per test assertion)`);
  console.log("================================================================================");

  if (failed > 0) process.exit(1);
}

runRegressionSuite().catch((err) => {
  console.error("FATAL ERROR IN REGRESSION SUITE:", err);
  process.exit(1);
});
