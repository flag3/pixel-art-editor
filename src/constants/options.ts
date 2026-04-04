import type { SelectOption, ColorMode, ConversionMethod, CompressionFormat } from "../types";

export const colorModeOptions: SelectOption<ColorMode>[] = [
  { value: "fourColors", label: "4" },
  { value: "twoColors", label: "2" },
];

export const conversionMethodOptions: SelectOption<ConversionMethod>[] = [
  { value: "leftToRight", label: "Left to Right, Top to Bottom" },
  { value: "topToBottomLeft", label: "Top to Bottom, Left to Right" },
  { value: "topToBottomRight", label: "Top to Bottom, Right to Left" },
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
  { value: "none", label: "none" },
  { value: "gen1", label: "gen1" },
  { value: "gen2", label: "gen2" },
];
