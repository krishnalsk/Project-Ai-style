# Style AI Enterprise Testing & CI/CD Operations Manual

Comprehensive documentation for running, maintaining, and automating the **Web**, **Android Mobile**, **Backend Security**, and **API Performance** testing suites for Style AI.

---

## 1. Required Tools & Runtime Dependencies

| Runtime / Tool | Recommended Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `v20.x` or `v24.x` | Test runner, Next.js web application, report compilation |
| **npm** | `v10.x` or `v11.x` | Package manager |
| **Google Chrome** | Latest Stable | Headless browser for Selenium E2E Web automation |
| **Java JDK** | `17` or `21` (Temurin) | Android Gradle build engine (`./gradlew assembleDebug`) |
| **Android SDK** | API 34+ (compileSdk 36) | Android application compilation and emulator execution |
| **Appium** | `v2.x` + `uiautomator2` | Android mobile UI automation |
| **k6** | `v0.48+` | API performance and 100 Virtual Users load testing |
| **Python** | `3.11+` | Semgrep static application security testing (SAST) |

---

## 2. GitHub Repository Configuration

- **Repository:** `https://github.com/krishnalsk/Project-Ai-style.git`
- **Default Branch:** `main`
- **Deployment Branch:** `gh-pages`

### Repository Variables (`Settings → Secrets and variables → Actions → Variables`)
- `WEB_DEPLOYMENT_URL`: `https://krishnalsk.github.io/Project-Ai-style/`
- `BACKEND_API_URL`: `https://krishnalsk.github.io/Project-Ai-style/api`
- `ANDROID_PROJECT_PATH`: `app`

### Repository Secrets (`Settings → Secrets and variables → Actions → Secrets`)
- `FIREBASE_API_KEY`: Authorized web client API key
- `FIREBASE_AUTH_DOMAIN`: `best-3-52312.firebaseapp.com`
- `FIREBASE_PROJECT_ID`: `best-3-52312`
- `FIREBASE_STORAGE_BUCKET`: `best-3-52312.firebasestorage.app`
- `FIREBASE_MESSAGING_SENDER_ID`: `354741162304`
- `FIREBASE_APP_ID`: Firebase application identifier

> **Security Note:** Never commit personal access tokens, private keys, or passwords to source control. GitHub Actions injects these securely during workflow runs.

---

## 3. GitHub Pages Configuration

1. In your GitHub repository, open **Settings → Pages**.
2. Under **Build and deployment**:
   - **Source:** Select **GitHub Actions** (recommended for workflow artifact deployment) or **Deploy from a branch** (`gh-pages` / `/ (root)`).
3. The live deployment will be published at: `https://krishnalsk.github.io/Project-Ai-style/`.

---

## 4. GitHub Actions Workflows

The repository includes four specialized workflows under `.github/workflows/`:

| Workflow File | Trigger Events | Key Steps & Responsibilities |
| :--- | :--- | :--- |
| **`deploy-and-test.yml`** | Push/PR to `main`, `workflow_dispatch` | Build → Static Analysis → Deploy Pages → Verify Live HTTP 200 → Headless Selenium Web E2E → Upload Reports |
| **`android-e2e.yml`** | Push to `app/**`, `workflow_dispatch` | Checkout → JDK 17 Setup → Gradle Build APK → Start Appium Server → Execute Mobile E2E → Capture Screenshots |
| **`security-review.yml`** | Weekly schedule (Monday), Push, `workflow_dispatch` | Gitleaks Secret Scan → Semgrep SAST → Live DAST Headers Audit → Firestore Rules Inspection |
| **`performance-test.yml`** | `workflow_dispatch` (manual/parameterized) | k6 100 Virtual Users Baseline (60s) → RPS & P95 Latency Threshold Gate → Performance Reports |

### Required Actions Permissions
In workflow files, minimum least-privilege permissions are enforced:
```yaml
permissions:
  contents: write    # For gh-pages deployment
  pages: write       # For GitHub Pages artifact deployment
  id-token: write    # For secure OIDC token verification
```

---

## 5. Local Execution Commands

### Run the Master Test Runner (All 4 Suites + All Reports)
```bash
cd style-ai-web
node testing-automation/run-all.js
```

### Run Suite A: Web Application (Selenium)
```bash
cd style-ai-web
node -e "require('./testing-automation/selenium-runner').runSeleniumSuite()"
```

