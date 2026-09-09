"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import {
  STAR_COLORS,
  STAR_COLOR_LABEL,
  STAR_MAX_LENGTH,
  type StarColor,
} from "@/lib/stars";
import { haptic } from "@/lib/utils";
import { StarShape } from "../ui/StarShape";

interface StarComposeProps {
  open: boolean;
  mode: "new" | "edit";
  initialText?: string;
  initialColor?: StarColor;
  /**
   * Persist the star. Resolves `true` on success. For a new star this saves it
   * but does **not** drop it in the jar — the fold-and-drop plays here first,
   * then `onDone` fires and the caller commits it.
   */
  onSubmit: (text: string, color: StarColor) => Promise<boolean>;
  /** Fold-and-drop finished (new) or the edit saved — close and commit. */
  onDone: () => void;
  onClose: () => void;
}

/**
 * The strip of paper she writes a star on — new or a rewrite. Never closes on a
 * backdrop tap (losing a half-written note would sting). The inner card mounts
 * fresh each time it opens, so its draft always starts from the right text.
 */
export function StarCompose(props: StarComposeProps) {
  return (
    <AnimatePresence>
      {props.open && <ComposeCard key="card" {...props} />}
    </AnimatePresence>
  );
}

type Phase = "write" | "folding" | "dropping";

