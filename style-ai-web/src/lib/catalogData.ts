// style-ai-web/src/lib/catalogData.ts
// Comprehensive 1,000-Record Fashion & Textile Catalog for Style AI

export interface FiberDetail {
  name: string;
  percentage: number;
  isHypoallergenic: boolean;
  isSynthetic: boolean;
}

export interface ProductRecord {
  id: string;
  name: string;
  description: string;
  category: "Tops" | "Bottoms" | "Outerwear" | "Dresses" | "Activewear" | "Sleepwear" | "Footwear" | "Accessories";
  subCategory: string;
  price: number;
  originalPrice: number;
  images: string[];
  availableSizes: string[];
  colors: string[];
  fabric: string;
  fibers: FiberDetail[];
  comfortScore: number;
  skinSafetyScore: number;
  skinSafety: "SAFE" | "MODERATE" | "AVOID";
  bodyFitScore: number;
  trendScore: number;
  sustainabilityScore: number;
  suitableWeather: string[];
  suitableOccasions: string[];
  season: string[];
  fit: "Relaxed" | "Loose" | "Regular" | "Slim" | "Oversized";
  allergens: string[];
  stock: number;
  tags: string[];
  emoji: string;
  isDemonstration: boolean;
}

// ─── REAL UNPLASH IMAGERY REPOSITORY ─────────────────────────────────────────
const CATEGORY_IMAGES: Record<string, string[]> = {
  Tops: [
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1588636310486-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
  ],
  Bottoms: [
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&auto=format&fit=crop&q=80",
  ],
  Outerwear: [
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?w=800&auto=format&fit=crop&q=80",
  ],
  Dresses: [
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80",
  ],
  Activewear: [
    "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1483721074576-5918667a9cf5?w=800&auto=format&fit=crop&q=80",
  ],
  Sleepwear: [
    "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551854838-212c50b4c184?w=800&auto=format&fit=crop&q=80",
  ],
  Footwear: [
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&auto=format&fit=crop&q=80",
  ],
  Accessories: [
    "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
  ],
};

// ─── FABRIC MATRIX DEFINITIONS ──────────────────────────────────────────────
interface FabricArchetype {
  name: string;
  fibers: FiberDetail[];
  skinSafety: "SAFE" | "MODERATE" | "AVOID";
  skinSafetyScore: number;
  comfortScore: number;
  sustainabilityScore: number;
  allergens: string[];
  suitableWeather: string[];
  descriptionTrait: string;
}

