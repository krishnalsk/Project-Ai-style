// src/lib/aiStylistRules.ts
// Port of the Android app's AiStylistViewModel rule-matching engine

export interface AiStylistResponse {
  recommendation: string;
  why: string;
  comfortScore: string;
  skinSafetyScore: string;
  rawText: string;
}

export function getAssistantRuleResponse(input: string): string | null {
  const query = input.toLowerCase().trim();

  // --- CORE RULE MATCHING ---
  if (query.includes("sensitive skin wear") || query.includes("sensitive skin")) {
    return `Recommendation: Cotton oversized T-shirt, loose-fit cotton pants, breathable sneakers.
Why: Soft breathable fabrics help reduce irritation and prevent flare-ups.
Comfort Score: 96%
Skin Safety Score: 98%`;
  }

  if (query.includes("dermatitis") || query.includes("eczema") || query.includes("best fabric for dermatitis")) {
    return `Recommendation: Organic Cotton, Bamboo Fabric, Linen.
Why: These natural fabrics are ultra-soft, highly breathable, and hypoallergenic.
Comfort Score: 95%
Skin Safety Score: 99%`;
  }

  if (query.includes("korean casual") || query.includes("korean")) {
    return `Recommendation: Oversized beige shirt, relaxed-fit trousers, clean white sneakers.
Why: Breathable cotton blend inspired by modern Korean minimalist fashion.
Comfort Score: 94%
Skin Safety Score: 96%`;
  }

  if (query.includes("summer") || query.includes("hot weather")) {
    return `Recommendation: Pure Linen shirt, relaxed cotton shorts, lightweight canvas shoes.
Why: Maximizes airflow and moisture dissipation in high heat.
Comfort Score: 97%
Skin Safety Score: 95%`;
  }

  if (query.includes("winter") || query.includes("cold weather")) {
    return `Recommendation: 100% Cotton thermal innerwear, soft fleece layer, relaxed cotton-lined pants.
Why: Provides warm insulation without rough wool irritating sensitive skin.
Comfort Score: 93%
Skin Safety Score: 95%`;
  }

  if (query.includes("rainy") || query.includes("monsoon")) {
    return `Recommendation: Quick-dry moisture-wicking top, lightweight breathable outer jacket, waterproof shoes.
Why: Prevents damp fabric from sticking to skin in humid/wet conditions.
Comfort Score: 94%
Skin Safety Score: 92%`;
  }

  if (query.includes("office") || query.includes("formal")) {
    return `Recommendation: Crisp cotton formal shirt, lightweight tailored trousers, soft-padded leather loafers.
Why: Professional appearance with skin-gentle all-day comfort.
Comfort Score: 92%
Skin Safety Score: 94%`;
  }

  if (query.includes("college") || query.includes("campus")) {
    return `Recommendation: Relaxed organic cotton graphic tee, breathable joggers, comfortable sneakers.
Why: Flexible and durable for continuous daily wear.
Comfort Score: 95%
Skin Safety Score: 96%`;
  }

  if (query.includes("party") || query.includes("evening")) {
    return `Recommendation: Slim-fit breathable cotton-linen shirt, dark soft chinos, minimalist loafers.
Why: Elevated aesthetic without sacrificing breathability.
Comfort Score: 90%
Skin Safety Score: 92%`;
  }

  if (query.includes("wedding") || query.includes("ethnic")) {
    return `Recommendation: Breathable ethnic kurta set or formal suit with 100% soft cotton lining.
Why: Luxurious traditional look while staying cool during long celebrations.
Comfort Score: 91%
Skin Safety Score: 93%`;
  }

  if (query.includes("travel") || query.includes("flight")) {
    return `Recommendation: Stretch organic cotton tee, elastic waistband joggers, lightweight layer jacket.
Why: Minimizes friction and maximizes circulation on long journeys.
Comfort Score: 97%
Skin Safety Score: 95%`;
  }

  if (query.includes("gym") || query.includes("workout") || query.includes("sports")) {
    return `Recommendation: Bamboo-fiber moisture-wicking sports tee and seamless training shorts.
Why: Naturally antibacterial, highly breathable, and reduces chafing.
Comfort Score: 95%
Skin Safety Score: 90%`;
  }

  if (query.includes("date night") || query.includes("date")) {
    return `Recommendation: Tailored black cotton shirt, beige chinos, clean white sneakers.
Why: Sharp yet approachable with soft-touch materials.
Comfort Score: 93%
Skin Safety Score: 94%`;
  }

  if (query.includes("streetwear")) {
    return `Recommendation: Heavyweight cotton oversized hoodie, wide-leg cargo pants, skate sneakers.
Why: On-trend streetwear drape using comfortable non-synthetic cotton.
Comfort Score: 94%
Skin Safety Score: 90%`;
  }

  if (query.includes("sweat a lot") || query.includes("sweating")) {
    return `Recommendation: Bamboo viscose fabric, moisture-wicking organic cotton, open-weave linen.
Why: Rapid evaporation prevents bacterial growth and sweat rash.
Comfort Score: 98%
Skin Safety Score: 95%`;
  }

  if (query.includes("polyester vs cotton") || query.includes("polyester")) {
    return `Recommendation: 100% Cotton is strongly recommended over Polyester.
Why: Cotton allows natural airflow and absorbs moisture, whereas synthetic polyester traps sweat and heat against the skin.
Comfort Score: 95%
Skin Safety Score: 96%`;
  }

  if (query.includes("trending") || query.includes("trends")) {
    return `Recommendation:
• Relaxed oversized linen shirts
• Earth-tone relaxed trousers
• Clean white minimalist sneakers
• Breathable Korean-cut knitwear
Style Match: 97% | Comfort: 95%`;
  }

  if (query.includes("wardrobe") || query.includes("capsule")) {
    return `Capsule Wardrobe Essentials:
1. Crisp White Organic Cotton T-Shirt
2. Classic Navy Linen Long-Sleeve
3. Relaxed-Fit Breathable Chinos
4. All-Weather Lightweight Cotton Cardigan
5. Minimalist Leather Sneakers
Comfort Score: 96% | Versatility: 99%`;
  }

  // --- GREETINGS & BASICS ---
  if (["hello", "hi", "hey", "hola"].includes(query)) {
    return "Hello! 👋 Welcome to Style AI. How can I help you with skin-safe fashion, comfort ratings, or outfit recommendations today?";
  }

  if (query.includes("what can you do") || query.includes("help")) {
    return `Here is what I can do for you:
• Outfit recommendations based on your skin type
• Skin-safe fabric analysis (XGBoost safety check)
• Weather-adaptive styling
• Capsule wardrobe planning
• Label Lens fabric scanner interpretation`;
  }

  if (query.includes("thank") || query.includes("thanks")) {
    return "You're very welcome! 😊 Feel free to ask anything about styling, fabrics, or skin health.";
  }

  return null;
}
