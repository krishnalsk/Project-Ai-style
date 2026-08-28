// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import { getAssistantRuleResponse } from "@/lib/aiStylistRules";

const SYSTEM_PROMPT = `
Act as a Senior AI Fashion Architect for "Style AI".

You must process every user request using the following 4-Step Rule Algorithm:

STEP 1: [Skin Safety Check - XGBoost Model]
Evaluate if condition is Dermatitis, Eczema, or Sensitive Skin. Level: SAFE, MODERATE, AVOID.

STEP 2: [Clothing Recommendation - Random Forest Model]
Weights: Skin Safety(40%), Comfort(25%), Body Fit(20%), Style(10%), Weather(5%).

STEP 3: [Weather Rule Engine]
Adjust recommendation based on real-time weather constraints (heat, humidity, UV).

STEP 4: [Output]
Provide concise, elegant styling advice with fabric details, Comfort Score (e.g. 95%), and Skin Safety Score (e.g. 98%).
`;

const MAX_MESSAGE_LENGTH = 2000;

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "") // Remove control chars
    .slice(0, MAX_MESSAGE_LENGTH);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = typeof body.message === "string" ? sanitizeInput(body.message) : "";
    const userProfile = body.userProfile && typeof body.userProfile === "object" ? body.userProfile : null;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 }
      );
    }

    // 1. Instant local rule engine match (matching Android app logic)
    const ruleMatch = getAssistantRuleResponse(message);
    if (ruleMatch) {
      return NextResponse.json({ reply: ruleMatch, source: "rule-engine" });
    }

    // 2. OpenRouter API fallback if API key is configured
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (apiKey) {
      const profileContext = userProfile
        ? `[User Profile: Skin=${userProfile.skinType || "Normal"}, Preferred Fabric=${userProfile.preferredFabric || "Cotton"}, Size=${userProfile.size || "M"}]`
        : "";

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://style-ai-web.app",
          "X-Title": "Style AI Assistant",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: profileContext
                ? `${profileContext}\n\nQuery: ${message}`
                : message,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "No recommendation generated.";
        return NextResponse.json({ reply, source: "openrouter" });
      }

      // Log API errors server-side only (never expose to client)
      console.error(`OpenRouter API error: ${response.status}`);
    }

    // 3. Graceful fallback with prompt guidance
    const fallbackReply = `Recommendation: Soft Organic Cotton essentials paired with relaxed-fit breathable trousers.
Why: Designed to maximize airflow while preventing skin irritation across varied conditions.
Comfort Score: 95%
Skin Safety Score: 96%

Tip: You can ask about "sensitive skin wear", "best fabric for dermatitis", "summer outfit", or "trending fashion" for specific recommendations!`;

    return NextResponse.json({ reply: fallbackReply, source: "fallback" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