const FABRIC_ARCHETYPES: FabricArchetype[] = [
  {
    name: "100% GOTS Organic Cotton",
    fibers: [{ name: "Organic Cotton", percentage: 100, isHypoallergenic: true, isSynthetic: false }],
    skinSafety: "SAFE",
    skinSafetyScore: 98,
    comfortScore: 96,
    sustainabilityScore: 99,
    allergens: [],
    suitableWeather: ["Hot", "Humid", "Pleasant", "All-Weather"],
    descriptionTrait: "Certified GOTS organic cotton zero synthetic dyes, ultra-gentle on dermatitis and eczema.",
  },
  {
    name: "100% Pure French Flax Linen",
    fibers: [{ name: "French Flax Linen", percentage: 100, isHypoallergenic: true, isSynthetic: false }],
    skinSafety: "SAFE",
    skinSafetyScore: 97,
    comfortScore: 95,
    sustainabilityScore: 98,
    allergens: [],
    suitableWeather: ["Hot", "Humid", "Sunny", "Summer"],
    descriptionTrait: "Open-weave natural flax provides maximum passive airflow, preventing sweat rash.",
  },
  {
    name: "95% Bamboo Viscose / 5% Elastane",
    fibers: [
      { name: "Bamboo Viscose", percentage: 95, isHypoallergenic: true, isSynthetic: false },
      { name: "Elastane", percentage: 5, isHypoallergenic: false, isSynthetic: true },
    ],
    skinSafety: "SAFE",
    skinSafetyScore: 94,
    comfortScore: 97,
    sustainabilityScore: 92,
    allergens: ["Latex / Spandex"],
    suitableWeather: ["Humid", "Hot", "Pleasant"],
    descriptionTrait: "Silky-smooth microtexture with high natural moisture-wicking and antimicrobial properties.",
  },
  {
    name: "100% Mulberry Silk",
    fibers: [{ name: "Mulberry Silk", percentage: 100, isHypoallergenic: true, isSynthetic: false }],
    skinSafety: "SAFE",
    skinSafetyScore: 99,
    comfortScore: 98,
    sustainabilityScore: 88,
    allergens: [],
    suitableWeather: ["Pleasant", "Hot", "Cold (Inner Layer)"],
    descriptionTrait: "Naturally hypoallergenic sericin protein structure protects delicate skin barriers from mechanical friction.",
  },
  {
    name: "100% Tencel Lyocell",
    fibers: [{ name: "Tencel Lyocell", percentage: 100, isHypoallergenic: true, isSynthetic: false }],
    skinSafety: "SAFE",
    skinSafetyScore: 96,
    comfortScore: 95,
    sustainabilityScore: 97,
    allergens: [],
    suitableWeather: ["Hot", "Humid", "Spring", "Summer"],
    descriptionTrait: "Closed-loop eucalyptus wood fiber offering superior breathability and botanical softness.",
  },
  {
    name: "70% Organic Cotton / 30% Hemp",
    fibers: [
      { name: "Organic Cotton", percentage: 70, isHypoallergenic: true, isSynthetic: false },
      { name: "Natural Hemp", percentage: 30, isHypoallergenic: true, isSynthetic: false },
    ],
    skinSafety: "SAFE",
    skinSafetyScore: 95,
    comfortScore: 92,
    sustainabilityScore: 98,
    allergens: [],
    suitableWeather: ["Hot", "Humid", "Pleasant"],
    descriptionTrait: "Antimicrobial hemp blend with high tensile strength that softens with every wash.",
  },
  {
    name: "60% Recycled Cotton / 40% Recycled Polyester",
    fibers: [
      { name: "Recycled Cotton", percentage: 60, isHypoallergenic: true, isSynthetic: false },
      { name: "Recycled Polyester", percentage: 40, isHypoallergenic: false, isSynthetic: true },
    ],
    skinSafety: "MODERATE",
    skinSafetyScore: 78,
    comfortScore: 80,
    sustainabilityScore: 85,
    allergens: ["Polyester"],
    suitableWeather: ["Pleasant", "Cold", "Dry"],
    descriptionTrait: "Eco-conscious recycled blend. Durable, but synthetic fibers may cause mild sweat trapping.",
  },
  {
    name: "80% Merino Wool / 20% Mulberry Silk",
    fibers: [
      { name: "Fine Merino Wool", percentage: 80, isHypoallergenic: false, isSynthetic: false },
      { name: "Mulberry Silk", percentage: 20, isHypoallergenic: true, isSynthetic: false },
    ],
    skinSafety: "MODERATE",
    skinSafetyScore: 75,
    comfortScore: 86,
    sustainabilityScore: 90,
    allergens: ["Wool / Lanolin"],
    suitableWeather: ["Cold", "Windy", "Winter"],
    descriptionTrait: "Superfine 17.5-micron merino softened with pure silk. Thermal comfort for non-lanolin sensitive users.",
  },
  {
    name: "100% Recycled Technical Polyester",
    fibers: [{ name: "Technical Polyester", percentage: 100, isHypoallergenic: false, isSynthetic: true }],
    skinSafety: "AVOID",
    skinSafetyScore: 62,
    comfortScore: 70,
    sustainabilityScore: 68,
    allergens: ["Polyester", "Synthetic Dyes"],
    suitableWeather: ["Cold", "Rainy"],
    descriptionTrait: "Hydrophobic synthetic active fabric. High risk of heat retention and sweat gland occlusion for eczema-prone skin.",
  },
  {
    name: "85% Acrylic / 15% Nylon Knit",
    fibers: [
      { name: "Acrylic", percentage: 85, isHypoallergenic: false, isSynthetic: true },
      { name: "Nylon", percentage: 15, isHypoallergenic: false, isSynthetic: true },
    ],
    skinSafety: "AVOID",
    skinSafetyScore: 58,
    comfortScore: 65,
    sustainabilityScore: 45,
    allergens: ["Synthetic Dyes", "Rough Synthetics"],
    suitableWeather: ["Cold", "Winter"],
    descriptionTrait: "Coarse synthetic knit structure. Frequent trigger for contact dermatitis and cutaneous itching.",
  },
];

