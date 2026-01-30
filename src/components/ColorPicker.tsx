import type { ColorPickerProps } from "../types";
import { colorsByMode } from "../utils/colorUtils";
import { useMemo } from "react";

export const ColorPicker = ({ colorMode, selectedColor, setSelectedColor }: ColorPickerProps) => {
  const availableColors = useMemo(() => colorsByMode[colorMode], [colorMode]);
  return (
    <div className="color-picker">
      {availableColors.map((color) => (
        <div
          key={color}
          className={`color-swatch ${color} ${selectedColor === color ? "selected" : ""}`}
          onClick={() => setSelectedColor(color)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelectedColor(color);
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
