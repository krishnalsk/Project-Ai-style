# Style AI - Smart Comfort Meets Style

[![Enterprise CI/CD Pipeline](https://github.com/krishnalsk/Project-Ai-style/actions/workflows/deploy.yml/badge.svg)](https://github.com/krishnalsk/Project-Ai-style/actions/workflows/deploy.yml)
[![Android CI](https://github.com/krishnalsk/Project-Ai-style/actions/workflows/android.yml/badge.svg)](https://github.com/krishnalsk/Project-Ai-style/actions/workflows/android.yml)

> 🌐 **Live Application & Testing Portal:** [https://krishnalsk.github.io/Project-Ai-style/](https://krishnalsk.github.io/Project-Ai-style/)

Style AI is a premium fashion & lifestyle application featuring an Android client built with Jetpack Compose & Firebase, alongside a Next.js web application and enterprise CI/CD testing suite. It leverages AI to provide personalized fashion recommendations while prioritizing user comfort and skin safety.

## 🚀 Key Features

*   **AI Stylist Assistant**: A smart chatbot that provides personalized outfit recommendations based on skin conditions, weather, and style preferences.
*   **Live Skin Forecast**: Real-time analysis of humidity and UV index to recommend the safest fabrics (e.g., Bamboo or Silk) to prevent irritation.
*   **Label Lens**: An AI-powered scanner that analyzes wash-care labels on clothing to detect fabric types and their compatibility with the user's skin profile.
*   **Virtual Try-On**: AI visualizer that allows users to capture a photo and see how outfits might fit or look.
*   **Skin Comfort Diary**: A daily log to track skin reactions and identify which fabrics provide the best comfort.
*   **Rewards & Gamification**: Earn "Style Points" through sustainable shopping and skin health tracking, redeemable for exclusive coupons.
*   **Saved Items**: A dedicated space to bookmark and manage favorite outfits.

## 🛠 Tech Stack

*   **UI**: Jetpack Compose (Modern Android UI toolkit)
*   **Backend**: Firebase (Authentication, Firestore, Google Sign-In)
*   **AI**: OpenRouter API Integration (Claude 3.5 / Gemini 2.0)
*   **Networking**: Retrofit & OkHttp
*   **Image Loading**: Coil
*   **Architecture**: MVVM (Model-View-ViewModel)

## 📦 Setup Instructions

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/yourusername/StyleAI.git
    ```
2.  **Firebase Configuration**:
    *   Add your `google-services.json` to the `app/` directory.
    *   Enable **Email/Password** and **Google** providers in the Firebase Console.
3.  **API Keys**:
    *   Replace the placeholder `default_web_client_id` in `app/src/main/res/values/strings.xml` with your Firebase Web Client ID.
    *   (Optional) Update the OpenRouter API key in `AiAssistantManager.kt`.
4.  **Build & Run**:
    Open the project in Android Studio and run it on an emulator or physical device.

## 🎨 Design Principles

Style AI follows a **Glassmorphism** design aesthetic, utilizing soft gradients, rounded corners (24dp+), and subtle blurs to create a premium, modern feel.

## 📂 Project Structure (Best3 Workspace)

Below is an overview of the key directories and files in this workspace:

```text
Best3/
├── app/                              # Android Mobile Application (Kotlin / Jetpack Compose)
│   ├── src/main/java/com/example/best3/
│   │   ├── data/                     # Firebase Auth/Firestore and AI assistant integrations
│   │   ├── navigation/               # App routing and navigation graph
│   │   ├── ui/                       # UI components and view models
│   │   │   ├── chat/                 # AI Stylist Chat and Closet screens
│   │   │   ├── home/                 # Main Forecast & Sustainability dashboards
│   │   │   ├── login/                # Authentication screens (Login/Signup/Forgot Password)
│   │   │   ├── onboarding/           # Skin type profiling and setup screens
│   │   │   └── product/              # Product Details with camera-based visual try-on mockup
│   │   └── theme/                    # Color scheme, typography, and styling theme
│   └── build.gradle.kts              # Mobile gradle build configuration
│
├── style-ai-web/                     # Web Application (React / Next.js / Tailwind CSS v4)
│   ├── src/
│   │   ├── app/                      # Next.js App Router pages
│   │   │   ├── ai-stylist/           # Chat interface page for AI styling
│   │   │   ├── outfit-generator/     # Outfit pairing page using Unsplash dynamic clothing imagery
│   │   │   ├── shop/[id]/            # E-Commerce details page with Hover Magnifier and Try-On Studio
│   │   │   ├── virtual-closet/       # Virtual Closet items tracker
│   │   │   └── dashboard/            # Skin Forecast and UV metrics home screen
│   │   ├── components/               # Custom UI, toaster, page headers, and SVG icons
│   │   ├── context/                  # React Auth, Cart, and Wishlist context providers
│   │   └── lib/                      # Mock product data and service helpers
│   ├── package.json                  # Web package configuration
│   └── tsconfig.json                 # Web TypeScript configuration
│
├── appium-tests/                     # Appium Mobile E2E Testing Framework (Node.js)
│   ├── package.json                  # Test runner package settings & dependencies
│   ├── run-tests.js                  # Appium driver capabilities, test cases & Excel generator
│   └── README.md                     # Android emulator connection and appium command guide
│
├── Project_Summary.md                # Core AI algorithms and summary document
└── README.md                         # Project documentation and file structure
```

---
*Developed with ❤️ for Style and Comfort.*
