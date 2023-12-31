import { Color, Size } from "./../types";
import { createInitialPixels } from "./../utils/hexUtils";

const widths = Array.from({ length: 20 }, (_, i) => 8 * (i + 1));
const heights = Array.from({ length: 18 }, (_, i) => 8 * (i + 1));

type GridSizeSelectorProps = {
  gridSize: Size;
  setGridSize: React.Dispatch<React.SetStateAction<Size>>;
  setHexValue: React.Dispatch<React.SetStateAction<string>>;
  setPixels: React.Dispatch<React.SetStateAction<Color[][]>>;
  setUndoStack: React.Dispatch<React.SetStateAction<Color[][][]>>;
  setRedoStack: React.Dispatch<React.SetStateAction<Color[][][]>>;
};

const GridSizeSelector = ({
  gridSize,
  setGridSize,
  setHexValue,
  setPixels,
  setUndoStack,
  setRedoStack,
}: GridSizeSelectorProps) => {
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
              }),
            );
            setUndoStack([]);
            setRedoStack([]);
            () => setHexValue("");
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
              }),
            );
            setUndoStack([]);
            setRedoStack([]);
            () => setHexValue("");
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

export default GridSizeSelector;
