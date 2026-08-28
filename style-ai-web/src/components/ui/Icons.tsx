// Shared icon set — Lucide-style inline SVGs (no extra dependency)
// Consistent stroke 1.75, size 20 default, currentColor
import React from "react";

type IconProps = { className?: string; size?: number; strokeWidth?: number };

const wrap = (path: React.ReactNode, props: IconProps & { viewBox?: string; fill?: string }) => {
  const { className = "", size = 20, strokeWidth = 1.75, viewBox = "0 0 24 24", fill = "none" } = props;
  return (
    <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {path}
    </svg>
  );
};

export const SearchIcon = (p: IconProps) => wrap(<><circle cx="11" cy="11" r="7" /><path d="M20 20L16.5 16.5" /></>, p);
export const ShoppingBagIcon = (p: IconProps) => wrap(<><path d="M6 7h12l-1 12H7L6 7z" /><path d="M9 7V5a3 3 0 016 0v2" /></>, p);
export const HeartIcon = (p: IconProps) => wrap(<path d="M12 21s-6.5-4.2-8.2-8.7A4.5 4.5 0 015.5 6a4.2 4.2 0 015 2 4.2 4.2 0 015-2 4.5 4.5 0 013.7 6.3C18.5 16.8 12 21 12 21z" />, p);
export const UserIcon = (p: IconProps) => wrap(<><circle cx="12" cy="8" r="4" /><path d="M5 20a7 7 0 0114 0" /></>, p);
export const BellIcon = (p: IconProps) => wrap(<><path d="M6 13a6 6 0 0012 0c0-3-2-4.5-2-6a4 4 0 00-8 0c0 1.5-2 3-2 6z" /><path d="M10 18a2 2 0 004 0" /></>, p);
export const SparklesIcon = (p: IconProps) => wrap(<><path d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3z" /><path d="M19 11l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" /><path d="M5 15l1 1.5L7.5 18 6 19.5 5 21 4 19.5 2.5 18 4 16.5 5 15z" /></>, p);
export const ShieldCheckIcon = (p: IconProps) => wrap(<><path d="M12 3l7 3v5c0 4-2.5 7.5-7 10-4.5-2.5-7-6-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" /></>, p);
export const LeafIcon = (p: IconProps) => wrap(<><path d="M11 20A7 7 0 0111 6a7 7 0 010 14z" /><path d="M11 6c3 2 5 5 5 8" /></>, p);
export const DropletsIcon = (p: IconProps) => wrap(<><path d="M12 3l6 7a6 6 0 11-12 0l6-7z" /><path d="M12 14a2 2 0 100 4 2 2 0 000-4z" /></>, p);
export const SunIcon = (p: IconProps) => wrap(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M18.36 5.64l-1.41 1.41" /></>, p);
export const ShirtIcon = (p: IconProps) => wrap(<><path d="M8 3l-4 4 2 2 2-1v10h8V8l2 1 2-2-4-4-3 2-2-2z" /></>, p);
export const ScanIcon = (p: IconProps) => wrap(<><path d="M3 7V5a2 2 0 012-2h2" /><path d="M17 3h2a2 2 0 012 2v2" /><path d="M21 17v2a2 2 0 01-2 2h-2" /><path d="M7 21H5a2 2 0 01-2-2v-2" /><path d="M8 12h8" /></>, p);
export const BookOpenIcon = (p: IconProps) => wrap(<><path d="M2 7a4 4 0 014-4h4v14H6a4 4 0 00-4 4V7z" /><path d="M22 7a4 4 0 00-4-4h-4v14h4a4 4 0 014 4V7z" /></>, p);
export const BarChartIcon = (p: IconProps) => wrap(<><path d="M3 3v18h18" /><path d="M7 16V9" /><path d="M11 16V11" /><path d="M15 16V5" /></>, p);
export const AwardIcon = (p: IconProps) => wrap(<><circle cx="12" cy="8" r="5" /><path d="M9 13l-2 6 5-2 5 2-2-6" /></>, p);
export const ArrowRightIcon = (p: IconProps) => wrap(<><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></>, p);
export const ArrowLeftIcon = (p: IconProps) => wrap(<><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></>, p);
export const StarIcon = (p: IconProps) => wrap(<path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.3L12 15.5 7.1 18l.9-5.3-4-3.9 5.5-.8L12 3z" fill="currentColor" stroke="none" />, { ...p, fill: "currentColor" });
export const CheckIcon = (p: IconProps) => wrap(<path d="M5 13l4 4L19 7" />, p);
export const XIcon = (p: IconProps) => wrap(<><path d="M18 6L6 18" /><path d="M6 6l12 12" /></>, p);
export const MenuIcon = (p: IconProps) => wrap(<><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>, p);
export const FilterIcon = (p: IconProps) => wrap(<><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></>, p);
export const SlidersIcon = (p: IconProps) => wrap(<><path d="M4 8h4" /><circle cx="10" cy="8" r="2" /><path d="M14 8h6" /><path d="M10 16h10" /><circle cx="8" cy="16" r="2" /><path d="M4 16h2" /></>, p);
export const PackageIcon = (p: IconProps) => wrap(<><path d="M21 8l-9-4-9 4 9 4 9-4z" /><path d="M3 8v8l9 4 9-4V8" /><path d="M12 12v8" /></>, p);
export const TruckIcon = (p: IconProps) => wrap(<><path d="M14 18H5a2 2 0 01-2-2V8a2 2 0 012-2h7l4 4v6a2 2 0 01-2 2z" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /><path d="M16 12h3a1 1 0 011 1v3" /></>, p);
