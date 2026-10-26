# Style AI — Comprehensive Project Analysis & Technical Report

---

## Executive Summary

**Style AI** is a modern, healthcare-inspired fashion and e-commerce Android application built with **Kotlin** and **Jetpack Compose**. It uniquely addresses clothing-induced skin allergies, fabric decision fatigue, and eco-sustainability by combining artificial intelligence, dermatological awareness, and online shopping into a single platform.

---

## 1. App Purpose and Problem Solved

### Purpose
Style AI serves as a smart fashion assistant and e-commerce store that analyzes clothing material composition to provide users with personal **Skin Comfort Scores**, climate-matched outfit recommendations, and AI-driven styling advice.

### Problem Solved
1. **Skin Irritation & Fabric Allergies:** Millions of individuals suffer from contact dermatitis, sensitive skin, or heat rashes caused by synthetic or harsh textiles (e.g., polyester, harsh dyes). Style AI analyzes clothing composition and provides a **Skin Comfort Score** and hypoallergenic warnings before purchase.
2. **Fashion Overwhelm & Decision Fatigue:** Shoppers struggle to coordinate outfits that suit their specific body type, skin sensitivity, and climate. Style AI features an AI Stylist assistant (powered by an intelligent 4-Step Dermatological Rule Engine) that provides real-time outfit advice.
3. **Unclear Care Instructions & Label Complexity:** Clothing wash labels are often confusing. The app features **Label Lens** and a **Wash Care Guide** to translate clothing tags into clear maintenance advice.
4. **Fast Fashion Sustainability Issues:** Style AI promotes sustainable textiles (e.g., organic cotton, French linen, bamboo viscose) through a dedicated **Sustainability Dashboard** and **Fabric Encyclopedia**.

---

## 2. Comprehensive Feature Breakdown

Below is a detailed breakdown of all features implemented across the application:

### Authentication & Onboarding
- **Splash Screen (`SplashScreen.kt`):** Application entry point that validates user authentication state via `FirebaseManager` and routes to either Auth Selection or Home.
- **Auth Selection (`AuthSelectionScreen.kt`):** High-converting landing screen offering Email Login, Registration, or One-Tap Google Sign-In.
- **Email & Password Login (`LoginScreen.kt`):** Secure Firebase Authentication flow supporting password visibility toggles, input validation, and Firestore profile synchronization upon successful sign-in.
- **User Registration (`SignUpScreen.kt`):** Create new accounts using Firebase Auth with client-side validation for email formats and password strength.
- **Password Reset Flow (`ForgotPasswordScreen.kt` & `ResetSuccessScreen.kt`):** Sends automated Firebase password reset emails to the user's inbox with visual verification feedback.
- **Email Verification (`EmailVerificationScreen.kt`):** Ensures user authenticity by checking `auth.currentUser?.isEmailVerified` with an active polling timer and resend capability.
- **Personalized Onboarding Flow:**
  - **Welcome Back (`WelcomeBackScreen.kt`):** Welcomes returning users with animated user avatar display.
  - **Personal Info Setup (`PersonalInfoSetupScreen.kt`):** Collects name, profession, age, size, and photo via `ActivityResultContracts.GetContent()`.
  - **Skin Diagnosis Setup (`SkinDiagnosisSetupScreen.kt`):** Captures skin condition data via camera integration (`TakePicturePreview`).
  - **Skin Comfort Analysis (`SkinComfortScreen.kt`):** Calculates an initial personal Comfort Score (e.g., 92/100) based on user selections.
  - **AI Personalization Loader (`AiLoadingScreen.kt`):** Smooth transition screen indicating AI profile generation before entering the dashboard.

