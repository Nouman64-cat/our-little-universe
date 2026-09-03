"use client";

import { darken } from "./shade";

/**
 * Furniture draws into a 100-wide box. Floor pieces sit on the baseline
 * y = 100; wall pieces (`art`, `mirror`, `shelf`) centre on y ≈ 46. The room
 * scales this box to the slot's width.
 */
export const FURNITURE_BOX = 100;

const S = 1.6;

const WOOD = "#c89a6a";
const WOOD_DARK = "#a2764a";
const FABRIC = "#e2a9b8";
const FABRIC_2 = "#cf8fa0";
const LEAF = "#7fae7c";

export function Furniture({ variant }: { category?: string; variant: string }) {
  switch (variant) {
    // ── seats ──────────────────────────────────────────────────────────────
    case "sofa-curved":
      return (
        <g stroke={FABRIC_2} strokeWidth={S} strokeLinejoin="round">
          {/* back */}
          <path d="M14 92 v-32 a14 12 0 0 1 14 -12 h44 a14 12 0 0 1 14 12 v32 Z" fill={FABRIC_2} />
          {/* seat cushions */}
          <rect x={16} y={74} width={68} height={20} rx={7} fill={FABRIC} />
          <path d="M50 74 v20" stroke={FABRIC_2} strokeWidth={S} />
          {/* arms */}
          <rect x={6} y={66} width={14} height={28} rx={7} fill={FABRIC_2} />
          <rect x={80} y={66} width={14} height={28} rx={7} fill={FABRIC_2} />
          {/* legs */}
          <path d="M18 94 v5 M82 94 v5" stroke={WOOD_DARK} />
        </g>
      );
    case "sofa-boxy":
      return (
        <g stroke={darken("#a9c3b0", 0.3)} strokeWidth={S} strokeLinejoin="round">
          <rect x={8} y={60} width={84} height={30} rx={3} fill="#bcd4c4" />
          <rect x={8} y={52} width={84} height={14} rx={3} fill="#a9c3b0" />
          <rect x={4} y={58} width={12} height={32} rx={3} fill="#a9c3b0" />
          <rect x={84} y={58} width={12} height={32} rx={3} fill="#a9c3b0" />
          <path d="M14 96 v-6 M86 96 v-6" stroke={WOOD_DARK} />
        </g>
      );
    case "loveseat":
      return (
        <g stroke={darken("#e6c6a0", 0.3)} strokeWidth={S} strokeLinejoin="round">
          <rect x={22} y={58} width={56} height={32} rx={4} fill="#f0d8b8" />
          <rect x={22} y={52} width={56} height={12} rx={4} fill="#e6c6a0" />
          <rect x={18} y={60} width={9} height={30} rx={3} fill="#e6c6a0" />
          <rect x={73} y={60} width={9} height={30} rx={3} fill="#e6c6a0" />
          <path d="M24 96 v-6 M76 96 v-6" stroke={WOOD_DARK} />
        </g>
      );
    case "armchairs":
      return (
        <g stroke={FABRIC_2} strokeWidth={S} strokeLinejoin="round">
          {[10, 56].map((x) => (
            <g key={x} transform={`translate(${x} 0)`}>
              <rect x={2} y={62} width={30} height={26} rx={4} fill={FABRIC} />
              <rect x={2} y={54} width={30} height={12} rx={4} fill={FABRIC_2} />
              <path d="M6 96 v-6 M28 96 v-6" stroke={WOOD_DARK} />
            </g>
          ))}
        </g>
      );

    // ── beds ───────────────────────────────────────────────────────────────
    case "bed-simple":
      return (
        <g stroke={darken("#d8c4a4", 0.3)} strokeWidth={S} strokeLinejoin="round">
          {/* headboard */}
          <rect x={6} y={52} width={12} height={42} rx={3} fill="#c9a97e" />
          {/* mattress + duvet */}
          <rect x={14} y={72} width={80} height={22} rx={4} fill="#efe6d0" />
          <path d="M14 80 h80" stroke="#dccdb0" strokeWidth={S} />
          {/* pillow */}
          <rect x={20} y={66} width={26} height={12} rx={4} fill="#f8f2e4" />
          {/* legs */}
          <path d="M18 94 v5 M90 94 v5" stroke={WOOD_DARK} />
        </g>
      );
    case "bed-canopy":
      return (
        <g stroke={WOOD_DARK} strokeWidth={S} strokeLinejoin="round">
          <path d="M8 20 h84 M10 20 v70 M90 20 v70" fill="none" />
          <path d="M4 20 q46 12 92 0" fill="#e7b9c6" stroke="none" opacity={0.9} />
          <rect x={10} y={62} width={80} height={28} rx={3} fill="#efe6d0" />
          <rect x={10} y={46} width={16} height={44} rx={3} fill="#d8c4a4" />
        </g>
      );
    case "bed-low":
      return (
        <g stroke={darken("#cbb79a", 0.3)} strokeWidth={S} strokeLinejoin="round">
          <rect x={4} y={74} width={92} height={18} rx={3} fill="#cbb79a" />
          <rect x={10} y={64} width={80} height={16} rx={3} fill="#f0e7d3" />
          <rect x={16} y={58} width={28} height={12} rx={3} fill="#f6efdf" />
        </g>
      );

    // ── rugs ───────────────────────────────────────────────────────────────
    case "rug-round":
      return (
        <g>
          <ellipse cx={50} cy={95} rx={42} ry={7} fill="#e9cdd6" stroke="#d3aebf" strokeWidth={S} />
          <ellipse cx={50} cy={95} rx={27} ry={4.4} fill="none" stroke="#d3aebf" strokeWidth={S} />
        </g>
      );
    case "rug-rect":
      return (
        <g>
          <path d="M8 98 L18 90 L82 90 L92 98 Z" fill="#d7e0d0" stroke="#b6c6ac" strokeWidth={S} />
          <path d="M20 94 L80 94" stroke="#b6c6ac" strokeWidth={S} />
        </g>
      );
    case "rug-runner":
      return (
        <path d="M18 96 L26 86 L74 86 L82 96 Z" fill="#e6d8b8" stroke="#cbb98c" strokeWidth={S} />
      );
    case "rug-shag":
      return (
        <g>
          <ellipse cx={50} cy={92} rx={38} ry={8} fill="#f0e2d0" stroke="#d8c3a8" strokeWidth={S} />
          <path d="M14 92 l-3 4 M26 95 l-2 4 M40 96 l0 4 M60 96 l0 4 M74 95 l2 4 M86 92 l3 4" stroke="#d8c3a8" strokeWidth={S} />
        </g>
      );

    // ── tables ─────────────────────────────────────────────────────────────
    case "table-round":
      return (
        <g stroke={WOOD_DARK} strokeWidth={S} strokeLinejoin="round">
          <ellipse cx={50} cy={72} rx={26} ry={7} fill={WOOD} />
          <path d="M40 76 l-4 20 M60 76 l4 20" />
        </g>
      );
    case "table-rect":
      return (
        <g stroke={WOOD_DARK} strokeWidth={S} strokeLinejoin="round">
          <rect x={16} y={58} width={68} height={10} rx={2} fill={WOOD} />
          <path d="M22 68 v28 M78 68 v28" />
        </g>
      );
    case "table-nest":
      return (
        <g stroke={WOOD_DARK} strokeWidth={S} strokeLinejoin="round">
          <rect x={20} y={64} width={40} height={8} rx={2} fill={WOOD} />
          <path d="M24 72 v22 M56 72 v22" />
          <rect x={50} y={72} width={34} height={7} rx={2} fill="#d9b48a" />
          <path d="M54 79 v16 M80 79 v16" />
        </g>
      );
    case "table-trunk":
      return (
        <g stroke={darken("#b98c5e", 0.3)} strokeWidth={S}>
          <ellipse cx={50} cy={82} rx={20} ry={14} fill="#b98c5e" />
          <ellipse cx={50} cy={78} rx={20} ry={12} fill="#cda173" />
          <ellipse cx={50} cy={78} rx={9} ry={5} fill="none" stroke="#b98c5e" />
        </g>
      );

    // ── wall ───────────────────────────────────────────────────────────────
    case "art-single":
      return (
        <g stroke="#9a8b73" strokeWidth={S} strokeLinejoin="round">
          <rect x={34} y={26} width={32} height={40} rx={2} fill="#f3ead6" />
          <path d="M40 54 l8 -12 6 8 6 -10 4 14 Z" fill="#c9a2c4" stroke="none" />
        </g>
      );
    case "art-trio":
      return (
        <g stroke="#9a8b73" strokeWidth={S} strokeLinejoin="round">
          <rect x={20} y={30} width={20} height={24} rx={2} fill="#f3ead6" />
          <rect x={44} y={24} width={16} height={20} rx={2} fill="#f3ead6" />
          <rect x={64} y={32} width={20} height={26} rx={2} fill="#f3ead6" />
          <circle cx={30} cy={42} r={4} fill="#e0a9c0" stroke="none" />
          <path d="M48 40 l4 -6 4 6 Z" fill="#a9c3b0" stroke="none" />
          <path d="M68 48 h12" stroke="#c9a2c4" />
        </g>
      );
    case "mirror":
      return (
        <g stroke="#c9b98c" strokeWidth={S * 1.6}>
          <circle cx={50} cy={44} r={20} fill="#dbe7ec" />
          <path d="M40 36 l6 6" stroke="#f0f5f7" strokeWidth={S * 1.4} />
        </g>
      );
    case "shelf":
      return (
        <g stroke={WOOD_DARK} strokeWidth={S} strokeLinejoin="round">
          <rect x={24} y={46} width={52} height={5} rx={1.5} fill={WOOD} />
          <rect x={30} y={30} width={7} height={16} fill="#c9a2c4" stroke="none" />
          <rect x={40} y={34} width={7} height={12} fill="#a9c3b0" stroke="none" />
          <path d="M54 46 v-10 a5 5 0 0 1 10 0" fill="none" stroke={LEAF} />
        </g>
      );

    // ── accents ────────────────────────────────────────────────────────────
    case "floor-lamp":
      return (
        <g stroke="#8a8170" strokeWidth={S}>
          <path d="M50 96 v-52" />
          <path d="M38 44 h24 l-4 -12 h-16 Z" fill="#f4e6b8" stroke="#c9b47e" />
          <ellipse cx={50} cy={96} rx={10} ry={3} fill="#8a8170" stroke="none" />
        </g>
      );
    case "plant":
      return (
        <g>
          <path d="M40 96 h20 l-3 -16 h-14 Z" fill="#cf8b6a" stroke={darken("#cf8b6a", 0.3)} strokeWidth={S} />
          <path d="M50 80 q-16 -6 -14 -30 M50 80 q16 -8 15 -32 M50 80 v-34" fill="none" stroke={LEAF} strokeWidth={S * 1.4} strokeLinecap="round" />
        </g>
      );
    case "stool":
      return (
        <g stroke={WOOD_DARK} strokeWidth={S}>
          <ellipse cx={50} cy={74} rx={13} ry={5} fill={WOOD} />
          <path d="M42 78 l-3 18 M58 78 l3 18 M50 79 v17" />
        </g>
      );
    case "cushion":
      return (
        <g>
          <ellipse cx={50} cy={90} rx={22} ry={12} fill="#e7b9c6" stroke="#d094a6" strokeWidth={S} />
          <circle cx={50} cy={88} r={2} fill="#d094a6" />
        </g>
      );

    default:
      return null;
  }
}
