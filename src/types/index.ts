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
