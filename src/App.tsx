import ColorModeSelector from "./components/ColorModeSelector";
import ColorPicker from "./components/ColorPicker";
import Grid from "./components/Grid";
import GridSizeSelector from "./components/GridSizeSelector";
import Buttons from "./components/Buttons";
import ConversionMethodSelector from "./components/ConversionMethodSelector";
import HexConverter from "./components/HexConverter";
import usePixelOperations from "./hooks/usePixelOperations";
import useUIState from "./hooks/useUIState";
import useFileOperations from "./hooks/useFileOperations";
import "./App.css";

function App() {
  const {
    gridSize,
    setGridSize,
    selectedColor,
    setSelectedColor,
    pixels,
    setPixels,
    undoStack,
    setUndoStack,
    redoStack,
    setRedoStack,
    applyChange,
    handlePixelClick,
    undo,
    redo,
    deleteGridContents,
  } = usePixelOperations();

  const {
    colorMode,
    setColorMode,
    conversionMethod,
    setConversionMethod,
    hexValue,
    setHexValue,
    convertPixelToHex,
    convertHexToPixel,
  } = useUIState(gridSize, pixels, applyChange);

  const { upload, download } = useFileOperations(
    colorMode,
    gridSize,
    pixels,
    applyChange,
  );

  return (
    <div className="container">
      <ColorModeSelector colorMode={colorMode} setColorMode={setColorMode} />
      <GridSizeSelector
        gridSize={gridSize}
        setGridSize={setGridSize}
        setHexValue={setHexValue}
        setPixels={setPixels}
        setUndoStack={setUndoStack}
        setRedoStack={setRedoStack}
      />
      <ColorPicker
        colorMode={colorMode}
        selectedColor={selectedColor}
        setSelectColor={setSelectedColor}
      />
      <Grid pixels={pixels} onPixelClick={handlePixelClick} />
      <Buttons
        undoStack={undoStack}
        redoStack={redoStack}
        upload={upload}
        undo={undo}
        redo={redo}
        deleteGridContents={deleteGridContents}
        download={download}
      />
      <ConversionMethodSelector
        conversionMethod={conversionMethod}
        setConversionMethod={setConversionMethod}
      />
      <HexConverter
        hexValue={hexValue}
        setHexValue={setHexValue}
        colorMode={colorMode}
        gridSize={gridSize}
        convertPixelToHex={convertPixelToHex}
        convertHexToPixel={convertHexToPixel}
      />
    </div>
  );
}

export default App;
