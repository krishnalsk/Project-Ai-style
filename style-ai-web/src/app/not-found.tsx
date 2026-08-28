import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-md w-full glass rounded-3xl p-10 shadow-xl border border-slate-100">
        <span className="text-6xl mb-4 block">👚</span>
        <h1 className="text-4xl font-black text-slate-900 mb-2">404</h1>
        <h2 className="text-lg font-extrabold text-slate-800 mb-2">Page Not Found</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Looks like this style route doesn&apos;t exist or has been moved to another collection.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white font-bold py-3 rounded-2xl hover:bg-blue-700 transition shadow-xs text-sm"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/shop"
            className="border-2 border-slate-200 text-slate-700 font-bold py-3 rounded-2xl hover:bg-slate-50 transition text-sm"
          >
            Browse Shop
          </Link>
        </div>
      </div>
    </main>
  );
}
