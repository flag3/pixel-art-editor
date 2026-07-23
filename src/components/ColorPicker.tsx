import type { Color, ColorCount } from "../types";
import { colorsByCount } from "../utils/colorUtils";

interface ColorPickerProps {
  colorCount: ColorCount;
  selectedColor: Color;
  onColorSelect: (color: Color) => void;
}

export const ColorPicker = ({ colorCount, selectedColor, onColorSelect }: ColorPickerProps) => {
  const availableColors = colorsByCount[colorCount];
  return (
    <div className="color-picker">
      {availableColors.map((color) => (
        <button
          type="button"
          key={color}
          className={`color-swatch ${color} ${selectedColor === color ? "selected" : ""}`}
          aria-pressed={selectedColor === color}
          onClick={() => onColorSelect(color)}
          aria-label={`Select ${color} color`}
        ></button>
      ))}
    </div>
  );
};
