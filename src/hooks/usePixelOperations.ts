import { useState } from "react";
import { Color, ColorMode, Size } from "./../types";
import { createInitialPixels } from "./../utils/hexUtils";

type usePixelOperationsProps = {
  selectedColor: Color;
  setHexValue: React.Dispatch<React.SetStateAction<string>>;
};

const usePixelOperations = ({
  selectedColor,
  setHexValue,
}: usePixelOperationsProps) => {
  const [colorMode, setColorMode] = useState<ColorMode>("fourColors");
  const [gridSize, setGridSize] = useState<Size>({ width: 16, height: 16 });
  const [pixels, setPixels] = useState(() => createInitialPixels(gridSize));
  const [undoStack, setUndoStack] = useState<Color[][][]>([]);
  const [redoStack, setRedoStack] = useState<Color[][][]>([]);

  const handleColorModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setColorMode(event.target.value as ColorMode);
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGridSize((prev) => ({ ...prev, width: Number(e.target.value) }));
    setPixels(
      createInitialPixels({
        width: Number(e.target.value),
        height: gridSize.height,
      }),
    );
    setUndoStack([]);
    setRedoStack([]);
    () => setHexValue("");
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGridSize((prev) => ({ ...prev, height: Number(e.target.value) }));
    setPixels(
      createInitialPixels({
        width: gridSize.width,
        height: Number(e.target.value),
      }),
    );
    setUndoStack([]);
    setRedoStack([]);
    () => setHexValue("");
  };

  const applyChange = (newPixels: Color[][]) => {
    const isSameAsPrevious =
      JSON.stringify(pixels) === JSON.stringify(newPixels);
    if (isSameAsPrevious) return;
    setRedoStack([]);
    setUndoStack((prevStack) => [...prevStack, pixels]);
    setPixels(newPixels);
  };

  const handlePixelClick = (rowIndex: number, colIndex: number) => {
    const newPixels = pixels.map((row) => row.slice());
    newPixels[rowIndex][colIndex] = selectedColor;
    applyChange(newPixels);
  };

  const handlePixelUndo = () => {
    if (!undoStack.length) return;

    setRedoStack((prevStack) => [...prevStack, pixels]);
    const lastState = undoStack[undoStack.length - 1];
    setPixels(lastState);
    setUndoStack((prevStack) => prevStack.slice(0, prevStack.length - 1));
  };

  const handlePixelRedo = () => {
    if (!redoStack.length) return;

    setUndoStack((prevStack) => [...prevStack, pixels]);
    const nextState = redoStack[redoStack.length - 1];
    setPixels(nextState);
    setRedoStack((prevStack) => prevStack.slice(0, prevStack.length - 1));
  };

  const handlePixelDelete = () => {
    applyChange(createInitialPixels(gridSize));
  };

  return {
    colorMode,
    gridSize,
    pixels,
    undoStack,
    redoStack,
    applyChange,
    handleColorModeChange,
    handleWidthChange,
    handleHeightChange,
    handlePixelClick,
    handlePixelUndo,
    handlePixelRedo,
    handlePixelDelete,
  };
};

export default usePixelOperations;