### Shopping & E-Commerce Core
- **Home Dashboard (`HomeDashboard.kt`):** Features seasonal banners, daily recommendations, category quick-scroll, weather-matched clothing picks, top picks, and search query filters.
- **Category Explorer (`CategoryScreen.kt`):** Filter products by curated categories: *Summer Comfort, Winter Essentials, Everyday Casual, Active Comfort, Eco Comfort, Sensitive Skin Safe, and Premium Formal*.
- **Product Search (`SearchScreen.kt`):** Real-time text search across product titles, fabrics, and comfort benefits with trending keyword tags.
- **Product Details (`ProductDetailsScreen.kt`):** Full-screen product view with image gallery thumbnails, fabric breakdown, price tag, size selectors, and direct "Buy Now" checkout action.
- **Wishlist & Saved Items (`WishlistScreen.kt` & `SavedItemsScreen.kt`):** Save favorite garments locally with category tabs (Tops, Bottoms, Dresses) and AI-recommended picks.
- **Shopping Cart & Checkout (`CartScreen.kt` & `CheckoutScreen.kt`):** Add items to cart, adjust quantities, apply discount promo codes, calculate total billing with delivery fee, choose payment methods, and confirm orders.
- **Order Confirmation (`PaymentSuccessScreen.kt`):** Instant visual success screen with animated checkmark and direct links to live order tracking.

### AI & Specialized Tools
- **AI Stylist Chat (`AiStylistScreen.kt`):** Conversational AI assistant integrated with an intelligent 4-Step Dermatological Rule Engine. Provides personalized outfit recommendations, skin-safe fabric advice, and occasion styling.
- **Label Lens OCR Scanner (`LabelLensScreen.kt`):** Simulates/performs garment wash-tag camera scanning to instantly breakdown material percentage, skin sensitivity rating, and wash care rules.
- **Virtual Closet (`VirtualClosetScreen.kt`):** Digital wardrobe manager where users can upload or organize owned garments by category (Summer, Winter, Active) and generate mix-and-match outfit combinations.
- **Fabric Encyclopedia (`FabricEncyclopediaScreen.kt`):** Educational directory detailing properties, hypoallergenic scores, and sustainability ratings of Organic Linen, Mulberry Silk, Bamboo Viscose, Merino Wool, etc.
- **Sustainability Dashboard (`SustainabilityDashboardScreen.kt`):** Visual metrics tracking eco-impact, eco-credits earned, carbon offset savings, and recycled garment stats.
- **Wash Care Guide (`WashCareGuideScreen.kt`):** Searchable icon legend explaining international washing, drying, ironing, and dry-cleaning laundry symbols.

### User Profile & Account Settings
- **User Profile Hub (`ProfileScreen.kt`):** Central dashboard displaying avatar, skin type, comfort score, order history link, wishlist count, and navigation to settings.
- **Order History & Live Tracking (`MyOrdersScreen.kt` & `OrderTrackingScreen.kt`):** View past purchases and track ongoing order status with a step-by-step delivery progress bar (Placed, Processing, Shipped, Delivered) and delivery agent card.
- **Edit Profile & Skin Preferences (`EditProfileScreen.kt` & `SkinPreferencesScreen.kt`):** Update personal metrics, body dimensions, allergy triggers, and fabric preferences stored in Firebase Firestore.
- **Skin Comfort Diary (`SkinComfortDiaryScreen.kt`):** Log daily skin comfort feedback, thermal comfort ratings, and irritation history.
- **Rewards Program (`RewardsScreen.kt`):** Gamified eco-reward points counter with redeemable discount coupons.
- **Address Management (`AddressManagementScreen.kt`):** Add, edit, select, or delete delivery shipping addresses.
- **Payment Methods (`PaymentMethodsScreen.kt`):** Manage saved Credit/Debit Cards, UPI IDs, and Net Banking options.
- **Size Recommendation Tool (`SizeRecommendationScreen.kt`):** Interactive AI height/weight slider tool that calculates precise garment sizing (S, M, L, XL, XXL).
- **Settings & Privacy (`SettingsScreen.kt` & `SettingsPrivacyScreen.kt`):** Toggle push notifications, dark mode preference, privacy settings, and account deletion (`deleteUserAccount`).
- **Notifications Hub (`NotificationsScreen.kt`):** Real-time order update alerts, price drops, and seasonal style advice notifications.

---

## 3. Technology Stack & Architecture

