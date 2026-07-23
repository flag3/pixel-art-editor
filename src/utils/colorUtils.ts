import type { Color, ColorCount } from "./../types";

export const colorsByCount: Record<ColorCount, Color[]> = {
  2: ["white", "black"],
  4: ["white", "lightgray", "darkgray", "black"],
};

export const getClosestColor = (r: number, g: number, b: number, colorCount: ColorCount): Color => {
  const computedStyle = getComputedStyle(document.documentElement);
  let minDistance = Infinity;
  let closestColor: Color = "white";

  for (const color of colorsByCount[colorCount]) {
    const cssRGB = computedStyle.getPropertyValue(`--${color}`).trim();
    const match = cssRGB.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (match) {
      const colorR = parseInt(match[1]);
      const colorG = parseInt(match[2]);
      const colorB = parseInt(match[3]);

      const distance = Math.sqrt(
        Math.pow(colorR - r, 2) + Math.pow(colorG - g, 2) + Math.pow(colorB - b, 2),
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    }
  }

  return closestColor;
};
