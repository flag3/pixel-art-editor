export const GRID_CONFIG = {
  DEFAULT_SIZE: { width: 16, height: 16 },
} as const;

export const DOWNLOAD_CONFIG = {
  DEFAULT_FILENAME: "pixel-art.png",
  CANVAS_SCALE: 1,
} as const;

export const COLOR_BITS = {
  white: [0, 0],
  lightgray: [1, 0],
  darkgray: [0, 1],
  black: [1, 1],
} as const;

export const BITS_TO_COLOR = {
  "00": "white",
  "10": "lightgray",
  "01": "darkgray",
  "11": "black",
} as const;
