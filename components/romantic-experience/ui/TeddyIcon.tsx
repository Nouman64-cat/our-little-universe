"use client";

interface TeddyFigureProps {
  /** "hug" pulls the arms forward and in. */
  pose?: "idle" | "hug";
  /** Squishes the eyes shut for a blink. */
  blink?: boolean;
  /** Main fur colour. */
  fur?: string;
  /** Neck accessory. */
  accent?: "bow" | "bowtie";
  /** Accent colour. */
  accentColor?: string;
  /** Mirror the figure (so a pair can face each other). */
  flip?: boolean;
}

interface TeddyIconProps extends TeddyFigureProps {
  className?: string;
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Mix a hex toward black / white by `amount` (0–1). */
function mix(hex: string, target: 0 | 255, amount: number) {
  const n = hex.replace("#", "");
  const c = (i: number) => {
    const v = parseInt(n.slice(i, i + 2), 16);
    return Math.round(v + (target - v) * amount).toString(16).padStart(2, "0");
  };
  return `#${c(0)}${c(2)}${c(4)}`;
}

/**
 * A soft teddy built from plain shapes, as a bare `<g>` so it can drop into any
 * scene. Switches between a resting pose and a hug, plus blinking, via CSS
 * transitions so it stays cheap. Colours are parameterised so a pair can differ.
 */
export function TeddyFigure({
  pose = "idle",
  blink = false,
  fur = "#eec1cf",
  accent = "bow",
  accentColor = "#ff9ec4",
  flip = false,
}: TeddyFigureProps) {
  const hugging = pose === "hug";
  const furDeep = mix(fur, 0, 0.12);
  const belly = mix(fur, 255, 0.34);
  const pad = mix(fur, 255, 0.42);
  const stitch = mix(fur, 0, 0.4);

  const armLeft = {
    transformOrigin: "64px 118px",
    transform: hugging ? "translate(26px, 6px) rotate(38deg)" : "rotate(6deg)",
    transition: `transform 0.4s ${EASE}`,
  } as const;

  const armRight = {
    transformOrigin: "136px 118px",
    transform: hugging ? "translate(-26px, 6px) rotate(-38deg)" : "rotate(-6deg)",
    transition: `transform 0.4s ${EASE}`,
  } as const;

  const eyeStyle = {
    transform: `scaleY(${blink ? 0.12 : 1})`,
    transformBox: "fill-box" as const,
    transformOrigin: "center",
    transition: "transform 0.12s ease",
  } as const;

  return (
    <g transform={flip ? "translate(200 0) scale(-1 1)" : undefined}>
      {/* ears */}
      <circle cx="60" cy="50" r="19" fill={fur} />
      <circle cx="140" cy="50" r="19" fill={fur} />
      <circle cx="60" cy="50" r="9" fill={furDeep} />
      <circle cx="140" cy="50" r="9" fill={furDeep} />

      {/* legs */}
      <ellipse cx="74" cy="192" rx="18" ry="14" fill={fur} />
      <ellipse cx="126" cy="192" rx="18" ry="14" fill={fur} />
      <ellipse cx="74" cy="196" rx="9" ry="6" fill={pad} />
      <ellipse cx="126" cy="196" rx="9" ry="6" fill={pad} />

      {/* arms */}
      <g style={armLeft}>
        <ellipse cx="52" cy="140" rx="17" ry="27" fill={furDeep} />
      </g>
      <g style={armRight}>
        <ellipse cx="148" cy="140" rx="17" ry="27" fill={furDeep} />
      </g>

      {/* body */}
      <ellipse cx="100" cy="152" rx="46" ry="42" fill={fur} />
      <ellipse cx="100" cy="158" rx="28" ry="26" fill={belly} />

      {/* head */}
      <circle cx="100" cy="82" r="45" fill={fur} />
      <ellipse cx="100" cy="96" rx="23" ry="18" fill={belly} />

      {/* cheeks */}
      <circle cx="70" cy="90" r="7" fill="#f2a7c0" opacity="0.55" />
      <circle cx="130" cy="90" r="7" fill="#f2a7c0" opacity="0.55" />

      {/* eyes */}
      <g>
        <ellipse cx="84" cy="76" rx="4.2" ry="5.4" fill="#4a3340" style={eyeStyle} />
        <ellipse cx="116" cy="76" rx="4.2" ry="5.4" fill="#4a3340" style={eyeStyle} />
        <circle cx="85.4" cy="74" r="1.3" fill="#fff" />
        <circle cx="117.4" cy="74" r="1.3" fill="#fff" />
      </g>

      {/* nose + mouth */}
      <ellipse cx="100" cy="90" rx="5" ry="3.6" fill={stitch} />
      <path
        d="M100 93v5M100 98c-4 0-6-2-7-4M100 98c4 0 6-2 7-4"
        fill="none"
        stroke={stitch}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* neck accent */}
      {accent === "bowtie" ? (
        <g>
          <path d="M100 120l-13-7v14zM100 120l13-7v14z" fill={accentColor} />
          <rect x="96" y="115" width="8" height="10" rx="2" fill={mix(accentColor, 0, 0.18)} />
        </g>
      ) : (
        <g>
          <path d="M100 118l-14-8v16zM100 118l14-8v16z" fill={accentColor} />
          <circle cx="100" cy="118" r="4.5" fill={mix(accentColor, 255, 0.28)} />
        </g>
      )}
    </g>
  );
}

/** Standalone teddy in its own `<svg>` — kept for one-off uses. */
export function TeddyIcon({ className, ...figure }: TeddyIconProps) {
  return (
    <svg viewBox="0 0 200 210" className={className} aria-hidden>
      <TeddyFigure {...figure} />
    </svg>
  );
}
