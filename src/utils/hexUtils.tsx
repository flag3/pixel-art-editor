import { Color, Size, Method, ColorMode } from "./../constants/index";

export const handleExport = (
  pixels: Color[][],
  method: Method,
  colorMode: ColorMode,
  setHexValue: React.Dispatch<React.SetStateAction<string>>,
) => {
  const hexStrings = pixelsToHex(pixels, method, colorMode);
  setHexValue(hexStrings.join(" "));
};

export const handleImport = (
  hexValue: string,
  size: Size,
  method: Method,
  colorMode: ColorMode,
  callback: (newPixels: Color[][]) => void,
) => {
  const hexStrings = splitHexValues(hexValue);
  const newPixels = hexToPixels(hexStrings, size, method, colorMode);
  callback(newPixels);
};

const pixelToBits = (color: Color): [number, number] => {
  switch (color) {
    case "white":
      return [0, 0];
    case "lightgray":
      return [1, 0];
    case "darkgray":
      return [0, 1];
    case "black":
      return [1, 1];
  }
};

const pixelsToHex = (
  pixels: Color[][],
  method: Method,
  colorMode: ColorMode,
): string[] => {
  const hexes: string[] = [];
  const width = pixels.length;
  const height = pixels[0].length;

  const convertBlockToHex = (
    x_start: number,
    y_start: number,
    colorMode: ColorMode,
  ) => {
    for (let y = y_start; y < y_start + 8; y++) {
      let bin1 = "";
      let bin2 = "";
      for (let x = x_start; x < x_start + 8; x++) {
        const [bit1, bit2] = pixelToBits(pixels[x][y]);
        bin1 += bit1;
        bin2 += bit2;
      }
      if (colorMode == "fourColors") {
        hexes.push(
          parseInt(bin1, 2).toString(16).padStart(2, "0").toUpperCase(),
        );
        hexes.push(
          parseInt(bin2, 2).toString(16).padStart(2, "0").toUpperCase(),
        );
      } else {
        hexes.push(
          parseInt(bin2, 2).toString(16).padStart(2, "0").toUpperCase(),
        );
      }
    }
  };

  switch (method) {
    case "leftToRight":
      for (let y_block = 0; y_block < height; y_block += 8) {
        for (let x_block = 0; x_block < width; x_block += 8) {
          convertBlockToHex(x_block, y_block, colorMode);
        }
      }
      break;

    case "topToBottomLeft":
      for (let x_block = 0; x_block < width; x_block += 8) {
        for (let y_block = 0; y_block < height; y_block += 8) {
          convertBlockToHex(x_block, y_block, colorMode);
        }
      }
      break;

    case "topToBottomRight":
      for (let x_block = width - 8; x_block >= 0; x_block -= 8) {
        for (let y_block = 0; y_block < height; y_block += 8) {
          convertBlockToHex(x_block, y_block, colorMode);
        }
      }
      break;
  }

  return hexes;
};

const splitHexValues = (hexValue: string): string[] => {
  const cleanedHexValue = hexValue.replace(/\s+/g, "");

  if (/[^a-fA-F0-9]/.test(cleanedHexValue)) {
    alert("Invalid characters detected in the HEX string.");
    throw new Error("Invalid characters in HEX string");
  }

  if (cleanedHexValue.length % 2 !== 0) {
    alert("The HEX string has an odd number of characters.");
    throw new Error("Odd number of characters in HEX string");
  }

  const hexes: string[] = [];
  for (let i = 0; i < cleanedHexValue.length; i += 2) {
    hexes.push(cleanedHexValue.substring(i, i + 2));
  }

  return hexes;
};

const bitsToPixel = (bit1: string, bit2: string): Color => {
  if (bit1 === "0" && bit2 === "0") return "white";
  if (bit1 === "1" && bit2 === "0") return "lightgray";
  if (bit1 === "0" && bit2 === "1") return "darkgray";
  if (bit1 === "1" && bit2 === "1") return "black";
  throw new Error("Invalid bits combination");
};

const hexToPixels = (
  hexes: string[],
  size: Size,
  method: Method,
  colorMode: ColorMode,
): Color[][] => {
  if (colorMode === "twoColors") {
    hexes = hexes.flatMap((n) => [n, n]);
  }
  const expectedLength = (size.width * size.height) / 2;
  while (hexes.length < expectedLength) {
    hexes.push("00");
  }

  if (hexes.length > expectedLength) {
    hexes = hexes.slice(0, expectedLength);
  }
  const hexPattern = /^[0-9A-Fa-f]{2}$/;

  for (const hex of hexes) {
    if (!hexPattern.test(hex)) {
      alert(`Invalid HEX value detected: ${hex}. Please use valid HEX values.`);
      return Array(16)
        .fill(null)
        .map(() => Array(16).fill("white") as Color[]);
    }
  }

  const pixels: Color[][] = Array(size.width)
    .fill(null)
    .map(() => Array(size.height).fill("white") as Color[]);

  let hexIndex = 0;

  const convertHexToBlock = (x_start: number, y_start: number) => {
    for (let y = y_start; y < y_start + 8; y++) {
      const bin1 = parseInt(hexes[hexIndex], 16).toString(2).padStart(8, "0");
      hexIndex++;

      const bin2 = parseInt(hexes[hexIndex], 16).toString(2).padStart(8, "0");
      hexIndex++;

      for (let x = x_start; x < x_start + 8; x++) {
        const bit1 = bin1[x - x_start];
        const bit2 = bin2[x - x_start];
        pixels[x][y] = bitsToPixel(bit1, bit2);
      }
    }
  };

  switch (method) {
    case "leftToRight":
      for (let y_block = 0; y_block < size.height; y_block += 8) {
        for (let x_block = 0; x_block < size.width; x_block += 8) {
          convertHexToBlock(x_block, y_block);
        }
      }
      break;

    case "topToBottomLeft":
      for (let x_block = 0; x_block < size.width; x_block += 8) {
        for (let y_block = 0; y_block < size.height; y_block += 8) {
          convertHexToBlock(x_block, y_block);
        }
      }
      break;

    case "topToBottomRight":
      for (let x_block = size.width - 8; x_block >= 0; x_block -= 8) {
        for (let y_block = 0; y_block < size.height; y_block += 8) {
          convertHexToBlock(x_block, y_block);
        }
      }
      break;
  }

  return pixels;
};
