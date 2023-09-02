import { Size } from "./../constants/index";

type HexConverterProps = {
  hexValue: string;
  setHexValue: React.Dispatch<React.SetStateAction<string>>;
  size: Size;
  handleExport: () => void;
  handleImport: () => void;
};

function HexConverter({
  hexValue,
  setHexValue,
  size,
  handleExport,
  handleImport,
}: HexConverterProps) {
  return (
    <div>
      <button onClick={handleExport}>To Hex</button>
      <textarea
        value={hexValue}
        onChange={(e) => setHexValue(e.target.value)}
        rows={size.height / 4}
        cols={size.width * 3}
      />
      <button onClick={handleImport}>From Hex</button>
    </div>
  );
}

export default HexConverter;
