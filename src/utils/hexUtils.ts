import { COLOR_BITS, BITS_TO_COLOR } from "../constants/config";
import {
  Color,
  ColorMode,
  ConversionMethod,
  Size,
  CompressionFormat,
} from "../types";
import {
  validateHexString,
  validateHexValue,
  ValidationResult,
} from "./errorHandling";
import { compressGen1, formatGen1Hex } from "./gen1Compressor";
import { decompressGen1, parseGen1Hex } from "./gen1Decompressor";
import { compressGen2, formatAsHex } from "./gen2Compressor";
import { decompressGen2, parseCompressedHex } from "./gen2Decompressor";

export interface DecompressionResult {
  success: boolean;
  data?: Color[][];
  error?: string;
  detectedSize?: Size;
}

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
  compressionFormat: CompressionFormat = "none",
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

  const hexString = result.join(" ");

  // Apply compression if requested
  if (compressionFormat === "gen1" || compressionFormat === "gen2") {
    try {
      // Convert hex string to bytes
      const hexBytes = hexString.replace(/\s+/g, "");
      const bytes = new Uint8Array(hexBytes.length / 2);
      for (let i = 0; i < hexBytes.length; i += 2) {
        bytes[i / 2] = parseInt(hexBytes.substr(i, 2), 16);
      }

      if (compressionFormat === "gen1") {
        // Compress the bytes using Gen1
        const compressed = compressGen1(bytes);
        return formatGen1Hex(compressed);
      } else if (compressionFormat === "gen2") {
        // Compress the bytes using Gen2
        const compressed = compressGen2(bytes);
        return formatAsHex(compressed);
      }
    } catch (error) {
      console.error(
        `${compressionFormat.toUpperCase()} compression failed:`,
        error,
      );
      // Fall back to uncompressed format
      return hexString;
    }
  }

  return hexString;
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

export const hexToPixelsWithDecompression = (
  hex: string,
  size: Size,
  conversionMethod: ConversionMethod,
  colorMode: ColorMode,
  compressionFormat: CompressionFormat,
  onError?: (error: string) => void,
): DecompressionResult => {
  if (compressionFormat === "gen1") {
    try {
      const compressedBytes = parseGen1Hex(hex);

      // Auto-detect Gen1 image size from first byte
      const width = (compressedBytes[0] >> 4) & 0xf; // Upper 4 bits
      const height = compressedBytes[0] & 0xf; // Lower 4 bits
      const autoDetectedSize = {
        width: width * 8, // Convert tiles to pixels
        height: height * 8,
      };

      const decompressedBytes = decompressGen1(compressedBytes);
      const decompressedHex = Array.from(decompressedBytes)
        .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
        .join(" ");

      const result = hexToPixels(
        decompressedHex,
        autoDetectedSize,
        conversionMethod,
        colorMode,
        onError,
      );
      if (result.success) {
        return {
          success: true,
          data: result.data,
          detectedSize: autoDetectedSize,
        };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gen1 decompression failed";
      if (onError) onError(errorMessage);
      return { success: false, error: errorMessage };
    }
  } else if (compressionFormat === "gen2") {
    const compressedBytes = parseCompressedHex(hex);
    if (!compressedBytes) {
      const error = "Invalid hex format for compressed data";
      if (onError) onError(error);
      return { success: false, error };
    }

    try {
      const decompressedBytes = decompressGen2(compressedBytes);
      const decompressedHex = Array.from(decompressedBytes)
        .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
        .join(" ");

      const result = hexToPixels(
        decompressedHex,
        size,
        conversionMethod,
        colorMode,
        onError,
      );
      return {
        success: result.success,
        data: result.data,
        error: result.error,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Decompression failed";
      if (onError) onError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  const result = hexToPixels(hex, size, conversionMethod, colorMode, onError);
  return { success: result.success, data: result.data, error: result.error };
};
