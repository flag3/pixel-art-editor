import { Color, Size, colors } from "./../constants/index";

export const exportToImage = (pixels: Color[][]) => {
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

export const importFromImage = (
  event: React.ChangeEvent<HTMLInputElement>,
  size: Size,
  callback: (pixels: Color[][]) => void
) => {
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
      if (img.width !== size.width || img.height !== size.height) {
        alert(`Please upload a ${size.width}x${size.height} image.`);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = size.width;
      canvas.height = size.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size.width, size.height);

      const newPixels: Color[][] = [];
      for (let x = 0; x < size.width; x++) {
        const row: Color[] = [];
        for (let y = 0; y < size.height; y++) {
          const pixelData = ctx.getImageData(x, y, 1, 1).data;
          row.push(getClosestColor(pixelData[0], pixelData[1], pixelData[2]));
        }
        newPixels.push(row);
      }

      callback(newPixels);
    };
    img.src = (e.target! as FileReader).result as string;
  };

  reader.readAsDataURL(file);
};

const getClosestColor = (r: number, g: number, b: number): Color => {
  const computedStyle = getComputedStyle(document.documentElement);
  let minDistance = Infinity;
  let closestColor: Color = "white";

  for (const color of colors) {
    const cssRGB = computedStyle.getPropertyValue(`--${color}`).trim();
    const match = cssRGB.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (match) {
      const colorR = parseInt(match[1]);
      const colorG = parseInt(match[2]);
      const colorB = parseInt(match[3]);

      const distance = Math.sqrt(
        Math.pow(colorR - r, 2) +
          Math.pow(colorG - g, 2) +
          Math.pow(colorB - b, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    }
  }

  return closestColor;
};
