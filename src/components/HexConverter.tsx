import { ColorMode, Size } from "./../types";

type HexConverterProps = {
  hexValue: string;
  setHexValue: React.Dispatch<React.SetStateAction<string>>;
  colorMode: ColorMode;
  gridSize: Size;
  convertPixelToHex: () => void;
  convertHexToPixel: () => void;
};

const HexConverter = ({
  hexValue,
  setHexValue,
  colorMode,
  gridSize,
  convertPixelToHex,
  convertHexToPixel,
}: HexConverterProps) => {
  return (
    <div>
      <button onClick={convertPixelToHex}>To Hex</button>
      <textarea
        value={hexValue}
        onChange={(e) => setHexValue(e.target.value)}
        rows={
          colorMode === "fourColors" ? gridSize.height / 4 : gridSize.height / 8
        }
        cols={gridSize.width * 3}
      />
      <button onClick={convertHexToPixel}>From Hex</button>
    </div>
  );
};

export default HexConverter;
