"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { haptic } from "@/lib/utils";
import type { Star, StarColor } from "@/lib/stars";
import { StarShape } from "../ui/StarShape";
import { StarCompose } from "./StarCompose";
import { StarJar } from "./StarJar";
import { StarReveal } from "./StarReveal";
import { useStars } from "./stars-context";
import { TabScreen } from "./ui/TabScreen";

type Compose = { mode: "new" } | { mode: "edit"; star: Star } | null;

/** The star jar: chuchu writes a note, folds it into a paper star, drops it in. */
export function StarsTab() {
  const reduceMotion = useReducedMotion();
  const {
    stars,
    status,
    freshId,
    suggestedColor,
    addStar,
    commitStar,
    editStar,
    removeStar,
    reload,
  } = useStars();

  const [selected, setSelected] = useState<Star | null>(null);
  const [compose, setCompose] = useState<Compose>(null);
  const [savedStar, setSavedStar] = useState<Star | null>(null);
  const [removing, setRemoving] = useState(false);

  const strings = copy.hub.stars;
  const count = stars.length;

  const openNew = () => {
    haptic(6);
    setCompose({ mode: "new" });
  };

  // Returns success; the compose sheet plays the fold, then calls `handleDone`.
  const handleSubmit = async (text: string, color: StarColor) => {
    if (!compose) return false;
    if (compose.mode === "new") {
      const star = await addStar(text, color);
      if (!star) return false;
      setSavedStar(star);
      return true;
    }
    const ok = await editStar(compose.star.id, text, color);
    if (ok) setSelected(null);
    return ok;
  };

  const handleDone = () => {
    if (savedStar) {
      commitStar(savedStar);
      setSavedStar(null);
      haptic([10, 30]);
    }
    setCompose(null);
  };

  const handleRemove = async (star: Star) => {
    setRemoving(true);
    const ok = await removeStar(star.id);
    setRemoving(false);
    if (ok) setSelected(null);
  };

  const countLine =
    count === 0
      ? strings.first
      : count === 1
        ? strings.oneStar
        : strings.someStars(count);

  return (
    <TabScreen title={strings.title} subtitle={strings.subtitle}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-faint" suppressHydrationWarning>
          {status === "error" ? strings.offline : countLine}
        </p>
        {status !== "error" && (
          <button
            type="button"
            onClick={openNew}
            disabled={status === "loading"}
            aria-label={strings.write}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rose/40 bg-rose/15 text-rose backdrop-blur-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60 disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                d="M12 5v14M5 12h14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="my-auto">
        {status === "error" ? (
          <div className="mx-auto flex max-w-[18rem] flex-col items-center gap-4 py-10 text-center">
            <StarShape className="h-14 w-14 opacity-50" color="petal" />
            <p className="text-sm text-ink-muted">{strings.errorBody}</p>
            <button
              type="button"
              onClick={reload}
              className="rounded-full border border-hairline px-4 py-2 text-xs text-ink-muted transition-colors hover:text-ink"
            >
              {strings.retry}
            </button>
          </div>
        ) : (
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: status === "loading" ? 0.55 : 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <StarJar stars={stars} freshId={freshId} onSelect={setSelected} />
          </motion.div>
        )}
      </div>

      <StarReveal
        star={selected}
        removing={removing}
        onClose={() => setSelected(null)}
        onEdit={(star) => {
          setSelected(null);
          setCompose({ mode: "edit", star });
        }}
        onRemove={handleRemove}
      />

      <StarCompose
        open={compose !== null}
        mode={compose?.mode ?? "new"}
        initialText={compose?.mode === "edit" ? compose.star.text : ""}
        initialColor={
          compose?.mode === "edit" ? compose.star.color : suggestedColor
        }
        onSubmit={handleSubmit}
        onDone={handleDone}
        onClose={() => {
          setCompose(null);
          setSavedStar(null);
        }}
      />
    </TabScreen>
  );
}
