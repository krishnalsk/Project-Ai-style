# Style AI - Smart Comfort Meets Style

Style AI is a premium Android application built with Jetpack Compose and Firebase. It leverages AI to provide personalized fashion recommendations while prioritizing user comfort and skin safety.

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

---
*Developed with ❤️ for Style and Comfort.*
