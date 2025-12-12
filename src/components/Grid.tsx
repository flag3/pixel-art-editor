import { GridProps } from "../types";
import { useEffect, useState, useCallback } from "react";

export const Grid = ({ pixels, onPixelClick }: GridProps) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const width = pixels.length;
  const height = pixels[0]?.length ?? 0;

  const handleStart = useCallback(
    (row: number, col: number) => {
      setIsMouseDown(true);
      onPixelClick(row, col);
    },
    [onPixelClick],
  );

  const handleEnd = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  const handleMove = useCallback(
    (row: number, col: number) => {
      if (isMouseDown) {
        onPixelClick(row, col);
      }
    },
    [isMouseDown, onPixelClick],
  );

  useEffect(() => {
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [handleEnd]);

  return (
    <div className="grid">
      {Array.from({ length: height }, (_, yIndex) => (
        <div key={yIndex} className="row">
          {Array.from({ length: width }, (_, xIndex) => {
            const color = pixels[xIndex][yIndex];
            return (
              <div
                key={xIndex}
                className={`pixel ${color}`}
                onMouseDown={() => handleStart(xIndex, yIndex)}
                onMouseEnter={() => handleMove(xIndex, yIndex)}
                onMouseUp={handleEnd}
                onTouchStart={() => handleStart(xIndex, yIndex)}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const element = document.elementFromPoint(
                    touch.clientX,
                    touch.clientY,
                  );
                  if (element && element.classList.contains("pixel")) {
                    const row = parseInt(element.getAttribute("data-row")!, 10);
                    const col = parseInt(element.getAttribute("data-col")!, 10);
                    handleMove(row, col);
                  }
                }}
                onTouchEnd={handleEnd}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPixelClick(xIndex, yIndex);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Pixel row ${yIndex + 1}, column ${xIndex + 1}`}
                data-row={xIndex}
                data-col={yIndex}
                style={{ touchAction: "none" }}
              ></div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