function ComposeCard({
  mode,
  initialText = "",
  initialColor = "petal",
  onSubmit,
  onDone,
  onClose,
}: StarComposeProps) {
  const reduceMotion = useReducedMotion();
  const strings = copy.hub.stars;

  const [text, setText] = useState(initialText);
  const [color, setColor] = useState<StarColor>(initialColor);
  const [phase, setPhase] = useState<Phase>("write");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => areaRef.current?.focus(), 120);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending && phase === "write") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, phase, onClose]);

  const trimmed = text.trim();
  const canSubmit = trimmed.length > 0 && !pending && phase === "write";

  const save = async () => {
    if (!canSubmit) return;
    setError(null);
    setPending(true);
    haptic([8, 20, 10]);
    const ok = await onSubmit(trimmed, color);
    setPending(false);
    if (!ok) {
      setError(strings.saveError);
      return;
    }
    if (reduceMotion || mode === "edit") {
      onDone();
      return;
    }
    setPhase("folding");
  };

  const ceremony = phase !== "write";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "new" ? strings.writeLabel : strings.editLabel}
    >
      <motion.div
        className="absolute inset-0 bg-canvas/75 backdrop-blur-sm"
        animate={{ opacity: phase === "dropping" ? 0 : 1 }}
        transition={{ duration: 0.45 }}
      />

      <AnimatePresence mode="wait">
        {!ceremony ? (
          <motion.div
            key="write"
            className="relative w-full max-w-xs"
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, rotate: -1 }
            }
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="rounded-2xl border border-hairline bg-[#fdf6ec] p-5 text-[#3a2e26] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
              <p className="mb-2 text-center font-display text-sm italic text-[#7c6a5b]">
                {mode === "new" ? strings.writePrompt : strings.editPrompt}
              </p>

              <textarea
                ref={areaRef}
                value={text}
                onChange={(e) =>
                  setText(e.target.value.slice(0, STAR_MAX_LENGTH))
                }
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    save();
                  }
                }}
                rows={4}
                maxLength={STAR_MAX_LENGTH}
                placeholder={strings.placeholder}
                disabled={pending}
                className="w-full resize-none rounded-lg border border-[#e4d7c4] bg-[repeating-linear-gradient(to_bottom,transparent,transparent_27px,#eadfce_27px,#eadfce_28px)] p-3 font-display text-base leading-7 text-[#3a2e26] outline-none placeholder:text-[#b6a690] focus-visible:border-[#d9a6bf] disabled:opacity-60"
              />

              <div className="mt-1 flex items-center justify-between text-[11px] text-[#9a8977]">
                <span aria-live="polite" className="text-[#c2557f]">
                  {error ?? ""}
                </span>
                <span>
                  {text.length}/{STAR_MAX_LENGTH}
                </span>
              </div>

              {/* paper colour */}
              <div className="mt-3">
                <p className="mb-1.5 text-[11px] uppercase tracking-[0.18em] text-[#9a8977]">
                  {strings.paper}
                </p>
                <div className="flex gap-2">
                  {STAR_COLORS.map((c) => {
                    const selected = c === color;
                    return (
                      <button
                        key={c}
                        type="button"
                        aria-label={STAR_COLOR_LABEL[c]}
                        aria-pressed={selected}
                        disabled={pending}
                        onClick={() => {
                          haptic(4);
                          setColor(c);
                        }}
                        className={[
                          "rounded-full p-1 transition-transform",
                          selected
                            ? "scale-110 ring-2 ring-[#d9a6bf]"
                            : "opacity-70 hover:opacity-100",
                        ].join(" ")}
                      >
                        <StarShape className="h-6 w-6" color={c} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={pending}
                  className="flex-1 rounded-full border border-[#e0d3c0] px-4 py-2.5 text-sm text-[#7c6a5b] transition-colors hover:bg-[#f3e9d9] disabled:opacity-50"
                >
                  {strings.cancel}
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={!canSubmit}
                  className="flex-1 rounded-full bg-rose px-4 py-2.5 text-sm font-medium text-[#3a1327] transition-opacity disabled:opacity-40"
                >
                  {pending
                    ? strings.saving
                    : mode === "new"
                      ? strings.fold
                      : strings.save}
                </button>
              </div>

              {mode === "new" && (
                <p className="mt-2 hidden text-center text-[10px] text-[#b6a690] sm:block">
                  {strings.submitHint}
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <FoldCeremony
            key="fold"
            text={trimmed}
            color={color}
            phase={phase}
            onFolded={() => setPhase("dropping")}
            onDropped={onDone}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface FoldCeremonyProps {
  text: string;
  color: StarColor;
  phase: Phase;
  onFolded: () => void;
  onDropped: () => void;
}

/** The strip creases in on itself, becomes a star, then falls toward the jar. */
function FoldCeremony({
  text,
  color,
  phase,
  onFolded,
  onDropped,
}: FoldCeremonyProps) {
  return (
    <div className="pointer-events-none relative flex h-64 w-64 items-center justify-center">
      {phase === "folding" && (
        <>
          <motion.div
            className="absolute flex items-center justify-center overflow-hidden bg-[#fdf6ec] px-2 text-center font-display text-[10px] leading-tight text-[#8a7969] shadow-[0_10px_30px_-8px_rgba(0,0,0,0.5)]"
            initial={{ width: 210, height: 66, rotate: 0, opacity: 1, borderRadius: 8 }}
            animate={{
              width: [210, 150, 88, 58],
              height: [66, 58, 66, 58],
              rotate: [0, -12, 16, 26],
              borderRadius: [8, 12, 20, 34],
              opacity: [1, 1, 0.65, 0],
            }}
            transition={{
              duration: 0.85,
              ease: "easeInOut",
              times: [0, 0.35, 0.7, 1],
            }}
          >
            <span className="line-clamp-3 px-1">{text}</span>
          </motion.div>

          <motion.div
            className="absolute h-24 w-24"
            initial={{ scale: 0.2, opacity: 0, rotate: -150 }}
            animate={{
              scale: [0.2, 0.45, 0.9, 1],
              opacity: [0, 0.25, 0.85, 1],
              rotate: [-150, -70, -18, 0],
            }}
            transition={{
              duration: 0.85,
              ease: "easeOut",
              times: [0, 0.35, 0.7, 1],
            }}
            onAnimationComplete={onFolded}
          >
            <StarShape className="h-full w-full" color={color} />
          </motion.div>
        </>
      )}

      {phase === "dropping" && (
        <motion.div
          className="absolute h-24 w-24"
          initial={{ y: 0, scale: 1, opacity: 1, rotate: 0 }}
          animate={{ y: 520, scale: 0.4, opacity: [1, 1, 0], rotate: 110 }}
          transition={{ duration: 0.6, ease: "easeIn", times: [0, 0.75, 1] }}
          onAnimationComplete={onDropped}
        >
          <StarShape className="h-full w-full" color={color} />
        </motion.div>
      )}
    </div>
  );
}
