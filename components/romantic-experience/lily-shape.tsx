/**
 * Shared oriental-lily geometry so <LilyIcon> (static) and <LilyBloom>
 * (animated) draw the exact same flower — a stargazer profile: six long
 * pointed tepals with a speckled throat, a green-white star centre, six
 * T-anther stamens on arching filaments, and a central pistil.
 *
 * Petals are indexed 0..5 around the flower. Even indices are the outer
 * whorl (narrower, sit behind); odd indices are the inner whorl (broader,
 * in front). Every path is drawn around the origin with the tip pointing up
 * (−y) so a single `rotate(angle)` places it.
 */

export const LILY_VIEWBOX = "-50 -50 100 100";

export const PETAL_ANGLES = [0, 60, 120, 180, 240, 300] as const;
export const STAMEN_ANGLES = [30, 90, 150, 210, 270, 330] as const;

const OUTER_PETAL =
  "M0,1.5 C -4,-3 -6.5,-9 -6.2,-18 C -6,-25 -8.6,-31 -6,-38 C -4.4,-42.5 -2.4,-46 0,-48 C 2.4,-46 4.4,-42.5 6,-38 C 8.6,-31 6,-25 6.2,-18 C 6.5,-9 4,-3 0,1.5 Z";

const INNER_PETAL =
  "M0,1.5 C -5,-3 -7.6,-9 -7.2,-18 C -7,-25 -9.4,-30 -6.6,-36 C -4.8,-40 -2.6,-43 0,-45 C 2.6,-43 4.8,-40 6.6,-36 C 9.4,-30 7,-25 7.2,-18 C 7.6,-9 5,-3 0,1.5 Z";

const MIDRIB_OUTER = "M0,-2 C 0.6,-16 0.6,-33 0,-46";
const MIDRIB_INNER = "M0,-2 C 0.6,-14 0.6,-30 0,-43";

/** True for the inner (broader, front) whorl. */
export const isInnerPetal = (index: number) => index % 2 === 1;

export const petalPath = (index: number) =>
  isInnerPetal(index) ? INNER_PETAL : OUTER_PETAL;

export const midribPath = (index: number) =>
  isInnerPetal(index) ? MIDRIB_INNER : MIDRIB_OUTER;

export const petalOpacity = (index: number) => (isInnerPetal(index) ? 1 : 0.9);

export type LilyTone = "blush" | "white";

const GRADIENT_STOPS: Record<LilyTone, [number, string][]> = {
  blush: [
    [0, "#fff2f8"],
    [26, "#fbc9e0"],
    [58, "#ef82b6"],
    [85, "#dd4f92"],
    [100, "#c8317c"],
  ],
  white: [
    [0, "#ffffff"],
    [42, "#fbf1e6"],
    [78, "#efdcc0"],
    [100, "#dcc39a"],
  ],
};

/** The petal fill. Drop into <defs> and reference by `id`. */
export function LilyGradient({ id, tone = "blush" }: { id: string; tone?: LilyTone }) {
  return (
    <radialGradient id={id} cx="50%" cy="56%" r="70%">
      {GRADIENT_STOPS[tone].map(([offset, color]) => (
        <stop key={offset} offset={`${offset}%`} stopColor={color} />
      ))}
    </radialGradient>
  );
}

const SPOTS = [
  { x: -2.2, y: -9, r: 1.3 },
  { x: 1.6, y: -11, r: 1 },
  { x: -0.5, y: -13.5, r: 1.5 },
  { x: 2.6, y: -15, r: 0.9 },
  { x: -2.8, y: -17, r: 1.1 },
  { x: 0.8, y: -19, r: 1.15 },
  { x: -1.4, y: -22, r: 0.95 },
  { x: 2, y: -24, r: 0.8 },
  { x: -0.3, y: -27, r: 0.85 },
  { x: 1, y: -31, r: 0.7 },
];

/**
 * One tepal: the petal, its midrib groove and — for blush lilies — the
 * crimson papillae down its centre. Caller wraps this in `rotate(angle)`.
 */
export function LilyPetal({
  index,
  gradientId,
  tone,
}: {
  index: number;
  gradientId: string;
  tone: LilyTone;
}) {
  const inner = isInnerPetal(index);
  const spots = tone === "blush" ? (inner ? SPOTS : SPOTS.slice(0, 8)) : [];
  return (
    <g opacity={petalOpacity(index)}>
      <path
        d={petalPath(index)}
        fill={`url(#${gradientId})`}
        stroke="var(--lily-stroke)"
        strokeWidth={0.75}
      />
      <path
        d={midribPath(index)}
        fill="none"
        stroke={tone === "blush" ? "#d76ba1" : "#e7d3ad"}
        strokeOpacity={0.5}
        strokeWidth={0.8}
        strokeLinecap="round"
      />
      {spots.length > 0 && (
        <g fill="#9c2549">
          {spots.map((s, i) => (
            <ellipse key={i} cx={s.x} cy={s.y} rx={s.r * 1.15} ry={s.r * 1.3} opacity={0.85} />
          ))}
        </g>
      )}
    </g>
  );
}

/** Green-white star throat, six long rust-anther stamens, a central pistil. */
export function LilyCentre() {
  return (
    <g>
      {/* throat — a green-white star with faint nectar guides */}
      <circle cx={0} cy={0} r={6} fill="#f2f4d6" />
      <circle cx={0} cy={0} r={3} fill="#d3e19c" />
      <g stroke="#aec36f" strokeWidth={0.8} strokeLinecap="round" opacity={0.8}>
        {STAMEN_ANGLES.map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={0}
              y1={0}
              x2={Math.sin(rad) * 5}
              y2={-Math.cos(rad) * 5}
            />
          );
        })}
      </g>

      {/* stamens — filament splays out and up, the heavy anther tips over */}
      {STAMEN_ANGLES.map((a) => {
        const rad = (a * Math.PI) / 180;
        const dx = Math.sin(rad);
        const dy = -Math.cos(rad);
        // tangential nudge so the filaments bow rather than spoke straight out
        const cx = dx * 12 + dy * 2.5;
        const cy = dy * 12 - dx * 2.5;
        const ex = dx * 23;
        const ey = dy * 23 + 3.5;
        return (
          <g key={a}>
            <path
              d={`M0,0 Q ${cx},${cy} ${ex},${ey}`}
              fill="none"
              stroke="#efe2bd"
              strokeWidth={1}
              strokeLinecap="round"
            />
            <g transform={`rotate(${a + 24} ${ex} ${ey})`}>
              <ellipse cx={ex} cy={ey} rx={4} ry={1.7} fill="#8a4526" />
              <ellipse cx={ex} cy={ey - 0.4} rx={2.5} ry={0.8} fill="#bd7a41" />
            </g>
          </g>
        );
      })}

      {/* pistil — one, central, a knobbed stigma */}
      <path
        d="M0,2 C -0.7,-4 -0.7,-9 0,-13"
        fill="none"
        stroke="#e6d6a6"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <ellipse cx={0} cy={-13} rx={2.4} ry={2} fill="#a94b7a" />
      <ellipse cx={0} cy={-13} rx={1.1} ry={0.9} fill="#8f3c66" />
    </g>
  );
}
