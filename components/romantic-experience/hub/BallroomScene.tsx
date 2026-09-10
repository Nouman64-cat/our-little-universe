"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "./theme-context";

/**
 * The castle ball — a ballroom seen from the floor: three tall arched windows,
 * gold chandeliers, a mirror-bright floor, and couples waltzing in silhouette.
 * The illustration follows the hub theme: a moonlit *midnight* ball in dark, a
 * sunlit *morning* ball in light. All motion stilled under
 * `prefers-reduced-motion`.
 */

interface Palette {
  /** Solid behind the SVG, in case it letterboxes. */
  shell: string;
  /** Sky through the windows, top → horizon. */
  sky: [string, string, string];
  /** Back wall, top → bottom. */
  wall: [string, string];
  /** Ballroom floor, front → back. */
  floor: [string, string, string];
  /** Warm bloom around the lights. */
  glow: string;
  /** The moon (dark) or sun (light) disc. */
  orb: [string, string];
  /** The centre-stage spotlight. */
  spot: [string, string];
  mullion: string;
  arch: string;
  pillar: string;
  moulding: string;
  /** Night stars — hidden by day. */
  star: string;
  starOpacity: number;
  /** Perspective lines on the floor. */
  line: string;
  lineOpacity: number;
  cord: string;
  fitting: string;
  flame: string;
  /** Corner darkening at the foot of the room. */
  vignette: string;
  vignetteOpacity: number;
  /** Drifting ♪ / ♫. */
  note: string;
}

const DARK: Palette = {
  shell: "#140d29",
  sky: ["#0f0b24", "#241a48", "#3a2a5e"],
  wall: ["#2a1c44", "#3d2a5c"],
  floor: ["#4a3568", "#2c1e44", "#191029"],
  glow: "#ffd98a",
  orb: ["#fdf6e3", "#e7d8b6"],
  spot: ["#fff1cf", "#ffe8b8"],
  mullion: "#6a4a86",
  arch: "#5a3d7a",
  pillar: "#4a3160",
  moulding: "#5a3d7a",
  star: "#fdf6e3",
  starOpacity: 1,
  line: "#ffffff",
  lineOpacity: 1,
  cord: "#7a5a2e",
  fitting: "#f0d29b",
  flame: "#ffe6a6",
  vignette: "#0d0820",
  vignetteOpacity: 0.26,
  note: "rgba(255,230,166,0.7)",
};

const LIGHT: Palette = {
  shell: "#e9eef6",
  sky: ["#a9d0ef", "#d4e8f7", "#f3e7d0"],
  wall: ["#f4e9d3", "#e7d6b6"],
  floor: ["#dcbf9c", "#c6a079", "#a67f58"],
  glow: "#ffe6ad",
  orb: ["#fff8dc", "#ffe6a0"],
  spot: ["#fff6dc", "#ffeec4"],
  mullion: "#b89b73",
  arch: "#a5865c",
  pillar: "#cbb890",
  moulding: "#bb9d71",
  star: "#ffffff",
  starOpacity: 0,
  line: "#7c5a3a",
  lineOpacity: 0.5,
  cord: "#8a6636",
  fitting: "#c99a4a",
  flame: "#ffcf6b",
  vignette: "#7a5c3c",
  vignetteOpacity: 0.14,
  note: "rgba(180,120,40,0.7)",
};

