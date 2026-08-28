"use client";
import Link from "next/link";
import React from "react";
import { ArrowLeftIcon } from "./Icons";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, backHref, onBack, actions }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 glass">
      <div className="page-container flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          {backHref ? (
            <Link href={backHref} aria-label="Go back" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition shrink-0">
              <ArrowLeftIcon size={20} />
            </Link>
          ) : onBack ? (
            <button onClick={onBack} aria-label="Go back" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition shrink-0">
              <ArrowLeftIcon size={20} />
            </button>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-[15px] sm:text-lg font-extrabold text-slate-900 leading-tight truncate">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 font-medium hidden sm:block">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