// ─── STYLISTIC ATTRIBUTES ───────────────────────────────────────────────────
const COLOR_PALETTES = [
  "Ivory White", "Onyx Black", "Azure Blue", "Sage Green", "Charcoal Grey",
  "Warm Beige", "Navy Blue", "Dusty Rose", "Olive Green", "Terracotta",
  "Oatmeal", "Midnight Indigo", "Desert Sand", "Eucalyptus", "Pewter"
];

const FIT_OPTIONS: ("Relaxed" | "Loose" | "Regular" | "Slim" | "Oversized")[] = [
  "Relaxed", "Loose", "Regular", "Oversized", "Slim"
];

const OCCASIONS_LIST = [
  "Casual Everyday", "Office & Formal", "Work From Home", "Active & Workout",
  "Evening & Dinner", "Weekend Travel", "Summer Vacation", "Cold Weather Outing"
];

// Category Sub-Archetypes
interface SubCategoryTemplate {
  category: ProductRecord["category"];
  subCategory: string;
  namePrefixes: string[];
  emoji: string;
  basePrice: number;
}

const SUB_CATEGORIES: SubCategoryTemplate[] = [
  { category: "Tops", subCategory: "Shirts", namePrefixes: ["Camp Collar", "Relaxed Cuban", "Classic Oxford", "Minimalist Poplin", "Band Collar"], emoji: "👔", basePrice: 1699 },
  { category: "Tops", subCategory: "T-Shirts", namePrefixes: ["Heavyweight Organic", "Raw-Hem Essential", "Relaxed Boxy", "Breathable Pocket", "Crewneck Base"], emoji: "👕", basePrice: 899 },
  { category: "Tops", subCategory: "Polo Shirts", namePrefixes: ["Knit Textured", "Bamboo Pique", "Open Placket", "Organic Ribbed"], emoji: "👕", basePrice: 1499 },
  { category: "Tops", subCategory: "Blouses & Tunics", namePrefixes: ["Silk Drape", "Linen Flow", "Tiered Botanical", "Minimalist V-Neck"], emoji: "👚", basePrice: 1899 },
  { category: "Bottoms", subCategory: "Trousers", namePrefixes: ["Single Pleat", "Elastic Waist Chino", "Relaxed Tailored", "Wide-Leg Linen", "Drawstring Travel"], emoji: "👖", basePrice: 2299 },
  { category: "Bottoms", subCategory: "Shorts", namePrefixes: ["Linen Resort", "Organic Fleece Sweat", "Easy-Pull Chino", "Tailored Hemp"], emoji: "🩳", basePrice: 1199 },
  { category: "Bottoms", subCategory: "Jeans & Denims", namePrefixes: ["Selvedge Loose", "Straight Organic Cotton", "Comfort Stretch Raw"], emoji: "👖", basePrice: 2799 },
  { category: "Outerwear", subCategory: "Hoodies & Sweats", namePrefixes: ["GOTS Certified Fleece", "Heavy Loopback", "Zip-Through Relaxed", "Thermal Brushed"], emoji: "🧥", basePrice: 2499 },
  { category: "Outerwear", subCategory: "Jackets & Overshirts", namePrefixes: ["Unlined Chore", "Linen Safari", "Organic Canvas Work", "Windproof Hemp"], emoji: "🧥", basePrice: 3499 },
  { category: "Outerwear", subCategory: "Cardigans & Sweaters", namePrefixes: ["Relaxed Cotton Knit", "Merino Silk Blend", "Seed Stitch Ribbed"], emoji: "🧶", basePrice: 2999 },
  { category: "Dresses", subCategory: "Maxi Dresses", namePrefixes: ["Tiered Summer Linen", "Silk Slip Minimal", "Organic Cotton Smocked"], emoji: "👗", basePrice: 3299 },
  { category: "Dresses", subCategory: "Midi & Shirt Dresses", namePrefixes: ["Belted Utility", "Breathable A-Line", "Relaxed Kaftan"], emoji: "👗", basePrice: 2699 },
  { category: "Activewear", subCategory: "Performance Tops", namePrefixes: ["Anti-Chafe Bamboo", "Seamless Moisture-Wicking", "Micro-Modal Athletic"], emoji: "🏃", basePrice: 1199 },
  { category: "Activewear", subCategory: "Active Bottoms", namePrefixes: ["Zero-Friction Jogger", "Breathable Mesh Short", "Ultra-Soft Ribbed Legging"], emoji: "🏃‍♀️", basePrice: 1699 },
  { category: "Sleepwear", subCategory: "Pyjama Sets", namePrefixes: ["Hypoallergenic Silk-Cotton", "Bamboo Cloud Lounge", "Pure Flax Slumber"], emoji: "🌙", basePrice: 2199 },
  { category: "Footwear", subCategory: "Sneakers & Flats", namePrefixes: ["Organic Canvas Low", "Cork-Lined Trainer", "Supple Leather Slip-On"], emoji: "👟", basePrice: 3699 },
  { category: "Accessories", subCategory: "Caps, Scarves & Bags", namePrefixes: ["UPF 50+ Linen Cap", "Mulberry Silk Scarf", "Organic Canvas Tote"], emoji: "🎒", basePrice: 899 },
];

