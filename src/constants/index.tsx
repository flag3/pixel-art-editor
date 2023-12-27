export type Color = "white" | "lightgray" | "darkgray" | "black";
export type ConversionMethod =
  | "leftToRight"
  | "topToBottomLeft"
  | "topToBottomRight";
export type Size = { width: number; height: number };
export type ColorMode = "fourColors" | "twoColors";
export const colorsByMode: Record<ColorMode, Color[]> = {
  twoColors: ["white", "black"],
  fourColors: ["white", "lightgray", "darkgray", "black"],
};
export const widths = Array.from({ length: 20 }, (_, i) => 8 * (i + 1));
export const heights = Array.from({ length: 18 }, (_, i) => 8 * (i + 1));
export const createInitialPixels = (size: Size): Color[][] => {
  return Array.from({ length: size.width }, () =>
    Array.from({ length: size.height }, () => "white"),
  );
};
