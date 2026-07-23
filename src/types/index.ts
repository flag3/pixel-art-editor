export type Color = "white" | "lightgray" | "darkgray" | "black";
export type ColorCount = 4 | 2;
export type TileOrder = "rows" | "columns" | "columnsReversed";
export type Compression = "none" | "gen1" | "gen2";

export interface Size {
  width: number;
  height: number;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
}
