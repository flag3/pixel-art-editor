import { Color } from "./../types";

type GridProps = {
  pixels: Color[][];
  onPixelClick: (row: number, col: number) => void;
};

const Grid = ({ pixels, onPixelClick }: GridProps) => {
  return (
    <div className="grid">
      {pixels.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((color, colIndex) => (
            <div
              key={colIndex}
              className={`pixel ${color}`}
              onClick={() => onPixelClick(rowIndex, colIndex)}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;
