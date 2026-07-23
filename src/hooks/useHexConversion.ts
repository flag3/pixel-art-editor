import { useState, useCallback } from "react";
import type { Color, ColorMode, TileOrder, Compression, Size } from "../types";
import { pixelsToHex, hexToPixelsWithDecompression } from "../utils/hexUtils";

interface UseHexConversionProps {
  pixels: Color[][];
  gridSize: Size;
  colorMode: ColorMode;
  onDecodeSuccess: (pixels: Color[][], detectedSize?: Size) => void;
}

export interface HexConversionState {
  tileOrder: TileOrder;
  compression: Compression;
  hexValue: string;
  error: string | null;
  setHexValue: (value: string) => void;
  setError: (error: string | null) => void;
  setTileOrder: (tileOrder: TileOrder) => void;
  setCompression: (compression: Compression) => void;
  handleEncode: () => void;
  handleDecode: () => void;
}

export const useHexConversion = ({
  pixels,
  gridSize,
  colorMode,
  onDecodeSuccess,
}: UseHexConversionProps): HexConversionState => {
  const [tileOrder, setTileOrder] = useState<TileOrder>("rows");
  const [compression, setCompression] = useState<Compression>("none");
  const [hexValue, setHexValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleEncode = useCallback(() => {
    setHexValue(pixelsToHex(pixels, tileOrder, colorMode, compression));
  }, [pixels, tileOrder, colorMode, compression]);

  const handleDecode = useCallback(() => {
    const result = hexToPixelsWithDecompression(
      hexValue,
      gridSize,
      tileOrder,
      colorMode,
      compression,
    );
    if (result.success && result.data) {
      onDecodeSuccess(result.data, result.detectedSize);
      setError(null);
    } else {
      setError(result.error ?? "Decode failed");
    }
  }, [hexValue, gridSize, tileOrder, colorMode, compression, onDecodeSuccess]);

  return {
    tileOrder,
    compression,
    hexValue,
    error,
    setHexValue,
    setError,
    setTileOrder,
    setCompression,
    handleEncode,
    handleDecode,
  };
};
