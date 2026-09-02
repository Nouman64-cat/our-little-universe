"use client";

import { useId } from "react";

interface HeartIconProps {
  className?: string;
  /** Render as a soft outline instead of a filled gradient. */
  outline?: boolean;
  title?: string;
}

/**
 * The single heart shape used everywhere in the experience. Uses a per-instance
 * gradient id so multiple hearts can render with independent fills.
 */
export function HeartIcon({ className, outline = false, title }: HeartIconProps) {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 32 29"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd0e6" />
          <stop offset="55%" stopColor="#ff9ec4" />
          <stop offset="100%" stopColor="#c1a6ff" />
        </linearGradient>
      </defs>
      <path
        d="M16 28.5C16 28.5 1.5 19.7 1.5 9.9C1.5 4.9 5.3 1.5 9.7 1.5C12.5 1.5 14.9 3 16 5.2C17.1 3 19.5 1.5 22.3 1.5C26.7 1.5 30.5 4.9 30.5 9.9C30.5 19.7 16 28.5 16 28.5Z"
        fill={outline ? "none" : `url(#${gradientId})`}
        stroke={outline ? "currentColor" : "none"}
        strokeWidth={outline ? 2 : 0}
        strokeLinejoin="round"
      />
    </svg>
  );
}
