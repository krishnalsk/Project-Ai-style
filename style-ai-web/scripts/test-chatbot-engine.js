// scripts/test-chatbot-engine.js
// Verification Suite for Style AI: ChatGPT-Like Conversational Engine & Intelligent Retrieval

const sharp = require("sharp");
const { processChatTurn, MISSING_INFO_DISCLAIMER } = require("../src/lib/chatbotEngine.ts");
const { MOCK_PRODUCTS } = require("../src/lib/products.ts");

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

async function runChatbotTestSuite() {
  console.log("================================================================================");
  console.log("💬 STYLE AI - CHATGPT-LIKE CONVERSATIONAL ENGINE & RETRIEVAL SUITE");
  console.log("================================================================================\n");

  const startTime = Date.now();

  // Synthesize test image for in-chat image test
  const careLabelBuffer = await sharp({
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
            '<circle cx="30" cy="120" r="8" fill="#111827"/>' +
            "</svg>"
        ),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();
  const careLabelDataUrl = `data:image/png;base64,${careLabelBuffer.toString("base64")}`;

  // ==============================================================================
  // TEST 1: SKIN-TO-FABRIC SUITABILITY RETRIEVAL
  // ==============================================================================
  console.log(">>> TEST 1: User asks 'What fabric is suitable for my skin?'...");
  const res1 = await processChatTurn({
    message: "What fabric is suitable for my skin?",
    skinType: "Sensitive / Eczema Prone",
    climate: "Moderate (18°C - 24°C)",
    history: [],
  });

  assert(res1.reply.includes("Organic Cotton"), "Test 1: Recommends Organic Cotton for sensitive skin");
  assert(res1.reply.includes("Linen") || res1.reply.includes("Bamboo"), "Test 1: Recommends natural cellulosic options");
  assert(res1.reply.includes("Clinical Note") || res1.reply.includes("dermatologist"), "Test 1: Non-medical disclaimer included");
  assert(res1.matchedProducts.length > 0, "Test 1: Returns matching products from catalog", `Count: ${res1.matchedProducts.length}`);
  assert(res1.matchedProducts.every((p) => p.product.price > 0), "Test 1: All products have authentic real prices");
  assert(res1.suggestedPills.length > 0, "Test 1: Provides follow-up prompt pills");

  // ==============================================================================
  // TEST 2: SPECIFIC FIBER INQUIRY (Is polyester suitable?)
  // ==============================================================================
  console.log("\n>>> TEST 2: User asks 'Is polyester suitable?'...");
  const res2 = await processChatTurn({
    message: "Is polyester suitable?",
    skinType: "Sensitive",
    climate: "Tropical / Humid (30°C+)",
    history: [],
  });

  assert(res2.reply.includes("Not Recommended") || res2.reply.includes("hydrophobic"), "Test 2: Notes synthetic limitations of polyester");
  assert(res2.reply.includes("heat") || res2.reply.includes("breathability"), "Test 2: Explains heat trapping / breathability mechanism");
  assert(res2.reply.includes("care tag") || res2.reply.includes("optical appearance cannot"), "Test 2: Notes that optical appearance cannot confirm composition");
  assert(res2.matchedProducts.length > 0, "Test 2: Provides safe natural alternatives from catalog");

  // ==============================================================================
  // TEST 3: CATALOG SEARCH & PRICE FILTERING (Show me products under ₹2,000)
  // ==============================================================================
  console.log("\n>>> TEST 3: User asks 'Show me products under ₹2,000.'...");
  const res3 = await processChatTurn({
    message: "Show me products under ₹2,000",
    skinType: "Sensitive",
    history: [],
  });

  assert(res3.matchedProducts.length > 0, "Test 3: Found products under ₹2,000");
  const allUnder2000 = res3.matchedProducts.every((p) => p.product.price <= 2000);
  assert(allUnder2000, "Test 3: Strict invariant: 100% of returned items have price <= 2000 INR");
  assert(res3.reply.includes("₹"), "Test 3: Reply formats authentic currency in ₹ (INR)");
  assert(res3.source === "catalog-retrieval", "Test 3: Source is catalog-retrieval");

  // Verify product IDs exist in real 1,000 catalog
  const allIdsValid = res3.matchedProducts.every((p) => MOCK_PRODUCTS.some((mock) => mock.id === p.product.id));
  assert(allIdsValid, "Test 3: All product IDs exist in the real 1,000 catalog (no fake products)");

  // ==============================================================================
  // TEST 4: MULTI-TURN CONVERSATION MEMORY (What did you recommend earlier?)
  // ==============================================================================
  console.log("\n>>> TEST 4: Multi-turn memory recall 'What did you recommend earlier?'...");
  const mockHistory = [
    {
      sender: "user",
      text: "What fabric is suitable for my skin?",
    },
    {
      sender: "ai",
      text: "I recommend Organic Cotton and Pure Flax Linen for your sensitive skin.",
      matchedProducts: [
        {
          product: MOCK_PRODUCTS[0], // e.g. p1
          score: 95,
          breakdown: { skinSafetyWeight: 40, comfortWeight: 25, weatherFitWeight: 15, bodyFitWeight: 10, preferenceBoost: 10, sensitivityPenalty: 0, totalScore: 95 },
          explanation: "Organic cotton classic tee",
          passedAllergyGate: true,
          sensitivityWarnings: [],
        },
      ],
    },
  ];

  const res4 = await processChatTurn({
    message: "What did you recommend earlier?",
    history: mockHistory,
  });

  assert(res4.reply.includes("Earlier in our conversation"), "Test 4: Recognizes prior conversation context");
  assert(res4.reply.includes("Organic Cotton") || res4.reply.includes(MOCK_PRODUCTS[0].name), "Test 4: Accurately recalls previously recommended fabrics/items");
  assert(res4.matchedProducts.length > 0, "Test 4: Carries previously recommended product references");

  // ==============================================================================
  // TEST 5: IN-CHAT IMAGE UPLOAD & MULTIMODAL DIAGNOSIS
  // ==============================================================================
  console.log("\n>>> TEST 5: In-chat care label image upload...");
  const res5 = await processChatTurn({
    message: "60% Cotton / 40% Recycled Polyester",
    image: careLabelDataUrl,
    skinType: "Sensitive",
    climate: "Moderate",
    history: [],
  });

  assert(res5.source === "multimodal-ai-engine", "Test 5: Source is multimodal-ai-engine");
  assert(res5.reply.includes("Garment Care Tag") || res5.reply.includes("Optical Verification"), "Test 5: Diagnoses care tag image");
  assert(res5.reply.includes("60% Cotton") || res5.reply.includes("Recycled Polyester"), "Test 5: Integrates verified fiber breakdown");
  assert(res5.diagnosis !== undefined, "Test 5: Populates structured diagnosis metadata");
  assert(res5.matchedProducts.length > 0, "Test 5: Connects care tag findings to catalog recommendations");

  // ==============================================================================
  // TEST 6: MISSING DATA & OUT-OF-SCOPE INVARIANT
  // ==============================================================================
  console.log("\n>>> TEST 6: Missing data / medical prescription request handling...");
  const res6 = await processChatTurn({
    message: "Can you prescribe steroid medicine or clinical cure for my eczema?",
    skinType: "Sensitive",
    history: [],
  });

  assert(res6.reply.includes(MISSING_INFO_DISCLAIMER), "Test 6: Outputs exact required missing information disclaimer", res6.reply);
  assert(res6.reply.includes("cannot provide medical prescriptions"), "Test 6: Explicitly refuses clinical medical diagnoses");

  // ------------------------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------------------------
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log("\n================================================================================");
  console.log(`📊 CHATBOT SUITE EXECUTION SUMMARY: ${passed} PASSED / ${failed} FAILED in ${elapsed}s`);
  console.log("================================================================================");

  if (failed > 0) {
    console.error(`\n❌ Chatbot test suite failed with ${failed} failure(s).`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All ${passed} assertions passed successfully! ChatGPT-style chatbot engine verified.`);
    process.exit(0);
  }
}

runChatbotTestSuite().catch((err) => {
  console.error("Chatbot test suite threw uncaught exception:", err);
  process.exit(1);
});
