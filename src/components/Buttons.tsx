import { Color } from "./../types";

type ButtonsProps = {
  undoStack: Color[][][];
  redoStack: Color[][][];
  upload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  undo: () => void;
  redo: () => void;
  deleteGridContents: () => void;
  download: () => void;
};

const Buttons = ({
  undoStack,
  redoStack,
  upload,
  undo,
  redo,
  deleteGridContents,
  download,
}: ButtonsProps) => {
  return (
    <div className="button-container">
      <div className="file-upload-wrapper">
        <input
          type="file"
          id="fileInput"
          className="hidden-input"
          onChange={upload}
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
      <button onClick={deleteGridContents}>
        <span className="material-icons-outlined">delete</span>
      </button>
      <button onClick={download}>
        <span className="material-icons-outlined">download</span>
      </button>
    </div>
  );
};

export default Buttons;
