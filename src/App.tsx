import { useState } from "react";
import ColorPicker from "./components/ColorPicker";
import Grid from "./components/Grid";
import GridSize from "./components/GridSize";
import Buttons from "./components/Buttons";
import ConversionMethod from "./components/ConversionMethod";
import HexConverter from "./components/HexConverter";
import { handleExport, handleImport } from "./utils/hexUtils";
import { exportToImage, importFromImage } from "./utils/imageUtils";
import { useUndoRedo } from "./hooks/useUndoRedo";
import { Color, Method, createInitialPixels } from "./constants/index";
import "./App.css";

function App() {
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
        resetPixels={() =>
          applyChange(createInitialPixels(gridSize.rows, gridSize.cols))
        }
        exportToImage={() => exportToImage(pixels)}
        importFromImage={(event) =>
          importFromImage(event, gridSize.rows, gridSize.cols, applyChange)
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
        gridSize={gridSize}
        handleExport={() => handleExport(pixels, conversionMethod, setHexValue)}
        handleImport={() =>
          handleImport(
            hexValue,
            gridSize.rows,
            gridSize.cols,
            conversionMethod,
            applyChange
          )
        }
      />
    </div>
  );
}

export default App;
