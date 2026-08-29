# Style AI — Security Audit Executive Summary

**Generated:** 29/8/2026, 1:48:36 pm
**Overall Score:** 72 / 100 — **LOW RISK**
**Audit Type:** SAST (Source Code Review) + DAST (HTTP Header Scan)

---

## Risk Distribution

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 0 | ✅ Clean |
| 🟠 High | 0 | ✅ Clean |
| 🟡 Medium | 0 | ✅ Clean |
| 🟢 Low | 14 | ⚠️ Low Risk |
| **Total** | **14** | **Low Risk** |

---

## Key Findings Summary

### SEC-001 — Firebase Auth Token Stored in localStorage
- **Category:** Authentication | **Severity:** Low | **CVSS Score:** 3/10
- **Location:** `style-ai-web/src/lib/firebaseAuth.ts`
- **Description:** Firebase Auth persists user ID tokens to localStorage by default. If an XSS attack occurs, stored tokens may be exfiltrated.
- **Recommendation:** Use sessionStorage or an HttpOnly cookie via a server-side token exchange to reduce XSS exposure of auth tokens.
- **Reference:** CWE-922 | A02:2021

### SEC-002 — No Session Inactivity Timeout Configured
- **Category:** Session Management | **Severity:** Low | **CVSS Score:** 3/10
- **Location:** `style-ai-web/src/contexts/AuthContext.tsx`
- **Description:** Firebase Authentication sessions do not expire by default. Users remain authenticated indefinitely even on shared devices.
- **Recommendation:** Implement client-side idle detection and call firebase.auth().signOut() after a configurable inactivity period (e.g., 30 minutes).
- **Reference:** CWE-613 | A07:2021

### SEC-003 — Content Security Policy (CSP) Not Defined as HTTP Header
- **Category:** Content Security | **Severity:** Low | **CVSS Score:** 4/10
- **Location:** `style-ai-web/src/middleware.ts`
- **Description:** No Content-Security-Policy header is returned for most routes. This allows unrestricted script and resource loading.
- **Recommendation:** Add a strict CSP header in middleware.ts restricting script-src to self and known CDN origins only.
- **Reference:** CWE-693 | A05:2021

### SEC-004 — Missing Rate Limiting on Authentication Endpoints
- **Category:** Input Validation | **Severity:** Low | **CVSS Score:** 3/10
- **Location:** `style-ai-web/src/app/login/page.tsx`
- **Description:** The /login and /signup pages do not implement client-side or server-side request throttling, allowing unlimited login attempts.
- **Recommendation:** Integrate Firebase App Check or implement a rate-limiting middleware to restrict repeated authentication requests per IP.
- **Reference:** CWE-307 | A07:2021

### SEC-005 — HSTS Max-Age Below Recommended Minimum
- **Category:** Transport Security | **Severity:** Low | **CVSS Score:** 2/10
- **Location:** `style-ai-web/src/middleware.ts`
- **Description:** HSTS is set via middleware but the max-age value may be less than the recommended 1-year minimum for production environments.
- **Recommendation:** Set max-age=63072000 (2 years) and include the preload directive to guarantee HTTPS enforcement.
- **Reference:** CWE-319 | A02:2021

### SEC-006 — Firebase Project Config Exposed in Client Bundle
- **Category:** Data Exposure | **Severity:** Low | **CVSS Score:** 3/10
- **Location:** `style-ai-web/src/lib/firebase.ts`
- **Description:** NEXT_PUBLIC_ environment variables embed Firebase project ID, API key, and App ID into the browser-downloadable JS bundle.
- **Recommendation:** This is expected for client-side Firebase SDKs. Mitigate by enabling Firebase Security Rules and App Check to restrict API key misuse.
- **Reference:** CWE-200 | A02:2021

### SEC-007 — Deprecated npm Package: inflight@1.0.6
- **Category:** Dependency | **Severity:** Low | **CVSS Score:** 2/10
- **Location:** `package-lock.json (transitive)`
- **Description:** The inflight package is flagged as memory-leaking and unsupported. It is a transitive dependency of several build tools.
- **Recommendation:** Run npm audit fix and monitor for upstream package updates that eliminate the inflight dependency.
- **Reference:** CWE-1104 | A06:2021

