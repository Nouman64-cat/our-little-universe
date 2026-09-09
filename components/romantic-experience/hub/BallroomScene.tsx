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
          <radialGradient id="ball-spot" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#fff1cf" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#ffe8b8" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#ffe8b8" stopOpacity="0" />
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

        {/* other couples, small and dim toward the back of the room */}
        {[
          { x: 92, y: 484, s: 0.78, dur: 8, span: 38 },
          { x: 312, y: 474, s: 0.7, dur: 9.5, span: 32 },
          { x: 214, y: 450, s: 0.56, dur: 11, span: 24 },
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
              style={{ y: c.y, scale: c.s, opacity: 0.7 }}
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

        {/* the bride and groom, centre stage in a pool of light */}
        <ellipse cx="200" cy="548" rx="168" ry="104" fill="url(#ball-spot)" />
        <motion.g
          initial={false}
          animate={sway ? { x: [182, 218, 182] } : { x: 200 }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        >
          <ellipse cx="0" cy="594" rx="54" ry="11" fill="#0b0718" opacity="0.45" />
          <motion.g
            animate={
              sway
                ? { y: [592, 584, 592], rotate: [-5, 5, -5] }
                : { y: 592, rotate: -3 }
            }
            transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <g transform="scale(2.05)">
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

/**
 * The bride and groom, feet at y=0, drawn upward, group-local coords. Groom
 * sits around x=-12 in a tailcoat, bride around x=+10 in a flowing gown with a
 * veil; his hand at her waist, her hand at his shoulder, joined hands raised to
 * the left in a waltz frame.
 */
function BrideGroom() {
  return (
    <g>
      {/* veil, trailing behind the bride */}
      <path
        d="M12 -74 Q 40 -52 30 -2 Q 24 -34 12 -64 Z"
        fill="#ffffff"
        opacity="0.28"
      />
      <path
        d="M12 -74 Q 30 -52 22 -6"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.5"
        strokeWidth="1"
      />

      {/* ---- groom ---- */}
      {/* tails */}
      <path d="M-19 -34 L-21 -3 L-13 -34 Z" fill="#141029" />
      <path d="M-5 -34 L-3 -3 L-11 -34 Z" fill="#141029" />
      {/* legs + shoes */}
      <rect x="-18" y="-33" width="5" height="33" fill="#17122b" />
      <rect x="-11" y="-33" width="5" height="33" fill="#17122b" />
      <rect x="-19.5" y="-3" width="8" height="4" rx="1.5" fill="#0b0818" />
      <rect x="-11.5" y="-3" width="8" height="4" rx="1.5" fill="#0b0818" />
      {/* coat */}
      <path d="M-21 -33 L-22 -57 Q-12 -63 -2 -57 L-3 -33 Z" fill="#1d1836" />
      {/* shirt + bow tie */}
      <path d="M-15.5 -57 L-12 -39 L-8.5 -57 Z" fill="#efe9dc" />
      <path d="M-12 -55 L-16 -58 L-16 -52 Z" fill="#0c0a1a" />
      <path d="M-12 -55 L-8 -58 L-8 -52 Z" fill="#0c0a1a" />
      {/* neck + head + hair */}
      <rect x="-14" y="-61" width="4" height="5" fill="#e7c6a4" />
      <circle cx="-12" cy="-67" r="6" fill="#e7c6a4" />
      <path
        d="M-18 -67 Q-18.5 -75 -12 -75 Q-5.5 -75 -6 -67 Q-9 -71 -12 -71 Q-15 -71 -18 -67 Z"
        fill="#26160f"
      />
      {/* his right arm around the bride's waist */}
      <path
        d="M-3 -49 Q 7 -45 15 -47"
        fill="none"
        stroke="#1d1836"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* his left forearm, up to the joined hands */}
      <path
        d="M-19 -55 L-24 -64"
        fill="none"
        stroke="#1d1836"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* ---- bride ---- */}
      {/* gown with a sweeping train to the right */}
      <path
        d="M2 1 C -12 -2 -11 -30 -3 -52 L10 -52 C 20 -30 34 4 8 1 Z"
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
      {/* bouquet at her side */}
      <g transform="translate(-4 -34)">
        <circle r="2.6" fill="#ffc7de" />
        <circle cx="3" cy="1" r="2" fill="#ffd9e6" />
        <circle cx="-1.5" cy="2.4" r="1.8" fill="#f6d2e2" />
        <path d="M0 2 L1 9" stroke="#8fb89c" strokeWidth="1.2" />
      </g>
      {/* neck + head + updo + tiara */}
      <rect x="2" y="-67" width="4" height="4" fill="#e7c6a4" />
      <circle cx="4" cy="-72" r="5.5" fill="#e7c6a4" />
      <path
        d="M-1.5 -72 Q-2 -80 4 -80 Q10 -80 9.5 -72 Q7 -76 4 -76 Q1 -76 -1.5 -72 Z"
        fill="#3a2617"
      />
      <circle cx="9" cy="-75" r="2.6" fill="#3a2617" />
      <path
        d="M0 -79 l1.6 -3 l1.6 3 l1.6 -3 l1.6 3"
        fill="none"
        stroke="#ffe6a6"
        strokeWidth="1.2"
      />
      {/* her left hand resting on his shoulder */}
      <path
        d="M2 -55 Q -7 -58 -14 -56"
        fill="none"
        stroke="#f2ebdb"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      {/* her right forearm crossing up to meet his hand */}
      <path
        d="M5 -55 Q -9 -56 -22 -64"
        fill="none"
        stroke="#f2ebdb"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      {/* their joined hands */}
      <ellipse cx="-24" cy="-65" rx="2.8" ry="3.6" fill="#e7c6a4" />

      {/* a small heart floating above them */}
      <path
        d="M-2 -98 c 0 -2 -3.4 -2 -3.4 0.7 c 0 2 3.4 4.1 3.4 4.1 c 0 0 3.4 -2.1 3.4 -4.1 c 0 -2.7 -3.4 -2.7 -3.4 -0.7 Z"
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
