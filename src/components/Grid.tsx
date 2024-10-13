import { useState } from "react";
import { Color } from "./../types";

type GridProps = {
  pixels: Color[][];
  onPixelClick: (row: number, col: number) => void;
};

const Grid = ({ pixels, onPixelClick }: GridProps) => {
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleStart = (row: number, col: number) => {
    setIsMouseDown(true);
    onPixelClick(row, col);
  };

  const handleEnd = () => {
    setIsMouseDown(false);
  };

  const handleMove = (row: number, col: number) => {
    if (isMouseDown) {
      onPixelClick(row, col);
    }
  };

  return (
    <div className="grid">
      {pixels.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((color, colIndex) => (
            <div
              key={colIndex}
              className={`pixel ${color}`}
              onMouseDown={() => handleStart(rowIndex, colIndex)}
              onMouseEnter={() => handleMove(rowIndex, colIndex)}
              onMouseUp={handleEnd}
              onTouchStart={() => handleStart(rowIndex, colIndex)}
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
              data-row={rowIndex}
              data-col={colIndex}
              style={{ touchAction: "none" }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;
