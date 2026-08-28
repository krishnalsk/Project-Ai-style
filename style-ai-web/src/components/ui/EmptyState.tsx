import Link from "next/link";
import React from "react";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <div className="card p-10 sm:p-14 text-center flex flex-col items-center">
      {icon && <div className="w-16 h-16 rounded-2xl bg-[#E6F4FF] flex items-center justify-center text-[#4A90E2] mb-4">{icon}</div>}
      <h3 className="text-lg font-extrabold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary inline-flex">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
