export type Color = "white" | "lightgray" | "darkgray" | "black";
export type Method = "leftToRight" | "topToBottomLeft" | "topToBottomRight";
export type Size = { width: number; height: number };
export const colors: Color[] = ["white", "lightgray", "darkgray", "black"];
export const widths = Array.from({ length: 20 }, (_, i) => 8 * (i + 1));
export const heights = Array.from({ length: 18 }, (_, i) => 8 * (i + 1));
export function createInitialPixels(size: Size): Color[][] {
  return Array(size.width).fill(Array(size.height).fill("white"));
}
