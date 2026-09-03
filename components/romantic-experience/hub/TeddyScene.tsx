"use client";

import { motion, useReducedMotion } from "motion/react";
import { TeddyFigure } from "../ui/TeddyIcon";

interface TeddySceneProps {
  pose: "idle" | "hug";
  blink: boolean;
}

/** Warm dots strung along a gentle swag near the top of the wall. */
const LIGHTS = [12, 40, 74, 108, 142, 158, 192, 226, 260, 288];
const swagY = (x: number) => 26 + Math.sin((x / 300) * Math.PI) * 30;

const STARS = [
  { x: 52, y: 52, r: 1.3 },
  { x: 96, y: 44, r: 1 },
  { x: 74, y: 74, r: 1.5 },
  { x: 108, y: 66, r: 0.9 },
];

/**
 * A snug bed nook at dusk: a warm window, fairy lights, plump pillows and a
 * folded knit throw — and the two of them, a little bear pair, cuddled up.
 * Everything settles to a still frame under reduced motion.
 */
export function TeddyScene({ pose, blink }: TeddySceneProps) {
  const reduceMotion = useReducedMotion();
  const hugging = pose === "hug";

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #f3e4e0 0%, #ecd4d0 52%, #e7cdca 100%)" }}
    >
      <svg
        viewBox="0 0 300 420"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        role="img"
        aria-label="Two teddies cuddled up in a cosy bed"
      >
        <defs>
          <radialGradient id="teddy-lampglow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe6bd" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffe6bd" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="teddy-window" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6c79a" />
            <stop offset="55%" stopColor="#e2a6bf" />
            <stop offset="100%" stopColor="#b493c9" />
          </linearGradient>
          <linearGradient id="teddy-duvet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f3e0e4" />
            <stop offset="100%" stopColor="#e6cdd3" />
          </linearGradient>
        </defs>

        {/* warm glow from the little lamp */}
        <circle cx={44} cy={196} r={92} fill="url(#teddy-lampglow)" />

        {/* ── window ── */}
        <g transform="translate(38 -4)">
          <rect x={30} y={44} width={92} height={108} rx={46} fill="#f4e7e2" />
          <path
            d="M36 94 a40 40 0 0 1 80 0 v52 a4 4 0 0 1 -4 4 h-72 a4 4 0 0 1 -4 -4 Z"
            fill="url(#teddy-window)"
            stroke="#cdaaa4"
            strokeWidth={4}
          />
          {/* moon + stars */}
          <path d="M92 70 a15 15 0 1 0 6 24 a12 12 0 1 1 -6 -24Z" fill="#fff3d6" />
          {STARS.map((st, i) => (
            <motion.circle
              key={i}
              cx={st.x + 8}
              cy={st.y + 12}
              r={st.r}
              fill="#fff6e0"
              animate={reduceMotion ? { opacity: 0.8 } : { opacity: [0.3, 1, 0.3] }}
              transition={reduceMotion ? undefined : { duration: 3, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
          <path d="M76 98 v52 M36 124 h80" stroke="#cdaaa4" strokeWidth={3} />
        </g>

        {/* ── framed pictures on the wall ── */}
        <g transform="translate(178 50)">
          <rect x={0} y={0} width={36} height={40} rx={3} fill="#efe1da" stroke="#c7a59d" strokeWidth={2.5} />
          <path d="M18 31 C 8 22 8 11 13 11 C 17 11 18 15 18 15 C 18 15 19 11 23 11 C 28 11 28 22 18 31Z" fill="#e79ac0" />
        </g>
        <g transform="translate(184 100)">
          <rect x={0} y={0} width={28} height={32} rx={3} fill="#efe1da" stroke="#c7a59d" strokeWidth={2.5} />
          <path d="M17 8 a8.5 8.5 0 1 0 4 14 a7 7 0 1 1 -4 -14Z" fill="#f0d29b" />
        </g>

        {/* ── fairy lights ── */}
        <path
          d={`M-6 ${swagY(-6)} Q 150 66 306 ${swagY(306)}`}
          fill="none"
          stroke="#c3ab98"
          strokeWidth={1.4}
        />
        {LIGHTS.map((x, i) => (
          <g key={i}>
            <line x1={x} y1={swagY(x)} x2={x} y2={swagY(x) + 5} stroke="#c3ab98" strokeWidth={1.2} />
            <motion.circle
              cx={x}
              cy={swagY(x) + 8}
              r={3.4}
              fill="#ffd98f"
              style={{ filter: "drop-shadow(0 0 5px rgba(255,214,150,0.9))" }}
              animate={reduceMotion ? { opacity: 0.9 } : { opacity: [0.55, 1, 0.55] }}
              transition={reduceMotion ? undefined : { duration: 2.6, repeat: Infinity, delay: i * 0.28 }}
            />
          </g>
        ))}

        {/* ── little shelf, right ── */}
        <g transform="translate(196 150)">
          <rect x={0} y={16} width={50} height={5} rx={2} fill="#d9b9a6" />
          <path d="M10 16 v-9 a6 6 0 0 1 12 0" fill="none" stroke="#8bb083" strokeWidth={3} />
          <rect x={28} y={2} width={7} height={14} fill="#c9a2c4" />
          <rect x={38} y={5} width={7} height={11} fill="#a9c3b0" />
        </g>

        {/* ── bedside lamp, left ── */}
        <g transform="translate(34 120)">
          <path d="M6 46 h28 l-6 -20 h-16 Z" fill="#f6e2b4" stroke="#d9bd82" strokeWidth={2} />
          <rect x={17} y={46} width={6} height={20} fill="#b99f86" />
          <ellipse cx={20} cy={68} rx={13} ry={4} fill="#b99f86" />
        </g>

        {/* ── padded headboard behind the bed ── */}
        <path
          d="M18 278 V162 a26 26 0 0 1 26 -26 h212 a26 26 0 0 1 26 26 V278Z"
          fill="#ddbdc5"
          stroke="#c79fa9"
          strokeWidth={2}
        />
        {/* quilted diamonds */}
        <g stroke="#cfa8b3" strokeWidth={1.2} opacity={0.7}>
          {[168, 196, 224, 252].map((y) => (
            <path key={`a${y}`} d={`M20 ${y} L 150 ${y - 22} L 280 ${y}`} fill="none" />
          ))}
          {[168, 196, 224, 252].map((y) => (
            <path key={`b${y}`} d={`M20 ${y - 22} L 150 ${y} L 280 ${y - 22}`} fill="none" />
          ))}
        </g>
        {[62, 106, 150, 194, 238].map((x) =>
          [176, 210, 244].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={1.8} fill="#bf95a1" />),
        )}
        {/* a little heart garland strung across the headboard */}
        <path d="M64 170 Q 150 182 236 170" fill="none" stroke="#c99aa7" strokeWidth={1} />
        {[80, 116, 150, 184, 220].map((x, i) => (
          <path
            key={x}
            transform={`translate(${x} ${172 + Math.sin((i / 4) * Math.PI) * 7})`}
            d="M0 0 C -3.5 -3.5 -3.5 -8 -1.3 -8 C 0 -8 0 -5 0 -5 C 0 -5 0 -8 1.3 -8 C 3.5 -8 3.5 -3.5 0 0Z"
            fill={i % 2 ? "#e79ac0" : "#f4c9da"}
          />
        ))}

        {/* ── bed / duvet ── */}
        <path d="M-20 272 Q 150 258 320 272 L320 420 L-20 420 Z" fill="url(#teddy-duvet)" />
        <path d="M-20 272 Q 150 258 320 272" fill="none" stroke="#f6ebec" strokeWidth={6} />
        {/* folded knit throw */}
        <path d="M-20 336 Q 150 324 320 336 L320 380 Q 150 370 -20 380 Z" fill="#ecd3b0" stroke="#d8bb8f" strokeWidth={2} />
        {[345, 355, 365].map((y) => (
          <path key={y} d={`M-20 ${y} Q 150 ${y - 10} 320 ${y}`} fill="none" stroke="#dcc196" strokeWidth={1.4} />
        ))}

        {/* ── pillows ── */}
        <g stroke="#e9d7da" strokeWidth={2}>
          <ellipse cx={90} cy={258} rx={50} ry={26} fill="#f7edea" transform="rotate(-7 90 258)" />
          <ellipse cx={208} cy={258} rx={50} ry={26} fill="#f1dfe4" transform="rotate(7 208 258)" />
        </g>

        {/* ── the pair, cuddled up ── */}
        <motion.g
          animate={reduceMotion ? undefined : { y: hugging ? [0, -3, 0] : [0, -2.5, 0] }}
          transition={{ duration: hugging ? 0.6 : 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <g transform={`translate(54 192) scale(0.56) rotate(${hugging ? 13 : 9} 118 210)`}>
            <TeddyFigure pose={pose} blink={blink} fur="#efc2d0" accent="bow" accentColor="#ff9ec4" />
          </g>
          <g transform={`translate(122 192) scale(0.56) rotate(${hugging ? -13 : -9} 82 210)`}>
            <TeddyFigure pose={pose} blink={blink} fur="#e3c39c" accent="bowtie" accentColor="#7fa8c4" flip />
          </g>
        </motion.g>

        {/* ── soft vignette ── */}
        <path
          d="M0 0 H300 V420 H0 Z"
          fill="none"
          stroke="rgba(90,55,60,0.12)"
          strokeWidth={14}
        />
      </svg>
    </div>
  );
}
