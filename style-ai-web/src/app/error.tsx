"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="card p-8 text-center max-w-md w-full">
        <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-3 text-red-600 font-bold">!</div>
        <h2 className="text-lg font-extrabold text-slate-900">Something went wrong</h2>
        <p className="text-sm text-slate-500 mt-1">{error.message || "An unexpected error occurred. Please try again."}</p>
        <button onClick={() => reset()} className="mt-6 bg-[#4A90E2] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#3A6BC8] transition">
          Try again
        </button>
      </div>
    </div>
  );
}
