import { Color, ColorMode, twoColors, fourColors } from "./../constants/index";

interface ColorPickerProps {
  selectedColor: Color;
  setSelectColor: React.Dispatch<React.SetStateAction<Color>>;
  colorMode: ColorMode;
}

const ColorPicker = ({
  selectedColor,
  setSelectColor,
  colorMode,
}: ColorPickerProps) => {
  const colors = colorMode === "twoColors" ? twoColors : fourColors;
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
