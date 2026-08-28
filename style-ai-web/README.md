# Style AI Web 🌐

> **Smart Comfort Meets Style** — A Web Application for Skin-Safe Fashion & AI Styling Recommendations.

---

## 🚀 Quick Start

### 1. Run Development Server
```bash
cd style-ai-web
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. Build for Production
```bash
npm run build
npm run start
```

---

## ✨ Key Features & Architecture

- 🤖 **AI Stylist (`/ai-stylist`):** Instant 0ms dermatological rule engine + OpenRouter Claude 3.5 Sonnet / Gemini fallback.
- 🌤️ **Live Skin Forecast (`/skin-forecast`):** Real-time UV Index sensor alerts, humidity tracking, and weather-adjusted fabric safety recommendations.
- 🔍 **Label Lens™ (`/label-lens`):** Clothing wash-care label OCR parser & skin friction risk analyzer.
- 📖 **Fabric Encyclopedia (`/fabric-encyclopedia`):** Detailed textile database with SAFE / MODERATE / AVOID skin safety ratings.
- ⚖️ **Side-by-Side Fabric Matchup (`/fabric-compare`):** Compare breathability, water retention, and eco-impact across natural vs synthetic fibers.
- 🩺 **Allergy & Flare-up Checker (`/allergy-checker`):** Custom multi-fiber blend risk calculator for eczema, psoriasis, and sensitive skin.
- 🛍️ **E-Commerce & Shop (`/shop`):** 8 skin-certified garments, category filters, product details (`/shop/[id]`), cart (`/cart`), 2-step checkout (`/checkout`), and order tracking (`/orders`).
- 📓 **Skin Comfort Diary (`/skin-diary`):** Daily outfit logging, flare-up history, and star ratings.
- 🎁 **Rewards & Style Points (`/rewards`):** Eco Pioneer levels, points balance, and coupon code redemption.
- 👗 **Virtual Closet (`/virtual-closet`):** Wardrobe item tracker, wear counter, and AI outfit recommendations.
- ✨ **Outfit Generator (`/outfit-generator`):** Weather & occasion-adapted outfit mixer.
- 📏 **Size & Fit Guide (`/size-guide`):** Measurement sliders mapping chest/waist to loose-fit sizes to reduce skin friction.
- 📊 **Wardrobe Analytics (`/analytics`):** Longitudinal comfort score reports and fiber distribution ratios.
- ❓ **Help Center (`/help`) & Settings (`/settings`):** FAQ on skin safety algorithms, GOTS certification, and privacy settings.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router + Turbopack)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS 4 + Glassmorphism UI
- **Authentication & DB:** Firebase Auth + Firestore
- **AI Integration:** OpenRouter API + 4-Step Rules Engine
- **State Management:** React Context (`AuthContext`, `CartContext`, `WishlistContext`)
- **PWA Ready:** Web App Manifest (`/manifest.webmanifest`)

---

## 🔒 Android Project Isolation
This web project is located in `style-ai-web/` and is **100% independent** from the Android application in `app/`. The Android application code was never modified or altered.
