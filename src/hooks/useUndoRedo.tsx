import { useState } from "react";
import { Color, Size, createInitialPixels } from "./../constants/index";

export const useUndoRedo = () => {
  const [gridSize, setGridSize] = useState<Size>({ width: 16, height: 16 });
  const [pixels, setPixels] = useState(() => createInitialPixels(gridSize));
  const [undoStack, setUndoStack] = useState<Color[][][]>([]);
  const [redoStack, setRedoStack] = useState<Color[][][]>([]);

  const applyChange = (newPixels: Color[][]) => {
    setRedoStack([]);
    setUndoStack((prevStack) => [...prevStack, pixels]);
    setPixels(newPixels);
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

  const clearUndoRedo = () => {
    setUndoStack([]);
    setRedoStack([]);
  };

  return {
    gridSize,
    setGridSize,
    pixels,
    setPixels,
    undoStack,
    redoStack,
    clearUndoRedo,
    applyChange,
    undo,
    redo,
  };
};
