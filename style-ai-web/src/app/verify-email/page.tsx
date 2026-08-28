"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [resent, setResent] = useState(false);

  // Poll every 3 seconds to check if email is verified
  useEffect(() => {
    const interval = setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(interval);
          router.push("/onboarding");
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [router]);

  async function resendVerification() {
    const user = auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 px-4">
      <div className="max-w-md w-full glass rounded-3xl p-10 shadow-xl border border-blue-100 text-center">
        <div className="text-5xl mb-6">📧</div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Verify Your Email</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          We&apos;ve sent a verification link to your email address. Click the link to activate your account. This page will automatically move forward once verified.
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-blue-600 font-semibold mb-6">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Waiting for verification...
        </div>

        {resent && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">
            ✅ Verification email resent!
          </div>
        )}

        <button
          onClick={resendVerification}
          className="text-sm text-blue-600 font-semibold hover:underline"
        >
          Didn&apos;t receive it? Resend email
        </button>
      </div>
    </main>
  );
}
