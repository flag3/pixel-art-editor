type HexConverterProps = {
  hexValue: string;
  setHexValue: React.Dispatch<React.SetStateAction<string>>;
  gridSize: { rows: number; cols: number };
  handleExport: () => void;
  handleImport: () => void;
};

function HexConverter({
  hexValue,
  setHexValue,
  gridSize,
  handleExport,
  handleImport,
}: HexConverterProps) {
  return (
    <div>
      <button onClick={handleExport}>To Hex</button>
      <textarea
        value={hexValue}
        onChange={(e) => setHexValue(e.target.value)}
        rows={gridSize.rows / 4}
        cols={gridSize.cols * 3}
      />
      <button onClick={handleImport}>From Hex</button>
    </div>
  );
}

export default HexConverter;
