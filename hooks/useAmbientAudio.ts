"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORE_KEY = "olu:castle:music";

function readPref(): "on" | "off" | null {
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    return v === "on" || v === "off" ? v : null;
  } catch {
    return null;
  }
}

function writePref(value: "on" | "off") {
  try {
    window.localStorage.setItem(STORE_KEY, value);
  } catch {
    // Private mode — the toggle still works for this visit.
  }
}

interface AmbientAudio {
  /** Attach to a rendered `<audio loop>` element. */
  ref: React.RefObject<HTMLAudioElement | null>;
  /** Whether the track is actually playing right now. */
  playing: boolean;
  /** Flip it on/off; remembers the choice for next time. */
  toggle: () => void;
}

/**
 * A looping background track that stops when its component unmounts (so the
 * music only plays on the castle tab). Tries to start on mount unless she
 * turned it off last time; browsers may hold playback until her first tap, in
 * which case the toggle starts it.
 */
export function useAmbientAudio(): AmbientAudio {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const start = useCallback(async () => {
    const el = ref.current;
    if (!el) return false;
    try {
      el.volume = 0.55;
      await el.play();
      setPlaying(true);
      return true;
    } catch {
      setPlaying(false);
      return false;
    }
  }, []);

  const toggle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      writePref("off");
    } else {
      start().then((ok) => {
        if (ok) writePref("on");
      });
    }
  }, [playing, start]);

  useEffect(() => {
    const el = ref.current;
    // Defer a frame so the <audio> element is mounted; playback may still be
    // blocked until her first tap, in which case the toggle starts it.
    const raf = requestAnimationFrame(() => {
      if (readPref() !== "off") start();
    });
    return () => {
      cancelAnimationFrame(raf);
      el?.pause();
      if (el) el.currentTime = 0;
    };
  }, [start]);

  return { ref, playing, toggle };
}
