"use client";

interface TeddyIconProps {
  className?: string;
  /** "hug" pulls the arms forward and in. */
  pose?: "idle" | "hug";
  /** Squishes the eyes shut for a blink. */
  blink?: boolean;
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * A soft pink teddy built from plain shapes. The parent animates breathing and
 * hearts; this component just switches between a resting pose and a hug, plus
 * blinking, via CSS transitions so it stays cheap.
 */
export function TeddyIcon({ className, pose = "idle", blink = false }: TeddyIconProps) {
  const hugging = pose === "hug";

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
    transformBox: "fill-box",
    transformOrigin: "center",
    transition: "transform 0.12s ease",
  } as const;

  return (
    <svg viewBox="0 0 200 210" className={className} aria-hidden>
      {/* ears */}
      <circle cx="60" cy="50" r="19" fill="#eec1cf" />
      <circle cx="140" cy="50" r="19" fill="#eec1cf" />
      <circle cx="60" cy="50" r="9" fill="#e6a9be" />
      <circle cx="140" cy="50" r="9" fill="#e6a9be" />

      {/* legs */}
      <ellipse cx="74" cy="192" rx="18" ry="14" fill="#eec1cf" />
      <ellipse cx="126" cy="192" rx="18" ry="14" fill="#eec1cf" />
      <ellipse cx="74" cy="196" rx="9" ry="6" fill="#f9dde6" />
      <ellipse cx="126" cy="196" rx="9" ry="6" fill="#f9dde6" />

      {/* arms */}
      <g style={armLeft}>
        <ellipse cx="52" cy="140" rx="17" ry="27" fill="#eac0ce" />
      </g>
      <g style={armRight}>
        <ellipse cx="148" cy="140" rx="17" ry="27" fill="#eac0ce" />
      </g>

      {/* body */}
      <ellipse cx="100" cy="152" rx="46" ry="42" fill="#eec1cf" />
      <ellipse cx="100" cy="158" rx="28" ry="26" fill="#f9dde6" />

      {/* head */}
      <circle cx="100" cy="82" r="45" fill="#eec1cf" />
      <ellipse cx="100" cy="96" rx="23" ry="18" fill="#f9dde6" />

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
      <ellipse cx="100" cy="90" rx="5" ry="3.6" fill="#c77e9b" />
      <path
        d="M100 93v5M100 98c-4 0-6-2-7-4M100 98c4 0 6-2 7-4"
        fill="none"
        stroke="#c77e9b"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* bow — her colour */}
      <path d="M100 118l-14-8v16zM100 118l14-8v16z" fill="#ff9ec4" />
      <circle cx="100" cy="118" r="4.5" fill="#ffb8d6" />
    </svg>
  );
}
