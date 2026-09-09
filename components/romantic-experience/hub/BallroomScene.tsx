"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * The midnight ball — a castle ballroom seen from the floor: three tall arched
 * windows onto a moonlit night, gold chandeliers, a mirror-bright floor, and a
 * few couples waltzing in silhouette. A fixed illustration palette (doesn't
 * follow the hub theme), all motion stilled under `prefers-reduced-motion`.
 */
export function BallroomScene() {
  const reduceMotion = useReducedMotion();
  const sway = !reduceMotion;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#140d29]">
      <svg
        viewBox="0 0 400 620"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="ball-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f0b24" />
            <stop offset="60%" stopColor="#241a48" />
            <stop offset="100%" stopColor="#3a2a5e" />
          </linearGradient>
          <linearGradient id="ball-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a1c44" />
            <stop offset="100%" stopColor="#3d2a5c" />
          </linearGradient>
          <linearGradient id="ball-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a3568" />
            <stop offset="45%" stopColor="#2c1e44" />
            <stop offset="100%" stopColor="#191029" />
          </linearGradient>
          <radialGradient id="ball-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd98a" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffd98a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ball-moon" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fdf6e3" />
            <stop offset="100%" stopColor="#e7d8b6" />
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
              {[0.2, 0.5, 0.35, 0.7].map((fx, s) => (
                <circle
                  key={s}
                  cx={win.x + win.w * fx}
                  cy={springY + 8 + s * 34}
                  r={s % 2 ? 1.4 : 1}
                  fill="#fdf6e3"
                  opacity={0.85}
                />
              ))}
              {/* mullions */}
              <path
                d={`M${win.x + r} ${springY} V${botY}`}
                stroke="#6a4a86"
                strokeWidth="4"
              />
              <path
                d={`M${win.x} ${topY + win.h * 0.55} H${win.x + win.w}`}
                stroke="#6a4a86"
                strokeWidth="4"
              />
              {/* arch frame */}
              <path
                d={`M${win.x - 4} ${botY} L${win.x - 4} ${springY} A${r + 4} ${r + 4} 0 0 1 ${win.x + win.w + 4} ${springY} L${win.x + win.w + 4} ${botY}`}
                fill="none"
                stroke="#5a3d7a"
                strokeWidth="7"
              />
            </g>
          );
        })}

        {/* pillars */}
        {[16, 132, 256, 372].map((x) => (
          <rect key={x} x={x} y="20" width="12" height="400" fill="#4a3160" />
        ))}

        {/* crown moulding */}
        <rect x="0" y="410" width="400" height="14" fill="#5a3d7a" />

        {/* floor */}
        <path d="M0 424 H400 V620 H0 Z" fill="url(#ball-floor)" />
        {/* perspective lines */}
        {[-160, -80, 40, 120, 200, 280, 360, 480, 560].map((x) => (
          <path
            key={x}
            d={`M200 424 L${x} 620`}
            stroke="#ffffff"
            strokeOpacity="0.06"
            strokeWidth="1.5"
          />
        ))}
        {[452, 492, 545, 610].map((y, i) => (
          <path
            key={y}
            d={`M0 ${y} H400`}
            stroke="#ffffff"
            strokeOpacity={0.07 - i * 0.012}
            strokeWidth="1.5"
          />
        ))}
        {/* floor sheen */}
        <ellipse cx="200" cy="470" rx="150" ry="34" fill="url(#ball-glow)" opacity="0.5" />

        {/* chandeliers (translated so the ceiling mount sits at the origin) */}
        {[
          { x: 118, drop: 72 },
          { x: 282, drop: 72 },
        ].map((ch, i) => (
          <g key={i} transform={`translate(${ch.x} 24)`}>
            <motion.g
              animate={sway ? { rotate: [-1.6, 1.6, -1.6] } : { rotate: 0 }}
              transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
            >
              <path d={`M0 0 V${ch.drop}`} stroke="#7a5a2e" strokeWidth="2" />
              <ellipse
                cx="0"
                cy={ch.drop}
                rx="34"
                ry="9"
                fill="none"
                stroke="#f0d29b"
                strokeWidth="3"
              />
              {[-30, -15, 0, 15, 30].map((dx) => (
                <g key={dx}>
                  <path d={`M${dx} ${ch.drop} v10`} stroke="#f0d29b" strokeWidth="2" />
                  <motion.circle
                    cx={dx}
                    cy={ch.drop + 13}
                    r="3.4"
                    fill="#ffe6a6"
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

        {/* waltzing couples, in silhouette (feet pinned at the group origin) */}
        {[
          { x: 120, y: 512, s: 1, dur: 7, span: 46 },
          { x: 250, y: 486, s: 0.82, dur: 8.5, span: 38 },
          { x: 196, y: 556, s: 1.15, dur: 6, span: 56 },
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
              style={{ y: c.y, scale: c.s }}
              animate={sway ? { rotate: [-4, 4, -4] } : { rotate: 0 }}
              transition={{
                duration: c.dur / 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Couple rim={["#ffc7de", "#c1a6ff", "#f0d29b"][i]} />
            </motion.g>
          </motion.g>
        ))}

        {/* soft vignette */}
        <rect x="0" y="0" width="400" height="620" fill="url(#ball-glow)" opacity="0.06" />
        <rect x="0" y="470" width="400" height="150" fill="#0d0820" opacity="0.28" />
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
            className="pointer-events-none absolute bottom-[34%] text-[#ffe6a6]/70"
            style={{ left: n.left }}
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
