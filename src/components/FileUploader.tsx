import { Color, ColorMode, Size } from "./../types";
import { getClosestColor } from "./../utils/colorUtils";

type FileUploaderProps = {
  colorMode: ColorMode;
  gridSize: Size;
  applyChange: (pixels: Color[][]) => void;
};

export const FileUploader = ({
  colorMode,
  gridSize,
  applyChange,
}: FileUploaderProps) => {
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

  return (
    <div className="file-upload-wrapper">
      <input
        type="file"
        id="fileInput"
        className="hidden-input"
        onChange={handleFileUpload}
      />
      <button onClick={() => document.getElementById("fileInput")!.click()}>
        <span className="material-icons-outlined">upload</span>
      </button>
    </div>
  );
}
