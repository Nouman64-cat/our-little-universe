"use client";

import { darken } from "./shade";

/** Yard pieces draw into a 44×54 box, base sitting on y = 54 (the ground). */
export const YARD_BOX = { w: 44, h: 54 };

const S = 1.3;

export function YardItem({ variant }: { variant: string }) {
  switch (variant) {
    case "tree":
      return (
        <g>
          <rect x={20} y={30} width={5} height={24} fill="#9a7250" stroke={darken("#9a7250", 0.25)} strokeWidth={S} />
          <circle cx={22.5} cy={20} r={16} fill="#8fb98a" stroke={darken("#8fb98a", 0.25)} strokeWidth={S} />
          <circle cx={15} cy={16} r={9} fill="#9ec59a" opacity={0.8} />
          <circle cx={29} cy={24} r={7} fill="#7ea87c" opacity={0.7} />
        </g>
      );
    case "lilies":
      return (
        <g>
          <path d="M6 54 q4 -14 10 -14 M22 54 q0 -18 0 -20 M38 54 q-4 -14 -10 -14" stroke="#6f9b6c" strokeWidth={S * 1.4} fill="none" strokeLinecap="round" />
          {[10, 22, 34].map((cx, i) => (
            <g key={cx} transform={`translate(${cx} ${30 - i * 2})`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx={0} cy={-4} rx={2.4} ry={5} fill="#f6dbe8" stroke="#d9b8cb" strokeWidth={0.7} transform={`rotate(${a})`} />
              ))}
              <circle cx={0} cy={0} r={1.6} fill="#efc987" />
            </g>
          ))}
        </g>
      );
    case "bench":
      return (
        <g stroke={darken("#c58f63", 0.3)} strokeWidth={S} strokeLinejoin="round">
          <rect x={4} y={34} width={36} height={5} rx={1.5} fill="#c58f63" />
          <rect x={4} y={22} width={36} height={5} rx={1.5} fill="#c58f63" />
          <rect x={7} y={38} width={4} height={14} fill="#a9733f" />
          <rect x={33} y={38} width={4} height={14} fill="#a9733f" />
        </g>
      );
    case "lamppost":
      return (
        <g>
          <rect x={20} y={14} width={4} height={40} fill="#5a5560" stroke={darken("#5a5560", 0.3)} strokeWidth={S} />
          <path d="M15 14 h14 l-2 -8 h-10 Z" fill="#f2e2a8" stroke="#8a7d4e" strokeWidth={S} />
          <circle cx={22} cy={10} r={2.4} fill="#fff4c9" opacity={0.9} />
        </g>
      );
    case "hedge":
      return (
        <g stroke={darken("#7fa876", 0.28)} strokeWidth={S}>
          <rect x={2} y={30} width={40} height={24} rx={9} fill="#7fa876" />
          <circle cx={12} cy={32} r={7} fill="#8db983" stroke="none" />
          <circle cx={24} cy={30} r={8} fill="#8db983" stroke="none" />
          <circle cx={34} cy={33} r={6} fill="#8db983" stroke="none" />
        </g>
      );
    case "pot":
      return (
        <g>
          <path d="M14 40 h16 l-2 14 h-12 Z" fill="#cf8b6a" stroke={darken("#cf8b6a", 0.3)} strokeWidth={S} />
          <path d="M22 40 q-10 -4 -8 -18 M22 40 q10 -6 9 -20 M22 40 v-22" stroke="#6f9b6c" strokeWidth={S * 1.3} fill="none" strokeLinecap="round" />
          <circle cx={13} cy={20} r={3.4} fill="#f2c0d5" />
          <circle cx={31} cy={19} r={3.4} fill="#f2c0d5" />
          <circle cx={22} cy={16} r={3.4} fill="#f6d7e4" />
        </g>
      );
    case "birdbath":
      return (
        <g stroke={darken("#cfc7b8", 0.3)} strokeWidth={S} strokeLinejoin="round">
          <rect x={19} y={30} width={6} height={24} fill="#cfc7b8" />
          <ellipse cx={22} cy={30} rx={16} ry={5} fill="#ded7c8" />
          <ellipse cx={22} cy={29} rx={12} ry={3} fill="#bcd6e4" stroke="none" />
        </g>
      );
    case "path":
      return (
        <g fill="#d8d0c0" stroke={darken("#d8d0c0", 0.25)} strokeWidth={S}>
          <ellipse cx={10} cy={50} rx={7} ry={3.4} />
          <ellipse cx={24} cy={45} rx={7} ry={3.4} />
          <ellipse cx={37} cy={40} rx={7} ry={3.4} />
        </g>
      );
    default:
      return null;
  }
}
