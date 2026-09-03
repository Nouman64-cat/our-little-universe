"use client";

import { darken, lighten } from "./shade";

/*
 * Every part draws into a local box with its origin at the top-left and its
 * given width/height, so `HouseExterior` can place it with a plain
 * <g transform="translate(x y)"> and the editor can preview it in a matching
 * viewBox. Flat storybook shapes; each colour carries its own darker outline
 * (the `GardenScene` grass-lip trick) so it reads on any wall.
 */

const STROKE = 1.3;

// ── Roof ────────────────────────────────────────────────────────────────────

interface RoofProps {
  shape: string;
  color: string;
  width: number;
  height: number;
}

export function Roof({ shape, color, width: w, height: h }: RoofProps) {
  const edge = darken(color, 0.28);
  const shine = lighten(color, 0.16);
  const common = { stroke: edge, strokeWidth: STROKE, strokeLinejoin: "round" as const };

  if (shape === "flat") {
    const top = h * 0.52;
    return (
      <g>
        <rect x={0} y={top} width={w} height={h - top} fill={color} {...common} />
        <rect x={-2} y={top - 4} width={w + 4} height={5} rx={2} fill={edge} />
        <rect x={0} y={top + 2} width={w} height={2.5} fill={shine} opacity={0.5} />
      </g>
    );
  }

  if (shape === "curved") {
    return (
      <g>
        <path
          d={`M0 ${h} Q ${w / 2} ${-h * 0.9} ${w} ${h} Z`}
          fill={color}
          {...common}
        />
        <path
          d={`M${w * 0.14} ${h * 0.9} Q ${w / 2} ${-h * 0.42} ${w * 0.86} ${h * 0.9}`}
          fill="none"
          stroke={shine}
          strokeWidth={STROKE}
          opacity={0.6}
        />
      </g>
    );
  }

  if (shape === "hip") {
    return (
      <g>
        <path
          d={`M0 ${h} L ${w * 0.2} 0 L ${w * 0.8} 0 L ${w} ${h} Z`}
          fill={color}
          {...common}
        />
        <path d={`M${w * 0.2} 0 L ${w * 0.5} ${h * 0.5}`} stroke={shine} strokeWidth={STROKE} opacity={0.55} />
        <path d={`M${w * 0.8} 0 L ${w * 0.5} ${h * 0.5}`} stroke={edge} strokeWidth={STROKE} opacity={0.5} />
      </g>
    );
  }

  // gable (default)
  return (
    <g>
      <path d={`M0 ${h} L ${w / 2} 0 L ${w} ${h} Z`} fill={color} {...common} />
      <path d={`M${w / 2} 0 L ${w / 2} ${h}`} stroke={edge} strokeWidth={STROKE * 0.7} opacity={0.35} />
      <path d={`M${w * 0.08} ${h * 0.86} L ${w / 2} ${h * 0.1}`} stroke={shine} strokeWidth={STROKE} opacity={0.55} />
    </g>
  );
}

// ── Door ────────────────────────────────────────────────────────────────────

interface DoorProps {
  shape: string;
  color: string;
  width?: number;
  height?: number;
}

