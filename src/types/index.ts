export type Color = "white" | "lightgray" | "darkgray" | "black";
export type ColorMode = "fourColors" | "twoColors";
export type ConversionMethod = "leftToRight" | "topToBottomLeft" | "topToBottomRight";
export type CompressionFormat = "none" | "gen1" | "gen2";

export interface Size {
  width: number;
  height: number;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export interface GridProps {
  pixels: Color[][];
  onPixelClick: (row: number, col: number) => void;
}

export interface ColorPickerProps {
  colorMode: ColorMode;
  selectedColor: Color;
  setSelectedColor: React.Dispatch<React.SetStateAction<Color>>;
}

export interface SelectProps<T = string> {
  value: T;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption<T>[];
}

export interface TextareaProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows: number;
  cols: number;
}

export interface ButtonProps {
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}

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
