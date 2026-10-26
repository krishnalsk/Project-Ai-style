"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { friendlyAuthError } from "@/lib/firebaseAuth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, loading: authLoading, demoLogin } = useAuth();
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState("");

  // Check if user is already verified or demo
  useEffect(() => {
    if (!authLoading) {
      if (user && user.emailVerified) {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  // Poll every 3 seconds to check if email is verified
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          await currentUser.reload();
          if (currentUser.emailVerified) {
            clearInterval(interval);
            router.push("/onboarding");
          }
        }
      } catch {
        // Ignore background polling network glitches
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [router]);

  async function resendVerification() {
    setResendError("");
    setResending(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await sendEmailVerification(currentUser);
        setResent(true);
        setTimeout(() => setResent(false), 5000);
      } else {
        setResendError("No active user session. Please sign in again.");
      }
    } catch (err) {
      setResendError(friendlyAuthError(err));
    } finally {
      setResending(false);
    }
  }

  function handleDemoAccess() {
    demoLogin("Style Explorer", user?.email || "guest@styleai.app");
    router.push("/dashboard");
  }

  return (
    <main className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 px-4 py-8">
      <div className="max-w-md w-full glass rounded-3xl p-10 shadow-xl border border-blue-100 text-center">
        <div className="text-5xl mb-6">📧</div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Verify Your Email</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          We&apos;ve sent a verification link to{" "}
          <strong className="text-slate-800">{user?.email || "your email address"}</strong>. Click the link in your email to activate your account.
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-blue-600 font-semibold mb-6">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Waiting for verification...
        </div>

        {resent && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl px-4 py-3 mb-4">
            ✅ Verification email resent! Check your inbox or spam folder.
          </div>
        )}

        {resendError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-4 py-3 mb-4">
            {resendError}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={resendVerification}
            disabled={resending}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition disabled:opacity-50"
          >
            {resending ? "Sending..." : "Didn't receive it? Resend Email"}
          </button>

          <button
            onClick={handleDemoAccess}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm"
          >
            ⚡ Skip Email Verification (Instant Demo Mode)
          </button>

          <Link
            href="/login"
            className="text-xs text-slate-500 hover:text-slate-700 font-medium mt-2 hover:underline"
          >
            ← Sign in with a different account
          </Link>
        </div>
      </div>
    </main>
  );
}

