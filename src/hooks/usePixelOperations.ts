import { useState } from "react";
import { Color, Size } from "./../types";
import { createInitialPixels } from "./../utils/hexUtils";

const usePixelOperations = () => {
  const [gridSize, setGridSize] = useState<Size>({ width: 16, height: 16 });
  const [selectedColor, setSelectedColor] = useState<Color>("white");
  const [pixels, setPixels] = useState(() => createInitialPixels(gridSize));
  const [undoStack, setUndoStack] = useState<Color[][][]>([]);
  const [redoStack, setRedoStack] = useState<Color[][][]>([]);

  const applyChange = (newPixels: Color[][]) => {
    setRedoStack([]);
    setUndoStack((prevStack) => [...prevStack, pixels]);
    setPixels(newPixels);
  };

  const handlePixelClick = (rowIndex: number, colIndex: number) => {
    const newPixels = pixels.map((row) => row.slice());
    newPixels[rowIndex][colIndex] = selectedColor;
    applyChange(newPixels);
  };

  const undo = () => {
    if (!undoStack.length) return;

    setRedoStack((prevStack) => [...prevStack, pixels]);
    const lastState = undoStack[undoStack.length - 1];
    setPixels(lastState);
    setUndoStack((prevStack) => prevStack.slice(0, prevStack.length - 1));
  };

  const redo = () => {
    if (!redoStack.length) return;

    setUndoStack((prevStack) => [...prevStack, pixels]);
    const nextState = redoStack[redoStack.length - 1];
    setPixels(nextState);
    setRedoStack((prevStack) => prevStack.slice(0, prevStack.length - 1));
  };

  const deleteGridContents = () => {
    applyChange(createInitialPixels(gridSize));
  };

  return {
    gridSize,
    setGridSize,
    selectedColor,
    setSelectedColor,
    pixels,
    setPixels,
    undoStack,
    setUndoStack,
    redoStack,
    setRedoStack,
    applyChange,
    handlePixelClick,
    undo,
    redo,
    deleteGridContents,
  };
};

export default usePixelOperations;