// ─── 1,000 RECORD GENERATOR ENGINE ──────────────────────────────────────────
export function generateCatalogRecords(count = 1000): ProductRecord[] {
  const records: ProductRecord[] = [];

  for (let i = 1; i <= count; i++) {
    const subTemplate = SUB_CATEGORIES[(i - 1) % SUB_CATEGORIES.length];
    const fabric = FABRIC_ARCHETYPES[(i * 7) % FABRIC_ARCHETYPES.length];
    const color = COLOR_PALETTES[(i * 3) % COLOR_PALETTES.length];
    const fit = FIT_OPTIONS[(i * 5) % FIT_OPTIONS.length];
    const occasionPrimary = OCCASIONS_LIST[(i * 2) % OCCASIONS_LIST.length];
    const occasionSecondary = OCCASIONS_LIST[(i * 3 + 1) % OCCASIONS_LIST.length];

    const prefix = subTemplate.namePrefixes[(i * 11) % subTemplate.namePrefixes.length];
    const name = `${color} ${prefix} ${subTemplate.subCategory}`;

    // Deterministic price calculation around basePrice with variance
    const priceVariance = ((i * 137) % 700) - 200;
    const price = Math.max(499, Math.round((subTemplate.basePrice + priceVariance) / 50) * 50);
    const originalPrice = Math.round((price * 1.35) / 50) * 50;

    // Body fit score variance
    const bodyFitScore = 88 + ((i * 3) % 11);
    const trendScore = 85 + ((i * 7) % 14);

    // Stock count: mostly in stock (10-60), occasionally limited (2-5) or 0
    const stock = (i % 23 === 0) ? 0 : 5 + ((i * 19) % 45);

    // Images from category pool
    const imgPool = CATEGORY_IMAGES[subTemplate.category] || CATEGORY_IMAGES.Tops;
    const primaryImg = imgPool[(i - 1) % imgPool.length];
    const secondaryImg = imgPool[i % imgPool.length];

    // Tags
    const tags = Array.from(new Set([
      subTemplate.category.toLowerCase(),
      subTemplate.subCategory.toLowerCase(),
      fabric.name.toLowerCase().split(" ")[1] || "cotton",
      fit.toLowerCase(),
      color.toLowerCase(),
      fabric.skinSafety === "SAFE" ? "hypoallergenic" : "synthetic",
      "skin-safe",
    ]));

    records.push({
      id: `p${i}`,
      name,
      description: `${subTemplate.namePrefixes[0]} crafted with ${fabric.name}. ${fabric.descriptionTrait} Features a comfortable ${fit.toLowerCase()} fit in ${color}.`,
      category: subTemplate.category,
      subCategory: subTemplate.subCategory,
      price,
      originalPrice,
      images: [primaryImg, secondaryImg],
      availableSizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: [color, COLOR_PALETTES[(i * 4) % COLOR_PALETTES.length]],
      fabric: fabric.name,
      fibers: fabric.fibers,
      comfortScore: fabric.comfortScore,
      skinSafetyScore: fabric.skinSafetyScore,
      skinSafety: fabric.skinSafety,
      bodyFitScore,
      trendScore,
      sustainabilityScore: fabric.sustainabilityScore,
      suitableWeather: fabric.suitableWeather,
      suitableOccasions: [occasionPrimary, occasionSecondary],
      season: fabric.suitableWeather.includes("Summer") ? ["Summer", "Spring"] : ["All-Season"],
      fit,
      allergens: fabric.allergens,
      stock,
      tags,
      emoji: subTemplate.emoji,
      isDemonstration: false,
    });
  }

  return records;
}

// Singleton generated catalog (1,000 distinct, typed records)
export const FULL_1000_CATALOG: ProductRecord[] = generateCatalogRecords(1000);
