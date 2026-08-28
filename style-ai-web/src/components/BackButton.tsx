"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ href, label = "Back", className = "" }: BackButtonProps) {
  const router = useRouter();

  const baseClasses = `inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses} aria-label={label}>
        <span aria-hidden>←</span>
        {label}
      </Link>
    );
  }

  return (
    <button
      onClick={() => router.back()}
      className={baseClasses}
      aria-label={label}
    >
      <span aria-hidden>←</span>
      {label}
    </button>
  );
}
