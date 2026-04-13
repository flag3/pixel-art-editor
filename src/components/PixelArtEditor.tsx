import { GRID_CONFIG } from "../constants/config";
import { usePixelState } from "../hooks/usePixelState";
import { useHexConversion } from "../hooks/useHexConversion";
import { usePixelDownload } from "../hooks/usePixelDownload";
import type { Color, ColorMode, ConversionMethod, CompressionFormat, Size } from "../types";
import {
  colorModeOptions,
  conversionMethodOptions,
  compressionFormatOptions,
  widthOptions,
  heightOptions,
} from "../constants/options";
import { createInitialPixels } from "../utils/hexUtils";
import { Button } from "./ui/Button";
import { ColorPicker } from "./ColorPicker";
import { Grid } from "./Grid";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";
import { useFileUpload } from "../hooks/useFileUpload";
import { useState, useCallback } from "react";

export default function PixelArtEditor() {
  const [colorMode, setColorMode] = useState<ColorMode>("fourColors");
  const [gridSize, setGridSize] = useState<Size>(GRID_CONFIG.DEFAULT_SIZE);
  const [selectedColor, setSelectedColor] = useState<Color>("white");
  const { pixels, applyChange, undo, redo, canUndo, canRedo } = usePixelState(gridSize);

  const handleDecodeSuccess = useCallback(
    (newPixels: Color[][], detectedSize?: Size) => {
      applyChange(newPixels);
      if (detectedSize) {
        setGridSize(detectedSize);
      }
    },
    [applyChange],
  );

  const {
    conversionMethod,
    compressionFormat,
    hexValue,
    error,
    setHexValue,
    setError,
    setConversionMethod,
    setCompressionFormat,
    handleEncode,
    handleDecode,
  } = useHexConversion({ pixels, gridSize, colorMode, onDecodeSuccess: handleDecodeSuccess });

  const { handleFileDownload } = usePixelDownload(pixels);

  const {
    inputRef,
    handleClick: handleUploadClick,
    handleChange: handleUploadChange,
  } = useFileUpload({ colorMode, gridSize, applyChange, onError: setError });

  const handleGridSizeChange = useCallback(
    (dimension: "width" | "height", value: number) => {
      const newSize = { ...gridSize, [dimension]: value };
      setGridSize(newSize);
      applyChange(createInitialPixels(newSize));
    },
    [gridSize, applyChange],
  );

  const handlePixelClick = useCallback(
    (rowIndex: number, colIndex: number) => {
      const newPixels = pixels.map((row) => row.slice());
      newPixels[rowIndex][colIndex] = selectedColor;
      applyChange(newPixels);
    },
    [pixels, selectedColor, applyChange],
  );

  return (
    <div className="container">
      <div className="color-mode-selector">
        <label>
          Color Mode{" "}
          <Select
            value={colorMode}
            onChange={(event) => {
              setColorMode(event.target.value as ColorMode);
            }}
            options={colorModeOptions}
          />
        </label>
      </div>
      <div className="grid-size-selector">
        <label>
          Width{" "}
          <Select
            value={gridSize.width.toString()}
            onChange={(e) => handleGridSizeChange("width", Number(e.target.value))}
            options={widthOptions}
          />
        </label>
        <label>
          Height{" "}
          <Select
            value={gridSize.height.toString()}
            onChange={(e) => handleGridSizeChange("height", Number(e.target.value))}
            options={heightOptions}
          />
        </label>
      </div>
      <ColorPicker
        colorMode={colorMode}
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
      />
      <Grid pixels={pixels} onPixelClick={handlePixelClick} />
      <div className="button-container">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden-input"
          onChange={handleUploadChange}
        />
        <Button icon="material-symbols:upload" onClick={handleUploadClick} />
        <Button icon="material-symbols:undo" onClick={undo} disabled={!canUndo} />
        <Button icon="material-symbols:redo" onClick={redo} disabled={!canRedo} />
        <Button
          icon="material-symbols:delete-outline"
          onClick={() => applyChange(createInitialPixels(gridSize))}
        />
        <Button icon="material-symbols:download" onClick={handleFileDownload} />
      </div>
      <div className="conversion-method">
        <label>
          Conversion Method{" "}
          <Select
            value={conversionMethod}
            onChange={(event) => setConversionMethod(event.target.value as ConversionMethod)}
            options={conversionMethodOptions}
          />
        </label>
      </div>
      <div className="compression-format">
        <label>
          Compression Format{" "}
          <Select
            value={compressionFormat}
            onChange={(event) => setCompressionFormat(event.target.value as CompressionFormat)}
            options={compressionFormatOptions}
          />
        </label>
      </div>
      <div className="button-container">
        <Button icon="material-symbols:code" onClick={handleEncode} />
        <Button icon="material-symbols:grid-on-outline" onClick={handleDecode} />
      </div>
      {error && (
        <div className="error-message" style={{ color: "red", margin: "10px 0" }}>
          {error}
        </div>
      )}
      <Textarea
        value={hexValue}
        onChange={(e) => setHexValue(e.target.value)}
        rows={colorMode === "fourColors" ? gridSize.height / 4 : gridSize.height / 8}
        cols={gridSize.width * 3 - 3}
      />
    </div>
  );
}
