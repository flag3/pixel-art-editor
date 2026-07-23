import type { Color, ColorCount, TileOrder, Size, Compression } from "../types";
import { compressGen1 } from "./gen1Compressor";
import { decompressGen1 } from "./gen1Decompressor";
import { compressGen2 } from "./gen2Compressor";
import { decompressGen2 } from "./gen2Decompressor";

export const hexToBytes = (hex: string): Uint8Array => {
  const cleanHex = hex.replace(/\s+/g, "").replace(/^0x/i, "").toUpperCase();
  if (!/^[0-9A-F]*$/.test(cleanHex) || cleanHex.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.slice(i, i + 2), 16);
  }
  return bytes;
};

export const bytesToHex = (data: Uint8Array): string =>
  Array.from(data)
    .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
    .join(" ");

const COLOR_BITS: Record<Color, [number, number]> = {
  white: [0, 0],
  lightgray: [1, 0],
  darkgray: [0, 1],
  black: [1, 1],
};

const BITS_TO_COLOR: Record<string, Color> = {
  "00": "white",
  "10": "lightgray",
  "01": "darkgray",
  "11": "black",
};

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DecompressionResult extends ValidationResult<Color[][]> {
  detectedSize?: Size;
}

export const createInitialPixels = (size: Size): Color[][] => {
  return Array.from({ length: size.width }, () =>
    Array.from({ length: size.height }, () => "white" as Color),
  );
};

const bitsToPixel = (bit1: string, bit2: string): Color => {
  const color = BITS_TO_COLOR[`${bit1}${bit2}`];
  if (!color) {
    throw new Error("Invalid bits combination");
  }
  return color;
};

export const pixelsToHex = (
  pixels: Color[][],
  tileOrder: TileOrder,
  colorCount: ColorCount,
  compression: Compression = "none",
): string => {
  const result: string[] = [];
  const width = pixels.length;
  const height = pixels[0].length;

  const convertBlockToHex = (x_start: number, y_start: number, colorCount: ColorCount) => {
    for (let y = y_start; y < y_start + 8; y++) {
      let bin1 = "";
      let bin2 = "";
      for (let x = x_start; x < x_start + 8; x++) {
        const [bit1, bit2] = COLOR_BITS[pixels[x][y]];
        bin1 += bit1;
        bin2 += bit2;
      }
      if (colorCount == 4) {
        result.push(parseInt(bin1, 2).toString(16).padStart(2, "0").toUpperCase());
        result.push(parseInt(bin2, 2).toString(16).padStart(2, "0").toUpperCase());
      } else {
        result.push(parseInt(bin2, 2).toString(16).padStart(2, "0").toUpperCase());
      }
    }
  };

  switch (tileOrder) {
    case "rows":
      for (let y_block = 0; y_block < height; y_block += 8) {
        for (let x_block = 0; x_block < width; x_block += 8) {
          convertBlockToHex(x_block, y_block, colorCount);
        }
      }
      break;

    case "columns":
      for (let x_block = 0; x_block < width; x_block += 8) {
        for (let y_block = 0; y_block < height; y_block += 8) {
          convertBlockToHex(x_block, y_block, colorCount);
        }
      }
      break;

    case "columnsReversed":
      for (let x_block = width - 8; x_block >= 0; x_block -= 8) {
        for (let y_block = 0; y_block < height; y_block += 8) {
          convertBlockToHex(x_block, y_block, colorCount);
        }
      }
      break;
  }

  const hexString = result.join(" ");

  if (compression === "none") {
    return hexString;
  }

  try {
    const bytes = hexToBytes(hexString);
    return compression === "gen1"
      ? bytesToHex(compressGen1(bytes))
      : bytesToHex(compressGen2(bytes));
  } catch {
    // ponytail: compression failure (e.g. gen1 on a non-square sprite) silently
    // falls back to uncompressed hex — surface an error if users get confused
    return hexString;
  }
};

export const hexToPixels = (
  hex: string,
  size: Size,
  tileOrder: TileOrder,
  colorCount: ColorCount,
): ValidationResult<Color[][]> => {
  const cleanedHexValue = hex.replace(/\s+/g, "");
  if (/[^a-fA-F0-9]/.test(cleanedHexValue)) {
    return { success: false, error: "Invalid characters detected in the HEX string." };
  }
  if (cleanedHexValue.length % 2 !== 0) {
    return { success: false, error: "The HEX string has an odd number of characters." };
  }

  let hexArray: string[] = [];
  for (let i = 0; i < cleanedHexValue.length; i += 2) {
    hexArray.push(cleanedHexValue.substring(i, i + 2));
  }

  if (colorCount === 2) {
    hexArray = hexArray.flatMap((n) => [n, n]);
  }

  const expectedLength = (size.width * size.height) / 2;
  while (hexArray.length < expectedLength) {
    hexArray.push("00");
  }

  if (hexArray.length > expectedLength) {
    hexArray = hexArray.slice(0, expectedLength);
  }

  const pixels = createInitialPixels(size);

  let hexIndex = 0;

  const convertHexToBlock = (x_start: number, y_start: number) => {
    for (let y = y_start; y < y_start + 8; y++) {
      const bin1 = parseInt(hexArray[hexIndex], 16).toString(2).padStart(8, "0");
      hexIndex++;

      const bin2 = parseInt(hexArray[hexIndex], 16).toString(2).padStart(8, "0");
      hexIndex++;

      for (let x = x_start; x < x_start + 8; x++) {
        const bit1 = bin1[x - x_start];
        const bit2 = bin2[x - x_start];
        pixels[x][y] = bitsToPixel(bit1, bit2);
      }
    }
  };

  switch (tileOrder) {
    case "rows":
      for (let y_block = 0; y_block < size.height; y_block += 8) {
        for (let x_block = 0; x_block < size.width; x_block += 8) {
          convertHexToBlock(x_block, y_block);
        }
      }
      break;

    case "columns":
      for (let x_block = 0; x_block < size.width; x_block += 8) {
        for (let y_block = 0; y_block < size.height; y_block += 8) {
          convertHexToBlock(x_block, y_block);
        }
      }
      break;

    case "columnsReversed":
      for (let x_block = size.width - 8; x_block >= 0; x_block -= 8) {
        for (let y_block = 0; y_block < size.height; y_block += 8) {
          convertHexToBlock(x_block, y_block);
        }
      }
      break;
  }

  return { success: true, data: pixels };
};

export const hexToPixelsWithDecompression = (
  hex: string,
  size: Size,
  tileOrder: TileOrder,
  colorCount: ColorCount,
  compression: Compression,
): DecompressionResult => {
  if (compression === "none") {
    return hexToPixels(hex, size, tileOrder, colorCount);
  }

  try {
    let decompressedBytes: Uint8Array;
    let detectedSize: Size | undefined;

    const compressedBytes = hexToBytes(hex);
    if (compression === "gen1") {
      // Gen1 stores the sprite size (in tiles) in the first byte's nybbles
      detectedSize = {
        width: ((compressedBytes[0] >> 4) & 0xf) * 8,
        height: (compressedBytes[0] & 0xf) * 8,
      };
      decompressedBytes = decompressGen1(compressedBytes);
    } else {
      decompressedBytes = decompressGen2(compressedBytes);
    }

    const result = hexToPixels(
      bytesToHex(decompressedBytes),
      detectedSize ?? size,
      tileOrder,
      colorCount,
    );
    return { ...result, detectedSize };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Decompression failed";
    return { success: false, error: errorMessage };
  }
};
