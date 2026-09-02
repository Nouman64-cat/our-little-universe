import type { ReactNode } from "react";
import type { HubTab } from "@/types/experience";

interface IconProps {
  active: boolean;
}

/** Shared props: filled when active, hairline stroke otherwise. */
function paint(active: boolean) {
  return {
    fill: active ? "currentColor" : "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

function HomeIcon({ active }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <path d="M4 11.5 12 5l8 6.5" {...paint(false)} fill="none" />
      <path d="M6 10.5V19h12v-8.5" {...paint(active)} />
    </svg>
  );
}

function GameIcon({ active }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <path
        d="M12 20s-7-4.6-7-9.6A3.9 3.9 0 0 1 12 7.6a3.9 3.9 0 0 1 7 2.8C19 15.4 12 20 12 20Z"
        {...paint(active)}
      />
    </svg>
  );
}

function SweetsIcon({ active }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <ellipse cx="12" cy="12" rx="4.5" ry="4" {...paint(active)} />
      <path d="M7.5 12 3.5 9.5v5L7.5 12ZM16.5 12l4-2.5v5L16.5 12Z" {...paint(active)} />
    </svg>
  );
}

function GardenIcon({ active }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <path d="M12 21v-7" {...paint(false)} fill="none" />
      <path
        d="M12 14c0-3 2-5 2-5s2 2 2 5M12 14c0-3-2-5-2-5s-2 2-2 5M12 14c-1.5-2-1.5-6-1.5-6S12 6 12 8s1.5 4 1.5 6"
        {...paint(active)}
      />
    </svg>
  );
}

function TeddyIcon({ active }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <circle cx="7" cy="6.5" r="2.4" {...paint(active)} />
      <circle cx="17" cy="6.5" r="2.4" {...paint(active)} />
      <circle cx="12" cy="13" r="7" {...paint(active)} />
      <circle cx="9.5" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <path d="M10.5 15.5c1 .8 2 .8 3 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function UsIcon({ active }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <rect x="3.5" y="6" width="17" height="12" rx="2.5" {...paint(active)} />
      <path d="m4.5 7.5 7.5 5.5 7.5-5.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const NAV_ICONS: Record<HubTab, (props: IconProps) => ReactNode> = {
  home: HomeIcon,
  game: GameIcon,
  sweets: SweetsIcon,
  garden: GardenIcon,
  teddy: TeddyIcon,
  us: UsIcon,
};
