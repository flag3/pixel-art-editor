import { GRID_CONFIG, DOWNLOAD_CONFIG } from "../constants/config";
import { usePixelState } from "../hooks/usePixelState";
import type { Color, ColorMode, ConversionMethod, CompressionFormat, Size } from "../types";
import {
  colorModeOptions,
  conversionMethodOptions,
  compressionFormatOptions,
  widthOptions,
  heightOptions,
} from "../types";
import { createInitialPixels, pixelsToHex, hexToPixelsWithDecompression } from "../utils/hexUtils";
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
  const {
    inputRef,
    handleClick: handleUploadClick,
    handleChange: handleUploadChange,
  } = useFileUpload({ colorMode, gridSize, applyChange });
  const [conversionMethod, setConversionMethod] = useState<ConversionMethod>("leftToRight");
  const [compressionFormat, setCompressionFormat] = useState<CompressionFormat>("none");
  const [hexValue, setHexValue] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  const handleFileDownload = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = pixels.length * DOWNLOAD_CONFIG.CANVAS_SCALE;
    canvas.height = pixels[0].length * DOWNLOAD_CONFIG.CANVAS_SCALE;
    const ctx = canvas.getContext("2d")!;

    const computedStyle = getComputedStyle(document.documentElement);

    pixels.forEach((row, rowIndex) => {
      row.forEach((color, colIndex) => {
        ctx.fillStyle = computedStyle.getPropertyValue(`--${color}`);
        ctx.fillRect(
          rowIndex * DOWNLOAD_CONFIG.CANVAS_SCALE,
          colIndex * DOWNLOAD_CONFIG.CANVAS_SCALE,
          DOWNLOAD_CONFIG.CANVAS_SCALE,
          DOWNLOAD_CONFIG.CANVAS_SCALE,
        );
      });
    });

    const dataURL = canvas.toDataURL();
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = DOWNLOAD_CONFIG.DEFAULT_FILENAME;
    link.click();
  }, [pixels]);

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
        setSelectedColor={setSelectedColor}
      />
      <Grid pixels={pixels} onPixelClick={handlePixelClick} />
      <div className="button-container">
        <input ref={inputRef} type="file" className="hidden-input" onChange={handleUploadChange} />
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
        <Button
          icon="material-symbols:code"
          onClick={() =>
            setHexValue(pixelsToHex(pixels, conversionMethod, colorMode, compressionFormat))
          }
        />
        <Button
          icon="material-symbols:grid-on"
          onClick={() => {
            const result = hexToPixelsWithDecompression(
              hexValue,
              gridSize,
              conversionMethod,
              colorMode,
              compressionFormat,
              setError,
            );
            if (result.success && result.data) {
              applyChange(result.data);
              setError(null);

              if (result.detectedSize) {
                setGridSize(result.detectedSize);
              }
            }
          }}
        />
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
