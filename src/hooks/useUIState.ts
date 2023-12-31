import { useState } from "react";
import { Color, ColorMode, ConversionMethod, Size } from "./../types";
import { pixelsToHex, hexToPixels, splitHexValues } from "./../utils/hexUtils";

const useUIState = (
  gridSize: Size,
  pixels: Color[][],
  applyChange: (pixels: Color[][]) => void,
) => {
  const [colorMode, setColorMode] = useState<ColorMode>("fourColors");
  const [conversionMethod, setConversionMethod] =
    useState<ConversionMethod>("leftToRight");
  const [hexValue, setHexValue] = useState("");

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
    colorMode,
    setColorMode,
    conversionMethod,
    setConversionMethod,
    hexValue,
    setHexValue,
    handlePixelCode,
    handleHexGridOn,
  };
};

export default useUIState;
