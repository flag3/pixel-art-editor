type HexConverterProps = {
  hexValue: string;
  setHexValue: React.Dispatch<React.SetStateAction<string>>;
  handleExport: () => void;
  handleImport: () => void;
};

function HexConverter({
  hexValue,
  setHexValue,
  handleExport,
  handleImport,
}: HexConverterProps) {
  return (
    <div>
      <button onClick={handleExport}>To Hex</button>
      <textarea
        value={hexValue}
        onChange={(e) => setHexValue(e.target.value)}
        rows={4}
        cols={49}
      />
      <button onClick={handleImport}>From Hex</button>
    </div>
  );
}

export default HexConverter;
