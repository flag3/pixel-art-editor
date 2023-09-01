import {
  Color,
  createInitialPixels,
  possibleCols,
  possibleRows,
} from "./../constants/index";

interface GridSizeProps {
  gridSize: { rows: number; cols: number };
  setGridSize: React.Dispatch<
    React.SetStateAction<{ rows: number; cols: number }>
  >;
  setPixels: React.Dispatch<React.SetStateAction<Color[][]>>;
  clearUndoRedo: () => void;
  clearHexValue: () => void;
}

const GridSize = ({
  gridSize,
  setGridSize,
  setPixels,
  clearUndoRedo,
  clearHexValue,
}: GridSizeProps) => {
  return (
    <div className="grid-size-selector">
      <label>
        Width:
        <select
          value={gridSize.cols}
          onChange={(e) => {
            setGridSize((prev) => ({
              ...prev,
              cols: Number(e.target.value),
            }));
            setPixels(
              createInitialPixels(gridSize.rows, Number(e.target.value))
            );
            clearUndoRedo();
            clearHexValue();
          }}
        >
          {possibleCols.map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </label>
      <label>
        Height:
        <select
          value={gridSize.rows}
          onChange={(e) => {
            setGridSize((prev) => ({
              ...prev,
              rows: Number(e.target.value),
            }));
            setPixels(
              createInitialPixels(Number(e.target.value), gridSize.cols)
            );
            clearUndoRedo();
            clearHexValue();
          }}
        >
          {possibleRows.map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default GridSize;
