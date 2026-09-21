import { usePixelState } from "../hooks/usePixelState";
import { useHexConversion } from "../hooks/useHexConversion";
import { usePixelDownload } from "../hooks/usePixelDownload";
import type { Color, ColorCount, SelectOption, Size } from "../types";
import {
  colorCountOptions,
  tileOrderOptions,
  compressionOptions,
  widthOptions,
  heightOptions,
} from "../constants/options";
import { createInitialPixels } from "../utils/hexUtils";
import type { CellPoint } from "../utils/gridUtils";
import { ColorPicker } from "./ColorPicker";
import { Grid } from "./Grid";
import { useFileUpload } from "../hooks/useFileUpload";
import { Icon } from "@iconify/react";
import {
  ButtonGroup,
  Flash,
  FormControl,
  IconButton,
  SegmentedControl,
  Select,
  Stack,
  Textarea,
} from "@primer/react";
import { useState, useCallback, useId } from "react";

const UploadIcon = () => <Icon icon="material-symbols:upload" />;
const UndoIcon = () => <Icon icon="material-symbols:undo" />;
const RedoIcon = () => <Icon icon="material-symbols:redo" />;
const ClearIcon = () => <Icon icon="material-symbols:delete-outline" />;
const DownloadIcon = () => <Icon icon="material-symbols:download" />;
const EncodeIcon = () => <Icon icon="material-symbols:arrow-downward" />;
const DecodeIcon = () => <Icon icon="material-symbols:arrow-upward" />;

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}

const SelectField = <T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<T>) => (
  <FormControl>
    <FormControl.Label>{label}</FormControl.Label>
    <Select value={value} onChange={(event) => onChange(event.target.value as T)}>
      {options.map((option) => (
        <Select.Option key={option.value} value={option.value}>
          {option.label}
        </Select.Option>
      ))}
    </Select>
  </FormControl>
);

export default function PixelArtEditor() {
  const colorsLabelId = useId();
  const [colorCount, setColorCount] = useState<ColorCount>(4);
  const [selectedColor, setSelectedColor] = useState<Color>("white");
  const { pixels, applyChange, undo, redo, canUndo, canRedo } = usePixelState({
    width: 16,
    height: 16,
  });
  const gridSize: Size = { width: pixels.length, height: pixels[0]?.length ?? 0 };

  const {
    tileOrder,
    compression,
    hexValue,
    error,
    setHexValue,
    setError,
    setTileOrder,
    setCompression,
    handleEncode,
    handleDecode,
  } = useHexConversion({ pixels, gridSize, colorCount, onDecodeSuccess: applyChange });

  const { handleFileDownload } = usePixelDownload(pixels);

  const {
    inputRef,
    handleClick: handleUploadClick,
    handleChange: handleUploadChange,
  } = useFileUpload({ colorCount, gridSize, applyChange, onError: setError });

  const handleGridSizeChange = (dimension: "width" | "height", value: number) => {
    applyChange(createInitialPixels({ ...gridSize, [dimension]: value }));
  };

  const handlePaintCells = useCallback(
    (cells: CellPoint[]) => {
      const newPixels = pixels.map((column) => column.slice());
      for (const [x, y] of cells) {
        if (newPixels[x]?.[y] !== undefined) {
          newPixels[x][y] = selectedColor;
        }
      }
      applyChange(newPixels);
    },
    [pixels, selectedColor, applyChange],
  );

  return (
    <Stack direction="vertical" gap="spacious" align="center">
      <Stack direction="horizontal" gap="normal" wrap="wrap" justify="center">
        <FormControl>
          <FormControl.Label as="span" id={colorsLabelId}>
            Colors
          </FormControl.Label>
          <SegmentedControl
            aria-labelledby={colorsLabelId}
            onChange={(index) =>
              setColorCount(Number(colorCountOptions[index].value) as ColorCount)
            }
          >
            {colorCountOptions.map((option) => (
              <SegmentedControl.Button
                key={option.value}
                selected={colorCount.toString() === option.value}
              >
                {option.label}
              </SegmentedControl.Button>
            ))}
          </SegmentedControl>
        </FormControl>
        <SelectField
          label="Width"
          value={gridSize.width.toString()}
          options={widthOptions}
          onChange={(value) => handleGridSizeChange("width", Number(value))}
        />
        <SelectField
          label="Height"
          value={gridSize.height.toString()}
          options={heightOptions}
          onChange={(value) => handleGridSizeChange("height", Number(value))}
        />
      </Stack>
      <Stack direction="vertical" gap="normal" align="center">
        <ColorPicker
          colorCount={colorCount}
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
        />
        <Grid pixels={pixels} onPaintCells={handlePaintCells} />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden-input"
          onChange={handleUploadChange}
        />
        <ButtonGroup>
          <IconButton icon={UploadIcon} aria-label="Upload image" onClick={handleUploadClick} />
          <IconButton icon={UndoIcon} aria-label="Undo" onClick={undo} disabled={!canUndo} />
          <IconButton icon={RedoIcon} aria-label="Redo" onClick={redo} disabled={!canRedo} />
          <IconButton
            icon={ClearIcon}
            aria-label="Clear grid"
            onClick={() => applyChange(createInitialPixels(gridSize))}
          />
          <IconButton
            icon={DownloadIcon}
            aria-label="Download image"
            onClick={handleFileDownload}
          />
        </ButtonGroup>
      </Stack>
      <Stack direction="vertical" gap="normal" align="center">
        <Stack direction="horizontal" gap="normal" wrap="wrap" justify="center" align="end">
          <SelectField
            label="Tile Order"
            value={tileOrder}
            options={tileOrderOptions}
            onChange={setTileOrder}
          />
          <SelectField
            label="Compression"
            value={compression}
            options={compressionOptions}
            onChange={setCompression}
          />
          <ButtonGroup>
            <IconButton icon={EncodeIcon} aria-label="Encode to hex" onClick={handleEncode} />
            <IconButton icon={DecodeIcon} aria-label="Decode from hex" onClick={handleDecode} />
          </ButtonGroup>
        </Stack>
        {error && <Flash variant="danger">{error}</Flash>}
        <FormControl>
          <FormControl.Label>Hex Data</FormControl.Label>
          <Textarea
            className="hex-textarea"
            value={hexValue}
            onChange={(e) => setHexValue(e.target.value)}
            rows={colorCount === 4 ? gridSize.height / 4 : gridSize.height / 8}
            resize="both"
          />
        </FormControl>
      </Stack>
    </Stack>
  );
}
