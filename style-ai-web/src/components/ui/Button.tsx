"use client";
import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-[#4A90E2] text-white shadow-[0_4px_14px_rgba(74,144,226,0.25)] hover:bg-[#3A6BC8] hover:shadow-[0_6px_20px_rgba(74,144,226,0.35)] active:scale-[0.98]",
  secondary: "bg-white text-slate-900 border-[1.5px] border-slate-200 hover:border-[#4A90E2] hover:text-[#4A90E2] hover:bg-[#EFF6FF]",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-2 text-xs rounded-xl",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3.5 text-sm rounded-2xl",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, children, className = "", disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 disabled:opacity-45 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
