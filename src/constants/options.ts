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

export const widthOptions: SelectOption[] = Array.from({ length: 20 }, (_, index) => {
  const value = (index + 1) * 8;
  return { value: value.toString(), label: value.toString() };
});

export const heightOptions: SelectOption[] = Array.from({ length: 18 }, (_, index) => {
  const value = (index + 1) * 8;
  return { value: value.toString(), label: value.toString() };
});

export const compressionOptions: SelectOption<Compression>[] = [
  { value: "none", label: "None" },
  { value: "gen1", label: "Gen 1" },
  { value: "gen2", label: "Gen 2" },
];
