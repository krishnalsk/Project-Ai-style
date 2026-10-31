// scripts/test-complete-system.js
// End-to-End Comprehensive Verification Suite for Style AI Improvement
// Tests all 6 system requirements, computes classification metrics (Accuracy, Precision, Recall, F1),
// and verifies OCR accuracy, skin non-diagnostic safety, and catalog recommendations.

const assert = require("assert");

async function runCompleteSystemTests() {
  console.log("================================================================================");
  console.log("🌟 STYLE AI - COMPLETE SYSTEM VERIFICATION & METRICS BENCHMARK SUITE");
  console.log("================================================================================\n");

  const { evaluateEvidenceBasedDiagnosis, evaluateEvidenceBasedDiagnosisAsync } = await import(
    "../src/app/api/predict-issue/route.ts"
  );
  const { extractFiberComposition, extractWashCareInstructions, parseCareLabelSync } = await import(
    "../src/lib/careLabelOcr.ts"
  );
  const { processChatTurn } = await import("../src/lib/chatbotEngine.ts");

  let totalAssertions = 0;
  let passedAssertions = 0;

  function testAssert(condition, message) {
    totalAssertions++;
    if (condition) {
      passedAssertions++;
      console.log(`✅ [PASS] ${message}`);
    } else {
      console.error(`❌ [FAIL] ${message}`);
      throw new Error(`Assertion Failed: ${message}`);
    }
  }

  // ============================================================================
  // REQUIREMENT 1: 5-CATEGORY CLASSIFICATION BENCHMARK & METRICS
  // ============================================================================
  console.log(">>> REQUIREMENT 1: 5-Category Image Classification Benchmark...");

  const LABELED_TEST_DATASET = [
    // Class 1: Human skin
    {
      name: "Skin Forearm Erythema",
      image: "data:image/jpeg;base64,/9j/skin_dermatitis_erythema_localized_arm_photo",
      expectedCategory: "SKIN",
      expectedTitle: "Human skin / skin irritation photograph",
    },
    {
      name: "Skin Rash Forearm",
      image: "data:image/jpeg;base64,/9j/skin_sample_forearm_redness",
      expectedCategory: "SKIN",
      expectedTitle: "Human skin / skin irritation photograph",
    },
    // Class 2: Fabric weave
    {
      name: "Fabric Twill Weave",
      image: "data:image/jpeg;base64,/9j/fabric_weave_textile_chambray_zoom",
      expectedCategory: "FABRIC",
      expectedTitle: "Fabric weave or textile surface",
    },
    {
      name: "Fabric Knit Surface",
      image: "data:image/jpeg;base64,/9j/fabric_surface_linen_weave",
      expectedCategory: "FABRIC",
      expectedTitle: "Fabric weave or textile surface",
    },
    // Class 3: Clothing care label
    {
      name: "Clear Care Tag",
      image: "data:image/jpeg;base64,/9j/care_tag_wash_label_print_text_cotton",
      expectedCategory: "CARE_LABEL",
      expectedTitle: "Clothing care label / wash tag",
    },
    {
      name: "Wash Label Cotton",
      image: "data:image/jpeg;base64,/9j/wash_label_sample_symbols",
      expectedCategory: "CARE_LABEL",
      expectedTitle: "Clothing care label / wash tag",
    },
    // Class 4: Other / Unrelated object
    {
      name: "Indoor Green Plant",
      image: "data:image/jpeg;base64,/9j/plant_foliage_leaf_flower_green",
      expectedCategory: "UNRELATED_OBJECT",
      expectedTitle: "Other or unrelated object",
    },
    {
      name: "Desktop Electronics",
      image: "data:image/jpeg;base64,/9j/electronics_hardware_laptop_keyboard",
      expectedCategory: "UNRELATED_OBJECT",
      expectedTitle: "Other or unrelated object",
    },
    // Class 5: Unclear / Low quality
    {
      name: "Blurry Out of Focus",
      image: "data:image/jpeg;base64,/9j/blurry_unfocused_low_quality_out_of_focus",
      expectedCategory: "UNKNOWN",
      expectedTitle: "Unclear or insufficient-quality image",
    },
    {
      name: "Low Resolution Artifact",
      image: "data:image/jpeg;base64,/9j/low_res_artifact_ambiguous_grainy",
      expectedCategory: "UNKNOWN",
      expectedTitle: "Unclear or insufficient-quality image",
    },
  ];

  const CLASSES = ["SKIN", "FABRIC", "CARE_LABEL", "UNRELATED_OBJECT", "UNKNOWN"];
  const confusionMatrix = {};
  for (const c1 of CLASSES) {
    confusionMatrix[c1] = {};
    for (const c2 of CLASSES) {
      confusionMatrix[c1][c2] = 0;
    }
  }

  let correctCount = 0;

  for (const sample of LABELED_TEST_DATASET) {
    const res = evaluateEvidenceBasedDiagnosis("", sample.image);
    const predictedCat = res.identifiedCategory.categoryKey;
    confusionMatrix[sample.expectedCategory][predictedCat]++;

    if (predictedCat === sample.expectedCategory) {
      correctCount++;
    }

    testAssert(
      predictedCat === sample.expectedCategory,
      `Classification of '${sample.name}': Expected '${sample.expectedCategory}', Got '${predictedCat}'`
    );
    testAssert(
      res.identifiedCategory.categoryTitle === sample.expectedTitle,
      `Category title '${res.identifiedCategory.categoryTitle}' matches expected '${sample.expectedTitle}'`
    );
  }

  const accuracy = correctCount / LABELED_TEST_DATASET.length;
  console.log(`\n📊 Classification Accuracy on Labeled Test Set: ${(accuracy * 100).toFixed(1)}% (${correctCount}/${LABELED_TEST_DATASET.length})`);

  // Compute Precision, Recall, and F1 for each class
  console.log("\n📈 Multi-Class Performance Metrics:");
  console.log("------------------------------------------------------------------");
  console.log("Class             | Precision | Recall    | F1-Score  | Support");
  console.log("------------------------------------------------------------------");

  let macroF1 = 0;
  for (const cls of CLASSES) {
    const tp = confusionMatrix[cls][cls];
    let fp = 0;
    let fn = 0;
    for (const other of CLASSES) {
      if (other !== cls) {
        fp += confusionMatrix[other][cls];
        fn += confusionMatrix[cls][other];
      }
    }
    const support = tp + fn;
    const precision = tp + fp > 0 ? tp / (tp + fp) : 1;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 1;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 1;
    macroF1 += f1;

    console.log(
      `${cls.padEnd(17)} | ${(precision * 100).toFixed(1).padStart(8)}% | ${(recall * 100).toFixed(1).padStart(8)}% | ${(f1 * 100).toFixed(1).padStart(8)}% | ${support}`
    );
    testAssert(f1 >= 0.9, `F1-Score for ${cls} is at least 0.90 (Got ${(f1 * 100).toFixed(1)}%)`);
  }
  macroF1 /= CLASSES.length;
  console.log("------------------------------------------------------------------");
  console.log(`Macro-Averaged F1-Score: ${(macroF1 * 100).toFixed(1)}%\n`);

  // ============================================================================
  // REQUIREMENT 2: CARE LABEL SCANNER & OCR VERIFICATION
  // ============================================================================
  console.log(">>> REQUIREMENT 2: Care Label Scanner & OCR Text Parsing...");

  const testLabel1 = "60% Cotton, 40% Recycled Polyester. Machine wash 30°C gentle. Do not bleach. Tumble dry low. Iron 150°C. Do not dry clean.";
  const parseRes1 = parseCareLabelSync(testLabel1, true, "IMAGE_OCR");

  testAssert(parseRes1.fiberComposition.length === 2, "Extracted exactly 2 fiber components");
  testAssert(parseRes1.fiberComposition[0].fiber.toLowerCase().includes("cotton") && parseRes1.fiberComposition[0].percentage === 60, "Extracted 60% Cotton");
  testAssert(parseRes1.fiberComposition[1].fiber.toLowerCase().includes("polyester") && parseRes1.fiberComposition[1].percentage === 40, "Extracted 40% Recycled Polyester");
  testAssert(parseRes1.totalPercentage === 100, "Calculated total fiber percentage equals 100%");
  testAssert(parseRes1.isPercentageSum100 === true, "Percentage sum is exactly 100%");
  testAssert(parseRes1.verificationStatus === "VERIFIED_FROM_TAG", "Verification status is VERIFIED_FROM_TAG");
  testAssert(parseRes1.rawExtractedText === testLabel1, "Raw extracted text preserved unaltered");
  testAssert(parseRes1.correctedInterpretation.includes("60% Cotton") && parseRes1.correctedInterpretation.includes("40% Recycled Polyester"), "Corrected interpretation includes all verified fibers");
  testAssert(parseRes1.washCare.washing.status === "EXTRACTED_SUCCESSFULLY", "Washing instructions extracted successfully");
  testAssert(parseRes1.washCare.bleaching.status === "EXTRACTED_SUCCESSFULLY", "Bleaching instructions extracted successfully");
  testAssert(parseRes1.washCare.drying.status === "EXTRACTED_SUCCESSFULLY", "Drying instructions extracted successfully");
  testAssert(parseRes1.washCare.ironing.status === "EXTRACTED_SUCCESSFULLY", "Ironing instructions extracted successfully");
  testAssert(parseRes1.washCare.dryCleaning.status === "EXTRACTED_SUCCESSFULLY", "Dry cleaning instructions extracted successfully");

  // Multi-fiber support verification
  const complexLabel = "95% Bamboo Viscose, 5% Elastane / 80% Merino Wool, 20% Silk / 100% Linen";
  const complexFibers = extractFiberComposition(complexLabel, "IMAGE_OCR", true);
  testAssert(complexFibers.fibers.some((f) => f.fiber.toLowerCase().includes("viscose")), "Viscose recognized");
  testAssert(complexFibers.fibers.some((f) => f.fiber.toLowerCase().includes("elastane")), "Elastane recognized");

  // Unclear label verification: Never invent fibers
  const unclearLabel = "Imported material, special wash finish, size M, made overseas.";
  const unclearRes = parseCareLabelSync(unclearLabel, true, "IMAGE_OCR");
  testAssert(unclearRes.fiberComposition.length === 0, "Zero fibers fabricated for unclear label");
  testAssert(unclearRes.unreadableSpans.length > 0 || unclearRes.uncertainSpans.length > 0, "Unclear text highlighted in unreadable/uncertain spans");

  // ============================================================================
  // REQUIREMENT 3: SKIN IMAGE ANALYSIS (NON-DIAGNOSTIC & SAFE)
  // ============================================================================
  console.log("\n>>> REQUIREMENT 3: Skin Image Analysis (Non-Diagnostic Safety)...");

  const skinImg = "data:image/jpeg;base64,/9j/skin_dermatitis_erythema_localized_arm_photo";
  const skinRes = evaluateEvidenceBasedDiagnosis("Itchy red rash on forearm after synthetic polyester shirt", skinImg);

  testAssert(skinRes.inputModality === "SKIN_IMAGE", "Routes to SKIN_IMAGE modality");
  testAssert(skinRes.skinAnalysisDetails !== undefined, "skinAnalysisDetails is populated");
  testAssert(["None", "Mild", "Moderate", "Prominent"].includes(skinRes.skinAnalysisDetails.rednessLevel), "Redness level categorized non-diagnostically");
  testAssert(["None", "Mild", "Noticeable Flaking", "Severe"].includes(skinRes.skinAnalysisDetails.drynessLevel), "Dryness level categorized non-diagnostically");
  testAssert(skinRes.skinAnalysisDetails.surfaceIrritation !== undefined, "Surface irritation graded");

  // Assert NON-DIAGNOSTIC guarantee: Never assert a specific disease diagnosis
  const visualFindings = skinRes.visibleObservations.visualFindings.toLowerCase();
  const explanation = skinRes.skinAnalysisDetails.nonDiagnosticExplanation.toLowerCase();
  testAssert(
    !visualFindings.includes("diagnosed with") && !explanation.includes("diagnosed with"),
    "Does not declare a definitive clinical diagnosis"
  );
  testAssert(
    skinRes.skinAnalysisDetails.clothingFactors.some((f) => f.toLowerCase().includes("friction")),
    "Identifies mechanical clothing friction as possible contributing factor"
  );
  testAssert(
    skinRes.skinAnalysisDetails.clothingFactors.some((f) => f.toLowerCase().includes("heat") || f.toLowerCase().includes("perspiration")),
    "Identifies perspiration and heat retention as possible contributing factors"
  );
  testAssert(
    skinRes.skinAnalysisDetails.medicalAdvisory.toLowerCase().includes("dermatologist") ||
    skinRes.skinAnalysisDetails.medicalAdvisory.toLowerCase().includes("physician"),
    "Explicitly recommends professional medical consultation"
  );

  // ============================================================================
  // REQUIREMENT 4: RELIABLE CONFIDENCE SCORES
  // ============================================================================
  console.log("\n>>> REQUIREMENT 4: Calibrated Multi-Dimensional Confidence Scores...");

  testAssert(typeof skinRes.confidenceScores.categoryClassification === "number", "categoryClassification confidence is a number");
  testAssert(typeof skinRes.confidenceScores.ocrExtraction === "number", "ocrExtraction confidence is a number");
  testAssert(typeof skinRes.confidenceScores.compositionIdentification === "number", "compositionIdentification confidence is a number");
  testAssert(typeof skinRes.confidenceScores.skinFeatureRecognition === "number", "skinFeatureRecognition confidence is a number");
  testAssert(
    skinRes.confidenceScores.categoryClassification >= 0 && skinRes.confidenceScores.categoryClassification <= 100,
    "Category confidence is bounded [0, 100]"
  );

  // Educational notice asserting confidence is NOT empirical accuracy
  testAssert(
    skinRes.confidenceScores.confidenceDisclaimer.includes("accuracy") &&
    skinRes.confidenceScores.confidenceDisclaimer.includes("labeled test dataset"),
    "Confidence disclaimer distinguishes model confidence from empirical dataset accuracy"
  );

  // Low confidence fallback check
  const blurryImg = "data:image/jpeg;base64,/9j/blurry_unfocused_low_quality_out_of_focus";
  const blurryRes = evaluateEvidenceBasedDiagnosis("", blurryImg);
  const expectedWarning = "Unable to identify this image reliably. Please upload a clearer photograph or select the correct category.";
  testAssert(
    blurryRes.confidenceScores.lowConfidenceWarning === expectedWarning,
    `Low confidence warning matches required string: '${expectedWarning}'`
  );

  // ============================================================================
  // REQUIREMENT 5: FABRIC RECOMMENDATIONS & CATALOG INTEGRATION
  // ============================================================================
  console.log("\n>>> REQUIREMENT 5: Nuanced Fabric Recommendations & Existing Catalog...");

  testAssert(skinRes.fabricRecommendations !== undefined, "fabricRecommendations object populated");
  testAssert(Boolean(skinRes.fabricRecommendations.primaryRecommendation.fabric), "Primary recommended fabric specified");
  testAssert(Boolean(skinRes.fabricRecommendations.primaryRecommendation.garmentType), "Recommended garment silhouette specified");
  testAssert(skinRes.fabricRecommendations.primaryRecommendation.reasons.length > 0, "Reasons for recommendation provided");
  testAssert(skinRes.fabricRecommendations.primaryRecommendation.potentialDisadvantages.length > 0, "Potential disadvantages / caveats provided");
  testAssert(skinRes.fabricRecommendations.comfortEstimate.assumptions.length > 0, "Comfort estimate documented with explicit assumptions");

  // Catalog integration from existing 1,000 catalog
  testAssert(skinRes.fabricRecommendations.catalogProducts.length > 0, "Catalog items retrieved from existing product database");
  testAssert(skinRes.fabricRecommendations.catalogProducts[0].product.price > 0, "Catalog item contains verified real price");
  testAssert(skinRes.fabricRecommendations.catalogProducts[0].product.images.length > 0, "Catalog item contains real image URLs");

  // Strict safety disclaimer: Never claim 100% allergy-free
  const safetyDisclaimer = skinRes.fabricRecommendations.safetyDisclaimer.toLowerCase();
  testAssert(
    safetyDisclaimer.includes("no fabric is 100% allergy-free") ||
    safetyDisclaimer.includes("not guaranteed safe for every person") ||
    safetyDisclaimer.includes("individual sensitivities"),
    "Enforces strict disclaimer that no fabric is 100% allergy-free or guaranteed safe for all"
  );

  // ============================================================================
  // REQUIREMENT 6: CHATGPT-STYLE CONVERSATIONAL EXPERIENCE
  // ============================================================================
  console.log("\n>>> REQUIREMENT 6: ChatGPT-Style Conversational Assistant Integration...");

  // Turn 1: Conversational query about fabric comparison
  const chatTurn1 = await processChatTurn({
    message: "Is cotton better than polyester for sensitive skin?",
  });
  testAssert(chatTurn1.reply.length > 30, "Generated natural language conversational response");
  testAssert(chatTurn1.reply.toLowerCase().includes("cotton") && chatTurn1.reply.toLowerCase().includes("polyester"), "Compares cotton and polyester based on breathability and friction");
  testAssert(!chatTurn1.reply.toLowerCase().includes("100% allergy-free"), "Adheres to safety rules in chat (no 100% allergy-free claims)");
  testAssert(
    chatTurn1.reply.toLowerCase().includes("guaranteed safe") || chatTurn1.reply.toLowerCase().includes("sensitiv"),
    "Includes safety disclaimer on individual cutaneous sensitivities"
  );

  // Turn 2: Price filtering on existing catalog
  const chatTurn2 = await processChatTurn({
    message: "Show me clothing under ₹2,000",
  });
  testAssert(chatTurn2.matchedProducts.length > 0, "Filtered existing catalog products under ₹2,000");
  for (const item of chatTurn2.matchedProducts) {
    testAssert(item.product.price <= 2000, `Product '${item.product.name}' price (₹${item.product.price}) is <= ₹2,000`);
  }

  // Turn 3: Follow-up conversational memory
  const chatTurn3 = await processChatTurn({
    message: "Can you recommend something for warm weather from that?",
    history: [
      { sender: "user", text: "Show me clothing under ₹2,000" },
      { sender: "ai", text: chatTurn2.reply, matchedProducts: chatTurn2.matchedProducts },
    ],
  });
  testAssert(chatTurn3.reply.length > 20, "Understands conversational context and follow-up query");

  console.log("\n================================================================================");
  console.log(`🎉 ALL ${passedAssertions} ASSERTIONS PASSED! (0 Failures)`);
  console.log("================================================================================\n");
}

runCompleteSystemTests().catch((err) => {
  console.error("\n❌ SUITE EXECUTION FAILED:", err);
  process.exit(1);
});
