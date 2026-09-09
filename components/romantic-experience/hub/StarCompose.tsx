"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { STAR_MAX_LENGTH } from "@/lib/stars";
import { haptic } from "@/lib/utils";

interface StarComposeProps {
  open: boolean;
  mode: "new" | "edit";
  initialText?: string;
  pending: boolean;
  error?: string | null;
  onSubmit: (text: string) => void;
  onClose: () => void;
}

/**
 * The strip of paper she writes a star on — used both for a new star and for
 * rewriting one. Unlike `NoteOverlay` this never closes on a backdrop tap;
 * losing a half-written note to a stray touch would sting. The inner card
 * mounts fresh each time it opens, so its draft always starts from the right
 * text without a state-syncing effect.
 */
export function StarCompose(props: StarComposeProps) {
  return (
    <AnimatePresence>
      {props.open && <ComposeCard key="card" {...props} />}
    </AnimatePresence>
  );
}

function ComposeCard({
  mode,
  initialText = "",
  pending,
  error,
  onSubmit,
  onClose,
}: StarComposeProps) {
  const reduceMotion = useReducedMotion();
  const [text, setText] = useState(initialText);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const strings = copy.hub.stars;

  useEffect(() => {
    const id = window.setTimeout(() => areaRef.current?.focus(), 120);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, onClose]);

  const trimmed = text.trim();
  const canSubmit = trimmed.length > 0 && !pending;

  const submit = () => {
    if (!canSubmit) return;
    haptic([8, 20, 10]);
    onSubmit(trimmed);
  };

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
      <div className="absolute inset-0 bg-canvas/75 backdrop-blur-sm" />

      <motion.div
        className="relative w-full max-w-xs"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, rotate: -1 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="rounded-2xl border border-hairline bg-[#fdf6ec] p-5 text-[#3a2e26] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
          <p className="mb-2 text-center font-display text-sm italic text-[#7c6a5b]">
            {mode === "new" ? strings.writePrompt : strings.editPrompt}
          </p>

          <textarea
            ref={areaRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, STAR_MAX_LENGTH))}
            rows={4}
            maxLength={STAR_MAX_LENGTH}
            placeholder={strings.placeholder}
            disabled={pending}
            className="w-full resize-none rounded-lg border border-[#e4d7c4] bg-[repeating-linear-gradient(to_bottom,transparent,transparent_27px,#eadfce_27px,#eadfce_28px)] p-3 font-display text-base leading-7 text-[#3a2e26] outline-none placeholder:text-[#b6a690] focus-visible:border-[#d9a6bf] disabled:opacity-60"
          />

          <div className="mt-1 flex items-center justify-between text-[11px] text-[#9a8977]">
            <span aria-live="polite" className="text-rose-bright">
              {error ?? ""}
            </span>
            <span>
              {text.length}/{STAR_MAX_LENGTH}
            </span>
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
              onClick={submit}
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
        </div>
      </motion.div>
    </motion.div>
  );
}
