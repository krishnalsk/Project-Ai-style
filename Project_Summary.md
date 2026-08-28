# Style AI - Project Documentation Summary

## 1. Core Mission
A personalized fashion e-commerce platform focusing on **Skin Safety**, **Comfort**, and **Sustainability**.

## 2. AI Intelligence Logic (4-Step Algorithm)
1. **Skin Safety Check:** XGBoost logic to classify fabric safety (Safe, Moderate, Avoid).
2. **Recommendation Engine:** Random Forest weighting (40% Safety, 25% Comfort, 20% Fit, 10% Style, 5% Weather).
3. **Weather Rule Engine:** Adjusts recommendations based on real-time temperature and humidity.
4. **Output Generation:** Structured AI responses via OpenRouter (Claude/Gemini).

## 3. Key Website Features to Replicate
* **AI Stylist Chat:** Instant outfit recommendations.
* **Live Skin Forecast:** Real-time UV/Humidity dashboard.
* **Fabric Encyclopedia:** Educational database on high-quality textiles.
* **Label Lens:** Webcam-based fabric scanning using OCR.
* **Sustainability Tracker:** Eco-impact visualization for purchases.

## 4. Technical Specifications
* **Primary Stack:** Kotlin/Jetpack Compose (Mobile), React/Next.js (Web Potential).
* **Backend:** Firebase Auth & Firestore.
* **AI API:** OpenRouter (accessing Claude 3.5 Sonnet / Gemini 2.0).
* **UI Style:** Premium, Minimalist, White/AccentBlue palette.

## 5. Critical Data Points
* `skinType`: User's baseline skin condition.
* `comfortScore`: Dynamic rating of wardrobe comfort.
* `location`: Required for weather-aware styling.
