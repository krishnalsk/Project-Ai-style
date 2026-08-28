"use client";

import Link from "next/link";
import { SparklesIcon } from "./ui/Icons";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

export default function Logo({ size = "md", href = "/", className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: 14, text: "text-base", iconBox: "w-7 h-7 rounded-lg" },
    md: { icon: 18, text: "text-lg", iconBox: "w-9 h-9 rounded-xl" },
    lg: { icon: 22, text: "text-xl", iconBox: "w-10 h-10 rounded-xl" },
  };

  const s = sizes[size];

  const content = (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <div
        className={`${s.iconBox} bg-[#4A90E2] flex items-center justify-center shadow-[0_4px_12px_rgba(74,144,226,0.3)] group-hover:scale-105 transition-transform`}
      >
        <SparklesIcon size={s.icon} className="text-white" />
      </div>
      <span className={`font-extrabold ${s.text} tracking-tight text-slate-900`}>
        Style <span className="text-[#4A90E2]">AI</span>
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
