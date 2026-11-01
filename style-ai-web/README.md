# Style AI Web 🌐

> **Smart Comfort Meets Style** — Enterprise Next.js 16 Web Application for Skin-Safe Fashion, Multimodal Vision Scanning, and AI Styling.

---

## 🚀 Quick Start

### 1. Run Development Server
```bash
cd style-ai-web
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. Run Test Suites
```bash
# Run 50-Case Senior QA Validation Suite
npm run test:qa

# Run 21-Case Conversational AI & Out-of-Domain Suite
npm run test:chat

# Run 78-Assertion Complete System Benchmark
npm run test:system

# Run Care Label OCR & Verification Suite
npm run test:label

# Run Multimodal Vision Accuracy Benchmark
npm run test:multimodal
```

### 3. Build Production Static Export (GitHub Pages)
```bash
STATIC_EXPORT=true npm run build
```

---

## ✨ Key Pages & Modules

- 🤖 **AI Stylist (`/ai-stylist`):** ChatGPT-style conversational assistant with natural name recognition, session memory persistence, and 1,000-record catalog integration.
- 🏷️ **Label Lens™ (`/label-lens`):** Optical care-label OCR scanner extracting fiber blends and ISO/ASTM wash symbols without hallucination.
- 🔬 **Multimodal Comfort Lens (`/multimodal-diagnosis`):** 5-category visual classification of skin irritation, fabric surface weave, and wash tags with zero-downtime browser fallback.
- 🌤️ **Live Skin Forecast (`/skin-forecast`):** Real-time UV and humidity sensor tracking for climate-adapted clothing advice.
- 🛍️ **Sustainable Shop (`/shop`):** 1,000 verified skin-safe products with real-time budget filters and dermatological safety scores.
- 📖 **Fabric Encyclopedia (`/fabric-encyclopedia`):** Comprehensive natural vs. synthetic textile reference guide.
- ⚖️ **Side-by-Side Fabric Matchup (`/fabric-compare`):** Moisture regain and cutaneous friction comparisons (Cotton vs. Polyester).
- 🩺 **Allergy Flare-Up Checker (`/allergy-checker`):** Sensitive skin multi-fiber risk calculator.
- 📓 **Skin Comfort Diary (`/skin-diary`):** Daily outfit tracking and cutaneous flare-up logging.
- 👗 **Virtual Closet (`/virtual-closet`):** Wardrobe inventory manager and AI outfit combinations.

---

## 🛠️ Architecture & Tech Stack

- **Framework:** Next.js 16 (App Router + Turbopack)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS 4
- **State Management:** React Context (`AuthContext`, `CartContext`, `WishlistContext`)
- **Authentication & Database:** Firebase Auth & Cloud Firestore
- **AI Engines:**
  - `src/lib/clientChatEngine.ts`: Zero-downtime client intelligence engine running directly in browser for 100% uptime on static hosts.
  - `src/lib/chatbotEngine.ts`: Server-side conversational intelligence layer.
  - `src/lib/careLabelOcr.ts`: Optical care tag OCR and fiber breakdown validator.
  - `src/lib/visionClassifier.ts`: Pretrained multimodal computer vision classifier.
  - `src/lib/queryEngine.ts`: Dermatologically grounded catalog query engine.
