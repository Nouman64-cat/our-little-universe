"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { haptic } from "@/lib/utils";
import type { Star } from "@/lib/stars";
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
  const { stars, status, pending, freshId, addStar, editStar, removeStar, reload } =
    useStars();

  const [selected, setSelected] = useState<Star | null>(null);
  const [compose, setCompose] = useState<Compose>(null);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const strings = copy.hub.stars;
  const count = stars.length;

  const openNew = () => {
    haptic(6);
    setComposeError(null);
    setCompose({ mode: "new" });
  };

  const handleSubmit = async (text: string) => {
    setComposeError(null);
    if (!compose) return;
    if (compose.mode === "new") {
      const star = await addStar(text);
      if (star) setCompose(null);
      else setComposeError(strings.saveError);
    } else {
      const ok = await editStar(compose.star.id, text);
      if (ok) {
        setCompose(null);
        setSelected(null);
      } else {
        setComposeError(strings.saveError);
      }
    }
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
      <p className="mb-4 text-sm text-ink-faint" suppressHydrationWarning>
        {status === "error" ? strings.offline : countLine}
      </p>

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

        {status !== "error" && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={openNew}
              disabled={status === "loading"}
              className="flex h-12 items-center gap-2 rounded-full border border-rose/40 bg-rose/15 px-6 text-sm font-medium text-rose backdrop-blur-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60 disabled:opacity-40"
            >
              <StarShape className="h-5 w-5" color="rose" />
              {strings.write}
            </button>
          </div>
        )}
      </div>

      <StarReveal
        star={selected}
        removing={removing}
        onClose={() => setSelected(null)}
        onEdit={(star) => {
          setComposeError(null);
          setSelected(null);
          setCompose({ mode: "edit", star });
        }}
        onRemove={handleRemove}
      />

      <StarCompose
        open={compose !== null}
        mode={compose?.mode ?? "new"}
        initialText={compose?.mode === "edit" ? compose.star.text : ""}
        pending={pending}
        error={composeError}
        onSubmit={handleSubmit}
        onClose={() => {
          setCompose(null);
          setComposeError(null);
        }}
      />
    </TabScreen>
  );
}
