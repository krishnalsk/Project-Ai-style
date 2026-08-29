"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signUpWithEmail, loginWithGoogle } from "@/lib/firebaseAuth";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/onboarding");
    }
  }, [user, authLoading, router]);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(email, password, fullName);
      router.push("/verify-email");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign-up failed";
      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  }

  function friendlyError(msg: string): string {
    if (msg.includes("auth/unauthorized-domain")) {
      return "Firebase Auth Domain Warning: This hosting domain (GitHub Pages) is not yet in your Firebase Authorized Domains list. You can click 'Instant Demo Access' below to explore immediately, or whitelist this domain in Firebase Console.";
    }
    if (msg.includes("email-already-in-use")) return "This email is already registered. Please sign in.";
    if (msg.includes("weak-password")) return "Password must be at least 6 characters.";
    if (msg.includes("invalid-email")) return "Please enter a valid email address.";
    return msg;
  }

  function handleDemoAccess() {
    demoLogin(fullName.trim() || "Style Explorer", email.trim() || "guest@styleai.app");
    router.push("/onboarding");
  }

  async function handleGoogleSignup() {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push("/onboarding");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 px-4 py-12">
      <div className="max-w-md w-full glass rounded-3xl p-10 shadow-xl border border-blue-100">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-extrabold text-sm">S</span>
          </div>
          <span className="font-extrabold text-xl text-slate-900">
            Style <span className="text-blue-600">AI</span>
          </span>
        </Link>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Create your account</h1>
        <p className="text-slate-500 text-sm mb-8">
          Get personalized style recommendations in minutes.
        </p>

        {/* Error */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl p-4 mb-5 space-y-2">
            <p className="font-medium leading-relaxed">{error}</p>
            <button
              onClick={handleDemoAccess}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition mt-2 shadow-sm"
            >
              ⚡ Enter in Demo Mode (1-Click Instant Access)
            </button>
          </div>
        )}

        {/* Google */}
        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition mb-3 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Guest Demo Button */}
        <button
          onClick={handleDemoAccess}
          className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl py-2.5 text-xs font-bold text-slate-700 transition mb-5"
        >
          <span>⚡</span> Explore as Guest (Instant Access)
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
              minLength={8}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors mt-1 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account...
              </>
            ) : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

function friendlyError(msg: string): string {
  if (msg.includes("email-already-in-use"))
    return "An account with this email already exists. Try logging in.";
  if (msg.includes("weak-password"))
    return "Password is too weak. Use at least 8 characters.";
  if (msg.includes("invalid-email"))
    return "Please enter a valid email address.";
  if (msg.includes("network"))
    return "Network error. Please check your connection.";
  return msg;
}
