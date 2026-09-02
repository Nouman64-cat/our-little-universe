"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "@/lib/utils";

interface Options {
  /** Fraction (0–1) of the surface that must be cleared to count as revealed. */
  threshold: number;
  /** Fired once when the threshold is first crossed. */
  onReveal: () => void;
}

interface ScratchCanvas {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** 0 → 1 amount of the surface cleared so far. */
  progress: number;
  /** True once `threshold` has been crossed. */
  isRevealed: boolean;
  /** Clears the whole surface immediately (keyboard / accessibility fallback). */
  revealNow: () => void;
}

const BRUSH_RADIUS = 26;
/** Sample stride when measuring cleared area — bigger = cheaper, less precise. */
const SAMPLE_STRIDE = 4;

/**
 * Canvas-backed "scratch to reveal" surface. Handles high-DPI sizing, smooth
 * continuous strokes for touch and mouse, and periodic (not per-move) progress
 * sampling so dragging a finger stays cheap.
 */
export function useScratchCanvas({ threshold, onReveal }: Options): ScratchCanvas {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const isDrawingRef = useRef(false);
  const revealedRef = useRef(false);
  const sampleQueuedRef = useRef(false);
  const onRevealRef = useRef(onReveal);

  const [progress, setProgress] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    onRevealRef.current = onReveal;
  }, [onReveal]);

  const paintCover = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.globalCompositeOperation = "source-over";
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, "#2a1f3d");
    gradient.addColorStop(0.5, "#3a2450");
    gradient.addColorStop(1, "#241a36");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Faint diagonal sheen so the cover reads as a physical foil.
    const sheen = ctx.createLinearGradient(0, h, w, 0);
    sheen.addColorStop(0, "rgba(255,255,255,0)");
    sheen.addColorStop(0.5, "rgba(255,214,236,0.12)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(247,201,221,0.85)";
    ctx.font = `500 ${Math.round(Math.min(w, h) * 0.12)}px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Scratch me ♡", w / 2, h / 2);
  }, []);

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    sizeRef.current = { width: canvas.width, height: canvas.height };

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctxRef.current = ctx;
    paintCover(ctx, rect.width, rect.height);
  }, [paintCover]);

  const measureProgress = useCallback(() => {
    sampleQueuedRef.current = false;
    const ctx = ctxRef.current;
    const { width, height } = sizeRef.current;
    if (!ctx || width === 0 || height === 0) return;

    const { data } = ctx.getImageData(0, 0, width, height);
    let cleared = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * SAMPLE_STRIDE) {
      total += 1;
      if (data[i] === 0) cleared += 1;
    }
    const ratio = total === 0 ? 0 : cleared / total;
    setProgress(ratio);

    if (ratio >= threshold && !revealedRef.current) {
      revealedRef.current = true;
      setIsRevealed(true);
      onRevealRef.current();
    }
  }, [threshold]);

  const queueMeasure = useCallback(() => {
    if (sampleQueuedRef.current) return;
    sampleQueuedRef.current = true;
    requestAnimationFrame(measureProgress);
  }, [measureProgress]);

  const scratchAt = useCallback((x: number, y: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = BRUSH_RADIUS * 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const last = lastPointRef.current;
    if (last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    lastPointRef.current = { x, y };
  }, []);

  const revealNow = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setProgress(1);
    setIsRevealed(true);
    onRevealRef.current();
  }, []);

  // Setup + keep the canvas correctly sized. Re-running wipes strokes, so we
  // only react to genuine size changes and stop once revealed.
  useEffect(() => {
    setup();
    const canvas = canvasRef.current;
    if (!canvas) return;

    let lastW = canvas.getBoundingClientRect().width;
    let lastH = canvas.getBoundingClientRect().height;
    const observer = new ResizeObserver((entries) => {
      if (revealedRef.current) return;
      const box = entries[0]?.contentRect;
      if (!box) return;
      if (Math.abs(box.width - lastW) < 1 && Math.abs(box.height - lastH) < 1) return;
      lastW = box.width;
      lastH = box.height;
      setup();
      lastPointRef.current = null;
      setProgress(0);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [setup]);

  // Pointer handling via native non-passive listeners so we can prevent the
  // page from scrolling mid-stroke on touch devices.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const toLocal = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: clamp(event.clientX - rect.left, 0, rect.width),
        y: clamp(event.clientY - rect.top, 0, rect.height),
      };
    };

    const handleDown = (event: PointerEvent) => {
      if (revealedRef.current) return;
      event.preventDefault();
      isDrawingRef.current = true;
      canvas.setPointerCapture?.(event.pointerId);
      lastPointRef.current = null;
      const { x, y } = toLocal(event);
      scratchAt(x, y);
      queueMeasure();
    };

    const handleMove = (event: PointerEvent) => {
      if (!isDrawingRef.current || revealedRef.current) return;
      event.preventDefault();
      // getCoalescedEvents keeps fast swipes smooth without extra state.
      const points =
        typeof event.getCoalescedEvents === "function"
          ? event.getCoalescedEvents()
          : [event];
      for (const point of points.length ? points : [event]) {
        const rect = canvas.getBoundingClientRect();
        scratchAt(
          clamp(point.clientX - rect.left, 0, rect.width),
          clamp(point.clientY - rect.top, 0, rect.height),
        );
      }
      queueMeasure();
    };

    const handleUp = () => {
      isDrawingRef.current = false;
      lastPointRef.current = null;
      queueMeasure();
    };

    canvas.addEventListener("pointerdown", handleDown);
    canvas.addEventListener("pointermove", handleMove, { passive: false });
    canvas.addEventListener("pointerup", handleUp);
    canvas.addEventListener("pointercancel", handleUp);
    canvas.addEventListener("pointerleave", handleUp);
    return () => {
      canvas.removeEventListener("pointerdown", handleDown);
      canvas.removeEventListener("pointermove", handleMove);
      canvas.removeEventListener("pointerup", handleUp);
      canvas.removeEventListener("pointercancel", handleUp);
      canvas.removeEventListener("pointerleave", handleUp);
    };
  }, [scratchAt, queueMeasure]);

  return { canvasRef, progress, isRevealed, revealNow };
}
