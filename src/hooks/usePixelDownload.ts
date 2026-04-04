import { useCallback } from "react";
import type { Color } from "../types";
import { DOWNLOAD_CONFIG } from "../constants/config";

export const usePixelDownload = (pixels: Color[][]) => {
  const handleFileDownload = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = pixels.length * DOWNLOAD_CONFIG.CANVAS_SCALE;
    canvas.height = pixels[0].length * DOWNLOAD_CONFIG.CANVAS_SCALE;
    const ctx = canvas.getContext("2d")!;

    const computedStyle = getComputedStyle(document.documentElement);

    pixels.forEach((row, rowIndex) => {
      row.forEach((color, colIndex) => {
        ctx.fillStyle = computedStyle.getPropertyValue(`--${color}`);
        ctx.fillRect(
          rowIndex * DOWNLOAD_CONFIG.CANVAS_SCALE,
          colIndex * DOWNLOAD_CONFIG.CANVAS_SCALE,
          DOWNLOAD_CONFIG.CANVAS_SCALE,
          DOWNLOAD_CONFIG.CANVAS_SCALE,
        );
      });
    });

    const dataURL = canvas.toDataURL();
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = DOWNLOAD_CONFIG.DEFAULT_FILENAME;
    link.click();
  }, [pixels]);

  return { handleFileDownload };
};
