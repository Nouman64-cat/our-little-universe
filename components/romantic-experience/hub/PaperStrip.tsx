"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { STAR_PAPER, type StarColor } from "@/lib/stars";

interface PaperStripProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  /** Faint wash of the chosen paper colour. */
  color: StarColor;
  maxLength: number;
  disabled?: boolean;
}

/**
 * Writing on a strip of paper. One long line: as she types, the paper feeds
 * sideways so the pen-tip (caret) stays dead centre, text scrolling off softly
 * at both edges. A hidden mirror `<span>` in the real font gives us the exact
 * width up to the caret without guessing.
 */
export function PaperStrip({
  value,
  onValueChange,
  onSubmit,
  placeholder,
  color,
  maxLength,
  disabled,
}: PaperStripProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const [caretPx, setCaretPx] = useState(0);
  const [focused, setFocused] = useState(false);

  const recalc = useCallback((text: string, caret: number) => {
    const mirror = mirrorRef.current;
    if (!mirror) return;
    mirror.textContent = text.slice(0, Math.max(0, caret)) || "";
    setCaretPx(mirror.offsetWidth);
  }, []);

  // First measure (and after an external value change, e.g. opening to edit).
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const el = inputRef.current;
      recalc(value, el?.selectionStart ?? value.length);
    });
    return () => cancelAnimationFrame(raf);
  }, [value, recalc]);

  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(id);
  }, []);

  const sync = (el: HTMLInputElement) => recalc(el.value, el.selectionStart ?? el.value.length);

  const textClass =
    "font-display italic text-[20px] leading-none tracking-normal whitespace-pre";

  return (
    <div
      className="relative -mx-5 h-[68px] select-none border-y border-[#e7d9c3] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-10px_18px_-14px_rgba(0,0,0,0.25)]"
      style={{
        background: `color-mix(in srgb, ${STAR_PAPER[color]} 9%, #fdf6ec)`,
        WebkitMaskImage:
          "linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)",
      }}
      onMouseDown={(e) => {
        // Keep focus on the input wherever she taps the strip.
        if (e.target !== inputRef.current) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }}
    >
      {/* baseline she writes along */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px translate-y-[13px] bg-[#d8c4a8]" />
      {/* centre feed marks */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-1.5 w-px -translate-x-1/2 bg-[#c9b492]" />
      <div className="pointer-events-none absolute left-1/2 bottom-0 h-1.5 w-px -translate-x-1/2 bg-[#c9b492]" />

      {/* the moving text */}
      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 text-[#3a2e26] ${textClass}`}
        style={{
          transform: `translate(${-caretPx}px, -50%)`,
          transition: "transform 130ms ease-out",
        }}
      >
        {value}
      </div>

      {/* pen-tip, pinned to centre */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[26px] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-[#c2557f]"
        style={{
          animation: "olu-caret-blink 1.1s step-end infinite",
          opacity: focused ? undefined : 0,
        }}
      />

      {/* placeholder while empty */}
      {value === "" && (
        <span
          className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pl-3 text-[#b6a690] ${textClass}`}
        >
          {placeholder}
        </span>
      )}

      {/* the real (transparent) input: owns the caret position + keyboard */}
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        enterKeyHint="done"
        maxLength={maxLength}
        disabled={disabled}
        value={value}
        onChange={(e) => {
          onValueChange(e.target.value);
          sync(e.currentTarget);
        }}
        onSelect={(e) => sync(e.currentTarget)}
        onKeyUp={(e) => sync(e.currentTarget)}
        onClick={(e) => sync(e.currentTarget)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        className="absolute inset-0 h-full w-full bg-transparent text-center text-transparent caret-transparent outline-none"
        style={{ fontSize: 16 }}
      />

      {/* hidden mirror for exact caret measurement */}
      <span
        ref={mirrorRef}
        aria-hidden
        className={`invisible absolute left-0 top-0 ${textClass}`}
      />
    </div>
  );
}
