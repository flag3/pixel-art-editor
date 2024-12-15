import { Color, ColorMode } from "./../types";
import { colorsByMode } from "./../utils/colorUtils";

type ColorPickerProps = {
  colorMode: ColorMode;
  selectedColor: Color;
  setSelectedColor: React.Dispatch<React.SetStateAction<Color>>;
};

export default function ColorPicker({
  colorMode,
  selectedColor,
  setSelectedColor,
}: ColorPickerProps) {
  return (
    <div className="color-picker">
      {colorsByMode[colorMode].map((color) => (
        <div
          key={color}
          className={`color-swatch ${color} ${
            selectedColor === color ? "selected" : ""
          }`}
          onClick={() => setSelectedColor(color)}
        ></div>
      ))}
    </div>
  );
}
