import React from "react";

type Variant = "safe" | "moderate" | "avoid" | "neutral" | "primary";

const map: Record<Variant, string> = {
  safe: "badge badge-safe",
  moderate: "badge badge-moderate",
  avoid: "badge badge-avoid",
  neutral: "badge bg-slate-100 text-slate-700 border-slate-200",
  primary: "badge bg-[#EFF6FF] text-[#4A90E2] border-[#BFDBFE]",
};

export function Badge({ variant = "neutral", className = "", children, ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return <span className={`${map[variant]} ${className}`} {...props}>{children}</span>;
}

export function SafetyBadge({ score, safety }: { score: number; safety?: string }) {
  const variant: Variant = safety === "AVOID" ? "avoid" : safety === "MODERATE" ? "moderate" : score >= 95 ? "safe" : score >= 85 ? "moderate" : "avoid";
  return <span className={map[variant]}>{score}% Safe</span>;
}
