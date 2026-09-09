"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import { formatMonthDay } from "@/lib/daily";
import type { Star } from "@/lib/stars";
import { StarShape } from "../ui/StarShape";
import { NoteOverlay } from "./ui/NoteOverlay";

interface StarRevealProps {
  star: Star | null;
  removing: boolean;
  onClose: () => void;
  onEdit: (star: Star) => void;
  onRemove: (star: Star) => void;
}

/** Unfold a star: read what's on it, then rewrite it or take it out. */
export function StarReveal({
  star,
  removing,
  onClose,
  onEdit,
  onRemove,
}: StarRevealProps) {
  const strings = copy.hub.stars;

  return (
    <NoteOverlay open={star !== null} onClose={onClose} label={strings.readLabel}>
      {star && (
        <RevealCard
          key={star.id}
          star={star}
          removing={removing}
          onClose={onClose}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      )}
    </NoteOverlay>
  );
}

function RevealCard({
  star,
  removing,
  onClose,
  onEdit,
  onRemove,
}: StarRevealProps & { star: Star }) {
  const reduceMotion = useReducedMotion();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const strings = copy.hub.stars;

  return (
    <div className="rounded-3xl border border-hairline bg-canvas-raised/95 p-7 text-center shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)]">
      <motion.div
        className="mx-auto mb-4 h-16 w-16"
        initial={
          reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -30 }
        }
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, ease: EASE_SOFT }}
      >
        <StarShape className="h-full w-full" color={star.color} />
      </motion.div>

      <p className="mb-2 text-xs uppercase tracking-[0.25em] text-ink-faint">
        {formatMonthDay(star.createdAt.slice(0, 10))}
      </p>
      <p className="whitespace-pre-wrap font-display text-lg leading-relaxed text-ink">
        {star.text}
      </p>

      {confirmRemove ? (
        <div className="mt-6">
          <p className="text-sm text-ink-muted">{strings.confirmRemove}</p>
          <div className="mt-3 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmRemove(false)}
              disabled={removing}
              className="rounded-full border border-hairline px-4 py-2 text-xs text-ink-muted transition-colors hover:text-ink disabled:opacity-50"
            >
              {strings.keep}
            </button>
            <button
              type="button"
              onClick={() => onRemove(star)}
              disabled={removing}
              className="rounded-full bg-rose/90 px-4 py-2 text-xs font-medium text-[#3a1327] transition-opacity disabled:opacity-50"
            >
              {removing ? strings.removing : strings.confirmRemoveCta}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex items-center justify-center gap-4 text-xs">
          <button
            type="button"
            onClick={() => onEdit(star)}
            className="text-rose transition-opacity hover:opacity-80"
          >
            {strings.edit}
          </button>
          <span className="text-ink-faint">·</span>
          <button
            type="button"
            onClick={() => setConfirmRemove(true)}
            className="text-ink-faint transition-colors hover:text-ink-muted"
          >
            {strings.remove}
          </button>
          <span className="text-ink-faint">·</span>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-faint transition-colors hover:text-ink-muted"
          >
            {strings.close}
          </button>
        </div>
      )}
    </div>
  );
}
