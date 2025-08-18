import { ColorPickerProps } from "../types";
import { colorsByMode } from "../utils/colorUtils";
import { useMemo } from "react";

export const ColorPicker = ({
  colorMode,
  selectedColor,
  setSelectedColor,
}: ColorPickerProps) => {
  const availableColors = useMemo(() => colorsByMode[colorMode], [colorMode]);
  return (
    <div className="color-picker">
      {availableColors.map((color) => (
        <div
          key={color}
          className={`color-swatch ${color} ${selectedColor === color ? "selected" : ""}`}
          onClick={() => setSelectedColor(color)}
        ></div>
      ))}
    </div>
  );
};
