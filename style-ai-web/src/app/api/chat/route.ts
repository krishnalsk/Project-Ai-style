// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import { processChatTurn, ChatHistoryMessage } from "@/lib/chatbotEngine";

const MAX_MESSAGE_LENGTH = 3000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 40;

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
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .slice(0, MAX_MESSAGE_LENGTH);
}

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before sending another message." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const rawMessage = typeof body.message === "string" ? body.message : "";
    const message = sanitizeInput(rawMessage);
    const image = body.image || null;
    const skinType = body.skinType || "Sensitive / Allergy Prone";
    const climate = body.climate || "Moderate (18°C - 24°C)";
    const history: ChatHistoryMessage[] = Array.isArray(body.history) ? body.history : [];
    const allergies: string[] = Array.isArray(body.allergies) ? body.allergies : [];
    const cityName: string | undefined = typeof body.cityName === "string" ? body.cityName : undefined;

    if (!message && !image) {
      return NextResponse.json({ error: "Message or image is required" }, { status: 400 });
    }

    // Process turn with conversational retrieval engine
    const response = await processChatTurn({
      message,
      image,
      skinType,
      climate,
      history,
      allergies,
      cityName,
    });

    return NextResponse.json({
      reply: response.reply,
      source: response.source,
      matchedProducts: response.matchedProducts,
      diagnosis: response.diagnosis,
      suggestedPills: response.suggestedPills,
    });
  } catch (err: unknown) {
    console.error("Chat API internal error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Unable to process styling request. Please try again shortly." },
      { status: 500 }
    );
  }
}
