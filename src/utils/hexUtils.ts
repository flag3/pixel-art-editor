import { Color, ColorMode, ConversionMethod, Size } from "../types";
import { COLOR_BITS, BITS_TO_COLOR } from "../constants/config";
import { validateHexString, validateHexValue, ValidationResult } from "./errorHandling";

export const createInitialPixels = (size: Size): Color[][] => {
  return Array.from({ length: size.width }, () =>
    Array.from({ length: size.height }, () => "white" as Color),
  );
};

const pixelToBits = (color: Color): [number, number] => {
  const bits = COLOR_BITS[color];
  return [bits[0], bits[1]];
};

const bitsToPixel = (bit1: string, bit2: string): Color => {
  const key = `${bit1}${bit2}` as keyof typeof BITS_TO_COLOR;
  const color = BITS_TO_COLOR[key];
  if (!color) {
    throw new Error("Invalid bits combination");
  }
  return color as Color;
};

export const pixelsToHex = (
  pixels: Color[][],
  conversionMethod: ConversionMethod,
  colorMode: ColorMode,
): string => {
  const result: string[] = [];
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
        result.push(
          parseInt(bin1, 2).toString(16).padStart(2, "0").toUpperCase(),
        );
        result.push(
          parseInt(bin2, 2).toString(16).padStart(2, "0").toUpperCase(),
        );
      } else {
        result.push(
          parseInt(bin2, 2).toString(16).padStart(2, "0").toUpperCase(),
        );
      }
    }
  };

  switch (conversionMethod) {
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

  return result.join(" ");
};

export const hexToPixels = (
  hex: string,
  size: Size,
  conversionMethod: ConversionMethod,
  colorMode: ColorMode,
  onError?: (error: string) => void,
): ValidationResult<Color[][]> => {
  const hexValidation = validateHexString(hex);
  if (!hexValidation.success) {
    if (onError) onError(hexValidation.error!);
    return { success: false, error: hexValidation.error };
  }

  const cleanedHexValue = hexValidation.data!;
  let hexArray: string[] = [];
  for (let i = 0; i < cleanedHexValue.length; i += 2) {
    hexArray.push(cleanedHexValue.substring(i, i + 2));
  }

  if (colorMode === "twoColors") {
    hexArray = hexArray.flatMap((n) => [n, n]);
  }

  const expectedLength = (size.width * size.height) / 2;
  while (hexArray.length < expectedLength) {
    hexArray.push("00");
  }

  if (hexArray.length > expectedLength) {
    hexArray = hexArray.slice(0, expectedLength);
  }

  for (const hexValue of hexArray) {
    const validation = validateHexValue(hexValue);
    if (!validation.success) {
      if (onError) onError(validation.error!);
      return {
        success: false,
        error: validation.error,
        data: createInitialPixels({ width: 16, height: 16 }),
      };
    }
  }

  const pixels: Color[][] = Array(size.width)
    .fill(null)
    .map(() => Array(size.height).fill("white") as Color[]);

  let hexIndex = 0;

  const convertHexToBlock = (x_start: number, y_start: number) => {
    for (let y = y_start; y < y_start + 8; y++) {
      const bin1 = parseInt(hexArray[hexIndex], 16)
        .toString(2)
        .padStart(8, "0");
      hexIndex++;

      const bin2 = parseInt(hexArray[hexIndex], 16)
        .toString(2)
        .padStart(8, "0");
      hexIndex++;

      for (let x = x_start; x < x_start + 8; x++) {
        const bit1 = bin1[x - x_start];
        const bit2 = bin2[x - x_start];
        pixels[x][y] = bitsToPixel(bit1, bit2);
      }
    }
  };

  switch (conversionMethod) {
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

  return { success: true, data: pixels };
};
