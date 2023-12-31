import { Color, ColorMode, Size } from "./../types";
import { getClosestColor } from "./../utils/colorUtils";

type useFileOperationsProps = {
  colorMode: ColorMode;
  gridSize: Size;
  pixels: Color[][];
  applyChange: (pixels: Color[][]) => void;
};

const useFileOperations = ({
  colorMode,
  gridSize,
  pixels,
  applyChange,
}: useFileOperationsProps) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      alert("Failed to read the image.");
    };

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== gridSize.width || img.height !== gridSize.height) {
          alert(`Please upload a ${gridSize.width}x${gridSize.height} image.`);
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = gridSize.width;
        canvas.height = gridSize.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, gridSize.width, gridSize.height);

        const newPixels: Color[][] = [];
        for (let x = 0; x < gridSize.width; x++) {
          const row: Color[] = [];
          for (let y = 0; y < gridSize.height; y++) {
            const pixelData = ctx.getImageData(x, y, 1, 1).data;
            row.push(
              getClosestColor(
                pixelData[0],
                pixelData[1],
                pixelData[2],
                colorMode,
              ),
            );
          }
          newPixels.push(row);
        }

        applyChange(newPixels);
      };
      img.src = (e.target! as FileReader).result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleFileDownload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = pixels.length;
    canvas.height = pixels[0].length;
    const ctx = canvas.getContext("2d")!;

    const computedStyle = getComputedStyle(document.documentElement);

    pixels.forEach((row, rowIndex) => {
      row.forEach((color, colIndex) => {
        ctx.fillStyle = computedStyle.getPropertyValue(`--${color}`);
        ctx.fillRect(rowIndex, colIndex, 1, 1);
      });
    });

    const dataURL = canvas.toDataURL();
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "pixel-art.png";
    link.click();
  };

  return { handleFileUpload, handleFileDownload };
};

export default useFileOperations;
