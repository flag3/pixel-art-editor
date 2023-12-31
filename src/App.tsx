import { useState } from "react";
import Button from "./components/Button";
import Selector from "./components/Selector";
import ColorPicker from "./components/ColorPicker";
import Grid from "./components/Grid";
import FileUploader from "./components/FileUploader";
import HexConverter from "./components/HexConverter";
import usePixelOperations from "./hooks/usePixelOperations";
import useFileOperations from "./hooks/useFileOperations";
import useHexOperations from "./hooks/useHexOperations";
import {
  Color,
  colorModeOptions,
  conversionMethodOptions,
  widthOptions,
  heightOptions,
} from "./types";
import "./App.css";

function App() {
  const [selectedColor, setSelectedColor] = useState<Color>("white");
  const [hexValue, setHexValue] = useState("");

  const {
    colorMode,
    gridSize,
    pixels,
    undoStack,
    redoStack,
    applyChange,
    handleColorModeChange,
    handleWidthChange,
    handleHeightChange,
    handlePixelClick,
    handlePixelUndo,
    handlePixelRedo,
    handlePixelDelete,
  } = usePixelOperations({ selectedColor, setHexValue });

  const { handleFileUpload, handleFileDownload } = useFileOperations({
    colorMode,
    gridSize,
    pixels,
    applyChange,
  });

  const {
    conversionMethod,
    handleConversionMethodChange,
    handlePixelCode,
    handleHexGridOn,
  } = useHexOperations({
    colorMode,
    gridSize,
    pixels,
    hexValue,
    setHexValue,
    applyChange,
  });

  return (
    <div className="container">
      <Selector
        className="color-mode-selector"
        label="Color Mode "
        value={colorMode}
        onChange={handleColorModeChange}
        options={colorModeOptions}
      />
      <div className="grid-size-selector">
        <Selector
          label="Width "
          value={gridSize.width.toString()}
          onChange={handleWidthChange}
          options={widthOptions}
        />
        <Selector
          label="Height "
          value={gridSize.height.toString()}
          onChange={handleHeightChange}
          options={heightOptions}
        />
      </div>
      <ColorPicker
        colorMode={colorMode}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
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
      <Selector
        className="conversion-method"
        label="Conversion Method "
        value={conversionMethod}
        onChange={handleConversionMethodChange}
        options={conversionMethodOptions}
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
