import {
  Color,
  Size,
  createInitialPixels,
  widths,
  heights,
} from "./../constants/index";

interface GridSizeProps {
  gridSize: Size;
  setGridSize: React.Dispatch<React.SetStateAction<Size>>;
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
          value={gridSize.width}
          onChange={(e) => {
            setGridSize((prev) => ({
              ...prev,
              width: Number(e.target.value),
            }));
            setPixels(
              createInitialPixels({
                width: Number(e.target.value),
                height: gridSize.height,
              })
            );
            clearUndoRedo();
            clearHexValue();
          }}
        >
          {widths.map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </label>
      <label>
        Height:
        <select
          value={gridSize.height}
          onChange={(e) => {
            setGridSize((prev) => ({
              ...prev,
              height: Number(e.target.value),
            }));
            setPixels(
              createInitialPixels({
                width: gridSize.width,
                height: Number(e.target.value),
              })
            );
            clearUndoRedo();
            clearHexValue();
          }}
        >
          {heights.map((num) => (
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