export function Door({ shape, color, width: w = 42, height: h = 66 }: DoorProps) {
  const edge = darken(color, 0.32);
  const panel = darken(color, 0.14);
  const glass = lighten(color, 0.62);
  const knob = "#e9c877";
  const frame = { stroke: edge, strokeWidth: STROKE, strokeLinejoin: "round" as const };

  const Knob =
    shape === "double" ? (
      <>
        <circle cx={w * 0.5 - 3} cy={h * 0.56} r={2.1} fill={knob} />
        <circle cx={w * 0.5 + 3} cy={h * 0.56} r={2.1} fill={knob} />
      </>
    ) : (
      <circle cx={w * 0.78} cy={h * 0.56} r={2.4} fill={knob} />
    );

  if (shape === "arched") {
    const r = w / 2;
    return (
      <g>
        <path
          d={`M0 ${h} L0 ${r} A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h} Z`}
          fill={color}
          {...frame}
        />
        <path d={`M${w * 0.5} ${r * 0.5} L ${w * 0.5} ${h * 0.42}`} stroke={panel} strokeWidth={STROKE} />
        <rect x={w * 0.22} y={h * 0.5} width={w * 0.56} height={h * 0.34} rx={2} fill="none" stroke={panel} strokeWidth={STROKE} />
        {Knob}
      </g>
    );
  }

  if (shape === "cottage") {
    return (
      <g>
        <rect x={0} y={0} width={w} height={h} rx={2} fill={color} {...frame} />
        <rect x={w * 0.16} y={h * 0.12} width={w * 0.68} height={h * 0.34} rx={1.5} fill={glass} stroke={edge} strokeWidth={STROKE} />
        <path d={`M${w * 0.5} ${h * 0.12} L ${w * 0.5} ${h * 0.46} M${w * 0.16} ${h * 0.29} L ${w * 0.84} ${h * 0.29}`} stroke={edge} strokeWidth={STROKE * 0.8} />
        {Knob}
      </g>
    );
  }

  if (shape === "double") {
    return (
      <g>
        <rect x={0} y={0} width={w * 0.5 - 1} height={h} rx={1.5} fill={color} {...frame} />
        <rect x={w * 0.5 + 1} y={0} width={w * 0.5 - 1} height={h} rx={1.5} fill={color} {...frame} />
        <rect x={w * 0.1} y={h * 0.14} width={w * 0.28} height={h * 0.4} rx={1} fill="none" stroke={panel} strokeWidth={STROKE} />
        <rect x={w * 0.62} y={h * 0.14} width={w * 0.28} height={h * 0.4} rx={1} fill="none" stroke={panel} strokeWidth={STROKE} />
        {Knob}
      </g>
    );
  }

  // panel (default)
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={2} fill={color} {...frame} />
      <rect x={w * 0.16} y={h * 0.1} width={w * 0.68} height={h * 0.34} rx={1.5} fill="none" stroke={panel} strokeWidth={STROKE} />
      <rect x={w * 0.16} y={h * 0.52} width={w * 0.68} height={h * 0.36} rx={1.5} fill="none" stroke={panel} strokeWidth={STROKE} />
      {Knob}
    </g>
  );
}

// ── Window ──────────────────────────────────────────────────────────────────

interface WindowProps {
  shape: string;
  /** Frame colour — usually the trim/white; glass is derived. */
  frameColor?: string;
  width?: number;
  height?: number;
}

