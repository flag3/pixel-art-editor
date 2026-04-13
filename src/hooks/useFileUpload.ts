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
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onError("Please upload an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      onError("Failed to read the image.");
    };

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = gridSize.width;
        canvas.height = gridSize.height;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, gridSize.width, gridSize.height);

        const newPixels: Color[][] = [];
        for (let x = 0; x < gridSize.width; x++) {
          const row: Color[] = [];
          for (let y = 0; y < gridSize.height; y++) {
            const pixelData = ctx.getImageData(x, y, 1, 1).data;
            row.push(getClosestColor(pixelData[0], pixelData[1], pixelData[2], colorMode));
          }
          newPixels.push(row);
        }

        applyChange(newPixels);
      };
      img.src = (e.target! as FileReader).result as string;
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return { inputRef, handleClick, handleChange };
};