| Component | Technology | Version / Details |
| :--- | :--- | :--- |
| **Language** | Kotlin | 2.2.10 |
| **Android SDK Target** | Target SDK 36, Min SDK 24 | Android 7.0 (API 24) to Android 15 (API 36) |
| **UI Framework** | Jetpack Compose | Compose BOM 2026.02.01 with Material Design 3 |
| **Navigation** | Navigation Compose | `androidx.navigation:navigation-compose:2.8.5` |
| **Image Loading** | Coil Compose | `io.coil-kt:coil-compose:2.6.0` |
| **Backend / Auth** | Google Firebase | Firebase Auth BOM 33.10.0 + Google Play Services Auth 21.3.0 |
| **Database** | Cloud Firestore & Realtime DB | `firebase-firestore-ktx` & `firebase-database` |
| **Networking** | Retrofit 2 & OkHttp3 | Retrofit 2.11.0 + OkHttp Logging Interceptor 4.12.0 |
| **JSON Parser** | Kotlinx Serialization | `kotlinx.serialization.json:1.6.3` |
| **AI Engine** | On-Device 4-Step Rule Engine | `AiStylistViewModel.kt` |

---

## 4. Project File Map & Execution Flow

### Key Project Paths
```text
C:/Users/mbala/Best3/app/src/main/java/com/example/best3/
├── MainActivity.kt
├── data/
│   └── FirebaseManager.kt
├── navigation/
│   └── NavGraph.kt
└── ui/
    ├── address/
    ├── cart/
    ├── chat/
    ├── home/
    ├── login/
    ├── notifications/
    ├── onboarding/screens/
    ├── payment/
    ├── product/
    ├── profile/
    ├── search/
    ├── splash/
    ├── theme/
    └── wishlist/
```

### Step-by-Step App Execution Flow
1. **Launch (`MainActivity.kt`):** Sets edge-to-edge layout, wraps UI in `StyleAiTheme`, and boots `StyleAiNavGraph`.
2. **Session Gate (`SplashScreen.kt` -> `NavGraph.kt`):** Checks `FirebaseManager.currentUser`. Unauthenticated users route to Auth Selection; authenticated users route to Home.
3. **Onboarding (`PersonalInfoSetupScreen.kt` -> `SkinDiagnosisSetupScreen.kt` -> `AiLoadingScreen.kt`):** Captures user traits, calculates baseline comfort scores, and routes to Home.
4. **E-Commerce Discovery (`HomeDashboard.kt` -> `ProductDetailsScreen.kt`):** Browsing products, viewing fabric health breakdowns, and initiating purchase actions.
5. **AI Interaction (`AiStylistScreen.kt`):** Interactive AI Assistant powered by an on-device 4-Step Dermatological Rule Engine for styling and fabric queries.
6. **Fulfillment (`CartScreen.kt` -> `CheckoutScreen.kt` -> `PaymentSuccessScreen.kt` -> `OrderTrackingScreen.kt`):** Cart assembly, promo application, order placement, and live progress tracking.

---

## 5. Security & Technical Risk Assessment

1. **In-Memory State Volatility:** `tempProfile` in `FirebaseManager.kt` uses `@Volatile` in-memory state. Unsaved onboarding parameters could reset if process death occurs under low memory. *Remediation: Store intermediate onboarding state in DataStore.*
2. **Offline Mode & Data Caching:** High dependency on real-time internet connectivity for Firestore and OpenRouter APIs. *Remediation: Introduce Room Database for offline-first catalog caching.*
3. **Synthetic Payment Flow:** Checkout processes complete synthetically without a payment gateway token. *Remediation: Integrate official Stripe / Razorpay Android SDK.*
4. **Camera Thumbnail Capture:** `SkinDiagnosisSetupScreen` uses `TakePicturePreview()` which returns small bitmap thumbnails. *Remediation: Use CameraX or File URI intent for high-resolution images.*

---

## 6. Project Evaluation Marksheet (Out of 100)

