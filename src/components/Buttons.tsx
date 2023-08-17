type Color = "white" | "lightgray" | "darkgray" | "black";

type ButtonsProps = {
  undo: () => void;
  redo: () => void;
  resetPixels: () => void;
  exportToImage: () => void;
  importFromImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  undoStack: Color[][][];
  redoStack: Color[][][];
};

const Buttons = ({
  undo,
  redo,
  resetPixels,
  exportToImage,
  importFromImage,
  undoStack,
  redoStack,
}: ButtonsProps) => {
  return (
    <div className="button-container">
      <div className="file-upload-wrapper">
        <input
          type="file"
          id="fileInput"
          className="hidden-input"
          onChange={importFromImage}
        />
        <button onClick={() => document.getElementById("fileInput")!.click()}>
          <span className="material-icons-outlined">upload</span>
        </button>
      </div>
      <button onClick={undo} disabled={!undoStack.length}>
        <span className="material-icons-outlined">undo</span>
      </button>
      <button onClick={redo} disabled={!redoStack.length}>
        <span className="material-icons-outlined">redo</span>
      </button>
      <button onClick={resetPixels}>
        <span className="material-icons-outlined">delete</span>
      </button>
      <button onClick={exportToImage}>
        <span className="material-icons-outlined">download</span>
      </button>
    </div>
  );
};

export default Buttons;
