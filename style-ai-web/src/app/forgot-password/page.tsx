"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/firebaseAuth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email";
      setError(msg.includes("user-not-found") ? "No account found with this email." : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 px-4">
      <div className="max-w-md w-full glass rounded-3xl p-10 shadow-xl border border-blue-100">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-extrabold text-sm">S</span>
          </div>
          <span className="font-extrabold text-xl text-slate-900">Style <span className="text-blue-600">AI</span></span>
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Check Your Inbox</h2>
            <p className="text-slate-500 text-sm mb-6">
              A password reset link has been sent to <strong>{email}</strong>.
            </p>
            <Link href="/login" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors inline-block">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Forgot Password</h1>
            <p className="text-slate-500 text-sm mb-8">Enter your email and we&apos;ll send a reset link.</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="text-sm text-center mt-6">
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">← Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
