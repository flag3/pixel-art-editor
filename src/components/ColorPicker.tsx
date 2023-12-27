import { Color, ColorMode, colorsByMode } from "./../constants/index";

type ColorPickerProps = {
  selectedColor: Color;
  setSelectColor: React.Dispatch<React.SetStateAction<Color>>;
  colorMode: ColorMode;
};

const ColorPicker = ({
  selectedColor,
  setSelectColor,
  colorMode,
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
