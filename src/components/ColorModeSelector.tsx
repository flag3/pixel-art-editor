import { ColorMode } from "./../types";

type ColorModeSelectorProps = {
  colorMode: ColorMode;
  setColorMode: React.Dispatch<React.SetStateAction<ColorMode>>;
};

const ColorModeSelector = ({
  colorMode,
  setColorMode,
}: ColorModeSelectorProps) => {
  return (
    <div className="color-mode-selector">
      <label>
        <select
          value={colorMode}
          onChange={(e) => setColorMode(e.target.value as ColorMode)}
        >
          <option value="fourColors">4</option>
          <option value="twoColors">2</option>
        </select>
        Colors
      </label>
    </div>
  );
};

export default ColorModeSelector;
