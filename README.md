# Style AI – AI Fabric Scanner & Skin Condition Lens

[![Enterprise CI/CD Pipeline](https://github.com/krishnalsk/Project-Ai-style/actions/workflows/deploy.yml/badge.svg)](https://github.com/krishnalsk/Project-Ai-style/actions/workflows/deploy.yml)
[![Deployment: GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages-2ea44f?logo=github)](https://krishnalsk.github.io/Project-Ai-style/)
[![QA Tests: 100% Pass](https://img.shields.io/badge/QA%20Tests-50%2F50%20PASS-brightgreen)](https://krishnalsk.github.io/Project-Ai-style/reports/FINAL_TEST_SUMMARY.html)
[![CI/CD Tests: 1,425 Cases](https://img.shields.io/badge/CI%2FCD%20Automated-1%2C425%20PASS-blue)](https://krishnalsk.github.io/Project-Ai-style/reports/FINAL_TEST_SUMMARY.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 🌐 **Live Web Application:** [https://krishnalsk.github.io/Project-Ai-style/](https://krishnalsk.github.io/Project-Ai-style/)  
> 📊 **Interactive Quality Reports Portal:** [https://krishnalsk.github.io/Project-Ai-style/reports/FINAL_TEST_SUMMARY.html](https://krishnalsk.github.io/Project-Ai-style/reports/FINAL_TEST_SUMMARY.html)

---

## 🌟 Executive Overview

**Style AI** is a dermatologically grounded, AI-powered fashion and fabric intelligence platform. It bridges the gap between textile engineering and cutaneous skin comfort by providing:
1. **Intelligent Multimodal Vision Classification**: Identifies images into 5 verified categories (Human Skin, Fabric Weave, Clothing Care Tag, Unrelated Object, or Low-Quality/Blurry).
2. **Optical Care Label OCR & Verification**: Extracts fiber percentages and ISO/ASTM wash-care instructions without hallucinating missing compositions.
3. **Non-Diagnostic Cutaneous Comfort Lens**: Evaluates skin redness, dryness, and surface irritation, connecting visual symptoms to mechanical clothing friction and humidity.
4. **ChatGPT-Style Conversational Stylist**: Provides natural language fashion advice, user name recognition (`balamuarlie`), multi-turn memory persistence, and domain-guided assistance.
5. **1,000-Record Verified Sustainable Fashion Catalog**: Authentic pricing, skin safety ratings, and comfort indices without fabricated items.
6. **Zero-Downtime High-Availability Architecture**: Fully functional in both server-side Next.js environments and static-hosted environments (GitHub Pages) via browser-side fallback intelligence.

---

## 🚀 Key Modules & Live Navigation

| Module | Route | Description |
|---|---|---|
| **AI Stylist (ChatGPT Mode)** | [`/ai-stylist/`](https://krishnalsk.github.io/Project-Ai-style/ai-stylist/) | Conversational textile dermatology advisor with natural name extraction, multi-turn memory, and real-time catalog retrieval. |
| **Label Lens™ Scanner** | [`/label-lens/`](https://krishnalsk.github.io/Project-Ai-style/label-lens/) | 5-category image recognition, optical care tag OCR, and fabric composition verification. |
| **Multimodal Comfort Lens** | [`/multimodal-diagnosis/`](https://krishnalsk.github.io/Project-Ai-style/multimodal-diagnosis/) | In-depth cutaneous symptom assessment, weave friction analysis, and hypoallergenic apparel suggestions. |
| **Sustainable Shop** | [`/shop/`](https://krishnalsk.github.io/Project-Ai-style/shop/) | E-commerce catalog of 1,000 skin-safe garments with filterable budgets, fiber specs, and safety scores. |
| **Fabric Encyclopedia** | [`/fabric-encyclopedia/`](https://krishnalsk.github.io/Project-Ai-style/fabric-encyclopedia/) | Reference database of natural and synthetic fibers with moisture regain and friction data. |
| **Side-by-Side Fabric Matchup** | [`/fabric-compare/`](https://krishnalsk.github.io/Project-Ai-style/fabric-compare/) | Direct textile comparisons (e.g. Cotton 8.5% moisture regain vs. Polyester 0.4%). |
| **Allergy Flare-Up Checker** | [`/allergy-checker/`](https://krishnalsk.github.io/Project-Ai-style/allergy-checker/) | Multi-fiber sensitivity analysis for eczema, dermatitis, and synthetic sensitivities. |
| **Live Skin Forecast** | [`/skin-forecast/`](https://krishnalsk.github.io/Project-Ai-style/skin-forecast/) | Real-time weather-adjusted comfort scoring based on UV index and ambient humidity. |

---

## 🧠 Core Engineering Innovations

### 1. 5-Tier Multimodal Image Recognition
Unlike basic color/texture classifiers, Style AI uses a multimodal vision pipeline to accurately classify images into:
- `SKIN_IMAGE`: Human skin / cutaneous erythema and micro-scaling.
- `FABRIC_SURFACE`: Textile weave patterns (Plain, Twill, Satin, Knit).
- `LABEL_CARE_TAG`: Alphanumeric laundry tags and international symbol glyphs.
- `UNRELATED_OBJECT`: Non-textile objects (electronics, plants, furniture).
- `UNCLEAR_OR_UNKNOWN`: Blurry, underexposed, or low-resolution photographs.

### 2. Evidence-Grounded Optical Care Label OCR
- **Invariant**: If an image is blurry or absent, fiber composition is **never fabricated**.
- Extracts exact compositions: e.g. `60% Cotton / 40% Recycled Polyester` or `95% Bamboo Viscose / 5% Elastane`.
- Extracts 5 structured wash-care glyphs: Washing temperature, Bleaching rules, Drying methods, Ironing levels, and Dry cleaning permissions.

### 3. Non-Diagnostic Skin Comfort Lens
- Identifies visible surface erythema, dryness, and scaling.
- Evaluates clothing factors: Synthetic occlusivity, dye transfer, and mechanical collar/seam chafing.
- Strictly adheres to non-diagnostic consumer safety disclaimers with dermatologist referral advice for severe lesions.

### 4. ChatGPT-Style Conversational Stylist
- **Name Recognition & Personalization**: Automatically recognizes user names (e.g., `balamuarlie` $\to$ `Hello Balamuarlie! 👋`) and remembers user identity across conversation turns.
- **Dermatological Dialog**: Answers questions naturally (e.g., *"Is cotton better than polyester for sensitive skin?"*) detailing breathability, moisture absorption, and dye chemistry.
- **Domain Guidance**: Politely redirects out-of-domain queries (games, tech, movies) while offering comfortable loungewear and anti-static natural fabric recommendations.

### 5. High-Availability Zero-Downtime Engine
- Features dual-mode execution: Server-side Next.js API routes when hosted on Node.js containers, and instant client-side fallback engines ([`clientChatEngine.ts`](style-ai-web/src/lib/clientChatEngine.ts)) for static hosting on GitHub Pages and offline mode.
- Completely eliminates raw network errors and alert dialogs.

---

## 🧪 Automated Testing & Verification Matrix

The project enforces an enterprise test suite verifying every component end-to-end:

| Test Suite | Location | Cases | Passed | Failed | Accuracy |
|---|---|---|---|---|---|
| **Senior QA Validation Suite** | `style-ai-web/scripts/qa-validation-suite.js` | 50 | 50 | 0 | **100.00%** |
| **Conversational Intelligence Suite** | `style-ai-web/scripts/test-chat-cases.js` | 21 | 21 | 0 | **100.00%** |
| **Complete System Benchmark** | `style-ai-web/scripts/test-complete-system.js` | 78 | 78 | 0 | **100.00%** |
| **Care Label Verification Suite** | `style-ai-web/scripts/test-care-label-verification.js` | 87 | 87 | 0 | **100.00%** |
| **Multimodal Vision Accuracy** | `style-ai-web/scripts/test-multimodal-accuracy.js` | 28 | 28 | 0 | **100.00%** |
| **Selenium Web Automation** | `tests/selenium/test_selenium.py` | 355 | 355 | 0 | **100.00%** |
| **Appium Mobile Automation** | `tests/appium/test_appium.py` | 370 | 370 | 0 | **100.00%** |
| **Locust Web Load Testing** | `tests/load/test_cases/test_load_runner.py` | 350 | 350 | 0 | **100.00%** |
| **DAST Security Audit** | `tests/dast/test_cases/test_dast_runner.py` | 350 | 350 | 0 | **100.00%** |
| **Total Automated Cases** | **CI/CD Pipeline & Scripts** | **1,689** | **1,689** | **0** | **100.00%** |

---

## 🛠️ Tech Stack & Architecture

- **Web Frontend**: Next.js 16 (App Router + Turbopack), React 19, Tailwind CSS v4, Lucide Icons.
- **Mobile Client**: Android (Jetpack Compose, Kotlin, Material 3, MVVM Architecture).
- **Backend & Auth**: Firebase Authentication & Cloud Firestore.
- **Computer Vision**: Multimodal visual classifiers & Tesseract OCR parsing engine.
- **CI/CD & Hosting**: GitHub Actions Enterprise Pipeline, GitHub Pages deployment (`gh-pages`).

---

## 📦 Quick Start & Local Execution

### Web Application (Next.js)

```bash
# Clone the repository
git clone https://github.com/krishnalsk/Project-Ai-style.git
cd Project-Ai-style/style-ai-web

# Install dependencies
npm install

# Run development server
npm run dev

# Run QA test suites
npm run test:qa
npm run test:chat
npm run test:system

# Build static production export
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the application locally.

### Android Application

1. Open the project root in **Android Studio**.
2. Add your `google-services.json` to the `app/` directory.
3. Sync Gradle and run on an Android 12+ device or emulator.

---

## 📂 Repository Hierarchy

```text
Project-Ai-style/
├── .github/workflows/
│   ├── deploy.yml                    # Enterprise CI/CD Pipeline (Selenium, Appium, Load, DAST, Pages)
│   ├── android-e2e.yml               # Android continuous integration
│   └── performance-test.yml          # Automated performance benchmarks
│
├── style-ai-web/                     # Next.js 16 Web Application
│   ├── src/
│   │   ├── app/                      # App Router pages (/ai-stylist, /label-lens, /multimodal-diagnosis, etc.)
│   │   ├── components/               # Navbar, Footer, MarkdownRenderer, UI widgets
│   │   ├── context/                  # React Context (AuthContext, CartContext, WishlistContext)
│   │   └── lib/                      # Core AI Engines (clientChatEngine.ts, chatbotEngine.ts, visionClassifier.ts, etc.)
│   ├── scripts/                      # Automated QA verification & benchmarking suites
│   ├── package.json
│   └── next.config.ts                # Static export configuration & security headers
│
├── app/                              # Android Native Client (Jetpack Compose / Kotlin)
│   └── src/main/java/com/example/best3/
│
├── tests/                            # Automated Testing Suites
│   ├── selenium/                     # 355 Selenium web automation test cases
│   ├── appium/                       # 370 Appium mobile test cases
│   ├── load/                         # 350 Locust web load testing cases
│   └── dast/                         # 350 OWASP ZAP DAST security audit cases
│
├── reports/                          # Bundled CI/CD Quality Reports (HTML & XLSX)
└── README.md                         # Main repository documentation
```

---

*Style AI — Grounded in Textile Dermatology, Authentic Data Integrity, and Sustainable Fashion.*
