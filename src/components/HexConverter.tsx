import { HexConverterProps } from "../types";

export const HexConverter = ({
  hexValue,
  setHexValue,
  colorMode,
  gridSize,
}: HexConverterProps) => {
  return (
    <textarea
      value={hexValue}
      onChange={(e) => setHexValue(e.target.value)}
      rows={
        colorMode === "fourColors" ? gridSize.height / 4 : gridSize.height / 8
      }
      cols={gridSize.width * 3 - 3}
    />
  );
}
