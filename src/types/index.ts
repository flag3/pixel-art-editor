export type Color = "white" | "lightgray" | "darkgray" | "black";
export type ColorMode = "fourColors" | "twoColors";

export const colorModeOptions: {
  value: ColorMode;
  label: string;
}[] = [
  { value: "fourColors", label: "4" },
  { value: "twoColors", label: "2" },
];

export type ConversionMethod =
  | "leftToRight"
  | "topToBottomLeft"
  | "topToBottomRight";

export const conversionMethodOptions: {
  value: ConversionMethod;
  label: string;
}[] = [
  { value: "leftToRight", label: "Left to Right, Top to Bottom" },
  { value: "topToBottomLeft", label: "Top to Bottom, Left to Right" },
  { value: "topToBottomRight", label: "Top to Bottom, Right to Left" },
];

export type Size = { width: number; height: number };

export const widthOptions = Array.from({ length: 20 }, (_, index) => {
  const value = (index + 1) * 8;
  return { value: value.toString(), label: value.toString() };
});

export const heightOptions = Array.from({ length: 18 }, (_, index) => {
  const value = (index + 1) * 8;
  return { value: value.toString(), label: value.toString() };
});
