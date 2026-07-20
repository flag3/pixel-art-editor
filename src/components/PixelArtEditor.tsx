import { usePixelState } from "../hooks/usePixelState";
import { useHexConversion } from "../hooks/useHexConversion";
import { usePixelDownload } from "../hooks/usePixelDownload";
import type { Color, ColorMode, ConversionMethod, CompressionFormat, Size } from "../types";
import {
  colorModeOptions,
  conversionMethodOptions,
  compressionFormatOptions,
  widthOptions,
  heightOptions,
} from "../constants/options";
import { createInitialPixels } from "../utils/hexUtils";
import { ColorPicker } from "./ColorPicker";
import { Grid } from "./Grid";
import { useFileUpload } from "../hooks/useFileUpload";
import { Icon } from "@iconify/react";
import {
  ButtonGroup,
  Flash,
  FormControl,
  IconButton,
  Select,
  Stack,
  Textarea,
} from "@primer/react";
import { useState, useCallback } from "react";

const UploadIcon = () => <Icon icon="material-symbols:upload" width={16} height={16} />;
const UndoIcon = () => <Icon icon="material-symbols:undo" width={16} height={16} />;
const RedoIcon = () => <Icon icon="material-symbols:redo" width={16} height={16} />;
const ClearIcon = () => <Icon icon="material-symbols:delete-outline" width={16} height={16} />;
const DownloadIcon = () => <Icon icon="material-symbols:download" width={16} height={16} />;
const EncodeIcon = () => <Icon icon="material-symbols:code" width={16} height={16} />;
const DecodeIcon = () => <Icon icon="material-symbols:grid-on-outline" width={16} height={16} />;

export default function PixelArtEditor() {
  const [colorMode, setColorMode] = useState<ColorMode>("fourColors");
  const [gridSize, setGridSize] = useState<Size>({ width: 16, height: 16 });
  const [selectedColor, setSelectedColor] = useState<Color>("white");
  const { pixels, applyChange, undo, redo, canUndo, canRedo } = usePixelState(gridSize);

  const handleDecodeSuccess = useCallback(
    (newPixels: Color[][], detectedSize?: Size) => {
      applyChange(newPixels);
      if (detectedSize) {
        setGridSize(detectedSize);
      }
    },
    [applyChange],
  );

  const {
    conversionMethod,
    compressionFormat,
    hexValue,
    error,
    setHexValue,
    setError,
    setConversionMethod,
    setCompressionFormat,
    handleEncode,
    handleDecode,
  } = useHexConversion({ pixels, gridSize, colorMode, onDecodeSuccess: handleDecodeSuccess });

  const { handleFileDownload } = usePixelDownload(pixels);

  const {
    inputRef,
    handleClick: handleUploadClick,
    handleChange: handleUploadChange,
  } = useFileUpload({ colorMode, gridSize, applyChange, onError: setError });

  const handleGridSizeChange = useCallback(
    (dimension: "width" | "height", value: number) => {
      const newSize = { ...gridSize, [dimension]: value };
      setGridSize(newSize);
      applyChange(createInitialPixels(newSize));
    },
    [gridSize, applyChange],
  );

  const handlePixelClick = useCallback(
    (rowIndex: number, colIndex: number) => {
      const newPixels = pixels.map((row) => row.slice());
      newPixels[rowIndex][colIndex] = selectedColor;
      applyChange(newPixels);
    },
    [pixels, selectedColor, applyChange],
  );

  return (
    <Stack direction="vertical" gap="spacious" align="center">
      <Stack direction="horizontal" gap="normal" wrap="wrap" justify="center">
        <FormControl>
          <FormControl.Label>Color Mode</FormControl.Label>
          <Select
            value={colorMode}
            onChange={(event) => {
              setColorMode(event.target.value as ColorMode);
            }}
          >
            {colorModeOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormControl.Label>Width</FormControl.Label>
          <Select
            value={gridSize.width.toString()}
            onChange={(e) => handleGridSizeChange("width", Number(e.target.value))}
          >
            {widthOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormControl.Label>Height</FormControl.Label>
          <Select
            value={gridSize.height.toString()}
            onChange={(e) => handleGridSizeChange("height", Number(e.target.value))}
          >
            {heightOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <Stack direction="vertical" gap="normal" align="center">
        <ColorPicker
          colorMode={colorMode}
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
        />
        <Grid pixels={pixels} onPixelClick={handlePixelClick} />
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
        <Stack direction="horizontal" gap="normal" wrap="wrap" justify="center">
          <FormControl>
            <FormControl.Label>Conversion Method</FormControl.Label>
            <Select
              value={conversionMethod}
              onChange={(event) => setConversionMethod(event.target.value as ConversionMethod)}
            >
              {conversionMethodOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormControl.Label>Compression Format</FormControl.Label>
            <Select
              value={compressionFormat}
              onChange={(event) => setCompressionFormat(event.target.value as CompressionFormat)}
            >
              {compressionFormatOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </FormControl>
        </Stack>
        {error && <Flash variant="danger">{error}</Flash>}
        <FormControl className="hex-form">
          <FormControl.Label>Hex Data</FormControl.Label>
          <Textarea
            block
            className="hex-textarea"
            value={hexValue}
            onChange={(e) => setHexValue(e.target.value)}
            rows={colorMode === "fourColors" ? gridSize.height / 4 : gridSize.height / 8}
            resize="vertical"
          />
        </FormControl>
        <ButtonGroup>
          <IconButton icon={EncodeIcon} aria-label="Encode to hex" onClick={handleEncode} />
          <IconButton icon={DecodeIcon} aria-label="Decode from hex" onClick={handleDecode} />
        </ButtonGroup>
      </Stack>
    </Stack>
  );
}
