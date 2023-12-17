import { ColorMode } from "./../constants/index";

function ColorModeSelector({
  colorMode,
  setColorMode,
}: {
  colorMode: ColorMode;
  setColorMode: React.Dispatch<React.SetStateAction<ColorMode>>;
}) {
  return (
    <div className="color-mode-selector">
      <label>
        Color Mode:
        <select
          value={colorMode}
          onChange={(e) => setColorMode(e.target.value as ColorMode)}
        >
          <option value="fourColors">Four Colors</option>
          <option value="twoColors">Two Colors</option>
        </select>
      </label>
    </div>
  );
}

export default ColorModeSelector;
