import {
  clampViewTransform,
  pinchViewTransform,
  type PinchSample,
  type ViewTransform,
} from "../utils/gridUtils";
import { useCallback, useEffect, useRef } from "react";

const IDENTITY: ViewTransform = { scale: 1, tx: 0, ty: 0 };
const MAX_CELL_PX = 64;
const WHEEL_ZOOM_SENSITIVITY = 0.01;

interface UsePanZoomOptions {
  /** Number of grid columns, used to cap zoom at a comfortable cell size */
  cols: number;
  /** Called when a two-finger gesture begins so the caller can cancel drawing */
  onGestureStart: () => void;
}

interface PanZoomHandlers {
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchMove: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
  onTouchCancel: (event: React.TouchEvent) => void;
}

interface PanZoom {
  containerRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  handlers: PanZoomHandlers;
  reset: () => void;
}

const measurePinch = (touches: React.TouchList, container: HTMLElement): PinchSample => {
  const rect = container.getBoundingClientRect();
  const [a, b] = [touches[0], touches[1]];
  return {
    dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
    midX: (a.clientX + b.clientX) / 2 - rect.left,
    midY: (a.clientY + b.clientY) / 2 - rect.top,
  };
};

/**
 * Two-finger pan/pinch-zoom for a fixed viewport over transformable content.
 * The transform lives in refs and is written straight to the DOM so gesture
 * frames never re-render the (potentially huge) grid.
 */
export const usePanZoom = ({ cols, onGestureStart }: UsePanZoomOptions): PanZoom => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const transformRef = useRef<ViewTransform>(IDENTITY);
  const pinchRef = useRef<PinchSample | null>(null);

  const setTransform = useCallback(
    (next: ViewTransform) => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;

      const contentW = content.offsetWidth;
      const contentH = content.offsetHeight;
      const maxScale = contentW > 0 ? (MAX_CELL_PX * cols) / contentW : 1;
      transformRef.current = clampViewTransform(
        next,
        { viewW: container.clientWidth, viewH: container.clientHeight, contentW, contentH },
        maxScale,
      );

      const { scale, tx, ty } = transformRef.current;
      content.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    },
    [cols],
  );

  const reset = useCallback(() => setTransform(IDENTITY), [setTransform]);

  const onTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (event.touches.length !== 2 || !containerRef.current) return;
      onGestureStart();
      pinchRef.current = measurePinch(event.touches, containerRef.current);
    },
    [onGestureStart],
  );

  const onTouchMove = useCallback(
    (event: React.TouchEvent) => {
      const from = pinchRef.current;
      if (event.touches.length !== 2 || !from || !containerRef.current) return;
      const to = measurePinch(event.touches, containerRef.current);
      if (from.dist === 0) return;
      pinchRef.current = to;
      setTransform(pinchViewTransform(transformRef.current, from, to));
    },
    [setTransform],
  );

  const onTouchEnd = useCallback((event: React.TouchEvent) => {
    if (event.touches.length < 2) {
      pinchRef.current = null;
    }
  }, []);

  // Desktop: ctrl/cmd + wheel (trackpad pinch) zooms about the cursor,
  // plain wheel pans while zoomed in. Native listener because React's
  // wheel events are passive and cannot preventDefault browser zoom.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (event: WheelEvent) => {
      const current = transformRef.current;
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        const rect = container.getBoundingClientRect();
        const mx = event.clientX - rect.left;
        const my = event.clientY - rect.top;
        const scale = current.scale * Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY);
        const ratio = scale / current.scale;
        setTransform({
          scale,
          tx: mx - (mx - current.tx) * ratio,
          ty: my - (my - current.ty) * ratio,
        });
      } else if (current.scale > 1) {
        event.preventDefault();
        setTransform({ ...current, tx: current.tx - event.deltaX, ty: current.ty - event.deltaY });
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [setTransform]);

  return {
    containerRef,
    contentRef,
    handlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd },
    reset,
  };
};
