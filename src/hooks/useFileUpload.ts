import { useRef } from "react";
import type { Color, ColorMode, Size } from "../types";
import { getClosestColor } from "../utils/colorUtils";

interface UseFileUploadProps {
  colorMode: ColorMode;
  gridSize: Size;
  applyChange: (newPixels: Color[][]) => void;
  onError: (message: string) => void;
}

export const useFileUpload = ({
  colorMode,
  gridSize,
  applyChange,
  onError,
}: UseFileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onError("Please upload an image file.");
      return;
    }

    const img = new Image();
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      onError("Failed to read the image.");
    };
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement("canvas");
      canvas.width = gridSize.width;
      canvas.height = gridSize.height;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, gridSize.width, gridSize.height);

      const { data } = ctx.getImageData(0, 0, gridSize.width, gridSize.height);
      const newPixels: Color[][] = Array.from({ length: gridSize.width }, (_, x) =>
        Array.from({ length: gridSize.height }, (_, y) => {
          const offset = (y * gridSize.width + x) * 4;
          return getClosestColor(data[offset], data[offset + 1], data[offset + 2], colorMode);
        }),
      );

      applyChange(newPixels);
    };
    img.src = URL.createObjectURL(file);
    event.target.value = "";
  };

  return { inputRef, handleClick, handleChange };
};
