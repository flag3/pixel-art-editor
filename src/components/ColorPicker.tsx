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
        <div
          key={color}
          className={`color-swatch ${color} ${selectedColor === color ? "selected" : ""}`}
          onClick={() => onColorSelect(color)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onColorSelect(color);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Select ${color} color`}
        ></div>
      ))}
    </div>
  );
};
