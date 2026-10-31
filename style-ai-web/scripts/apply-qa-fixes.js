// scripts/apply-qa-fixes.js
const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');

// 1. Fix src/app/signup/page.tsx
{
  const filePath = path.join(baseDir, 'src/app/signup/page.tsx');
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace handleSignUp
  const oldSignUpRegex = /async function handleSignUp\(e: React\.FormEvent\) \{[\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\}/;
  const newSignUp = `async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError("Please enter your full name (minimum 2 characters).");
      return;
    }
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your confirm password.");
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(trimmedEmail, password, trimmedName);
      router.push("/verify-email");
    } catch (err: unknown) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }`;

  content = content.replace(oldSignUpRegex, newSignUp);

  // Add Confirm Password input in JSX if not already present
  if (!content.includes('placeholder="Re-enter password"')) {
    const passwordInputTarget = /(<div>\s*<label className="block text-sm font-semibold text-slate-700 mb-1">Password<\/label>[\s\S]*?<\/div>)/;
    const confirmInputJSX = `$1
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              minLength={8}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>`;
    content = content.replace(passwordInputTarget, confirmInputJSX);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Updated src/app/signup/page.tsx');
}

// 2. Fix src/app/login/page.tsx
{
  const filePath = path.join(baseDir, 'src/app/login/page.tsx');
  let content = fs.readFileSync(filePath, 'utf8');

  const oldLoginRegex = /async function handleEmailLogin\(e: React\.FormEvent\) \{[\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\}/;
  const newLogin = `async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setLoading(true);
    try {
      const u = await loginWithEmail(trimmedEmail, password);
      if (!u.emailVerified) {
        router.push("/verify-email");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }`;

  content = content.replace(oldLoginRegex, newLogin);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Updated src/app/login/page.tsx');
}

// 3. Fix src/app/forgot-password/page.tsx
{
  const filePath = path.join(baseDir, 'src/app/forgot-password/page.tsx');
  let content = fs.readFileSync(filePath, 'utf8');

  const oldFpRegex = /async function handleSubmit\(e: React\.FormEvent\) \{[\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\}/;
  const newFp = `async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(trimmedEmail);
      setSent(true);
    } catch (err: unknown) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }`;

  content = content.replace(oldFpRegex, newFp);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Updated src/app/forgot-password/page.tsx');
}

// 4. Fix src/app/profile/page.tsx
{
  const filePath = path.join(baseDir, 'src/app/profile/page.tsx');
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('const [profileError, setProfileError]')) {
    content = content.replace(
      'const [saveSuccess, setSaveSuccess] = useState(false);',
      'const [saveSuccess, setSaveSuccess] = useState(false);\n  const [profileError, setProfileError] = useState("");'
    );
  }

  const oldSaveRegex = /async function handleSave\(\) \{[\s\S]*?setTimeout\(\(\) => setSaveSuccess\(false\), 3000\);\s*\}/;
  const newSave = `async function handleSave() {
    setProfileError("");
    if (!formData.fullName.trim()) {
      setProfileError("Please enter a valid full name.");
      return;
    }
    setSaving(true);
    await updateProfile(formData);
    setSaving(false);
    setEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }`;
  content = content.replace(oldSaveRegex, newSave);

  if (!content.includes('{profileError && (')) {
    content = content.replace(
      '{saveSuccess && (',
      `{profileError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{profileError}</span>
          </div>
        )}

        {saveSuccess && (`
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Updated src/app/profile/page.tsx');
}

// 5. Fix src/app/onboarding/page.tsx
{
  const filePath = path.join(baseDir, 'src/app/onboarding/page.tsx');
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('const [onboardingError, setOnboardingError]')) {
    content = content.replace(
      'const [size, setSize] = useState("");',
      'const [size, setSize] = useState("");\n  const [onboardingError, setOnboardingError] = useState("");'
    );
  }

  const oldFinishRegex = /async function handleFinish\(\) \{[\s\S]*?finally \{\s*setSaving\(false\);\s*\}\s*\}/;
  const newFinish = `function handleNextStep() {
    setOnboardingError("");
    if (step === 1 && !fullName.trim()) {
      setOnboardingError("Please enter your full name to proceed.");
      return;
    }
    if (step === 2 && !skinType) {
      setOnboardingError("Please select your skin type to proceed.");
      return;
    }
    setStep(step + 1);
  }

  async function handleFinish() {
    setOnboardingError("");
    if (!size) {
      setOnboardingError("Please choose your clothing size.");
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      await saveUserProfile(user.uid, {
        fullName,
        age,
        profession,
        location,
        skinType,
        preferredFabric,
        size,
        email: user.email,
        comfortScore: 92,
      });
      await refreshProfile();
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }`;
  content = content.replace(oldFinishRegex, newFinish);

  // Replace onClick={() => setStep(step + 1)} with handleNextStep
  content = content.replace('onClick={() => setStep(step + 1)}', 'onClick={handleNextStep}');

  // Add error box above navigation buttons if not present
  if (!content.includes('{onboardingError && (')) {
    content = content.replace(
      '{/* Navigation Buttons */}',
      `{onboardingError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold px-4 py-2.5 rounded-xl mb-4">
            ⚠️ {onboardingError}
          </div>
        )}

        {/* Navigation Buttons */}`
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Updated src/app/onboarding/page.tsx');
}

console.log('🎉 All form validation fixes applied successfully!');
