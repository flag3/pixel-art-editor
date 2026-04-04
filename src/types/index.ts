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
  onColorSelect: (color: Color) => void;
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
