export type Color = "white" | "lightgray" | "darkgray" | "black";
export type ColorMode = "fourColors" | "twoColors";
export type ConversionMethod = "leftToRight" | "topToBottomLeft" | "topToBottomRight";
export type CompressionFormat = "none" | "lz3";

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

export interface SelectorProps<T = string> {
  className?: string;
  label: string;
  value: T;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption<T>[];
}

export interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface FileUploaderProps {
  colorMode: ColorMode;
  gridSize: Size;
  applyChange: (newPixels: Color[][]) => void;
}

export interface HexConverterProps {
  hexValue: string;
  setHexValue: React.Dispatch<React.SetStateAction<string>>;
  colorMode: ColorMode;
  gridSize: Size;
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
  { value: "none", label: "None" },
  { value: "lz3", label: "LZ3" },
];