### SEC-008 — Outdated glob Package (v7.x / v10.x) with Known CVEs
- **Category:** Dependency | **Severity:** Low | **CVSS Score:** 2/10
- **Location:** `package-lock.json (transitive)`
- **Description:** Old glob package versions contain wildcard expansion vulnerabilities. Both v7.x and v10.5.x are flagged by npm audit.
- **Recommendation:** Run npm audit fix --force or pin glob to the latest patched release (v11+) in direct dependencies.
- **Reference:** CWE-22 | A06:2021

### SEC-009 — Unauthenticated Users Can Access /onboarding Route
- **Category:** Access Control | **Severity:** Low | **CVSS Score:** 3/10
- **Location:** `style-ai-web/src/components/ProtectedRoute.tsx`
- **Description:** Navigating directly to /onboarding bypasses email-verification redirect logic, allowing session-only auth (without email verification) to access onboarding screens.
- **Recommendation:** Add emailVerified check to ProtectedRoute.tsx and redirect unverified users to /verify-email before onboarding.
- **Reference:** CWE-285 | A01:2021

### SEC-010 — Verbose Firebase Error Messages Exposed to UI
- **Category:** Error Handling | **Severity:** Low | **CVSS Score:** 2/10
- **Location:** `style-ai-web/src/app/login/page.tsx`
- **Description:** Authentication errors such as "Firebase: Error (auth/user-not-found)" are surfaced directly in the UI, aiding user enumeration.
- **Recommendation:** Map Firebase error codes to generic UI messages (e.g., "Invalid email or password") to prevent user enumeration.
- **Reference:** CWE-209 | A09:2021

### SEC-011 — User Skin & Health Data Stored Without Explicit Consent Notice
- **Category:** Privacy | **Severity:** Low | **CVSS Score:** 3/10
- **Location:** `style-ai-web/src/app/onboarding/page.tsx`
- **Description:** Onboarding collects sensitive skin type and health profile data. No GDPR/PDPB consent banner or privacy notice is presented at collection time.
- **Recommendation:** Add an inline consent checkbox before collecting health-related data, linking to the privacy policy.
- **Reference:** CWE-359 | A02:2021

### SEC-012 — X-Frame-Options Missing on Public Marketing Pages
- **Category:** Clickjacking | **Severity:** Low | **CVSS Score:** 2/10
- **Location:** `style-ai-web/src/middleware.ts`
- **Description:** The X-Frame-Options header is only applied to protected routes. Public pages (/, /shop) are missing frame-busting protection.
- **Recommendation:** Apply X-Frame-Options: DENY globally in middleware.ts for all routes, not only authenticated ones.
- **Reference:** CWE-1021 | A05:2021

### SEC-013 — uuid Package Below Supported Version (v8.x)
- **Category:** Dependency | **Severity:** Low | **CVSS Score:** 2/10
- **Location:** `appium-tests/package-lock.json (transitive)`
- **Description:** uuid@8.3.2 is flagged as end-of-life. ESM consumers should use uuid@latest; CommonJS users should use uuid@11.
- **Recommendation:** Update parent packages that depend on uuid, or pin uuid directly to v11.x.
- **Reference:** CWE-1104 | A06:2021

### SEC-014 — Cache-Control Headers Missing on API Responses
- **Category:** Caching | **Severity:** Low | **CVSS Score:** 2/10
- **Location:** `style-ai-web/src/middleware.ts`
- **Description:** Next.js API routes do not set Cache-Control headers by default. Sensitive API responses may be cached by proxy servers.
- **Recommendation:** Add Cache-Control: no-store, no-cache to all API route responses in middleware.ts to prevent sensitive data caching.
- **Reference:** CWE-524 | A02:2021


---

## Hardening Roadmap

1. **Priority 1:** Implement Content Security Policy (SEC-003) and fix X-Frame-Options globally (SEC-012)
2. **Priority 2:** Add email-verified check to ProtectedRoute (SEC-009) and map Firebase errors to generic messages (SEC-010)
3. **Priority 3:** Add session inactivity timeout (SEC-002) and GDPR consent notice (SEC-011)
4. **Priority 4:** Update flagged npm dependencies (SEC-007, SEC-008, SEC-013)

---

*Zero Critical or High vulnerabilities detected. The application is safe for production with low-risk hardening recommended.*
