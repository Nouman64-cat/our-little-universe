"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { clamp } from "@/lib/utils";

interface Transform {
  scale: number;
  x: number;
  y: number;
}

interface PanZoomOptions {
  minScale?: number;
  maxScale?: number;
  /**
   * Where the `zoomBy` buttons zoom towards, as a fraction of the viewport
   * offset from its centre (0 = centre, 0.3 = 30% below centre). Pinch and
   * wheel still zoom towards the pointer. Default 0.
   */
  anchorY?: number;
  /**
   * A press that never became a drag or pinch — treat it as a tap at these
   * client coordinates (e.g. plant a flower / open a note).
   */
  onTap: (clientX: number, clientY: number) => void;
}

interface PanZoom {
  scale: number;
  /** True while a finger/mouse gesture is in progress (kills the CSS easing). */
  gesturing: boolean;
  /** Spread onto the clipping viewport element (give it `touch-none select-none`). */
  viewportProps: {
    onPointerDown: (event: ReactPointerEvent) => void;
    onPointerMove: (event: ReactPointerEvent) => void;
    onPointerUp: (event: ReactPointerEvent) => void;
    onPointerCancel: (event: ReactPointerEvent) => void;
    onWheel: (event: ReactWheelEvent) => void;
  };
  /** Style for the transformed "world" element inside the viewport. */
  worldStyle: CSSProperties;
  /** Multiply the current zoom, anchored on the viewport centre. */
  zoomBy: (factor: number) => void;
  /** Back to 1×, centred. */
  reset: () => void;
}

const TAP_SLOP = 8; // px of travel still allowed for a press to count as a tap
const TAP_TIME = 500; // ms

/**
 * Pinch / drag / wheel pan-zoom for a single element. State is driven entirely
 * from pointer handlers (no effects); the caller wraps its content in a "world"
 * div carrying `worldStyle` inside a clipping viewport carrying `viewportProps`.
 * A press that doesn't move fires `onTap`, so tap targets keep working at any
 * zoom — read their position from `getBoundingClientRect()`, which already
 * reflects the transform.
 */
