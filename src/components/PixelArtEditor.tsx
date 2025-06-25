import { useState, useCallback } from "react";
import { Button } from "./Button";
import { Selector } from "./Selector";
import { ColorPicker } from "./ColorPicker";
import { Grid } from "./Grid";
import { FileUploader } from "./FileUploader";
import { HexConverter } from "./HexConverter";
import { usePixelState } from "../hooks/usePixelState";
import {
  createInitialPixels,
  pixelsToHex,
  hexToPixelsWithDecompression,
} from "../utils/hexUtils";
import {
  Color,
  ColorMode,
  ConversionMethod,
  CompressionFormat,
  Size,
  colorModeOptions,
  conversionMethodOptions,
  compressionFormatOptions,
  widthOptions,
  heightOptions,
} from "../types";
import { GRID_CONFIG, DOWNLOAD_CONFIG } from "../constants/config";
import "../App.css";

export default function PixelArtEditor() {
  const [colorMode, setColorMode] = useState<ColorMode>("fourColors");
  const [gridSize, setGridSize] = useState<Size>(GRID_CONFIG.DEFAULT_SIZE);
  const [selectedColor, setSelectedColor] = useState<Color>("white");
  const { pixels, applyChange, undo, redo, canUndo, canRedo } = usePixelState(gridSize);
  const [conversionMethod, setConversionMethod] = useState<ConversionMethod>("leftToRight");
  const [compressionFormat, setCompressionFormat] = useState<CompressionFormat>("none");
  const [hexValue, setHexValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleGridSizeChange = useCallback((
    dimension: "width" | "height",
    value: number,
  ) => {
    const newSize = { ...gridSize, [dimension]: value };
    setGridSize(newSize);
    applyChange(createInitialPixels(newSize));
  }, [gridSize, applyChange]);

  const handlePixelClick = useCallback((rowIndex: number, colIndex: number) => {
    const newPixels = pixels.map((row) => row.slice());
    newPixels[rowIndex][colIndex] = selectedColor;
    applyChange(newPixels);
  }, [pixels, selectedColor, applyChange]);

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
          DOWNLOAD_CONFIG.CANVAS_SCALE
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
      <Selector
        className="color-mode-selector"
        label="Color Mode "
        value={colorMode}
        onChange={(event) => {
          setColorMode(event.target.value as ColorMode);
        }}
        options={colorModeOptions}
      />
      <div className="grid-size-selector">
        <Selector
          label="Width "
          value={gridSize.width.toString()}
          onChange={(e) =>
            handleGridSizeChange("width", Number(e.target.value))
          }
          options={widthOptions}
        />
        <Selector
          label="Height "
          value={gridSize.height.toString()}
          onChange={(e) =>
            handleGridSizeChange("height", Number(e.target.value))
          }
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
        <FileUploader
          colorMode={colorMode}
          gridSize={gridSize}
          applyChange={applyChange}
        />
        <Button text="undo" onClick={undo} disabled={!canUndo} />
        <Button text="redo" onClick={redo} disabled={!canRedo} />
        <Button
          text="delete"
          onClick={() => applyChange(createInitialPixels(gridSize))}
        />
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
      <Selector
        className="compression-format"
        label="Compression Format "
        value={compressionFormat}
        onChange={(event) =>
          setCompressionFormat(event.target.value as CompressionFormat)
        }
        options={compressionFormatOptions}
      />
      <div className="button-container">
        <Button
          text="code"
          onClick={() =>
            setHexValue(pixelsToHex(pixels, conversionMethod, colorMode, compressionFormat))
          }
        />
        <Button
          text="grid_on"
          onClick={() => {
            const result = hexToPixelsWithDecompression(
              hexValue,
              gridSize,
              conversionMethod,
              colorMode,
              compressionFormat,
              setError
            );
            if (result.success && result.data) {
              applyChange(result.data);
              setError(null);
            }
          }}
        />
      </div>
      {error && (
        <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
          {error}
        </div>
      )}
      <HexConverter
        hexValue={hexValue}
        setHexValue={setHexValue}
        colorMode={colorMode}
        gridSize={gridSize}
      />
    </div>
  );
}
