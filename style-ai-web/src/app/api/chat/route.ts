// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import { getAssistantRuleResponse } from "@/lib/aiStylistRules";

const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

// In-memory sliding window rate limiter
const ipRequestCounts = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipRequestCounts.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRequestCounts.set(ip, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  ipRequestCounts.set(ip, validTimestamps);
  return false;
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "") // Remove control chars
    .slice(0, MAX_MESSAGE_LENGTH);
}

export async function POST(req: Request) {
  try {
    // 1. IP extraction & rate limiting check
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before sending another message." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const message = typeof body.message === "string" ? sanitizeInput(body.message) : "";

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 }
      );
    }

    // 2. High-performance deterministic rule engine match (matching Android app logic)
    const ruleMatch = getAssistantRuleResponse(message);
    if (ruleMatch) {
      return NextResponse.json({ reply: ruleMatch, source: "rule-engine" });
    }

    // 3. Graceful dermatology fallback with prompt suggestions
    const fallbackReply = `Recommendation: Soft Organic Cotton essentials paired with relaxed-fit breathable trousers.
Why: Designed to maximize airflow while preventing skin irritation across varied conditions.
Comfort Score: 95%
Skin Safety Score: 96%

Tip: You can ask about "sensitive skin wear", "best fabric for dermatitis", "summer outfit", "rainy season", or "office wear" for tailored recommendations!`;

    return NextResponse.json({ reply: fallbackReply, source: "rule-engine" });
  } catch (err: unknown) {
    console.error("Chat API internal error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Unable to process styling request. Please try again shortly." },
      { status: 500 }
    );
  }
}
