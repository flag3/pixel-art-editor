import { useState } from "react";
import ColorModeSelector from "./components/ColorModeSelector";
import ColorPicker from "./components/ColorPicker";
import Grid from "./components/Grid";
import GridSize from "./components/GridSize";
import Buttons from "./components/Buttons";
import ConversionMethod from "./components/ConversionMethod";
import HexConverter from "./components/HexConverter";
import { handleExport, handleImport } from "./utils/hexUtils";
import { exportToImage, importFromImage } from "./utils/imageUtils";
import { useUndoRedo } from "./hooks/useUndoRedo";
import {
  Color,
  Method,
  ColorMode,
  createInitialPixels,
} from "./constants/index";
import "./App.css";

function App() {
  const [colorMode, setColorMode] = useState<ColorMode>("fourColors");
  const [selectedColor, setSelectedColor] = useState<Color>("white");
  const [conversionMethod, setConversionMethod] =
    useState<Method>("leftToRight");
  const [hexValue, setHexValue] = useState("");
  const {
    gridSize,
    setGridSize,
    pixels,
    setPixels,
    undoStack,
    redoStack,
    clearUndoRedo,
    applyChange,
    undo,
    redo,
  } = useUndoRedo();

  return (
    <div className="container">
      <ColorModeSelector colorMode={colorMode} setColorMode={setColorMode} />
      <GridSize
        gridSize={gridSize}
        setGridSize={setGridSize}
        setPixels={setPixels}
        clearUndoRedo={clearUndoRedo}
        clearHexValue={() => setHexValue("")}
      />
      <ColorPicker
        selectedColor={selectedColor}
        setSelectColor={setSelectedColor}
        colorMode={colorMode}
      />
      <Grid
        pixels={pixels}
        handlePixelClick={(row: number, col: number) => {
          const newPixels = pixels.map((row) => row.slice());
          newPixels[row][col] = selectedColor;
          applyChange(newPixels);
        }}
      />
      <Buttons
        undo={undo}
        redo={redo}
        resetPixels={() => applyChange(createInitialPixels(gridSize))}
        exportToImage={() => exportToImage(pixels)}
        importFromImage={(event) =>
          importFromImage(event, gridSize, colorMode, applyChange)
        }
        undoStack={undoStack}
        redoStack={redoStack}
      />
      <ConversionMethod
        conversionMethod={conversionMethod}
        setConversionMethod={setConversionMethod}
      />
      <HexConverter
        hexValue={hexValue}
        setHexValue={setHexValue}
        size={gridSize}
        colorMode={colorMode}
        handleExport={() =>
          handleExport(pixels, conversionMethod, colorMode, setHexValue)
        }
        handleImport={() =>
          handleImport(
            hexValue,
            gridSize,
            conversionMethod,
            colorMode,
            applyChange,
          )
        }
      />
    </div>
  );
}

export default App;