export function usePanZoom(
  viewportRef: RefObject<HTMLDivElement | null>,
  { minScale = 1, maxScale = 4, anchorY = 0, onTap }: PanZoomOptions,
): PanZoom {
  const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
  const [gesturing, setGesturing] = useState(false);

  const transformRef = useRef<Transform>(transform);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef<{
    transform: Transform;
    points: { x: number; y: number }[];
    dist: number;
    mid: { x: number; y: number };
    moved: boolean;
    time: number;
  } | null>(null);
  const onTapRef = useRef(onTap);
  useEffect(() => {
    onTapRef.current = onTap;
  }, [onTap]);

  const apply = useCallback((next: Transform) => {
    transformRef.current = next;
    setTransform(next);
  }, []);

  const clampTranslate = useCallback(
    (x: number, y: number, scale: number) => {
      const vp = viewportRef.current;
      const vw = vp?.clientWidth ?? 0;
      const vh = vp?.clientHeight ?? 0;
      const maxX = Math.max(0, ((scale - 1) * vw) / 2);
      const maxY = Math.max(0, ((scale - 1) * vh) / 2);
      return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
    },
    [viewportRef],
  );

  /** (Re)snapshot the gesture from whatever pointers are currently down. */
  const beginGesture = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const rect = vp.getBoundingClientRect();
    const points = [...pointers.current.values()].map((p) => ({ ...p }));
    let dist = 0;
    let mid = { x: 0, y: 0 };
    if (points.length >= 2) {
      dist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      mid = {
        x: (points[0].x + points[1].x) / 2 - rect.left - rect.width / 2,
        y: (points[0].y + points[1].y) / 2 - rect.top - rect.height / 2,
      };
    }
    start.current = {
      transform: transformRef.current,
      points,
      dist,
      mid,
      moved: start.current?.moved ?? false,
      time: start.current?.time ?? Date.now(),
    };
  }, [viewportRef]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent) => {
      const vp = viewportRef.current;
      vp?.setPointerCapture?.(event.pointerId);
      pointers.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      if (pointers.current.size === 1) {
        start.current = null; // fresh press → fresh tap timer
      }
      beginGesture();
      setGesturing(true);
    },
    [beginGesture, viewportRef],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent) => {
      if (!pointers.current.has(event.pointerId) || !start.current) return;
      pointers.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      const snap = start.current;
      const pts = [...pointers.current.values()];
      const vp = viewportRef.current;
      if (!vp) return;

      if (pts.length >= 2 && snap.dist > 0) {
        const rect = vp.getBoundingClientRect();
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const mid = {
          x: (pts[0].x + pts[1].x) / 2 - rect.left - rect.width / 2,
          y: (pts[0].y + pts[1].y) / 2 - rect.top - rect.height / 2,
        };
        const scale = clamp(
          (snap.transform.scale * dist) / snap.dist,
          minScale,
          maxScale,
        );
        const ratio = scale / snap.transform.scale;
        const x = mid.x - (snap.mid.x - snap.transform.x) * ratio;
        const y = mid.y - (snap.mid.y - snap.transform.y) * ratio;
        snap.moved = true;
        apply({ scale, ...clampTranslate(x, y, scale) });
        return;
      }

      // single pointer → pan
      const dx = pts[0].x - snap.points[0].x;
      const dy = pts[0].y - snap.points[0].y;
      if (Math.hypot(dx, dy) > TAP_SLOP) snap.moved = true;
      const { scale } = snap.transform;
      apply({
        scale,
        ...clampTranslate(snap.transform.x + dx, snap.transform.y + dy, scale),
      });
    },
    [apply, clampTranslate, minScale, maxScale, viewportRef],
  );

  const endPointer = useCallback(
    (event: ReactPointerEvent) => {
      const hadOne = pointers.current.size === 1;
      const snap = start.current;
      pointers.current.delete(event.pointerId);
      try {
        viewportRef.current?.releasePointerCapture?.(event.pointerId);
      } catch {
        /* already gone */
      }

      if (pointers.current.size === 0) {
        setGesturing(false);
        if (
          hadOne &&
          snap &&
          !snap.moved &&
          Date.now() - snap.time < TAP_TIME
        ) {
          onTapRef.current(event.clientX, event.clientY);
        }
        // settle any out-of-bounds translate from a clamp race
        const t = transformRef.current;
        apply({ scale: t.scale, ...clampTranslate(t.x, t.y, t.scale) });
        start.current = null;
      } else {
        beginGesture(); // fewer fingers now — rebase the gesture
      }
    },
    [apply, beginGesture, clampTranslate, viewportRef],
  );

  const zoomBy = useCallback(
    (factor: number) => {
      const vh = viewportRef.current?.clientHeight ?? 0;
      const my = vh * anchorY;
      const t = transformRef.current;
      const scale = clamp(t.scale * factor, minScale, maxScale);
      const ratio = scale / t.scale;
      apply({
        scale,
        ...clampTranslate(t.x * ratio, my - (my - t.y) * ratio, scale),
      });
    },
    [apply, clampTranslate, minScale, maxScale, anchorY, viewportRef],
  );

  const reset = useCallback(() => {
    apply({ scale: 1, x: 0, y: 0 });
  }, [apply]);

  const onWheel = useCallback(
    (event: ReactWheelEvent) => {
      const vp = viewportRef.current;
      if (!vp || event.deltaY === 0) return;
      const rect = vp.getBoundingClientRect();
      const m = {
        x: event.clientX - rect.left - rect.width / 2,
        y: event.clientY - rect.top - rect.height / 2,
      };
      const t = transformRef.current;
      const factor = event.deltaY < 0 ? 1.15 : 1 / 1.15;
      const scale = clamp(t.scale * factor, minScale, maxScale);
      const ratio = scale / t.scale;
      apply({
        scale,
        ...clampTranslate(
          m.x - (m.x - t.x) * ratio,
          m.y - (m.y - t.y) * ratio,
          scale,
        ),
      });
    },
    [apply, clampTranslate, minScale, maxScale, viewportRef],
  );

  return {
    scale: transform.scale,
    gesturing,
    viewportProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onWheel,
    },
    worldStyle: {
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
      transformOrigin: "center center",
      transition: gesturing ? "none" : "transform 180ms ease-out",
      willChange: "transform",
    },
    zoomBy,
    reset,
  };
}
