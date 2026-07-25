import type { SelectOption, TileOrder, Compression } from "../types";

export const colorCountOptions: SelectOption[] = [
  { value: "4", label: "4" },
  { value: "2", label: "2" },
];

export const tileOrderOptions: SelectOption<TileOrder>[] = [
  { value: "rows", label: "Rows" },
  { value: "columns", label: "Columns" },
  { value: "columnsReversed", label: "Columns, reversed" },
];

const tileSizeOptions = (count: number): SelectOption[] =>
  Array.from({ length: count }, (_, index) => {
    const value = ((index + 1) * 8).toString();
    return { value, label: value };
  });

export const widthOptions = tileSizeOptions(20);
export const heightOptions = tileSizeOptions(18);

export const compressionOptions: SelectOption<Compression>[] = [
  { value: "none", label: "None" },
  { value: "gen1", label: "Gen 1" },
  { value: "gen2", label: "Gen 2" },
];
