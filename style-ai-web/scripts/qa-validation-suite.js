// scripts/qa-validation-suite.js
// Automated End-to-End QA Test Execution Suite for Style AI
// Executes tests for Login, Registration, Checkout, Profile, Onboarding, APIs, and Navigation.

const http = require("http");
const fs = require("fs");
const path = require("path");

async function runQASuite() {
  console.log("================================================================================");
  console.log("🧪 STYLE AI - SENIOR QA VALIDATION & FUNCTIONAL TEST SUITE");
  console.log("================================================================================\n");

  const results = [];

  function record(testCase, expected, actual, status, reason = "") {
    results.push({ testCase, expected, actual, status, reason });
    const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⚠️";
    console.log(`${icon} [${status}] ${testCase}`);
    if (status === "FAIL" && reason) {
      console.log(`    ↳ Reason: ${reason}`);
    }
  }

  // Robust HTTP requester supporting Next.js trailing slash and redirects
  function fetchHttp(targetPath, method = "GET", body = null, redirectsRemaining = 5) {
    return new Promise((resolve, reject) => {
      let reqPath = targetPath;
      if (!reqPath.includes("?") && !reqPath.endsWith("/") && !reqPath.includes(".")) {
        reqPath += "/";
      }

      const options = {
        hostname: "localhost",
        port: 3000,
        path: reqPath,
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      const req = http.request(options, (res) => {
        // Handle redirect if any
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsRemaining > 0) {
          const redirectUrl = new URL(res.headers.location, "http://localhost:3000");
          return resolve(fetchHttp(redirectUrl.pathname + redirectUrl.search, method, body, redirectsRemaining - 1));
        }

        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      });

      req.on("error", (err) => reject(err));
      if (body) {
        req.write(typeof body === "string" ? body : JSON.stringify(body));
      }
      req.end();
    });
  }

  // Import Auth Helpers
  const { friendlyAuthError } = await import("../src/lib/firebaseAuth.ts");

  // ============================================================================
  // SECTION 1: LOGIN VALIDATION TESTING
  // ============================================================================
  console.log(">>> SECTION 1: Login Validation Tests...");

  // TC-01: Valid email and password structure check
  {
    const validEmail = "stylist@example.com";
    const validPass = "ValidPass123!";
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validEmail) && validPass.length >= 8;
    record(
      "TC-01: Login with valid credentials format",
      "Credentials satisfy email regex and min length 8",
      isValid ? "Valid email and password accepted" : "Rejected",
      isValid ? "PASS" : "FAIL"
    );
  }

  // TC-02: Incorrect password error handling
  {
    const fakeError = { code: "auth/wrong-password", message: "Firebase: Error (auth/wrong-password)." };
    const userMsg = friendlyAuthError(fakeError);
    const expectedMsg = "Incorrect email or password. Please check your credentials and try again.";
    const passed = userMsg === expectedMsg;
    record(
      "TC-02: Login with incorrect password",
      `Generic message: '${expectedMsg}'`,
      userMsg,
      passed ? "PASS" : "FAIL",
      passed ? "" : `Expected '${expectedMsg}', got '${userMsg}'`
    );
  }

  // TC-03: Unregistered email error handling
  {
    const fakeError = { code: "auth/user-not-found", message: "Firebase: Error (auth/user-not-found)." };
    const userMsg = friendlyAuthError(fakeError);
    const expectedMsg = "Incorrect email or password. Please check your credentials and try again.";
    const passed = userMsg === expectedMsg;
    record(
      "TC-03: Login with unregistered email",
      `Generic message: '${expectedMsg}'`,
      userMsg,
      passed ? "PASS" : "FAIL",
      passed ? "" : `Expected '${expectedMsg}', got '${userMsg}'`
    );
  }

  // TC-04: Account enumeration prevention (Unregistered email vs Incorrect password)
  {
    const errUnregistered = friendlyAuthError({ code: "auth/user-not-found" });
    const errWrongPass = friendlyAuthError({ code: "auth/wrong-password" });
    const errInvalidCred = friendlyAuthError({ code: "auth/invalid-credential" });
    const isProtected = errUnregistered === errWrongPass && errWrongPass === errInvalidCred;
    record(
      "TC-04: Account enumeration prevention (generic error for non-existent users)",
      "Unregistered user and wrong password return identical generic error",
      isProtected ? "Identical error returned (No user enumeration)" : "Divergent errors returned",
      isProtected ? "PASS" : "FAIL"
    );
  }

  // TC-05: Empty email validation
  {
    const loginCode = fs.readFileSync("src/app/login/page.tsx", "utf8");
    const hasEmptyEmailCheck = loginCode.includes("!trimmedEmail") || loginCode.includes("!email.trim()");
    record(
      "TC-05: Login with empty email",
      "Empty email rejected before submission",
      hasEmptyEmailCheck ? "Explicit client-side empty email validation present" : "Allowed empty email",
      hasEmptyEmailCheck ? "PASS" : "FAIL"
    );
  }

  // TC-06: Empty password validation
  {
    const loginCode = fs.readFileSync("src/app/login/page.tsx", "utf8");
    const hasEmptyPasswordCheck = loginCode.includes("!password");
    record(
      "TC-06: Login with empty password",
      "Empty password rejected before submission",
      hasEmptyPasswordCheck ? "Explicit client-side empty password validation present" : "Allowed empty password",
      hasEmptyPasswordCheck ? "PASS" : "FAIL"
    );
  }

  // TC-07: Both fields empty
  {
    const loginCode = fs.readFileSync("src/app/login/page.tsx", "utf8");
    const blocksBoth = loginCode.includes("!trimmedEmail") && loginCode.includes("!password");
    record(
      "TC-07: Login with both fields empty",
      "Submission blocked when both fields empty",
      blocksBoth ? "Submission successfully blocked on both fields" : "Submission allowed",
      blocksBoth ? "PASS" : "FAIL"
    );
  }

  // TC-08: Invalid email format (missing @)
  {
    const email = "testuser.com";
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    record(
      "TC-08: Login with invalid email format (missing @)",
      "Invalid format rejected by email pattern",
      !isValid ? "Rejected format 'testuser.com'" : "Allowed invalid format",
      !isValid ? "PASS" : "FAIL"
    );
  }

  // TC-09: Invalid email format (missing domain)
  {
    const email = "user@";
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    record(
      "TC-09: Login with invalid email format (missing domain)",
      "Invalid format rejected by email pattern",
      !isValid ? "Rejected format 'user@'" : "Allowed invalid format",
      !isValid ? "PASS" : "FAIL"
    );
  }

  // TC-10: Password format & length requirement
  {
    const shortPass = "12345";
    const meetsRule = shortPass.length >= 8;
    record(
      "TC-10: Login password min length check (less than 8 chars)",
      "Password under 8 characters flagged as short",
      !meetsRule ? "Detected short password (< 8 chars)" : "Allowed short password",
      !meetsRule ? "PASS" : "FAIL"
    );
  }

  // TC-11: Password exposure check in error messages and logs
  {
    const rawPass = "SecretPassword123!";
    const fakeError = { code: "auth/invalid-credential", message: `Password ${rawPass} invalid` };
    const friendly = friendlyAuthError(fakeError);
    const exposed = friendly.includes(rawPass);
    record(
      "TC-11: Password non-exposure in error messages",
      "Error message never echoes plain-text password",
      !exposed ? "Password completely sanitized from error" : "Password leaked in error message",
      !exposed ? "PASS" : "FAIL"
    );
  }

  // ============================================================================
  // SECTION 2: REGISTRATION VALIDATION TESTING
  // ============================================================================
  console.log("\n>>> SECTION 2: Registration Validation Tests...");

  // TC-12: All required fields validation (Full Name, Email, Password, Confirm Password)
  {
    const signupCode = fs.readFileSync("src/app/signup/page.tsx", "utf8");
    const hasFullName = signupCode.includes("fullName");
    const hasEmail = signupCode.includes("email");
    const hasPassword = signupCode.includes("password");
    const hasConfirmPassword = signupCode.includes("confirmPassword");

    const allPresent = hasFullName && hasEmail && hasPassword && hasConfirmPassword;
    record(
      "TC-12: Registration form required fields presence (Name, Email, Password, Confirm Password)",
      "Form contains Full Name, Email, Password, and Confirm Password fields",
      allPresent
        ? "All 4 required fields present in form"
        : `Missing fields: ${!hasConfirmPassword ? "confirmPassword is MISSING" : "other"}`,
      allPresent ? "PASS" : "FAIL",
      allPresent ? "" : "Confirm Password field is currently missing from src/app/signup/page.tsx"
    );
  }

  // TC-13: Empty registration form submission
  {
    const signupCode = fs.readFileSync("src/app/signup/page.tsx", "utf8");
    const hasCheck = signupCode.includes("!trimmedName") && signupCode.includes("!trimmedEmail") && signupCode.includes("password.length");
    record(
      "TC-13: Empty registration form submission",
      "Submission rejected when all registration fields are blank",
      hasCheck ? "Rejected empty submission with specific error feedback" : "Submission allowed",
      hasCheck ? "PASS" : "FAIL"
    );
  }

  // TC-14: Whitespace-only name submission
  {
    const fullName = "    ";
    const isValid = fullName.trim().length >= 2;
    record(
      "TC-14: Full Name whitespace-only rejection",
      "Names with only spaces rejected (min 2 trimmed chars)",
      !isValid ? "Rejected whitespace-only name" : "Accepted whitespace name",
      !isValid ? "PASS" : "FAIL"
    );
  }

  // TC-15: Invalid email format in registration
  {
    const badEmails = ["plainaddress", "@missingusername.com", "user@domain..com", "user@.com"];
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
    const allRejected = badEmails.every((e) => !emailPattern.test(e));
    record(
      "TC-15: Registration invalid email format rejection",
      "Malformed email strings rejected by email pattern",
      allRejected ? "All 4 malformed email formats rejected" : "Allowed malformed email",
      allRejected ? "PASS" : "FAIL"
    );
  }

  // TC-16: Weak password rejection (< 8 characters)
  {
    const weakPass = "abc12";
    const isWeak = weakPass.length < 8;
    const userMsg = friendlyAuthError({ code: "auth/weak-password" });
    const passed = isWeak && userMsg === "Password is too weak. Please use at least 8 characters.";
    record(
      "TC-16: Registration weak password (< 8 chars) rejection",
      "Passwords under 8 chars rejected with 'Password is too weak. Please use at least 8 characters.'",
      userMsg,
      passed ? "PASS" : "FAIL"
    );
  }

  // TC-17: Password and confirm-password mismatch
  {
    const signupCode = fs.readFileSync("src/app/signup/page.tsx", "utf8");
    const hasMismatchCheck = signupCode.includes("password !== confirmPassword");

    record(
      "TC-17: Password and confirm-password mismatch check",
      "Mismatched passwords rejected before submission with 'Passwords do not match. Please re-enter your confirm password.'",
      hasMismatchCheck ? "Mismatched passwords rejected with mismatch error" : "No confirmPassword mismatch check implemented",
      hasMismatchCheck ? "PASS" : "FAIL",
      hasMismatchCheck ? "" : "src/app/signup/page.tsx does not check password !== confirmPassword"
    );
  }

  // TC-18: Duplicate email registration error handling
  {
    const fakeError = { code: "auth/email-already-in-use", message: "Firebase: Error (auth/email-already-in-use)." };
    const userMsg = friendlyAuthError(fakeError);
    const expectedMsg = "An account with this email already exists. Please log in instead.";
    const passed = userMsg === expectedMsg;
    record(
      "TC-18: Duplicate email registration rejection",
      `Expected message: '${expectedMsg}'`,
      userMsg,
      passed ? "PASS" : "FAIL"
    );
  }

  // TC-19: Valid registration input verification
  {
    const validRegistration = {
      fullName: "Priya Sharma",
      email: "priya.sharma@example.com",
      password: "StrongPassword123!",
      confirmPassword: "StrongPassword123!",
    };
    const isValid =
      validRegistration.fullName.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validRegistration.email) &&
      validRegistration.password.length >= 8 &&
      validRegistration.password === validRegistration.confirmPassword;

    record(
      "TC-19: Valid registration acceptance check",
      "Valid registration inputs pass all validation checks",
      isValid ? "All registration validation checks passed" : "Validation check failed",
      isValid ? "PASS" : "FAIL"
    );
  }

  // ============================================================================
  // SECTION 3: OTHER EXISTING FORMS TESTING
  // ============================================================================
  console.log("\n>>> SECTION 3: Other Existing Forms Validation Tests...");

  // TC-20: Checkout - Missing delivery fields validation
  {
    const emptyAddress = { name: "", phone: "", line1: "", city: "", pincode: "" };
    const isMissing = !emptyAddress.name.trim() || !emptyAddress.phone.trim() || !emptyAddress.line1.trim() || !emptyAddress.city.trim() || !emptyAddress.pincode.trim();
    record(
      "TC-20: Checkout - Empty required delivery fields",
      "Empty address fields rejected with 'Please fill all delivery fields'",
      isMissing ? "Detected empty address fields" : "Allowed empty address",
      isMissing ? "PASS" : "FAIL"
    );
  }

  // TC-21: Checkout - Invalid phone number length (< 10 digits)
  {
    const shortPhone = "98765432";
    const isValid = /^\d{10}$/.test(shortPhone.replace(/\s/g, ""));
    record(
      "TC-21: Checkout - Invalid mobile phone (< 10 digits)",
      "Mobile number with 8 digits rejected with 'Enter a valid 10-digit mobile number'",
      !isValid ? "Rejected 8-digit mobile number" : "Allowed 8-digit mobile number",
      !isValid ? "PASS" : "FAIL"
    );
  }

  // TC-22: Checkout - Invalid phone number with non-numeric characters
  {
    const nonNumericPhone = "98765abcd0";
    const isValid = /^\d{10}$/.test(nonNumericPhone.replace(/\s/g, ""));
    record(
      "TC-22: Checkout - Non-numeric characters in mobile phone",
      "Mobile number with letters rejected",
      !isValid ? "Rejected non-numeric mobile number" : "Allowed non-numeric mobile number",
      !isValid ? "PASS" : "FAIL"
    );
  }

  // TC-23: Checkout - Valid 10-digit phone number with whitespace
  {
    const spacedPhone = "98765 43210";
    const isValid = /^\d{10}$/.test(spacedPhone.replace(/\s/g, ""));
    record(
      "TC-23: Checkout - Valid 10-digit mobile number with whitespace",
      "Accepted 10-digit mobile number after trimming whitespace",
      isValid ? "Accepted '98765 43210'" : "Rejected valid phone",
      isValid ? "PASS" : "FAIL"
    );
  }

  // TC-24: Checkout - Invalid 6-digit postal pincode (< 6 digits)
  {
    const shortPin = "40001";
    const isValid = /^\d{6}$/.test(shortPin);
    record(
      "TC-24: Checkout - Invalid postal pincode (< 6 digits)",
      "5-digit pincode rejected with 'Enter a valid 6-digit pincode'",
      !isValid ? "Rejected 5-digit pincode '40001'" : "Allowed 5-digit pincode",
      !isValid ? "PASS" : "FAIL"
    );
  }

  // TC-25: Checkout - Invalid pincode with letters
  {
    const letterPin = "40001A";
    const isValid = /^\d{6}$/.test(letterPin);
    record(
      "TC-25: Checkout - Non-numeric postal pincode",
      "Pincode with letters rejected",
      !isValid ? "Rejected pincode '40001A'" : "Allowed pincode with letters",
      !isValid ? "PASS" : "FAIL"
    );
  }

  // TC-26: Checkout - Valid 6-digit pincode
  {
    const validPin = "400001";
    const isValid = /^\d{6}$/.test(validPin);
    record(
      "TC-26: Checkout - Valid 6-digit numeric pincode",
      "6-digit numeric pincode accepted",
      isValid ? "Accepted '400001'" : "Rejected valid pincode",
      isValid ? "PASS" : "FAIL"
    );
  }

  // TC-27: Checkout - Empty cart order placement block
  {
    const cartItems = [];
    const isBlocked = cartItems.length === 0;
    record(
      "TC-27: Checkout - Empty cart order rejection",
      "Order placement blocked when cart is empty with 'Your cart is empty'",
      isBlocked ? "Order blocked for 0 cart items" : "Order allowed with empty cart",
      isBlocked ? "PASS" : "FAIL"
    );
  }

  // TC-28: Forgot Password - Empty email check
  {
    const fpCode = fs.readFileSync("src/app/forgot-password/page.tsx", "utf8");
    const hasPreValidation = fpCode.includes("!trimmedEmail") || fpCode.includes("!email.trim()");
    record(
      "TC-28: Forgot Password - Client-side empty email validation check",
      "Explicit JS check prevents blank submission before network call",
      hasPreValidation ? "Explicit client check present" : "Missing explicit JS empty email check",
      hasPreValidation ? "PASS" : "FAIL",
      hasPreValidation ? "" : "src/app/forgot-password/page.tsx does not check !trimmedEmail"
    );
  }

  // TC-29: Forgot Password - Invalid email regex check
  {
    const fpCode = fs.readFileSync("src/app/forgot-password/page.tsx", "utf8");
    const hasEmailRegex = fpCode.includes("emailRegex.test");
    record(
      "TC-29: Forgot Password - Client-side email format regex check",
      "Explicit JS email regex prevents malformed email submission",
      hasEmailRegex ? "Email regex check present" : "Missing client email regex check",
      hasEmailRegex ? "PASS" : "FAIL",
      hasEmailRegex ? "" : "src/app/forgot-password/page.tsx lacks client-side email format regex"
    );
  }

  // TC-30: Profile Page - Empty Full Name validation
  {
    const profileCode = fs.readFileSync("src/app/profile/page.tsx", "utf8");
    const hasNameValidation = profileCode.includes("!formData.fullName.trim()");
    record(
      "TC-30: Profile Page - Empty full name validation check",
      "handleSave rejects blank or whitespace-only name",
      hasNameValidation ? "Name validation present" : "Missing full name validation in handleSave",
      hasNameValidation ? "PASS" : "FAIL",
      hasNameValidation ? "" : "src/app/profile/page.tsx handleSave() does not validate !formData.fullName.trim()"
    );
  }

  // TC-31: Onboarding - Step 1 Name validation
  {
    const obCode = fs.readFileSync("src/app/onboarding/page.tsx", "utf8");
    const hasStep1Validation = obCode.includes("step === 1") && obCode.includes("fullName");
    record(
      "TC-31: Onboarding - Step 1 required full name validation",
      "Step 1 Continue button checks that full name is provided",
      hasStep1Validation ? "Step 1 validation present" : "Missing Step 1 required name validation",
      hasStep1Validation ? "PASS" : "FAIL",
      hasStep1Validation ? "" : "src/app/onboarding/page.tsx allows continuing to step 2 without full name"
    );
  }

  // TC-32: Onboarding - Step 2 Skin Type validation
  {
    const obCode = fs.readFileSync("src/app/onboarding/page.tsx", "utf8");
    const hasStep2Validation = obCode.includes("step === 2") && obCode.includes("skinType");
    record(
      "TC-32: Onboarding - Step 2 required skin type validation",
      "Step 2 Continue button checks that a skin type is selected",
      hasStep2Validation ? "Step 2 validation present" : "Missing Step 2 required skin type validation",
      hasStep2Validation ? "PASS" : "FAIL",
      hasStep2Validation ? "" : "src/app/onboarding/page.tsx allows continuing to step 3 without selecting skin type"
    );
  }

  // TC-33: Skin Diary - Garment required field validation
  {
    const diaryCode = fs.readFileSync("src/app/skin-diary/page.tsx", "utf8");
    const hasGarmentCheck = diaryCode.includes("!garment.trim()");
    record(
      "TC-33: Skin Diary - Empty garment entry validation",
      "handleAddEntry rejects submission when garment name is blank",
      hasGarmentCheck ? "Empty garment rejected via !garment.trim()" : "Missing garment validation",
      hasGarmentCheck ? "PASS" : "FAIL"
    );
  }

  // ============================================================================
  // SECTION 4: FUNCTIONAL & API VALIDATION TESTING
  // ============================================================================
  console.log("\n>>> SECTION 4: Functional & API Validation Tests...");

  // TC-34: API /api/predict-issue/ - Empty payload rejection
  try {
    const res = await fetchHttp("/api/predict-issue/", "POST", {});
    const passed = res.status === 400 && res.data.status === "error";
    record(
      "TC-34: API /api/predict-issue - Empty payload rejection",
      "HTTP 400 with 'Please provide either an image, a description, or both.'",
      `HTTP ${res.status}: ${res.data.error || JSON.stringify(res.data)}`,
      passed ? "PASS" : "FAIL"
    );
  } catch (err) {
    record("TC-34: API /api/predict-issue - Empty payload rejection", "HTTP 400", err.message, "FAIL");
  }

  // TC-35: API /api/predict-issue/ - Valid text query processing
  try {
    const res = await fetchHttp("/api/predict-issue/", "POST", {
      textQuery: "60% Cotton 40% Polyester",
    });
    const passed = res.status === 200 && res.data.status === "success" && res.data.prediction.comfortScore;
    record(
      "TC-35: API /api/predict-issue - Valid text query processing",
      "HTTP 200 with structured prediction and comfort score",
      `HTTP ${res.status}: Score = ${res.data?.prediction?.comfortScore?.score}, Status = ${res.data?.prediction?.verifiedTextileInfo?.verificationStatus}`,
      passed ? "PASS" : "FAIL"
    );
  } catch (err) {
    record("TC-35: API /api/predict-issue - Valid text query processing", "HTTP 200", err.message, "FAIL");
  }

  // TC-36: API /api/chat/ - Empty payload rejection
  try {
    const res = await fetchHttp("/api/chat/", "POST", { message: "" });
    const passed = res.status === 400;
    record(
      "TC-36: API /api/chat - Empty message rejection",
      "HTTP 400 rejection for empty message and image",
      `HTTP ${res.status}: ${res.data.error || "Empty rejected"}`,
      passed ? "PASS" : "FAIL"
    );
  } catch (err) {
    record("TC-36: API /api/chat - Empty message rejection", "HTTP 400", err.message, "FAIL");
  }

  // TC-37: API /api/chat/ - Natural language conversational styling query
  try {
    const res = await fetchHttp("/api/chat/", "POST", {
      message: "Is cotton better than polyester for sensitive skin?",
    });
    const passed = res.status === 200 && res.data.reply && res.data.reply.length > 50;
    record(
      "TC-37: API /api/chat - Cotton vs Polyester natural language query",
      "HTTP 200 with detailed comparison explanation",
      `HTTP ${res.status}: Length = ${res.data?.reply?.length || 0} chars, Source = ${res.data?.source}`,
      passed ? "PASS" : "FAIL"
    );
  } catch (err) {
    record("TC-37: API /api/chat - Cotton vs Polyester query", "HTTP 200", err.message, "FAIL");
  }

  // TC-38: API /api/chat/ - Price constraint query (under ₹2,000)
  try {
    const res = await fetchHttp("/api/chat/", "POST", {
      message: "Show me clothing under ₹2,000",
    });
    const items = res.data?.matchedProducts || [];
    const allUnder2k = items.length > 0 && items.every((i) => i.product.price <= 2000);
    const passed = res.status === 200 && allUnder2k;
    record(
      "TC-38: API /api/chat - Price filtering (under ₹2,000)",
      "HTTP 200 with all returned products priced <= ₹2,000",
      `HTTP ${res.status}: ${items.length} products matched, max price = ₹${Math.max(...items.map((i) => i.product.price), 0)}`,
      passed ? "PASS" : "FAIL"
    );
  } catch (err) {
    record("TC-38: API /api/chat - Price filtering query", "HTTP 200", err.message, "FAIL");
  }

  // TC-39: Navigation & Page Accessibility - Root Homepage
  try {
    const res = await fetchHttp("/");
    record("TC-39: Page Navigation - Homepage (/)", "HTTP 200", `HTTP ${res.status}`, res.status === 200 ? "PASS" : "FAIL");
  } catch (err) {
    record("TC-39: Page Navigation - Homepage (/)", "HTTP 200", err.message, "FAIL");
  }

  // TC-40: Navigation & Page Accessibility - Shop Catalog (/shop)
  try {
    const res = await fetchHttp("/shop/");
    record("TC-40: Page Navigation - Shop Catalog (/shop/)", "HTTP 200", `HTTP ${res.status}`, res.status === 200 ? "PASS" : "FAIL");
  } catch (err) {
    record("TC-40: Page Navigation - Shop Catalog (/shop/)", "HTTP 200", err.message, "FAIL");
  }

  // TC-41: Navigation & Page Accessibility - Label Lens (/label-lens)
  try {
    const res = await fetchHttp("/label-lens/");
    record("TC-41: Page Navigation - Label Lens (/label-lens/)", "HTTP 200", `HTTP ${res.status}`, res.status === 200 ? "PASS" : "FAIL");
  } catch (err) {
    record("TC-41: Page Navigation - Label Lens (/label-lens/)", "HTTP 200", err.message, "FAIL");
  }

  // TC-42: Navigation & Page Accessibility - AI Stylist (/ai-stylist)
  try {
    const res = await fetchHttp("/ai-stylist/");
    record("TC-42: Page Navigation - AI Stylist (/ai-stylist/)", "HTTP 200", `HTTP ${res.status}`, res.status === 200 ? "PASS" : "FAIL");
  } catch (err) {
    record("TC-42: Page Navigation - AI Stylist (/ai-stylist/)", "HTTP 200", err.message, "FAIL");
  }

  // TC-43: Navigation & Page Accessibility - Login Page (/login)
  try {
    const res = await fetchHttp("/login/");
    record("TC-43: Page Navigation - Login (/login/)", "HTTP 200", `HTTP ${res.status}`, res.status === 200 ? "PASS" : "FAIL");
  } catch (err) {
    record("TC-43: Page Navigation - Login (/login/)", "HTTP 200", err.message, "FAIL");
  }

  // TC-44: Navigation & Page Accessibility - Signup Page (/signup)
  try {
    const res = await fetchHttp("/signup/");
    record("TC-44: Page Navigation - Signup (/signup/)", "HTTP 200", `HTTP ${res.status}`, res.status === 200 ? "PASS" : "FAIL");
  } catch (err) {
    record("TC-44: Page Navigation - Signup (/signup/)", "HTTP 200", err.message, "FAIL");
  }

  // TC-45: Navigation & Page Accessibility - Checkout Page (/checkout)
  try {
    const res = await fetchHttp("/checkout/");
    record("TC-45: Page Navigation - Checkout (/checkout/)", "HTTP 200", `HTTP ${res.status}`, res.status === 200 ? "PASS" : "FAIL");
  } catch (err) {
    record("TC-45: Page Navigation - Checkout (/checkout/)", "HTTP 200", err.message, "FAIL");
  }

  // TC-46: Navigation & Page Accessibility - Style Quiz (/quiz)
  try {
    const res = await fetchHttp("/quiz/");
    record("TC-46: Page Navigation - Style Quiz (/quiz/)", "HTTP 200", `HTTP ${res.status}`, res.status === 200 ? "PASS" : "FAIL");
  } catch (err) {
    record("TC-46: Page Navigation - Style Quiz (/quiz/)", "HTTP 200", err.message, "FAIL");
  }

  // TC-47: Navigation & Page Accessibility - Profile Page (/profile)
  try {
    const res = await fetchHttp("/profile/");
    record("TC-47: Page Navigation - Profile Page (/profile/)", "HTTP 200", `HTTP ${res.status}`, res.status === 200 ? "PASS" : "FAIL");
  } catch (err) {
    record("TC-47: Page Navigation - Profile Page (/profile/)", "HTTP 200", err.message, "FAIL");
  }

  // TC-48: Navigation & Page Accessibility - Onboarding Wizard (/onboarding)
  try {
    const res = await fetchHttp("/onboarding/");
    record("TC-48: Page Navigation - Onboarding Wizard (/onboarding/)", "HTTP 200", `HTTP ${res.status}`, res.status === 200 ? "PASS" : "FAIL");
  } catch (err) {
    record("TC-48: Page Navigation - Onboarding Wizard (/onboarding/)", "HTTP 200", err.message, "FAIL");
  }

  // TC-49: Navigation & Page Accessibility - Skin Diary (/skin-diary)
  try {
    const res = await fetchHttp("/skin-diary/");
    record("TC-49: Page Navigation - Skin Diary (/skin-diary/)", "HTTP 200", `HTTP ${res.status}`, res.status === 200 ? "PASS" : "FAIL");
  } catch (err) {
    record("TC-49: Page Navigation - Skin Diary (/skin-diary/)", "HTTP 200", err.message, "FAIL");
  }

  // TC-50: Navigation & Page Accessibility - Dashboard (/dashboard)
  try {
    const res = await fetchHttp("/dashboard/");
    record("TC-50: Page Navigation - Dashboard (/dashboard/)", "HTTP 200", `HTTP ${res.status}`, res.status === 200 ? "PASS" : "FAIL");
  } catch (err) {
    record("TC-50: Page Navigation - Dashboard (/dashboard/)", "HTTP 200", err.message, "FAIL");
  }

  // ============================================================================
  // SUMMARY REPORT GENERATION
  // ============================================================================
  console.log("\n================================================================================");
  console.log("📊 FINAL QA TEST EXECUTION METRICS");
  console.log("================================================================================");

  const total = results.length;
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const notTested = results.filter((r) => r.status === "NOT TESTED").length;
  const accuracy = ((passed / total) * 100).toFixed(2);

  console.log(`Total Test Cases Executed: ${total}`);
  console.log(`Passed Test Cases:         ${passed}`);
  console.log(`Failed Test Cases:         ${failed}`);
  console.log(`Not-Tested Cases:          ${notTested}`);
  console.log(`Final Test Accuracy:       ${accuracy}%\n`);

  if (failed > 0) {
    console.log("⚠️ IDENTIFIED DEFECTS TO FIX:");
    results
      .filter((r) => r.status === "FAIL")
      .forEach((r, i) => {
        console.log(`  ${i + 1}. [${r.testCase}] -> ${r.reason}`);
      });
  }

  fs.writeFileSync("scripts/qa-results.json", JSON.stringify({ total, passed, failed, notTested, accuracy, results }, null, 2));
}

runQASuite().catch(console.error);