| Evaluation Category | Max Marks | Score Awarded | Assessment Remarks |
| :--- | :---: | :---: | :--- |
| **UI & UX Design** | 20 | **19** | Beautiful Material 3 UI, glassmorphism cards, modern color palettes, smooth transitions. |
| **Feature Scope & Functionality** | 20 | **18** | Comprehensive e-commerce, AI assistant, OCR label scanner, tracking, sustainability metrics. |
| **Code Architecture & Cleanliness** | 15 | **13** | Well-organized Jetpack Compose codebase, single-activity pattern, clean Navigation Graph. |
| **Firebase Integration & Auth** | 15 | **14** | Multi-method auth (Email/Google), Firestore user synchronization, and account deletion. |
| **API & AI Communication** | 10 | **9** | Functional OpenRouter REST API integration using Retrofit and Kotlinx Serialization. |
| **Data Persistence & Local Storage** | 10 | **6** | Firestore integration is functional, but lacks Room local database for offline persistence. |
| **Error Handling & Security** | 10 | **7** | Safe API key injection via `local.properties`/`BuildConfig`, though payment processing is synthetic. |
| **TOTAL SCORE** | **100** | **86 / 100** | **Grade: A (Outstanding College Project / Prototype)** |

---

## 7. 20 Technical Q&A for Developer / Faculty Defense

1. **Q: What architecture pattern does this application follow?**  
   *A:* Single Activity Architecture (`MainActivity`) using Jetpack Compose and Navigation Compose with a centralized Navigation Graph (`NavGraph.kt`) and a repository/manager singleton (`FirebaseManager.kt`).
2. **Q: How does the AI Stylist recommendation engine work?**  
   *A:* It uses an instant on-device 4-Step Rule Engine (`AiStylistViewModel.kt`) evaluating skin safety levels, clothing weighting, weather adaptation, and output synthesis.
3. **Q: Which library is used for rendering asynchronous images?**  
   *A:* Coil Compose (`io.coil-kt:coil-compose:2.6.0`) via `AsyncImage` composables.
4. **Q: How does the AI Stylist feature generate recommendations?**  
   *A:* Via Kotlin Coroutines in `AiStylistViewModel` executing direct rule matching and dynamic 4-step dermatological evaluation.
5. **Q: How is user authentication handled?**  
   *A:* Firebase Authentication supporting Email/Password and Google OAuth2 (`GoogleAuthProvider`).
6. **Q: Where is user profile data stored?**  
   *A:* Google Cloud Firestore under the `users/{userId}` document path.
7. **Q: What minimum Android SDK version is supported?**  
   *A:* Android 7.0 (API Level 24 / `minSdk = 24`).
8. **Q: How does the app check if an email is verified?**  
   *A:* `EmailVerificationScreen.kt` launches a periodic coroutine loop (`while(true)`) that reloads `auth.currentUser?.reload()` every 3 seconds and checks `.isEmailVerified`.
9. **Q: How are Jetpack Compose screens previewed during development?**  
   *A:* Each screen file contains a `@Preview(showBackground = true)` composable wrapped inside `StyleAiTheme`.
10. **Q: How does the camera feature work in `SkinDiagnosisSetupScreen.kt`?**  
    *A:* It uses Jetpack Activity Contracts: `rememberLauncherForActivityResult(ActivityResultContracts.TakePicturePreview())`.
11. **Q: How is Google Sign-In implemented?**  
    *A:* Using `GoogleSignIn.getSignedInAccountFromIntent()` to retrieve an OAuth `idToken`, which is passed to `FirebaseManager.signInWithGoogle(idToken)`.
12. **Q: What JSON library parses API responses?**  
    *A:* Kotlinx Serialization JSON (`kotlinx.serialization.json`) integrated with Retrofit.
13. **Q: How are custom routes and arguments handled in Navigation Compose?**  
    *A:* Route patterns like `"product_details/{productName}"` are registered in `NavGraph.kt`, and parameters are parsed from `backStackEntry.arguments?.getString("productName")`.
14. **Q: Is there account deletion functionality compliant with privacy laws?**  
    *A:* Yes, `FirebaseManager.deleteUserAccount()` deletes the Firebase Auth account and its Firestore document.
15. **Q: What Jetpack Compose UI library version is used?**  
    *A:* Compose BOM `2026.02.01` with Material 3.
16. **Q: How does the app handle dark and light themes?**  
    *A:* Defined in `Theme.kt` via `StyleAiTheme`, utilizing custom Material3 color schemes.
