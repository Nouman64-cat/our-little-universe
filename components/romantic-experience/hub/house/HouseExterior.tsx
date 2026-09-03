"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { skyPhase, sunProgress, type SkyPhase } from "@/lib/daily";
import {
  DOOR_COLORS,
  ROOF_COLORS,
  WALL_COLORS,
} from "@/lib/house-catalog";
import type { ExteriorState } from "@/lib/house";
import { Chimney, Door, Mailbox, Roof, WelcomeSign, Window } from "./parts/structure";
import { YARD_BOX, YardItem } from "./parts/YardItem";
import { darken } from "./parts/shade";
import type { Selection } from "./selection";

const SKY: Record<SkyPhase, { top: string; bottom: string; ground: string; groundLip: string; orb: string; glow: string }> = {
  dawn: { top: "#f6c9a6", bottom: "#eab7cf", ground: "#9ccf95", groundLip: "#7cbd7a", orb: "#fff0d4", glow: "rgba(255,214,160,0.7)" },
  day: { top: "#9ccbe8", bottom: "#d4e9f1", ground: "#94d18d", groundLip: "#74c072", orb: "#fff7e2", glow: "rgba(255,236,180,0.8)" },
  dusk: { top: "#f0a578", bottom: "#c98aa9", ground: "#77a074", groundLip: "#5f9166", orb: "#ffe0b0", glow: "rgba(255,176,120,0.65)" },
  night: { top: "#1b2246", bottom: "#33305e", ground: "#3a5142", groundLip: "#42604b", orb: "#eef0ff", glow: "rgba(200,208,255,0.5)" },
};

const CLOUDS = [
  { y: 34, from: -60, to: 360, rest: 46, size: 1, dur: 58 },
  { y: 66, from: 340, to: -80, rest: 190, size: 0.72, dur: 74 },
] as const;

const byId = (list: readonly { id: string; hex: string }[], id: string) =>
  (list.find((o) => o.id === id) ?? list[0]).hex;

interface HouseExteriorProps {
  exterior: ExteriorState;
  greeting: string;
  hasUnreadLetter: boolean;
  lilyCount: number;
  editing: boolean;
  selected: Selection | null;
  onSelect: (s: Selection) => void;
  onOpenLetters: () => void;
  onOpenGarden: () => void;
}

