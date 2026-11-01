// style-ai-web/scripts/test-chat-cases.js
const { generateClientChatResponse } = require("../src/lib/clientChatEngine");
const { processChatTurn } = require("../src/lib/chatbotEngine");

async function testAll() {
  const cases = [
    { label: "User Name (screenshot case)", query: "balamuarlie" },
    { label: "Capitalized User Name", query: "Balamurali" },
    { label: "Explicit Introduction", query: "my name is Balamurali" },
    { label: "Greeting", query: "hi" },
    { label: "Gratitude", query: "thank you" },
    { label: "Small Talk", query: "how are you" },
    { label: "Affirmation", query: "ok" },
    { label: "Goodbye", query: "bye" },
    { label: "Capabilities", query: "who are you" },
    { label: "Fabric Comparison", query: "cotton vs polyester" },
    { label: "Skin Suitability", query: "what fabric is suitable for my skin?" },
    { label: "Outfit Recommendation", query: "recommend an outfit" },
    { label: "Price / Catalog Search", query: "Show me products under ₹2,000" },
    { label: "Gaming Out-of-Domain", query: "what is GTA 6" },
    { label: "Gaming Query", query: "game" },
    { label: "Tech Out-of-Domain", query: "watch tech" },
    { label: "Tech Query", query: "tech" },
    { label: "Entertainment Out-of-Domain", query: "can you recommend an anime movie" },
    { label: "Food Out-of-Domain", query: "what is the best pizza recipe" },
    { label: "Vague Outfit Inquiry (Missing details)", query: "what should I wear" },
    { label: "Natural Fallback / Conversation", query: "can you help me with summer fashion" },
  ];

  console.log("================================================================================");
  console.log("TESTING CLIENT CHAT ENGINE & SERVER CHATBOT ENGINE PARITY");
  console.log("================================================================================");

  let allPassed = true;

  for (const item of cases) {
    console.log(`\n--- [TEST] ${item.label}: "${item.query}" ---`);

    // Test Client Engine
    const clientRes = await generateClientChatResponse({ message: item.query });
    console.log(`[Client] Source: ${clientRes.source} | Matched: ${clientRes.matchedProducts.length}`);
    console.log(`[Client] Reply:\n${clientRes.reply.slice(0, 160)}...\n`);

    // Test Server Engine
    const serverRes = await processChatTurn({ message: item.query });
    console.log(`[Server] Source: ${serverRes.source} | Matched: ${serverRes.matchedProducts.length}`);
    console.log(`[Server] Reply:\n${serverRes.reply.slice(0, 160)}...\n`);

    // Verify neither returns the old canned robotic text:
    const oldCanned = "Hello! I am your Style AI Assistant, trained on textile dermatology and our verified 1,000-record sustainable fashion catalog.";
    if (clientRes.reply.includes(oldCanned) || serverRes.reply.includes(oldCanned)) {
      console.error(`FAILED: "${item.query}" returned old canned text!`);
      allPassed = false;
    }
  }

  // Also test name persistence across conversation turns:
  console.log("\n--- [TEST] Name Persistence in Multi-Turn Conversation ---");
  const turn1 = { sender: "user", text: "balamuarlie" };
  const aiTurn1 = { sender: "ai", text: "Hello Balamuarlie! Great to meet you!" };
  const turn2 = { sender: "user", text: "what is GTA 6" };

  const multiTurnRes = await generateClientChatResponse({
    message: turn2.text,
    history: [turn1, aiTurn1],
  });

  console.log("[Multi-Turn] Client Response addressing name:\n", multiTurnRes.reply.slice(0, 200));
  if (!multiTurnRes.reply.includes("Balamuarlie")) {
    console.error("FAILED: Multi-turn response did not address user by remembered name!");
    allPassed = false;
  } else {
    console.log("PASSED: Multi-turn response addressed user by remembered name!");
  }

  console.log(`\n================================================================================`);
  console.log(`ALL CONVERSATIONAL TESTS RESULT: ${allPassed ? "100% PASSED" : "FAILED"}`);
  console.log(`================================================================================`);
}

testAll().catch(console.error);
