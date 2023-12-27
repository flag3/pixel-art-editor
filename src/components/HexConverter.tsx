import { Size, ColorMode } from "./../constants/index";

type HexConverterProps = {
  hexValue: string;
  setHexValue: React.Dispatch<React.SetStateAction<string>>;
  size: Size;
  colorMode: ColorMode;
  handleExport: () => void;
  handleImport: () => void;
};

const HexConverter = ({
  hexValue,
  setHexValue,
  size,
  colorMode,
  handleExport,
  handleImport,
}: HexConverterProps) => {
  return (
    <div>
      <button onClick={handleExport}>To Hex</button>
      <textarea
        value={hexValue}
        onChange={(e) => setHexValue(e.target.value)}
        rows={colorMode === "fourColors" ? size.height / 4 : size.height / 8}
        cols={size.width * 3}
      />
      <button onClick={handleImport}>From Hex</button>
    </div>
  );
};

export default HexConverter;
