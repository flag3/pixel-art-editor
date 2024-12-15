type FileUploaderProps = {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function FileUploader({ onFileUpload }: FileUploaderProps) {
  return (
    <div className="file-upload-wrapper">
      <input
        type="file"
        id="fileInput"
        className="hidden-input"
        onChange={onFileUpload}
      />
      <button onClick={() => document.getElementById("fileInput")!.click()}>
        <span className="material-icons-outlined">upload</span>
      </button>
    </div>
  );
}
