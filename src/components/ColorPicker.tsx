import type { Color, ColorMode } from "../types";
import { colorsByMode } from "../utils/colorUtils";

interface ColorPickerProps {
  colorMode: ColorMode;
  selectedColor: Color;
  onColorSelect: (color: Color) => void;
}

export const ColorPicker = ({ colorMode, selectedColor, onColorSelect }: ColorPickerProps) => {
  const availableColors = colorsByMode[colorMode];
  return (
    <div className="color-picker">
      {availableColors.map((color) => (
        <button
          type="button"
          key={color}
          className={`color-swatch ${color} ${selectedColor === color ? "selected" : ""}`}
          onClick={() => onColorSelect(color)}
          aria-label={`Select ${color} color`}
        ></button>
      ))}
    </div>
  );
};
