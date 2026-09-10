"use client";

import { useId } from "react";
import { LilyBloom } from "./LilyBloom";
import { LilyIcon } from "./ui/LilyIcon";
import type { LilyTone } from "./lily-shape";
import type { FlowerSpecies } from "@/lib/flowers";

export { FLOWER_SPECIES, FLOWER_LABEL, isFlowerSpecies } from "@/lib/flowers";
export type { FlowerSpecies } from "@/lib/flowers";

/**
 * Face-on SVG art for every garden flower. The lily is the hero (and the only
 * species the daily visit plants on its own); the rest she plants by hand from
 * the picker. Every bloom uses the same `-50 -50 100 100` viewBox so they size
 * interchangeably on a stem.
 */
const VIEWBOX = "-50 -50 100 100";

/** Lay `count` copies of a petal path evenly around the centre. */
function ring(
  path: string,
  count: number,
  offset: number,
  fill: string,
  scale = 1,
  opacity = 1,
) {
  return Array.from({ length: count }, (_, i) => {
    const angle = offset + (i * 360) / count;
    return (
      <path
        key={angle}
        d={path}
        fill={fill}
        opacity={opacity}
        transform={`rotate(${angle}) scale(${scale})`}
      />
    );
  });
}

interface ArtProps {
  className?: string;
}

/* ------------------------------- rose -------------------------------- */

const ROSE_PETAL =
  "M0,3 C -13,3 -16,-14 -8,-25 C -4,-30 4,-30 8,-25 C 16,-14 13,3 0,3 Z";

function RoseArt({ className }: ArtProps) {
  const id = useId();
  return (
    <svg viewBox={VIEWBOX} className={className} aria-hidden>
      <defs>
        <radialGradient id={id} cx="50%" cy="52%" r="70%">
          <stop offset="0%" stopColor="#ffdcea" />
          <stop offset="46%" stopColor="#ee7ba9" />
          <stop offset="100%" stopColor="#c93f7e" />
        </radialGradient>
      </defs>
      <g stroke="var(--lily-stroke)" strokeWidth={0.6}>
        {ring(ROSE_PETAL, 6, 0, `url(#${id})`, 1.16, 0.95)}
        {ring(ROSE_PETAL, 6, 30, `url(#${id})`, 0.82)}
        {ring(ROSE_PETAL, 5, 14, `url(#${id})`, 0.52)}
        {ring(ROSE_PETAL, 4, 40, "#bd3b76", 0.3)}
      </g>
      <circle cx={0} cy={0} r={2.6} fill="#9c2a5c" />
    </svg>
  );
}

/* ------------------------------- tulip ------------------------------- */

const TULIP_PETAL =
  "M0,2 C -10,-1 -12,-20 -8,-33 C -5,-41 -1,-45 0,-45 C 1,-45 5,-41 8,-33 C 12,-20 10,-1 0,2 Z";

function TulipArt({ className }: ArtProps) {
  const id = useId();
  return (
    <svg viewBox={VIEWBOX} className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#8257c4" />
          <stop offset="55%" stopColor="#b48be6" />
          <stop offset="100%" stopColor="#efe0ff" />
        </linearGradient>
      </defs>
      <g stroke="var(--lily-stroke)" strokeWidth={0.6}>
        {/* back pair */}
        <path d={TULIP_PETAL} fill="#7c53bd" transform="rotate(-22) scale(0.96)" />
        <path d={TULIP_PETAL} fill="#7c53bd" transform="rotate(22) scale(0.96)" />
        {/* front three */}
        <path d={TULIP_PETAL} fill={`url(#${id})`} transform="rotate(-14)" />
        <path d={TULIP_PETAL} fill={`url(#${id})`} transform="rotate(14)" />
        <path d={TULIP_PETAL} fill={`url(#${id})`} transform="scale(1.04)" />
      </g>
    </svg>
  );
}

/* ------------------------------- daisy ------------------------------- */

const DAISY_PETAL = "M0,-5 C -3.2,-12 -3.2,-30 0,-41 C 3.2,-30 3.2,-12 0,-5 Z";

