interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export default function Spinner({ size = "md", label = "Loading...", className = "" }: SpinnerProps) {
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`} role="status" aria-label={label}>
      <div
        className={`${sizes[size]} border-[#4A90E2] border-t-transparent rounded-full animate-spin`}
      />
      <p className="text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}