17. **Q: How are discount codes calculated in checkout?**  
    *A:* Client-side logic in `CheckoutScreen.kt` parses promo inputs (e.g., `"STYLE20"`) and deducts percentage discounts from the subtotal.
18. **Q: What happens when the user clicks "Logout"?**  
    *A:* `FirebaseManager.logout()` calls `FirebaseAuth.getInstance().signOut()`, and `navController.navigate(Screen.AuthSelection.route)` clears the backstack (`popUpTo(0)`).
19. **Q: How is asynchronous tasks state managed in UI composables?**  
    *A:* Using Compose state variables like `var isLoading by remember { mutableStateOf(false) }` combined with `LaunchedEffect` and `rememberCoroutineScope()`.
20. **Q: Is the project ready for Google Play Store publishing?**  
    *A:* The release build type in `build.gradle.kts` enables `isMinifyEnabled = true` and `isShrinkResources = true`. Preparing for release requires signing with a production Keystore.

---

## 8. 2-Minute Presentation Script

> **"Respected Sir / Evaluators,**
>
> Today, I am excited to present **Style AI**, a healthcare-inspired fashion and smart e-commerce Android application designed to solve a growing problem: clothing-induced skin allergies, fabric decision fatigue, and eco-sustainability.
>
> Many people suffer from sensitive skin or skin irritation caused by synthetic textiles. **Style AI** bridges dermatological awareness with online shopping.
>
> When a user opens Style AI, they are onboarded through a custom skin and fabric preference assessment. Our app authenticates users securely via **Firebase Authentication** and **Google Sign-In**, storing preferences in **Cloud Firestore**.
>
> On the **Home Dashboard**, users can explore tailored collections matched to weather conditions and dermatological ratings. 
> 
> Key innovative features include:
> 1. **AI Stylist Assistant:** Powered by a 4-Step Dermatological Rule Engine, providing real-time fabric advice and outfit styling.
> 2. **Label Lens OCR Scanner:** Translating complex garment tags into instant skin-safety scores.
> 3. **Virtual Closet & Sustainability Tracker:** Helping users curate eco-friendly wardrobes and track carbon offset credits.
>
> Architecturally, the app is written 100% in **Kotlin** using **Jetpack Compose**, **Material Design 3**, and **Coroutines**, targeting **Android 15 (API 36)**.
>
> Style AI makes fashion shopping personalized, healthy, and sustainable. Thank you!"

---

## 9. Five Technical Concepts to Understand

1. **Declarative UI with Jetpack Compose:** Understanding how Jetpack Compose regenerates the UI (reposition/recomposition) automatically when `@Composable` state variables (`mutableStateOf`) change.
2. **Navigation Compose & Backstack Management:** Knowing how `NavHost` manages screen transitions and pops screens off the stack using `popUpTo` and `inclusive = true`.
3. **Firebase Authentication & Firestore Sync:** Understanding how user session state is checked at splash, and how documents are created and merged asynchronously in Firestore using Kotlin Coroutine `await()`.
4. **Coroutines & ViewModel State Management:** Explaining how `AiStylistViewModel` manages asynchronous UI state and updates `mutableStateListOf` for real-time chat.
5. **Material Design 3 & Theme Styling:** Explaining how `StyleAiTheme` manages dynamic typography and Material 3 color schemes.

---

## 10. How to Run & Test the Application

### Setup Steps
1. Open `C:/Users/mbala/Best3` in Android Studio Ladybug or newer.
2. Ensure `local.properties` contains your Android SDK path (`sdk.dir=...`).
3. Run Gradle Sync (**File -> Sync Project with Gradle Files**).
4. Launch on emulator or physical device via **Run (Shift + F10)**.

---

## Final Checklist Before Defense

- [x] Verified Gradle build succeeds (`:app:compileDebugKotlin`).
- [x] Confirmed `local.properties` configured with valid SDK path and API key.
- [x] Tested app flow on Pixel 8 Emulator (API 34/35).
- [x] Mastered 5 Technical Concepts and 20 Defense Questions.
- [x] Prepared 2-Minute Script for presentation.
