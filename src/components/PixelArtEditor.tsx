import { useState } from "react";
import Button from "./Button";
import Selector from "./Selector";
import ColorPicker from "./ColorPicker";
import Grid from "./Grid";
import FileUploader from "./FileUploader";
import HexConverter from "./HexConverter";
import usePixelOperations from "./../hooks/usePixelOperations";
import useFileOperations from "./../hooks/useFileOperations";
import {
  Color,
  colorModeOptions,
  conversionMethodOptions,
  widthOptions,
  heightOptions,
} from "./../types";
import { hexToPixels, pixelsToHex } from "./../utils/hexUtils";
import { ConversionMethod } from "./../types";
import "./../App.css";

export default function PixelArtEditor() {
  const [selectedColor, setSelectedColor] = useState<Color>("white");
  const [hexValue, setHexValue] = useState("");
  const [conversionMethod, setConversionMethod] =
    useState<ConversionMethod>("leftToRight");

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
        onChange={(event) =>
          setConversionMethod(event.target.value as ConversionMethod)
        }
        options={conversionMethodOptions}
      />
      <div className="button-container">
        <Button
          text="code"
          onClick={() =>
            setHexValue(pixelsToHex(pixels, conversionMethod, colorMode))
          }
        />
        <Button
          text="grid_on"
          onClick={() =>
            applyChange(
              hexToPixels(hexValue, gridSize, conversionMethod, colorMode),
            )
          }
        />
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
