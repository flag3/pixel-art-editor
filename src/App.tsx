import ColorModeSelector from "./components/ColorModeSelector";
import ColorPicker from "./components/ColorPicker";
import Grid from "./components/Grid";
import GridSizeSelector from "./components/GridSizeSelector";
import FileUploader from "./components/FileUploader";
import Button from "./components/Button";
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
    handlePixelUndo,
    handlePixelRedo,
    handlePixelDelete,
  } = usePixelOperations();

  const {
    colorMode,
    setColorMode,
    conversionMethod,
    setConversionMethod,
    hexValue,
    setHexValue,
    handlePixelCode,
    handleHexGridOn,
  } = useUIState(gridSize, pixels, applyChange);

  const { handleFileUpload, handleFileDownload } = useFileOperations(
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
      <div className="button-container">
        <FileUploader onFileUpload={handleFileUpload} />
        <Button
          text="undo"
          onClick={handlePixelUndo}
          disabled={!undoStack.length}
        />
        <Button
          text="redo"
          onClick={handlePixelRedo}
          disabled={!redoStack.length}
        />
        <Button text="delete" onClick={handlePixelDelete} />
        <Button text="download" onClick={handleFileDownload} />
      </div>
      <ConversionMethodSelector
        conversionMethod={conversionMethod}
        setConversionMethod={setConversionMethod}
      />
      <div className="button-container">
        <Button text="code" onClick={handlePixelCode} />
        <Button text="grid_on" onClick={handleHexGridOn} />
      </div>
      <HexConverter
        hexValue={hexValue}
        setHexValue={setHexValue}
        colorMode={colorMode}
        gridSize={gridSize}
      />
    </div>
  );
}

export default App;
