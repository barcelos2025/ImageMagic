import React from "react";

import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ className }) => (
  <svg
    className={cn("h-9 w-9", className)}
    viewBox="0 0 48 48"
    role="img"
    aria-label="ImageMagic"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="brand-mark-surface" x1="9" x2="39" y1="7" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="hsl(var(--primary))" />
        <stop offset="1" stopColor="hsl(118 18% 45%)" />
      </linearGradient>
      <linearGradient id="brand-mark-glint" x1="15" x2="34" y1="12" y2="35" gradientUnits="userSpaceOnUse">
        <stop stopColor="hsl(60 24% 98%)" />
        <stop offset="1" stopColor="hsl(105 24% 86%)" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="16" fill="url(#brand-mark-surface)" />
    <path
      d="M14 30.5c4.9 4.8 14 4.6 19.2-.4 2.5-2.4 3.8-5.6 3.8-9.4-2.6 1.1-5.6 1.5-8.7 1.1-6.2-.9-11.3 2.5-14.3 8.7Z"
      fill="hsl(var(--primary-foreground))"
      opacity="0.18"
    />
    <circle cx="24" cy="24" r="11.5" fill="hsl(var(--background))" opacity="0.96" />
    <circle cx="24" cy="24" r="6.3" fill="url(#brand-mark-glint)" />
    <path
      d="M20 18.3h8l-4 5.8-4-5.8Zm10.2 3.2 2.4 7.6-6.8-3.9 4.4-3.7Zm-2.2 10-8 .1 4-5.8 4 5.7Zm-10.2-3.1-2.4-7.6 6.8 3.9-4.4 3.7Z"
      fill="hsl(var(--primary))"
      opacity="0.92"
    />
    <path
      d="M31.8 10.5c4.9.4 7.1 2.8 7.4 7.9-4.7-.5-7.3-3.1-7.4-7.9Z"
      fill="hsl(104 22% 82%)"
    />
    <path
      d="M33.5 12.4c1.9 1.7 3.3 3.2 4.2 4.8"
      fill="none"
      stroke="hsl(var(--primary))"
      strokeLinecap="round"
      strokeWidth="1.25"
    />
  </svg>
);
