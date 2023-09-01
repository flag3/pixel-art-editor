export type Color = "white" | "lightgray" | "darkgray" | "black";
export type Method = "leftToRight" | "topToBottomLeft" | "topToBottomRight";
export const colors: Color[] = ["white", "lightgray", "darkgray", "black"];
export function createInitialPixels(rows: number, cols: number): Color[][] {
  return Array(cols).fill(Array(rows).fill("white"));
}
export const possibleRows = Array.from({ length: 18 }, (_, i) => 8 * (i + 1));
export const possibleCols = Array.from({ length: 20 }, (_, i) => 8 * (i + 1));
