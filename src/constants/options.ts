import type { SelectOption, ColorMode, ConversionMethod, CompressionFormat } from "../types";

export const colorModeOptions: SelectOption<ColorMode>[] = [
  { value: "fourColors", label: "4" },
  { value: "twoColors", label: "2" },
];

export const conversionMethodOptions: SelectOption<ConversionMethod>[] = [
  { value: "leftToRight", label: "Rows" },
  { value: "topToBottomLeft", label: "Columns" },
  { value: "topToBottomRight", label: "Columns, reversed" },
];

export const widthOptions: SelectOption[] = Array.from({ length: 20 }, (_, index) => {
  const value = (index + 1) * 8;
  return { value: value.toString(), label: value.toString() };
});

export const heightOptions: SelectOption[] = Array.from({ length: 18 }, (_, index) => {
  const value = (index + 1) * 8;
  return { value: value.toString(), label: value.toString() };
});

export const compressionFormatOptions: SelectOption<CompressionFormat>[] = [
  { value: "none", label: "None" },
  { value: "gen1", label: "Gen 1" },
  { value: "gen2", label: "Gen 2" },
];
