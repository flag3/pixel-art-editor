import { useState } from "react";
import { Color, ColorMode, ConversionMethod, Size } from "./../types";
import { pixelsToHex, hexToPixels, splitHexValues } from "./../utils/hexUtils";

type useHexOperationsProps = {
  colorMode: ColorMode;
  gridSize: Size;
  pixels: Color[][];
  hexValue: string;
  setHexValue: React.Dispatch<React.SetStateAction<string>>;
  applyChange: (pixels: Color[][]) => void;
};

const useHexOperations = ({
  colorMode,
  gridSize,
  pixels,
  hexValue,
  setHexValue,
  applyChange,
}: useHexOperationsProps) => {
  const [conversionMethod, setConversionMethod] =
    useState<ConversionMethod>("leftToRight");

  const handleConversionMethodChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setConversionMethod(event.target.value as ConversionMethod);
  };

  const handlePixelCode = () => {
    const hexStrings = pixelsToHex(pixels, conversionMethod, colorMode);
    setHexValue(hexStrings.join(" "));
  };

  const handleHexGridOn = () => {
    const hexStrings = splitHexValues(hexValue);
    const newPixels = hexToPixels(
      hexStrings,
      gridSize,
      conversionMethod,
      colorMode,
    );
    applyChange(newPixels);
  };

  return {
    conversionMethod,
    handleConversionMethodChange,
    handlePixelCode,
    handleHexGridOn,
  };
};

export default useHexOperations;
