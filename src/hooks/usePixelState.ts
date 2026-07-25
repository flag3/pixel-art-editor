import type { Color, Size } from "../types";
import { createInitialPixels } from "../utils/hexUtils";
import { useState, useCallback } from "react";

export interface PixelState {
  pixels: Color[][];
  applyChange: (newPixels: Color[][]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const isSamePixels = (a: Color[][], b: Color[][]): boolean =>
  a.length === b.length &&
  a[0]?.length === b[0]?.length &&
  a.every((column, x) => column.every((color, y) => color === b[x][y]));

export const usePixelState = (initialSize: Size): PixelState => {
  const [pixels, setPixels] = useState(() => createInitialPixels(initialSize));
  const [undoStack, setUndoStack] = useState<Color[][][]>([]);
  const [redoStack, setRedoStack] = useState<Color[][][]>([]);

  const applyChange = useCallback(
    (newPixels: Color[][]) => {
      if (isSamePixels(pixels, newPixels)) return;

      setRedoStack([]);
      setUndoStack((prevStack) => [...prevStack, pixels]);
      setPixels(newPixels);
    },
    [pixels],
  );

  const undo = useCallback(() => {
    if (!undoStack.length) return;

    setRedoStack((prevStack) => [...prevStack, pixels]);
    const lastState = undoStack[undoStack.length - 1];
    setPixels(lastState);
    setUndoStack((prevStack) => prevStack.slice(0, prevStack.length - 1));
  }, [undoStack, pixels]);

  const redo = useCallback(() => {
    if (!redoStack.length) return;

    setUndoStack((prevStack) => [...prevStack, pixels]);
    const nextState = redoStack[redoStack.length - 1];
    setPixels(nextState);
    setRedoStack((prevStack) => prevStack.slice(0, prevStack.length - 1));
  }, [redoStack, pixels]);

  return {
    pixels,
    applyChange,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
};
