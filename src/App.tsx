import { useState, useEffect } from "react";
import ColorPicker from "./components/ColorPicker";
import Grid from "./components/Grid";
import Buttons from "./components/Buttons";
import HexConverter from "./components/HexConverter";
import { handleExport, handleImport } from "./utils/hexUtils";
import { exportToImage, importFromImage } from "./utils/imageUtils";
import { useUndoRedo } from "./hooks/useUndoRedo";
import { Color, initialPixels } from "./constants/index";
import "./App.css";

function App() {
  const [selectedColor, setSelectedColor] = useState<Color>("white");
  const [hexValue, setHexValue] = useState("");
  const { pixels, undoStack, redoStack, applyChange, undo, redo } =
    useUndoRedo();

  const [tweeting, setTweeting] = useState(false);
  const handleTweet = () => {
    handleExport(pixels, setHexValue);
    setTweeting(true);
  };

  useEffect(() => {
    if (tweeting) {
      const tweetText = `Check out my pixel art:\n${hexValue}\nhttps://flag3.github.io/pixel-art-editor/`;
      const tweetURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        tweetText
      )}`;
      window.open(tweetURL, "_blank");
      setTweeting(false);
    }
  }, [hexValue, tweeting]);

  return (
    <div className="container">
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
        resetPixels={() => applyChange(initialPixels)}
        exportToImage={() => exportToImage(pixels)}
        importFromImage={(event) => importFromImage(event, applyChange)}
        undoStack={undoStack}
        redoStack={redoStack}
      />
      <HexConverter
        hexValue={hexValue}
        setHexValue={setHexValue}
        handleExport={() => handleExport(pixels, setHexValue)}
        handleImport={() => handleImport(hexValue, applyChange)}
      />
      <button onClick={handleTweet}>X</button>
    </div>
  );
}

export default App;
