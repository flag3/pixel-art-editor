import { Color } from "./../constants/index";

type GridProps = {
  pixels: Color[][];
  handlePixelClick: (row: number, col: number) => void;
};

const Grid = ({ pixels, handlePixelClick }: GridProps) => {
  return (
    <div className="grid">
      {pixels.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((color, colIndex) => (
            <div
              key={colIndex}
              className={`pixel ${color}`}
              onClick={() => handlePixelClick(rowIndex, colIndex)}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;
