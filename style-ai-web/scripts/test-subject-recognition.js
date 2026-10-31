// scripts/test-subject-recognition.js
// Comprehensive Verification Suite for Intelligent Image Subject Recognition & Automatic Modality Selection

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

async function runTestSuite() {
  console.log("================================================================================");
  console.log("🔬 DERMSTYLE AI - INTELLIGENT IMAGE SUBJECT RECOGNITION TEST SUITE");
  console.log("================================================================================\n");

  // --------------------------------------------------------------------------------
  // SYNTHESIZE TEST IMAGE BUFFERS
  // --------------------------------------------------------------------------------

  // 1. Beige woven textile (Test 1): R=215, G=195, B=165 (sand/earthy warm fabric)
  const beigeBuffer = await sharp({
    create: { width: 140, height: 140, channels: 3, background: { r: 215, g: 195, b: 165 } },
  })
    .png()
    .toBuffer();
  const beigeDataUrl = `data:image/png;base64,${beigeBuffer.toString("base64")}`;

  // 2. White care label (Test 2): R=248, G=248, B=248 with printed text lines
  const careLabelBuffer = await sharp({
    create: { width: 140, height: 140, channels: 3, background: { r: 248, g: 248, b: 248 } },
  })
    .composite([
      {
        input: Buffer.from(
          '<svg width="140" height="140">' +
            '<rect x="15" y="20" width="110" height="10" fill="#111"/>' +
            '<rect x="15" y="40" width="90" height="8" fill="#222"/>' +
            '<rect x="15" y="60" width="100" height="8" fill="#222"/>' +
            "</svg>"
        ),
        top: 0,
        left: 0,
      },
    ])
    .jpeg()
    .toBuffer();
  const careLabelDataUrl = `data:image/jpeg;base64,${careLabelBuffer.toString("base64")}`;

  // 3. Human skin forearm with mild erythema (Test 3): R=218, G=128, B=102
  const skinBuffer = await sharp({
    create: { width: 140, height: 140, channels: 3, background: { r: 218, g: 128, b: 102 } },
  })
    .jpeg()
    .toBuffer();
  const skinDataUrl = `data:image/jpeg;base64,${skinBuffer.toString("base64")}`;

  // 4. Green botanical plant / foliage (Test 4): R=45, G=170, B=55 (ExG > 20)
  const plantBuffer = await sharp({
    create: { width: 140, height: 140, channels: 3, background: { r: 45, g: 170, b: 55 } },
  })
    .jpeg()
    .toBuffer();
  const plantDataUrl = `data:image/jpeg;base64,${plantBuffer.toString("base64")}`;

  // 5. Electronics / dark hardware (Test 5): R=20, G=20, B=25
  const hardwareBuffer = await sharp({
    create: { width: 140, height: 140, channels: 3, background: { r: 20, g: 20, b: 25 } },
  })
    .jpeg()
    .toBuffer();
  const hardwareDataUrl = `data:image/jpeg;base64,${hardwareBuffer.toString("base64")}`;

  // 6. Low quality / blurry mock (Test 6)
  const blurryDataUrl = "data:image/jpeg;base64,corrupt_payload_too_small";

  // --------------------------------------------------------------------------------
  // TEST 1: BEIGE WOVEN TEXTILE PHOTOGRAPH
  // --------------------------------------------------------------------------------
  console.log(">>> RUNNING TEST 1: Beige woven textile recognition...");
  const rec1 = await inspectImageModalityAsync(beigeDataUrl, "auto");

  assert(
    rec1.detectedSubject === "Woven Textile",
    "Test 1: Identifies detected subject as 'Woven Textile'",
    `Got: ${rec1.detectedSubject}`
  );
  assert(
    rec1.objectCategory === "FABRIC",
    "Test 1: Classifies object category as 'FABRIC'",
    `Got: ${rec1.objectCategory}`
  );
  assert(
    rec1.recommendedModality === "fabric",
    "Test 1: Automatically selects 'fabric' as recommended modality",
    `Got: ${rec1.recommendedModality}`
  );
  assert(
    rec1.modality === "FABRIC_SURFACE",
    "Test 1: Routes effective modality to FABRIC_SURFACE",
    `Got: ${rec1.modality}`
  );
  assert(
    rec1.detectedFeatures.some((f) => f.includes("Beige-colored textile")),
    "Test 1: Detects beige-colored textile feature",
    `Features: ${JSON.stringify(rec1.detectedFeatures)}`
  );
  assert(
    rec1.detectedFeatures.some((f) => f.includes("Visible woven surface")),
    "Test 1: Detects visible woven surface feature"
  );
  assert(
    rec1.detectedFeatures.some((f) => f.includes("Repeating yarn structure")),
    "Test 1: Detects repeating yarn structure feature"
  );
  assert(
    rec1.confidenceTier === "HIGH",
    "Test 1: Assigns HIGH confidence tier",
    `Tier: ${rec1.confidenceTier}, Confidence: ${rec1.confidence}`
  );

  // --------------------------------------------------------------------------------
  // TEST 2: WHITE WASHING INSTRUCTION CARE LABEL
  // --------------------------------------------------------------------------------
  console.log("\n>>> RUNNING TEST 2: White washing instruction care label recognition...");
  const rec2 = await inspectImageModalityAsync(careLabelDataUrl, "auto");

  assert(
    rec2.detectedSubject === "Garment Care Label",
    "Test 2: Identifies detected subject as 'Garment Care Label'",
    `Got: ${rec2.detectedSubject}`
  );
  assert(
    rec2.objectCategory === "CARE_LABEL",
    "Test 2: Classifies object category as 'CARE_LABEL'",
    `Got: ${rec2.objectCategory}`
  );
  assert(
    rec2.recommendedModality === "label",
    "Test 2: Automatically selects 'label' as recommended modality",
    `Got: ${rec2.recommendedModality}`
  );
  assert(
    rec2.modality === "LABEL_CARE_TAG",
    "Test 2: Routes effective modality to LABEL_CARE_TAG"
  );
  assert(
    rec2.detectedFeatures.some((f) => f.includes("White satin ribbon")),
    "Test 2: Detects white satin ribbon base material",
    `Features: ${JSON.stringify(rec2.detectedFeatures)}`
  );
  assert(
    rec2.confidenceTier === "HIGH",
    "Test 2: Assigns HIGH confidence tier"
  );

  // --------------------------------------------------------------------------------
  // TEST 3: HUMAN FOREARM WITH VISIBLE MILD REDNESS
  // --------------------------------------------------------------------------------
  console.log("\n>>> RUNNING TEST 3: Human forearm with localized redness recognition...");
  const rec3 = await inspectImageModalityAsync(skinDataUrl, "auto");

  assert(
    rec3.detectedSubject.includes("Human Skin / Forearm"),
    "Test 3: Identifies detected subject as 'Human Skin / Forearm'",
    `Got: ${rec3.detectedSubject}`
  );
  assert(
    rec3.objectCategory === "SKIN",
    "Test 3: Classifies object category as 'SKIN'",
    `Got: ${rec3.objectCategory}`
  );
  assert(
    rec3.recommendedModality === "skin",
    "Test 3: Automatically selects 'skin' as recommended modality",
    `Got: ${rec3.recommendedModality}`
  );
  assert(
    rec3.modality === "SKIN_IMAGE",
    "Test 3: Routes effective modality to SKIN_IMAGE"
  );
  assert(
    rec3.detectedFeatures.some((f) => f.includes("erythema") || f.includes("redness")),
    "Test 3: Detects observable localized cutaneous redness (erythema)",
    `Features: ${JSON.stringify(rec3.detectedFeatures)}`
  );
  assert(
    rec3.confidenceTier === "HIGH",
    "Test 3: Assigns HIGH confidence tier"
  );

  // --------------------------------------------------------------------------------
  // TEST 4: UNRELATED OBJECT - GREEN PLANT / BOTANICAL FOLIAGE
  // --------------------------------------------------------------------------------
  console.log("\n>>> RUNNING TEST 4: Unrelated object (Green plant foliage) recognition...");
  const rec4 = await inspectImageModalityAsync(plantDataUrl, "auto");

  assert(
    rec4.detectedSubject === "Indoor Plant / Foliage",
    "Test 4: Identifies subject as 'Indoor Plant / Foliage'",
    `Got: ${rec4.detectedSubject}`
  );
  assert(
    rec4.objectCategory === "UNRELATED_OBJECT",
    "Test 4: Flags objectCategory strictly as 'UNRELATED_OBJECT'",
    `Got: ${rec4.objectCategory}`
  );
  assert(
    rec4.isUnrelatedObject === true,
    "Test 4: Sets isUnrelatedObject to true"
  );
  assert(
    rec4.recommendedModality === "unrelated",
    "Test 4: Recommended modality is 'unrelated' (never forced into skin or fabric)"
  );

  // End-to-end diagnostic behavior with unrelated plant upload
  const diag4 = await evaluateEvidenceBasedDiagnosisAsync(
    "Testing plant photo",
    plantDataUrl,
    "Normal",
    "Moderate (18°C - 24°C)",
    "auto"
  );
  assert(
    diag4.assessmentTitle.includes("Unrelated Object Detected"),
    "Test 4: Diagnostic engine pauses assessment for unrelated objects",
    `Got: ${diag4.assessmentTitle}`
  );
  assert(
    diag4.comfortScore.score === null,
    "Test 4: Does NOT compute comfort score for an unrelated plant"
  );
  assert(
    diag4.imageRecognition !== undefined && diag4.imageRecognition.isUnrelatedObject === true,
    "Test 4: Diagnostic response embeds imageRecognition metadata"
  );

  // --------------------------------------------------------------------------------
  // TEST 5: UNRELATED OBJECT - ELECTRONICS / HARDWARE
  // --------------------------------------------------------------------------------
  console.log("\n>>> RUNNING TEST 5: Unrelated object (Electronics / Hardware) recognition...");
  const rec5 = await inspectImageModalityAsync(hardwareDataUrl, "auto");

  assert(
    rec5.objectCategory === "UNRELATED_OBJECT",
    "Test 5: Categorizes hardware as UNRELATED_OBJECT",
    `Got: ${rec5.objectCategory}`
  );
  assert(
    rec5.isUnrelatedObject === true,
    "Test 5: Sets isUnrelatedObject flag"
  );

  // --------------------------------------------------------------------------------
  // TEST 6: BLURRY / LOW-QUALITY / CORRUPTED IMAGE
  // --------------------------------------------------------------------------------
  console.log("\n>>> RUNNING TEST 6: Blurry / low-quality photograph handling...");
  const rec6 = await inspectImageModalityAsync(blurryDataUrl, "auto");

  assert(
    rec6.objectCategory === "UNKNOWN",
    "Test 6: Object category is UNKNOWN for blurry payload",
    `Got: ${rec6.objectCategory}`
  );
  assert(
    rec6.confidenceTier === "LOW",
    "Test 6: Confidence tier is LOW for blurry payload",
    `Got: ${rec6.confidenceTier}`
  );
  assert(
    rec6.alternativeCategories.length >= 4,
    "Test 6: Provides intelligent alternative category suggestions",
    `Suggestions: ${JSON.stringify(rec6.alternativeCategories)}`
  );
  assert(
    rec6.isLowQuality === true,
    "Test 6: Flags isLowQuality as true"
  );

  // --------------------------------------------------------------------------------
  // TEST 7: MANUAL CATEGORY CORRECTION OVERRIDE
  // --------------------------------------------------------------------------------
  console.log("\n>>> RUNNING TEST 7: Manual category correction override...");
  // User uploads beige fabric with "Auto-Detect": system chooses fabric
  const autoRes = await inspectImageModalityAsync(beigeDataUrl, "auto");
  assert(
    autoRes.modality === "FABRIC_SURFACE",
    "Test 7A: Auto-detect correctly selects FABRIC_SURFACE"
  );

  // User manually switches category to "label": system respects user override
  const overrideRes = await inspectImageModalityAsync(beigeDataUrl, "label");
  assert(
    overrideRes.userSelectedModality === "LABEL_CARE_TAG",
    "Test 7B: System records user's manual modality choice"
  );

  // --------------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`🎯 SUBJECT RECOGNITION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
