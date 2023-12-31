import { Color, ColorMode } from "./../types";
import { colorsByMode } from "./../utils/colorUtils";

type ColorPickerProps = {
  colorMode: ColorMode;
  selectedColor: Color;
  setSelectColor: React.Dispatch<React.SetStateAction<Color>>;
};

const ColorPicker = ({
  colorMode,
  selectedColor,
  setSelectColor,
}: ColorPickerProps) => {
  return (
    <div className="color-picker">
      {colorsByMode[colorMode].map((color) => (
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
