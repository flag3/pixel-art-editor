import { useCallback } from "react";
import type { Color } from "../types";
import { readColorStyles } from "../utils/colorUtils";

export const usePixelDownload = (pixels: Color[][]) => {
  const handleFileDownload = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = pixels.length;
    canvas.height = pixels[0].length;
    const ctx = canvas.getContext("2d")!;

    const styles = readColorStyles();

    pixels.forEach((column, x) => {
      column.forEach((color, y) => {
        ctx.fillStyle = styles[color];
        ctx.fillRect(x, y, 1, 1);
      });
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL();
    link.download = "pixel-art.png";
    link.click();
  }, [pixels]);

  return { handleFileDownload };
};
