import { useState, useCallback } from "react";
import type { Color, ColorMode, ConversionMethod, CompressionFormat, Size } from "../types";
import { pixelsToHex, hexToPixelsWithDecompression } from "../utils/hexUtils";

interface UseHexConversionProps {
  pixels: Color[][];
  gridSize: Size;
  colorMode: ColorMode;
  onDecodeSuccess: (pixels: Color[][], detectedSize?: Size) => void;
}

export interface HexConversionState {
  conversionMethod: ConversionMethod;
  compressionFormat: CompressionFormat;
  hexValue: string;
  error: string | null;
  setHexValue: (value: string) => void;
  setError: (error: string | null) => void;
  setConversionMethod: (method: ConversionMethod) => void;
  setCompressionFormat: (format: CompressionFormat) => void;
  handleEncode: () => void;
  handleDecode: () => void;
}

export const useHexConversion = ({
  pixels,
  gridSize,
  colorMode,
  onDecodeSuccess,
}: UseHexConversionProps): HexConversionState => {
  const [conversionMethod, setConversionMethod] = useState<ConversionMethod>("leftToRight");
  const [compressionFormat, setCompressionFormat] = useState<CompressionFormat>("none");
  const [hexValue, setHexValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleEncode = useCallback(() => {
    setHexValue(pixelsToHex(pixels, conversionMethod, colorMode, compressionFormat));
  }, [pixels, conversionMethod, colorMode, compressionFormat]);

  const handleDecode = useCallback(() => {
    const result = hexToPixelsWithDecompression(
      hexValue,
      gridSize,
      conversionMethod,
      colorMode,
      compressionFormat,
      setError,
    );
    if (result.success && result.data) {
      onDecodeSuccess(result.data, result.detectedSize);
      setError(null);
    }
  }, [hexValue, gridSize, conversionMethod, colorMode, compressionFormat, onDecodeSuccess]);

  return {
    conversionMethod,
    compressionFormat,
    hexValue,
    error,
    setHexValue,
    setError,
    setConversionMethod,
    setCompressionFormat,
    handleEncode,
    handleDecode,
  };
};
