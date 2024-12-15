import { ColorMode, Size } from "./../types";

type HexConverterProps = {
  hexValue: string;
  setHexValue: React.Dispatch<React.SetStateAction<string>>;
  colorMode: ColorMode;
  gridSize: Size;
};

export default function HexConverter({
  hexValue,
  setHexValue,
  colorMode,
  gridSize,
}: HexConverterProps) {
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