export function BallroomScene() {
  const reduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const p = theme === "light" ? LIGHT : DARK;
  const sway = !reduceMotion;

  return (
    <div
      className="absolute inset-0 overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: p.shell }}
    >
      <svg
        viewBox="0 0 400 620"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="ball-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.sky[0]} />
            <stop offset="60%" stopColor={p.sky[1]} />
            <stop offset="100%" stopColor={p.sky[2]} />
          </linearGradient>
          <linearGradient id="ball-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.wall[0]} />
            <stop offset="100%" stopColor={p.wall[1]} />
          </linearGradient>
          <linearGradient id="ball-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.floor[0]} />
            <stop offset="45%" stopColor={p.floor[1]} />
            <stop offset="100%" stopColor={p.floor[2]} />
          </linearGradient>
          <radialGradient id="ball-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.glow} stopOpacity="0.5" />
            <stop offset="100%" stopColor={p.glow} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ball-moon" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor={p.orb[0]} />
            <stop offset="100%" stopColor={p.orb[1]} />
          </radialGradient>
          <radialGradient id="ball-spot" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor={p.spot[0]} stopOpacity="0.9" />
            <stop offset="55%" stopColor={p.spot[1]} stopOpacity="0.28" />
            <stop offset="100%" stopColor={p.spot[1]} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* back wall */}
        <rect x="0" y="0" width="400" height="420" fill="url(#ball-wall)" />

        {/* windows onto the night (rectangle with an arched top) */}
        {[
          { x: 40, w: 84, h: 250 },
          { x: 152, w: 96, h: 290 },
          { x: 276, w: 84, h: 250 },
        ].map((win, i) => {
          const topY = 40 + (290 - win.h);
          const botY = topY + win.h;
          const springY = topY + win.w / 2;
          const r = win.w / 2;
          return (
            <g key={i}>
              <path
                d={`M${win.x} ${botY} L${win.x} ${springY} A${r} ${r} 0 0 1 ${win.x + win.w} ${springY} L${win.x + win.w} ${botY} Z`}
                fill="url(#ball-sky)"
              />
              {i === 1 && (
                <circle
                  cx={win.x + win.w * 0.66}
                  cy={topY + 80}
                  r="22"
                  fill="url(#ball-moon)"
                />
              )}
              {p.starOpacity > 0 &&
                [0.2, 0.5, 0.35, 0.7].map((fx, s) => (
                  <circle
                    key={s}
                    cx={win.x + win.w * fx}
                    cy={springY + 8 + s * 34}
                    r={s % 2 ? 1.4 : 1}
                    fill={p.star}
                    opacity={0.85 * p.starOpacity}
                  />
                ))}
              {/* mullions */}
              <path
                d={`M${win.x + r} ${springY} V${botY}`}
                stroke={p.mullion}
                strokeWidth="4"
              />
              <path
                d={`M${win.x} ${topY + win.h * 0.55} H${win.x + win.w}`}
                stroke={p.mullion}
                strokeWidth="4"
              />
              {/* arch frame */}
              <path
                d={`M${win.x - 4} ${botY} L${win.x - 4} ${springY} A${r + 4} ${r + 4} 0 0 1 ${win.x + win.w + 4} ${springY} L${win.x + win.w + 4} ${botY}`}
                fill="none"
                stroke={p.arch}
                strokeWidth="7"
              />
            </g>
          );
        })}

        {/* pillars */}
        {[16, 132, 256, 372].map((x) => (
          <rect key={x} x={x} y="20" width="12" height="352" fill={p.pillar} />
        ))}

        {/* crown moulding */}
        <rect x="0" y="372" width="400" height="14" fill={p.moulding} />

        {/* floor */}
        <path d="M0 386 H400 V620 H0 Z" fill="url(#ball-floor)" />
        {/* perspective lines */}
        {[-160, -80, 40, 120, 200, 280, 360, 480, 560].map((x) => (
          <path
            key={x}
            d={`M200 386 L${x} 620`}
            stroke={p.line}
            strokeOpacity={0.06 * p.lineOpacity}
            strokeWidth="1.5"
          />
        ))}
        {[416, 464, 528, 604].map((y, i) => (
          <path
            key={y}
            d={`M0 ${y} H400`}
            stroke={p.line}
            strokeOpacity={(0.07 - i * 0.012) * p.lineOpacity}
            strokeWidth="1.5"
          />
        ))}
        {/* floor sheen */}
        <ellipse cx="200" cy="430" rx="150" ry="34" fill="url(#ball-glow)" opacity="0.5" />

        {/* chandeliers (translated so the ceiling mount sits at the origin) */}
        {[
          { x: 118, drop: 64 },
          { x: 282, drop: 64 },
        ].map((ch, i) => (
          <g key={i} transform={`translate(${ch.x} 44)`}>
            <motion.g
              animate={sway ? { rotate: [-1.6, 1.6, -1.6] } : { rotate: 0 }}
              transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
            >
              <path d={`M0 0 V${ch.drop}`} stroke={p.cord} strokeWidth="2" />
              <ellipse
                cx="0"
                cy={ch.drop}
                rx="34"
                ry="9"
                fill="none"
                stroke={p.fitting}
                strokeWidth="3"
              />
              {[-30, -15, 0, 15, 30].map((dx) => (
                <g key={dx}>
                  <path d={`M${dx} ${ch.drop} v10`} stroke={p.fitting} strokeWidth="2" />
                  <motion.circle
                    cx={dx}
                    cy={ch.drop + 13}
                    r="3.4"
                    fill={p.flame}
                    animate={
                      sway ? { opacity: [0.6, 1, 0.7], r: [3, 3.8, 3.2] } : undefined
                    }
                    transition={{
                      duration: 1.6 + Math.abs(dx) / 20,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </g>
              ))}
              <circle cx="0" cy={ch.drop} r="30" fill="url(#ball-glow)" />
            </motion.g>
          </g>
        ))}

        {/* two dim dancers, far back at the edges */}
        {[
          { x: 60, y: 404, s: 0.4, dur: 9, span: 18 },
          { x: 340, y: 398, s: 0.36, dur: 10.5, span: 16 },
        ].map((c, i) => (
          <motion.g
            key={i}
            initial={false}
            animate={
              sway
                ? { x: [c.x - c.span / 2, c.x + c.span / 2, c.x - c.span / 2] }
                : { x: c.x }
            }
            transition={{ duration: c.dur, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.g
              style={{ y: c.y, scale: c.s, opacity: 0.45 }}
              animate={sway ? { rotate: [-4, 4, -4] } : { rotate: 0 }}
              transition={{
                duration: c.dur / 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Couple rim={["#ffc7de", "#c1a6ff"][i]} />
            </motion.g>
          </motion.g>
        ))}

        {/* soft vignette */}
        <rect x="0" y="0" width="400" height="620" fill="url(#ball-glow)" opacity="0.06" />
        <rect
          x="0"
          y="410"
          width="400"
          height="210"
          fill={p.vignette}
          opacity={p.vignetteOpacity}
        />

        {/* the bride and groom, centre stage in a pool of light */}
        <ellipse cx="200" cy="376" rx="180" ry="150" fill="url(#ball-spot)" />
        <motion.g
          initial={false}
          animate={sway ? { x: [182, 218, 182] } : { x: 200 }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        >
          <ellipse cx="4" cy="404" rx="64" ry="12" fill="#0b0718" opacity="0.42" />
          <motion.g
            animate={
              sway
                ? { y: [402, 393, 402], rotate: [-5, 5, -5] }
                : { y: 402, rotate: -3 }
            }
            transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <g transform="scale(2.15)">
              <BrideGroom />
            </g>
          </motion.g>
        </motion.g>
      </svg>

      {/* drifting notes */}
      {!reduceMotion &&
        [
          { left: "22%", d: 9, delay: 0 },
          { left: "62%", d: 11, delay: 2 },
          { left: "44%", d: 8, delay: 4 },
          { left: "78%", d: 12, delay: 1.5 },
        ].map((n, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute bottom-[34%]"
            style={{ left: n.left, color: p.note }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -220, opacity: [0, 0.9, 0] }}
            transition={{
              duration: n.d,
              delay: n.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
          >
            {i % 2 ? "♫" : "♪"}
          </motion.span>
        ))}
    </div>
  );
}

/**
 * The bride and groom, feet at y=0, drawn upward, group-local coords. Groom
 * around x=-12, drawn a touch taller and broader-shouldered so he reads as the
 * larger of the two; bride around x=+5 in a full gown with a veil. His hand at
 * her waist, her hand on his shoulder, joined hands raised in a waltz frame.
 */
function BrideGroom() {
  return (
    <g>
      {/* veil, trailing behind the bride */}
      <path
        d="M11 -72 Q 38 -50 29 -2 Q 23 -33 11 -60 Z"
        fill="#ffffff"
        opacity="0.28"
      />
      <path
        d="M11 -72 Q 29 -50 21 -6"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.5"
        strokeWidth="1"
      />

      {/* ---- groom (a little taller, broader) ---- */}
      {/* tails */}
      <path d="M-19 -35 L-21 -3 L-13 -35 Z" fill="#141029" />
      <path d="M-5 -35 L-3 -3 L-11 -35 Z" fill="#141029" />
      {/* legs + shoes */}
      <rect x="-18" y="-34" width="5.5" height="34" fill="#17122b" />
      <rect x="-11" y="-34" width="5.5" height="34" fill="#17122b" />
      <rect x="-19.5" y="-3" width="8" height="4.2" rx="1.5" fill="#0b0818" />
      <rect x="-11.5" y="-3" width="8" height="4.2" rx="1.5" fill="#0b0818" />
      {/* coat, broad shoulders */}
      <path d="M-21 -34 L-23 -61 Q-12 -69 -1 -61 L-3 -34 Z" fill="#1d1836" />
      {/* shirt + bow tie */}
      <path d="M-15 -61 L-12 -42 L-9 -61 Z" fill="#efe9dc" />
      <path d="M-12 -59 L-15.8 -61.5 L-15.8 -56.5 Z" fill="#0c0a1a" />
      <path d="M-12 -59 L-8.2 -61.5 L-8.2 -56.5 Z" fill="#0c0a1a" />
      {/* neck + head + hair */}
      <rect x="-13.8" y="-65" width="3.8" height="5" fill="#e7c6a4" />
      <circle cx="-12" cy="-70.5" r="6.2" fill="#e7c6a4" />
      <path
        d="M-18.2 -70.5 Q-18.6 -78 -12 -78 Q-5.4 -78 -5.8 -70.5 Q-8.6 -74.5 -12 -74.5 Q-15.4 -74.5 -18.2 -70.5 Z"
        fill="#26160f"
      />
      {/* his right arm around the bride's waist */}
      <path
        d="M-3 -49 Q 7 -45 15 -47"
        fill="none"
        stroke="#1d1836"
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      {/* his left forearm, up to the joined hands */}
      <path
        d="M-19 -55 L-24 -65"
        fill="none"
        stroke="#1d1836"
        strokeWidth="4.6"
        strokeLinecap="round"
      />

      {/* ---- bride (a touch shorter, slimmer profile) ---- */}
      {/* gown with a sweeping train to the right */}
      <path
        d="M2 1 C -12 -2 -11 -30 -3 -52 L10 -52 C 19 -30 31 4 8 1 Z"
        fill="#f7f0e2"
      />
      <path
        d="M-2 -50 C -7 -28 -7 -6 1 1"
        fill="none"
        stroke="#e6dcc6"
        strokeWidth="1.3"
      />
      <path
        d="M6 -48 C 10 -26 12 -6 3 1"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.6"
        strokeWidth="1.1"
      />
      {/* bodice */}
      <path d="M-1 -52 L0 -64 Q4 -66 8 -64 L9 -52 Z" fill="#f2ebdb" />
      {/* neck + head + updo + tiara */}
      <rect x="2" y="-62" width="4" height="4" fill="#e7c6a4" />
      <circle cx="4" cy="-66.5" r="5.2" fill="#e7c6a4" />
      <path
        d="M-1.2 -66.5 Q-1.8 -74 4 -74 Q9.8 -74 9.2 -66.5 Q6.6 -70.2 4 -70.2 Q1.4 -70.2 -1.2 -66.5 Z"
        fill="#3a2617"
      />
      <circle cx="8.8" cy="-69" r="2.4" fill="#3a2617" />
      <path
        d="M0.4 -73 l1.5 -2.8 l1.5 2.8 l1.5 -2.8 l1.5 2.8"
        fill="none"
        stroke="#ffe6a6"
        strokeWidth="1.2"
      />
      {/* her left hand resting on his shoulder */}
      <path
        d="M2 -56 Q -6 -60 -13 -58"
        fill="none"
        stroke="#f2ebdb"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      {/* her right forearm crossing up to meet his hand */}
      <path
        d="M5 -55 Q -8 -57 -21 -63"
        fill="none"
        stroke="#f2ebdb"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      {/* their joined hands */}
      <ellipse cx="-23" cy="-64" rx="2.9" ry="3.7" fill="#e7c6a4" />

      {/* a small heart floating above them */}
      <path
        d="M-2 -92 c 0 -2 -3.4 -2 -3.4 0.7 c 0 2 3.4 4.1 3.4 4.1 c 0 0 3.4 -2.1 3.4 -4.1 c 0 -2.7 -3.4 -2.7 -3.4 -0.7 Z"
        fill="#ffb3d0"
        opacity="0.7"
      />
    </g>
  );
}

/** A dancing pair, feet at y=0, drawn upward. A gown-and-head silhouette. */
function Couple({ rim }: { rim: string }) {
  return (
    <g fill="#0c0720">
      {/* partner */}
      <g transform="translate(13 0)">
        <path d="M0 0 L-7 -40 Q0 -46 7 -40 Z" />
        <rect x="-4" y="-62" width="8" height="22" rx="4" />
        <circle cx="0" cy="-68" r="6" />
      </g>
      {/* lead, fuller gown with a rim of light */}
      <g transform="translate(-9 0)">
        <path
          d="M0 0 L-16 -44 Q0 -52 16 -44 Z"
          stroke={rim}
          strokeOpacity="0.5"
          strokeWidth="1.5"
        />
        <rect x="-4.5" y="-66" width="9" height="24" rx="4.5" />
        <circle cx="0" cy="-72" r="6.5" />
      </g>
    </g>
  );
}
