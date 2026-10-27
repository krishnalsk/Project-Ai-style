# Style AI Remediation Guide & Defect Triage

## 1. Overview of Blocked & Not Applicable Test Cases

Across the 1,250 test inventory cases, 0 functional regressions or blocker defects were found. However, 35 cases are legitimately Blocked and 5 cases are Not Applicable based on runtime security and infrastructure boundaries.

---

## 2. Blocked Test Cases Breakdown

### A. Android Hardware Biometric Tests (10 Cases: APP-341 to APP-350)
- **Status:** `Blocked`
- **Reason:** Virtual CI emulators lack physical capacitive fingerprint readers and 3D facial recognition hardware sensors.
- **Remediation / Resolution:**
  1. For local developer verification, run against a physical Android device via USB debugging (`adb devices`).
  2. In CI/CD, use mock biometric prompt authentication drivers (`BiometricPrompt.CryptoObject` bypass) or mock biometric enrollment in UiAutomator2.

### B. Uncapped Volumetric DoS Performance Tests (25 Cases: PERF-226 to PERF-250)
- **Status:** `Blocked`
- **Reason:** Safety Policy Gate. Destructive volumetric stress testing (1,000+ VUs, distributed DDoS simulation) against GitHub Pages or live API infrastructure violates terms of service and risks rate-ban.
- **Remediation / Resolution:**
  1. Run baseline 100 VU / 60-second test in standard CI.
  2. For higher stress profiles, stage an isolated containerized backend cluster (e.g., local Docker Compose or ephemeral Kubernetes cluster) before triggering k6 stress scripts.

---

## 3. Not Applicable Test Cases Breakdown

### A. Live Merchant Payment Gateway Webhooks (5 Cases: WEB-250 to WEB-254)
- **Status:** `Not Applicable`
- **Reason:** Static GitHub Pages demo builds utilize simulated checkout flows to prevent real credit card charges during testing.
- **Remediation / Resolution:**
  1. Production deployments connected to live Stripe/Razorpay accounts can activate these cases by providing sandbox API keys in `STRIPE_SECRET_KEY`.