### Run Suite B: Android Application (Appium)
```bash
cd style-ai-web
node -e "require('./testing-automation/appium-runner').runAndroidAppiumSuite()"
```

### Run Suite C: Backend Security & Vulnerability Scan
```bash
cd style-ai-web
node -e "require('./testing-automation/security-runner').runSecuritySuite()"
```

### Run Suite D: API Performance & Load Testing
```bash
cd style-ai-web
node -e "require('./testing-automation/performance-runner').runPerformanceSuite()"
```

---

## 6. Report Structure & Artifact Locations

All test results, workbooks, visual evidence, and logs are output to:

```
Test Results/
├── Excel/
│   ├── Automation_Test_Report.xlsx      # Master consolidated report (6 tabs)
│   ├── Web_Test_Report.xlsx              # Suite A Web E2E cases
│   ├── Android_Appium_Report.xlsx        # Suite B Android Appium cases
│   ├── Backend_Security_Report.xlsx      # Suite C Security audit cases
│   ├── API_Performance_Report.xlsx       # Suite D Performance benchmark cases
│   ├── Failed_Test_Cases.xlsx            # Filtered blocked/failed cases
│   ├── Passed_Test_Cases.xlsx            # Filtered passed cases
│   └── Summary_Report.xlsx               # Executive KPI & scorecard metrics
│
├── HTML/
│   ├── execution-report.html             # Master interactive execution view
│   ├── dashboard.html                    # Executive dashboard with charts & filters
│   ├── web-report.html                   # Web Selenium detailed table
│   ├── android-report.html               # Android Appium detailed table
│   ├── security-report.html              # Security findings and OWASP map
│   ├── performance-report.html           # Performance RPS & latency percentiles
│   └── trends.html                       # Multi-build regression comparisons
│
├── JSON/
│   └── execution-results.json            # Machine-readable test inventory & metrics
│
├── Screenshots/
│   ├── web/                              # Desktop, tablet, mobile, and route screenshots
│   └── android/                          # Mobile UI screens and Compose hierarchy
│
├── Logs/
│   ├── selenium-execution.log            # Browser console logs and test traces
│   ├── appium-execution.log              # Device logs and UiAutomator2 traces
│   ├── security-scan.log                 # Header and secret scanning logs
│   ├── performance-load.log              # Latency distribution and RPS logs
│   └── k6-baseline-test.js               # Standalone k6 execution script
│
└── Summary/
    ├── summary.md                        # Formatted Markdown summary for CI/CD
    └── remediation-guide.md              # Defect triage and remediation instructions
```

---

## 7. Pass/Fail Gates & Quality Criteria

- **Functional Test Gate:** Minimum **95% pass rate** required for release certification.
- **Security Gate:** Zero **Critical** or **High** severity vulnerabilities permitted.
- **Performance Thresholds:**
  - P95 Response Time: `< 1,500 ms`
  - HTTP Error Rate: `< 1.0 %`
  - Requests Per Second (RPS): `> 10.0 req/s` under 100 Virtual Users
- **Infrastructure Gate:** Live deployment must return HTTP 200 before Selenium E2E execution starts.

---

## 8. Defect Triage & Troubleshooting Guide

### Issue 1: Chrome / ChromeDriver Version Mismatch
- **Symptom:** `SessionNotCreatedError: This version of ChromeDriver only supports Chrome version X`
- **Solution:** Selenium 4 automatically resolves driver binaries via Selenium Manager. Ensure Google Chrome is updated to the latest stable release.

### Issue 2: Port 3000 Collision during Local Testing
- **Symptom:** `Error: listen EADDRINUSE: address already in use :::3000`
- **Solution:** The Selenium suite is configured to test the live deployment (`https://krishnalsk.github.io/Project-Ai-style/`) by default, eliminating local port collision dependencies.

### Issue 3: Biometric Tests Flagged as Blocked in Android Suite
- **Symptom:** `APP-341` to `APP-350` marked `Blocked`
- **Explanation:** Virtual emulators lack physical biometric sensors. Tests are preserved in the inventory and can be executed on physical hardware via `adb`.

### Issue 4: Uncapped Stress Tests Flagged as Blocked in Performance Suite
- **Symptom:** `PERF-226` to `PERF-250` marked `Blocked`
- **Explanation:** Safety Policy Gate. Uncapped 1,000+ VU DoS testing against public hosting infrastructure is restricted. Run baseline 100 VU tests or test against isolated local containers.
