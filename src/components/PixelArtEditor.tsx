import { useState } from "react";
import { Button } from "./Button";
import { Selector } from "./Selector";
import { ColorPicker } from "./ColorPicker";
import { Grid } from "./Grid";
import { FileUploader } from "./FileUploader";
import { HexConverter } from "./HexConverter";
import {
  createInitialPixels,
  hexToPixels,
  pixelsToHex,
} from "./../utils/hexUtils";
import {
  Color,
  ColorMode,
  ConversionMethod,
  Size,
  colorModeOptions,
  conversionMethodOptions,
  widthOptions,
  heightOptions,
} from "./../types";
import "./../App.css";

function usePixelState(initialSize: Size) {
  const [pixels, setPixels] = useState(() => createInitialPixels(initialSize));
  const [undoStack, setUndoStack] = useState<Color[][][]>([]);
  const [redoStack, setRedoStack] = useState<Color[][][]>([]);

  const applyChange = (newPixels: Color[][]) => {
    const isSameAsPrevious =
      JSON.stringify(pixels) === JSON.stringify(newPixels);
    if (isSameAsPrevious) return;
    setRedoStack([]);
    setUndoStack((prevStack) => [...prevStack, pixels]);
    setPixels(newPixels);
  };

  const undo = () => {
    if (!undoStack.length) return;
    setRedoStack((prevStack) => [...prevStack, pixels]);
    const lastState = undoStack[undoStack.length - 1];
    setPixels(lastState);
    setUndoStack((prevStack) => prevStack.slice(0, prevStack.length - 1));
  };

  const redo = () => {
    if (!redoStack.length) return;
    setUndoStack((prevStack) => [...prevStack, pixels]);
    const nextState = redoStack[redoStack.length - 1];
    setPixels(nextState);
    setRedoStack((prevStack) => prevStack.slice(0, prevStack.length - 1));
  };

  return { pixels, applyChange, undo, redo, undoStack, redoStack };
}

export default function PixelArtEditor() {
  const [colorMode, setColorMode] = useState<ColorMode>("fourColors");
  const [gridSize, setGridSize] = useState<Size>({ width: 16, height: 16 });
  const [selectedColor, setSelectedColor] = useState<Color>("white");
  const { pixels, applyChange, undo, redo, undoStack, redoStack } =
    usePixelState(gridSize);
  const [conversionMethod, setConversionMethod] =
    useState<ConversionMethod>("leftToRight");
  const [hexValue, setHexValue] = useState("");

  const handleGridSizeChange = (
    dimension: "width" | "height",
    value: number,
  ) => {
    setGridSize((prev) => ({ ...prev, [dimension]: value }));
    applyChange(createInitialPixels({ ...gridSize, [dimension]: value }));
  };

  const handlePixelClick = (rowIndex: number, colIndex: number) => {
    const newPixels = pixels.map((row) => row.slice());
    newPixels[rowIndex][colIndex] = selectedColor;
    applyChange(newPixels);
  };

  const handleFileDownload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = pixels.length;
    canvas.height = pixels[0].length;
    const ctx = canvas.getContext("2d")!;

    const computedStyle = getComputedStyle(document.documentElement);

    pixels.forEach((row, rowIndex) => {
      row.forEach((color, colIndex) => {
        ctx.fillStyle = computedStyle.getPropertyValue(`--${color}`);
        ctx.fillRect(rowIndex, colIndex, 1, 1);
      });
    });

    const dataURL = canvas.toDataURL();
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "pixel-art.png";
    link.click();
  };

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
        <Button text="undo" onClick={undo} disabled={!undoStack.length} />
        <Button text="redo" onClick={redo} disabled={!redoStack.length} />
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
