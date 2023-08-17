type Color = "white" | "lightgray" | "darkgray" | "black";
const colors: Color[] = ["white", "lightgray", "darkgray", "black"];

interface ColorPickerProps {
  selectedColor: Color;
  setSelectColor: React.Dispatch<React.SetStateAction<Color>>;
}

const ColorPicker = ({ selectedColor, setSelectColor }: ColorPickerProps) => {
  return (
    <div className="color-picker">
      {colors.map((color) => (
        <div
          key={color}
          className={`color-swatch ${color} ${
            selectedColor === color ? "selected" : ""
          }`}
          onClick={() => setSelectColor(color)}
        ></div>
      ))}
    </div>
  );
};

export default ColorPicker;