function DaisyArt({ className }: ArtProps) {
  const id = useId();
  const petals = 13;
  return (
    <svg viewBox={VIEWBOX} className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#efeaf4" />
        </linearGradient>
      </defs>
      <g stroke="#e4dcec" strokeWidth={0.5}>
        {Array.from({ length: petals }, (_, i) => (
          <path
            key={i}
            d={DAISY_PETAL}
            fill={`url(#${id})`}
            transform={`rotate(${(i * 360) / petals}) scale(${i % 2 ? 0.92 : 1})`}
          />
        ))}
      </g>
      <circle cx={0} cy={0} r={9} fill="#f6c945" />
      <circle cx={0} cy={0} r={5.4} fill="#e3a52a" />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i * 2 * Math.PI) / 9;
        return (
          <circle
            key={i}
            cx={Math.cos(a) * 6.6}
            cy={Math.sin(a) * 6.6}
            r={1}
            fill="#c98f1e"
          />
        );
      })}
    </svg>
  );
}

/* ------------------------------- poppy ------------------------------- */

const POPPY_PETAL =
  "M0,4 C -22,3 -26,-26 -10,-38 C -5,-42 5,-42 10,-38 C 26,-26 22,3 0,4 Z";

function PoppyArt({ className }: ArtProps) {
  const id = useId();
  return (
    <svg viewBox={VIEWBOX} className={className} aria-hidden>
      <defs>
        <radialGradient id={id} cx="50%" cy="54%" r="72%">
          <stop offset="0%" stopColor="#ff9e6b" />
          <stop offset="42%" stopColor="#f04e33" />
          <stop offset="100%" stopColor="#bf2530" />
        </radialGradient>
      </defs>
      <g stroke="var(--lily-stroke)" strokeWidth={0.5}>
        {/* back pair */}
        <path d={POPPY_PETAL} fill="#c8302f" transform="rotate(196) scale(0.98)" />
        <path d={POPPY_PETAL} fill="#c8302f" transform="rotate(286) scale(0.98)" />
        {/* front pair */}
        <path d={POPPY_PETAL} fill={`url(#${id})`} transform="rotate(18)" />
        <path d={POPPY_PETAL} fill={`url(#${id})`} transform="rotate(104)" />
      </g>
      {/* dark heart + a ruff of stamens */}
      <circle cx={0} cy={0} r={7.5} fill="#241018" />
      <g stroke="#3f2a1c" strokeWidth={1.1} strokeLinecap="round">
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 2 * Math.PI) / 12;
          return (
            <line
              key={i}
              x1={Math.cos(a) * 7}
              y1={Math.sin(a) * 7}
              x2={Math.cos(a) * 12}
              y2={Math.sin(a) * 12}
            />
          );
        })}
      </g>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 2 * Math.PI) / 12;
        return (
          <circle
            key={i}
            cx={Math.cos(a) * 12.5}
            cy={Math.sin(a) * 12.5}
            r={1.3}
            fill="#20140c"
          />
        );
      })}
      <circle cx={0} cy={0} r={3.6} fill="#120610" />
    </svg>
  );
}

const ART: Record<Exclude<FlowerSpecies, "lily">, (p: ArtProps) => React.JSX.Element> = {
  rose: RoseArt,
  tulip: TulipArt,
  daisy: DaisyArt,
  poppy: PoppyArt,
};

/**
 * One flower, face-on. The lily gets its dedicated open-from-bud bloom when
 * `fresh`; the others render static (their entrance is carried by the stem
 * growing and the whole plant easing in).
 */
export function FlowerArt({
  species,
  className,
  fresh = false,
  tone,
}: {
  species: FlowerSpecies;
  className?: string;
  fresh?: boolean;
  /** Lily only — a speckled pink stargazer by default, or a cream lily. */
  tone?: LilyTone;
}) {
  if (species === "lily") {
    return fresh ? (
      <LilyBloom className={className} tone={tone} />
    ) : (
      <LilyIcon className={className} tone={tone} />
    );
  }
  const Art = ART[species];
  return <Art className={className} />;
}
