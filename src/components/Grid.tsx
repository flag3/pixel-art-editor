import { usePanZoom } from "../hooks/usePanZoom";
import type { Color } from "../types";
import { getLinePoints, type CellPoint } from "../utils/gridUtils";
import { useCallback, useEffect, useRef } from "react";

interface GridProps {
  pixels: Color[][];
  onPaintCells: (cells: CellPoint[]) => void;
}

export const Grid = ({ pixels, onPaintCells }: GridProps) => {
  // Refs, not state: drawing status never affects render output, and refs
  // can't go stale between rapid touch events.
  const isDrawingRef = useRef(false);
  // Cells of the in-progress stroke. The full stroke is re-sent on every move:
  // mouseenter updates are batched at low priority, so a per-segment paint can
  // read stale pixels and drop earlier segments — the full stroke converges.
  const strokeRef = useRef<CellPoint[]>([]);
  // Touch paint is deferred to the first move (or tap release) so the first
  // finger of a pinch gesture never leaves a stray dot.
  const pendingTouchRef = useRef<CellPoint | null>(null);
  const width = pixels.length;
  const height = pixels[0]?.length ?? 0;

  const handleStart = (row: number, col: number) => {
    isDrawingRef.current = true;
    strokeRef.current = [[row, col]];
    onPaintCells([[row, col]]);
  };

  const handleEnd = useCallback(() => {
    isDrawingRef.current = false;
    strokeRef.current = [];
    pendingTouchRef.current = null;
  }, []);

  const { containerRef, contentRef, handlers, reset } = usePanZoom({
    cols: width,
    // A second finger means pan/zoom, not drawing — drop the current stroke
    onGestureStart: handleEnd,
  });

  useEffect(() => {
    reset();
  }, [width, height, reset]);

  const handleMove = (row: number, col: number) => {
    if (!isDrawingRef.current) return;

    const stroke = strokeRef.current;
    const lastCell = stroke[stroke.length - 1];
    if (lastCell && lastCell[0] === row && lastCell[1] === col) return;

    // Interpolate from the previously painted cell so fast drags leave no gaps
    const segment = lastCell
      ? getLinePoints(lastCell[0], lastCell[1], row, col).slice(1)
      : [[row, col] as CellPoint];
    strokeRef.current = [...stroke, ...segment];
    onPaintCells(strokeRef.current);
  };

  useEffect(() => {
    const events = ["mouseup", "touchend", "touchcancel"] as const;
    events.forEach((type) => window.addEventListener(type, handleEnd));
    return () => {
      events.forEach((type) => window.removeEventListener(type, handleEnd));
    };
  }, [handleEnd]);

  return (
    <div ref={containerRef} className="grid-viewport" {...handlers}>
      <div
        ref={contentRef}
        className="grid"
        style={{ "--grid-cols": width, "--grid-rows": height } as React.CSSProperties}
      >
        {Array.from({ length: height }, (_, yIndex) => (
          <div key={yIndex} className="row">
            {Array.from({ length: width }, (_, xIndex) => {
              const color = pixels[xIndex][yIndex];
              return (
                <button
                  type="button"
                  key={xIndex}
                  className={`pixel ${color}`}
                  onMouseDown={() => handleStart(xIndex, yIndex)}
                  onMouseEnter={() => handleMove(xIndex, yIndex)}
                  onTouchStart={(e) => {
                    // A multi-touch start is a pan/zoom gesture, not a new stroke
                    if (e.touches.length > 1) return;
                    pendingTouchRef.current = [xIndex, yIndex];
                  }}
                  onTouchMove={(e) => {
                    if (e.touches.length > 1) return;
                    const pending = pendingTouchRef.current;
                    if (pending) {
                      pendingTouchRef.current = null;
                      handleStart(pending[0], pending[1]);
                    }
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (element && element.classList.contains("pixel")) {
                      const row = parseInt(element.getAttribute("data-row")!, 10);
                      const col = parseInt(element.getAttribute("data-col")!, 10);
                      handleMove(row, col);
                    }
                  }}
                  onTouchEnd={() => {
                    // A tap that never moved paints its single cell on release
                    const pending = pendingTouchRef.current;
                    if (pending) {
                      pendingTouchRef.current = null;
                      onPaintCells([pending]);
                    }
                  }}
                  onKeyDown={(e) => {
                    // preventDefault suppresses the native click activation, so
                    // onPaintCells fires once per key press (no duplicate undo entry)
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onPaintCells([[xIndex, yIndex]]);
                    }
                  }}
                  aria-label={`Pixel row ${yIndex + 1}, column ${xIndex + 1}`}
                  data-row={xIndex}
                  data-col={yIndex}
                ></button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
