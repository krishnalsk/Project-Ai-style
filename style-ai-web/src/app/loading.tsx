export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#4A90E2]/10 border border-[#BFDBFE] flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#4A90E2]/30 border-t-[#4A90E2] rounded-full animate-spin" aria-hidden />
        </div>
        <p className="text-sm font-semibold text-slate-600">Loading Style AI…</p>
      </div>
    </div>
  );
}