export function Window({ shape, frameColor = "#f4efe6", width: w = 32, height: h = 32 }: WindowProps) {
  const edge = darken(frameColor, 0.4);
  const glass = "#bcd6e4";
  const glare = "#e8f2f6";
  const frame = { stroke: edge, strokeWidth: STROKE, strokeLinejoin: "round" as const };

  if (shape === "round") {
    const r = Math.min(w, h) / 2;
    return (
      <g>
        <circle cx={w / 2} cy={h / 2} r={r} fill={glass} {...frame} />
        <circle cx={w / 2} cy={h / 2} r={r} fill="none" stroke={frameColor} strokeWidth={STROKE * 2.2} />
        <path d={`M${w / 2} ${h / 2 - r + 2} L ${w / 2} ${h / 2 + r - 2}`} stroke={edge} strokeWidth={STROKE * 0.8} opacity={0.7} />
        <path d={`M${w * 0.28} ${h * 0.3} A ${r * 0.7} ${r * 0.7} 0 0 1 ${w * 0.44} ${h * 0.2}`} fill="none" stroke={glare} strokeWidth={STROKE * 1.6} opacity={0.85} />
      </g>
    );
  }

  if (shape === "arched") {
    const r = w / 2;
    return (
      <g>
        <path d={`M0 ${h} L0 ${r} A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h} Z`} fill={glass} {...frame} />
        <path d={`M0 ${h} L0 ${r} A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h} Z`} fill="none" stroke={frameColor} strokeWidth={STROKE * 2} />
        <path d={`M${w / 2} 1 L ${w / 2} ${h} M0 ${h * 0.62} L ${w} ${h * 0.62}`} stroke={edge} strokeWidth={STROKE} />
        <path d={`M${w * 0.24} ${h * 0.24} L ${w * 0.36} ${h * 0.4}`} stroke={glare} strokeWidth={STROKE * 1.6} opacity={0.8} />
      </g>
    );
  }

  if (shape === "bay") {
    return (
      <g>
        <path d={`M${w * 0.16} ${h} L 0 ${h * 0.34} L ${w * 0.16} 2 Z`} fill={glass} {...frame} />
        <rect x={w * 0.16} y={2} width={w * 0.68} height={h - 2} fill={glass} {...frame} />
        <path d={`M${w * 0.84} ${h} L ${w} ${h * 0.34} L ${w * 0.84} 2 Z`} fill={glass} {...frame} />
        <path d={`M${w * 0.5} 4 L ${w * 0.5} ${h - 2} M${w * 0.18} ${h * 0.5} L ${w * 0.82} ${h * 0.5}`} stroke={edge} strokeWidth={STROKE} />
        <path d={`M${w * 0.26} ${h * 0.22} L ${w * 0.4} ${h * 0.4}`} stroke={glare} strokeWidth={STROKE * 1.6} opacity={0.8} />
      </g>
    );
  }

  // square (default)
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={1.5} fill={glass} {...frame} />
      <rect x={0} y={0} width={w} height={h} rx={1.5} fill="none" stroke={frameColor} strokeWidth={STROKE * 2.2} />
      <path d={`M${w / 2} 1 L ${w / 2} ${h - 1} M1 ${h / 2} L ${w - 1} ${h / 2}`} stroke={edge} strokeWidth={STROKE} />
      <path d={`M${w * 0.2} ${h * 0.22} L ${w * 0.38} ${h * 0.4}`} stroke={glare} strokeWidth={STROKE * 1.8} opacity={0.8} />
    </g>
  );
}

// ── Small fixed pieces ──────────────────────────────────────────────────────

export function Chimney({ color = "#b5654c" }: { color?: string }) {
  const edge = darken(color, 0.3);
  return (
    <g>
      <rect x={0} y={6} width={16} height={30} fill={color} stroke={edge} strokeWidth={STROKE} />
      <rect x={-2} y={0} width={20} height={8} rx={1.5} fill={edge} />
    </g>
  );
}

export function Mailbox({ hasMail = false }: { hasMail?: boolean }) {
  const post = "#9a7b63";
  const body = "#e7e1d6";
  const edge = "#7d7566";
  return (
    <g>
      <rect x={9} y={16} width={4} height={24} fill={post} stroke={darken(post, 0.25)} strokeWidth={STROKE} />
      <path d="M2 10 h14 a4 4 0 0 1 4 4 v6 h-22 v-6 a4 4 0 0 1 4 -4 Z" fill={body} stroke={edge} strokeWidth={STROKE} />
      <rect x={0} y={20} width={22} height={2.5} fill={edge} />
      <path d="M18 12 v-6" stroke={hasMail ? "#d16f92" : edge} strokeWidth={STROKE * 1.6} strokeLinecap="round" />
      {hasMail && <circle cx={18} cy={5} r={2.6} fill="#d16f92" />}
    </g>
  );
}

export function WelcomeSign({ line }: { line: string }) {
  const board = "#f3e8d3";
  const edge = "#b79b73";
  // The board hangs from two short stakes; the text is forced to fit its inner
  // width with textLength so any sign wording stays inside the frame.
  const W = 72;
  const cx = W / 2 - 8; // board runs x = -8 .. W-8
  return (
    <g>
      <path d={`M2 0 v9 M${W - 18} 0 v9`} stroke="#8a7355" strokeWidth={STROKE * 1.4} />
      <rect x={-8} y={7} width={W} height={18} rx={3.5} fill={board} stroke={edge} strokeWidth={STROKE * 1.2} />
      <text
        x={cx}
        y={19.5}
        textAnchor="middle"
        textLength={W - 14}
        lengthAdjust="spacingAndGlyphs"
        fontSize={7}
        fontStyle="italic"
        fontWeight={500}
        fill="#6a4c39"
        fontFamily="var(--font-display), Georgia, serif"
      >
        {line}
      </text>
    </g>
  );
}
