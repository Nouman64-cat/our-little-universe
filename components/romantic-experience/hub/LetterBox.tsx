"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { clamp } from "@/lib/utils";

interface LetterBoxProps {
  /** How many sealed letters are still in the box (including today's, if any). */
  sealed: number;
  /** A fresh letter can be opened today — raise it out of the box. */
  waiting: boolean;
  reduceMotion: boolean;
  /** Tapping the waiting letter opens it. */
  onOpen: () => void;
}

/** Fan slots for the sealed envelopes, ordered centre-outwards. */
const FAN = [
  { dx: 2, rot: 1 },
  { dx: -22, rot: -5 },
  { dx: 26, rot: 6 },
  { dx: -46, rot: -10 },
  { dx: 50, rot: 11 },
  { dx: -68, rot: -14 },
] as const;

const WOOD_TOP = "#d8a973";
const WOOD_BOT = "#b07f4f";
const WOOD_EDGE = "#7c5636";
const PAPER = "#f7edd7";
const PAPER_DIM = "#e7dcc4";
const SEAL = "#d8607f";

/** One standing envelope, seen from the top third (the rest is inside the box). */
function Envelope({
  dim = false,
  seal = false,
}: {
  dim?: boolean;
  seal?: boolean;
}) {
  const face = dim ? PAPER_DIM : PAPER;
  const line = dim ? "#cdbf9f" : "#c7b489";
  return (
    <g>
      <rect x={-34} y={0} width={68} height={104} rx={4} fill={face} stroke={line} strokeWidth={1.3} />
      {/* flap */}
      <path d="M-34 3 L0 34 L34 3" fill="none" stroke={line} strokeWidth={1.3} strokeLinejoin="round" />
      {seal ? (
        <g>
          <circle cx={0} cy={30} r={7} fill={SEAL} stroke="#b34c66" strokeWidth={1} />
          <path
            d="M0 33 c -3 -3 -5 -4 -5 -6.4 a 2.4 2.4 0 0 1 5 -1 a 2.4 2.4 0 0 1 5 1 c 0 2.4 -2 3.4 -5 6.4 Z"
            fill="#ffe0e9"
          />
        </g>
      ) : (
        <circle cx={0} cy={24} r={2.4} fill={SEAL} opacity={0.75} />
      )}
    </g>
  );
}

/**
 * A keepsake box of letters. The sealed ones stand fanned inside; when a new
 * one is ready it lifts out with a wax seal and a soft glow, waiting to be
 * opened. Empty, the lid sits open on a box that's given everything it had.
 */
export function LetterBox({ sealed, waiting, reduceMotion, onOpen }: LetterBoxProps) {
  const gid = useId().replace(/:/g, "");
  const backCount = clamp(sealed - (waiting ? 1 : 0), 0, FAN.length);
  const empty = sealed === 0;

  // Draw the fanned envelopes left-to-right so they overlap naturally.
  const back = FAN.slice(0, backCount)
    .map((slot, i) => ({ ...slot, i }))
    .sort((a, b) => a.dx - b.dx);

  return (
    <svg viewBox="0 0 320 264" className="w-full" aria-hidden>
      <defs>
        <linearGradient id={`wood${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={WOOD_TOP} />
          <stop offset="100%" stopColor={WOOD_BOT} />
        </linearGradient>
        <radialGradient id={`glow${gid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={SEAL} stopOpacity={0.5} />
          <stop offset="100%" stopColor={SEAL} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx={160} cy={244} rx={116} ry={13} fill="#000" opacity={0.14} />

      {/* open lid, hinged at the back-left of the box */}
      <g transform="rotate(-19 44 150)">
        <rect x={40} y={116} width={210} height={40} rx={8} fill={`url(#wood${gid})`} stroke={WOOD_EDGE} strokeWidth={1.6} />
        <rect x={52} y={124} width={186} height={24} rx={5} fill="#f0e2c6" stroke="#d9c49b" strokeWidth={1.1} />
        <path
          d="M145 146 c -5 -5 -9 -7 -9 -11.5 a 4.2 4.2 0 0 1 9 -1.7 a 4.2 4.2 0 0 1 9 1.7 c 0 4.5 -4 6.5 -9 11.5 Z"
          fill={SEAL}
          opacity={0.85}
        />
      </g>

      {/* the fanned sealed letters, sitting down in the box */}
      <g transform="translate(160 96)">
        {back.map((slot) => (
          <g key={slot.i} transform={`translate(${slot.dx} 0) rotate(${slot.rot})`}>
            <Envelope dim />
          </g>
        ))}
      </g>

      {/* today's letter, lifted out and waiting */}
      {waiting && (
        <motion.g
          style={{ cursor: "pointer" }}
          onClick={onOpen}
          initial={reduceMotion ? undefined : { y: 0 }}
          animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x={114} y={18} width={92} height={132} fill="transparent" />
          <motion.ellipse
            cx={160}
            cy={70}
            rx={70}
            ry={70}
            fill={`url(#glow${gid})`}
            initial={reduceMotion ? { opacity: 0.5 } : { opacity: 0.4 }}
            animate={reduceMotion ? { opacity: 0.5 } : { opacity: [0.35, 0.65, 0.35] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <g transform="translate(160 34) rotate(-4)">
            <Envelope seal />
          </g>
        </motion.g>
      )}

      {/* box front panel */}
      <g>
        <path
          d="M40 150 h240 a10 10 0 0 1 10 10 v58 a14 14 0 0 1 -14 14 H44 a14 14 0 0 1 -14 -14 v-58 a10 10 0 0 1 10 -10 Z"
          fill={`url(#wood${gid})`}
          stroke={WOOD_EDGE}
          strokeWidth={1.8}
        />
        {/* top rim */}
        <path d="M42 158 h236" stroke={WOOD_EDGE} strokeOpacity={0.55} strokeWidth={2} strokeLinecap="round" />
        <path d="M44 153 h232" stroke="#f2d9b6" strokeOpacity={0.7} strokeWidth={1.6} strokeLinecap="round" />
        {/* engraved plate */}
        <rect x={126} y={182} width={68} height={26} rx={13} fill="#e9c98f" stroke={WOOD_EDGE} strokeWidth={1.2} />
        <text
          x={160}
          y={199}
          textAnchor="middle"
          textLength={46}
          lengthAdjust="spacingAndGlyphs"
          fontSize={11}
          fill="#6a4a2c"
          fontFamily="var(--font-display), Georgia, serif"
          fontStyle="italic"
        >
          c ♡ c
        </text>
      </g>

      {/* a small kept heart resting in the open, empty box */}
      {empty && (
        <path
          d="M160 132 c -9 -9 -16 -13 -16 -21 a 7.5 7.5 0 0 1 16 -3 a 7.5 7.5 0 0 1 16 3 c 0 8 -7 12 -16 21 Z"
          fill={SEAL}
          opacity={0.4}
        />
      )}
    </svg>
  );
}