export function HouseExterior({
  exterior,
  greeting,
  hasUnreadLetter,
  lilyCount,
  editing,
  selected,
  onSelect,
  onOpenLetters,
  onOpenGarden,
}: HouseExteriorProps) {
  const reduceMotion = useReducedMotion();

  const { phase, sun } = useMemo(() => {
    const now = new Date();
    const p = sunProgress(now);
    return {
      phase: skyPhase(now),
      sun: { x: 26 + p * 248, y: 150 - Math.sin(Math.max(0.06, p) * Math.PI) * 116 },
    };
  }, []);
  const s = SKY[phase];
  const isNight = phase === "night";

  const wallHex = byId(WALL_COLORS, exterior.wall);
  const roofHex = byId(ROOF_COLORS, exterior.roofColor);
  const doorHex = byId(DOOR_COLORS, exterior.doorColor);
  const wallEdge = darken(wallHex, 0.22);
  const trim = "#f4efe6";

  const isSel = (kind: Selection["kind"]) => editing && selected?.kind === kind;
  const yardSel = (i: number) =>
    editing && selected?.kind === "yard" && selected.index === i;

  const lilies = Math.min(6, Math.max(0, lilyCount));

  return (
    <svg viewBox="0 0 300 264" className="h-full w-full" role="img" aria-label="Your house">
      <defs>
        <linearGradient id="house-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s.top} />
          <stop offset="100%" stopColor={s.bottom} />
        </linearGradient>
        <linearGradient id="house-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s.ground} />
          <stop offset="100%" stopColor={darken(s.ground, 0.28)} />
        </linearGradient>
      </defs>

      {/* sky */}
      <rect x={0} y={0} width={300} height={172} fill="url(#house-sky)" />

      {isNight &&
        [
          [30, 26], [70, 44], [110, 20], [150, 40], [210, 22], [248, 46], [276, 30],
        ].map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={1.3}
            fill="#f4f2ff"
            animate={reduceMotion ? { opacity: 0.7 } : { opacity: [0.25, 0.9, 0.25] }}
            transition={reduceMotion ? undefined : { duration: 3.4, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}

      {/* sun / moon */}
      <g>
        <circle cx={sun.x} cy={sun.y} r={14} fill={s.orb} opacity={0.28} />
        <circle cx={sun.x} cy={sun.y} r={9} fill={s.orb} style={{ filter: `drop-shadow(0 0 10px ${s.glow})` }} />
        {isNight && <circle cx={sun.x + 4} cy={sun.y - 2} r={7.5} fill={s.bottom} />}
      </g>

      {/* clouds */}
      {CLOUDS.map((c, i) => (
        <motion.g
          key={i}
          animate={reduceMotion ? { x: c.rest } : { x: [c.from, c.to] }}
          transition={reduceMotion ? undefined : { duration: c.dur, repeat: Infinity, ease: "linear" }}
          opacity={isNight ? 0.22 : 0.9}
        >
          <g transform={`translate(0 ${c.y}) scale(${c.size})`}>
            <ellipse cx={0} cy={0} rx={18} ry={9} fill="#ffffff" />
            <ellipse cx={14} cy={3} rx={13} ry={8} fill="#ffffff" />
            <ellipse cx={-13} cy={3} rx={11} ry={7} fill="#ffffff" />
          </g>
        </motion.g>
      ))}

      {/* ground */}
      <path d="M0 160 Q 150 146 300 160 L300 264 L0 264 Z" fill="url(#house-ground)" />
      <path d="M0 160 Q 150 146 300 160" fill="none" stroke={s.groundLip} strokeWidth={3} />

      {/* walkway */}
      <path d="M140 214 L126 262 L174 262 L160 214 Z" fill="#ddd5c4" stroke={darken("#ddd5c4", 0.2)} strokeWidth={1.2} />

      {/* chimney (behind the roof) */}
      <g transform="translate(184 74)">
        <Chimney color={roofHex} />
        {!reduceMotion && !isNight && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0], y: [-2, -16, -26] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeOut" }}
          >
            <circle cx={8} cy={4} r={4} fill="#d8d2d8" />
            <circle cx={12} cy={-2} r={3} fill="#d8d2d8" />
          </motion.g>
        )}
      </g>

      {/* house body */}
      <rect x={88} y={124} width={124} height={92} fill={wallHex} stroke={wallEdge} strokeWidth={1.4} />
      <rect x={88} y={124} width={124} height={4} fill={darken(wallHex, 0.1)} opacity={0.5} />

      {/* roof */}
      <g transform="translate(70 78)">
        <Roof shape={exterior.roof} color={roofHex} width={160} height={46} />
      </g>

      {/* windows */}
      <g transform="translate(103 146)">
        <Window shape={exterior.windows} frameColor={trim} width={30} height={30} />
      </g>
      <g transform="translate(167 146)">
        <Window shape={exterior.windows} frameColor={trim} width={30} height={30} />
      </g>

      {/* welcome sign */}
      <g transform="translate(128 100)">
        <WelcomeSign line={greeting} />
      </g>

      {/* door */}
      <g transform="translate(130 154)">
        <Door shape={exterior.door} color={doorHex} width={40} height={62} />
      </g>

      {/* the garden's lilies, a bed against the wall — a shortcut to the garden */}
      {!editing && (
        <g
          role="button"
          tabIndex={0}
          aria-label="Visit the garden"
          onClick={onOpenGarden}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpenGarden()}
          style={{ cursor: "pointer" }}
        >
          <rect x={92} y={198} width={116} height={22} fill="transparent" />
          {Array.from({ length: Math.max(1, lilies) }, (_, i) => {
            const left = i % 2 === 0;
            const n = Math.floor(i / 2);
            const cx = (left ? 118 : 182) + (left ? -n * 11 : n * 11);
            return (
              <g key={i} transform={`translate(${cx} ${212 - (i % 3)})`} opacity={lilies === 0 ? 0.3 : 1}>
                <path d="M0 8 v-8" stroke="#6f9b6c" strokeWidth={1.3} />
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse key={a} cx={0} cy={-3} rx={1.9} ry={4} fill="#f6dbe8" stroke="#d9b8cb" strokeWidth={0.5} transform={`rotate(${a})`} />
                ))}
                <circle r={1.2} fill="#efc987" />
              </g>
            );
          })}
        </g>
      )}

      {/* mailbox — a shortcut to the letters */}
      <g
        transform="translate(20 176)"
        role={editing ? undefined : "button"}
        tabIndex={editing ? undefined : 0}
        aria-label={editing ? undefined : "Open your letters"}
        onClick={editing ? undefined : onOpenLetters}
        onKeyDown={editing ? undefined : (e) => (e.key === "Enter" || e.key === " ") && onOpenLetters()}
        style={{ cursor: editing ? "default" : "pointer" }}
      >
        <Mailbox hasMail={hasUnreadLetter} />
      </g>

      {/* yard slots */}
      {exterior.yard.map((item, i) => {
        const cx = [58, 242][i] ?? 150;
        const baseY = 214;
        return (
          <g key={i} transform={`translate(${cx - YARD_BOX.w / 2} ${baseY - YARD_BOX.h})`}>
            {item && <YardItem variant={item} />}
            {editing && (
              <Hotspot
                x={0}
                y={0}
                w={YARD_BOX.w}
                h={YARD_BOX.h}
                active={yardSel(i)}
                label={`Yard spot ${i + 1}`}
                onSelect={() => onSelect({ kind: "yard", index: i })}
                empty={!item}
              />
            )}
          </g>
        );
      })}

      {/* edit hotspots for the house itself */}
      {editing && (
        <>
          <Hotspot x={72} y={76} w={156} h={46} active={isSel("roof")} label="Roof" onSelect={() => onSelect({ kind: "roof" })} />
          <Hotspot x={88} y={124} w={124} h={92} active={isSel("wall")} label="Walls" onSelect={() => onSelect({ kind: "wall" })} />
          <Hotspot x={99} y={142} w={38} h={38} active={isSel("windows")} label="Windows" onSelect={() => onSelect({ kind: "windows" })} />
          <Hotspot x={163} y={142} w={38} h={38} active={isSel("windows")} label="Windows" onSelect={() => onSelect({ kind: "windows" })} />
          <Hotspot x={128} y={152} w={44} h={64} active={isSel("door")} label="Front door" onSelect={() => onSelect({ kind: "door" })} />
        </>
      )}
    </svg>
  );
}

function Hotspot({
  x,
  y,
  w,
  h,
  active,
  label,
  onSelect,
  empty,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
  label: string;
  onSelect: () => void;
  empty?: boolean;
}) {
  return (
    <g style={{ cursor: "pointer" }} onClick={onSelect} role="button" tabIndex={0} aria-label={label}
       onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        fill={active ? "rgba(255,158,196,0.16)" : empty ? "rgba(255,158,196,0.06)" : "transparent"}
        stroke={active ? "#ff9ec4" : "rgba(255,158,196,0.55)"}
        strokeWidth={active ? 2 : 1.2}
        strokeDasharray={active ? undefined : "3 3"}
      />
      {empty && !active && (
        <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fontSize={14} fill="#ff9ec4">
          +
        </text>
      )}
    </g>
  );
}
