"use client";

import type { ReactNode } from "react";
import {
  FENCE_OPTIONS,
  GATE_OPTIONS,
  PATH_OPTIONS,
  type FenceStyle,
  type GardenDecor,
  type GardenPart,
  type GateStyle,
  type PathStyle,
} from "@/lib/garden-decor";
import { FenceRun, GateArt, PathRun } from "../garden-decor";
import { useGardenDecor } from "./garden-context";

/** The tray of style choices for whichever garden piece she tapped. */
export function GardenEditor({
  part,
  decor,
}: {
  part: GardenPart;
  decor: GardenDecor;
}) {
  const { setFence, setGate, setPath } = useGardenDecor();

  if (part === "fence") {
    return (
      <Section title="fence">
        <TileRow
          options={FENCE_OPTIONS}
          current={decor.fence}
          onPick={(id) => setFence(id as FenceStyle)}
          preview={(id) =>
            id === "none" ? (
              <Empty />
            ) : (
              <div className="flex h-full w-full items-end">
                <FenceRun variant={id as Exclude<FenceStyle, "none">} />
              </div>
            )
          }
        />
      </Section>
    );
  }

  if (part === "gate") {
    return (
      <Section title="gate">
        <TileRow
          options={GATE_OPTIONS}
          current={decor.gate}
          onPick={(id) => setGate(id as GateStyle)}
          preview={(id) =>
            id === "none" ? (
              <Empty label="open" />
            ) : (
              <GateArt
                variant={id as Exclude<GateStyle, "none">}
                className="h-full w-full"
              />
            )
          }
        />
      </Section>
    );
  }

  return (
    <Section title="path">
      <TileRow
        options={PATH_OPTIONS}
        current={decor.path}
        onPick={(id) => setPath(id as PathStyle)}
        preview={(id) =>
          id === "none" ? (
            <Empty />
          ) : (
            <div className="h-full w-8 overflow-hidden rounded-[3px]">
              <PathRun variant={id as Exclude<PathStyle, "none">} />
            </div>
          )
        }
      />
    </Section>
  );
}

// ── building blocks (kept local; the house editor's are not exported) ────────

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-medium capitalize text-ink">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Empty({ label = "none" }: { label?: string }) {
  return (
    <span className="text-[11px] uppercase tracking-[0.15em] text-ink-faint">
      {label}
    </span>
  );
}

function TileRow<T extends { id: string; label: string }>({
  options,
  current,
  onPick,
  preview,
}: {
  options: readonly T[];
  current: string;
  onPick: (id: string) => void;
  preview: (id: string) => ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onPick(o.id)}
          aria-pressed={current === o.id}
          aria-label={o.label}
          className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60 ${
            current === o.id
              ? "border-rose bg-rose/10"
              : "border-hairline hover:bg-surface"
          }`}
        >
          <span className="flex h-14 w-full items-center justify-center overflow-hidden">
            {preview(o.id)}
          </span>
          <span className="truncate text-[10px] text-ink-faint">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
