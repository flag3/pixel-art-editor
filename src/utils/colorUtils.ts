import type { Color, ColorCount } from "./../types";

export const colorsByCount: Record<ColorCount, Color[]> = {
  2: ["white", "black"],
  4: ["white", "lightgray", "darkgray", "black"],
};

export const readColorStyles = (): Record<Color, string> => {
  const computedStyle = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    colorsByCount[4].map((color) => [color, computedStyle.getPropertyValue(`--${color}`).trim()]),
  ) as Record<Color, string>;
};

export const createColorMatcher = (
  colorCount: ColorCount,
): ((r: number, g: number, b: number) => Color) => {
  const styles = readColorStyles();
  const palette = colorsByCount[colorCount].flatMap((color) => {
    const match = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(styles[color]);
    return match ? [{ color, r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) }] : [];
  });

  return (r, g, b) => {
    let closestColor: Color = "white";
    let minDistance = Infinity;

    for (const entry of palette) {
      const distance = (entry.r - r) ** 2 + (entry.g - g) ** 2 + (entry.b - b) ** 2;
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = entry.color;
      }
    }

    return closestColor;
  };
};
