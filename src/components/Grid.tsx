import type { Color } from "../types";
import { useEffect, useState } from "react";

interface GridProps {
  pixels: Color[][];
  onPixelClick: (row: number, col: number) => void;
}

export const Grid = ({ pixels, onPixelClick }: GridProps) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const width = pixels.length;
  const height = pixels[0]?.length ?? 0;

  const handleStart = (row: number, col: number) => {
    setIsMouseDown(true);
    onPixelClick(row, col);
  };

  const handleEnd = () => setIsMouseDown(false);

  const handleMove = (row: number, col: number) => {
    if (isMouseDown) {
      onPixelClick(row, col);
    }
  };

  useEffect(() => {
    const end = () => setIsMouseDown(false);
    window.addEventListener("mouseup", end);
    window.addEventListener("touchend", end);

    return () => {
      window.removeEventListener("mouseup", end);
      window.removeEventListener("touchend", end);
    };
  }, []);

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
                  const element = document.elementFromPoint(touch.clientX, touch.clientY);
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
