export const GRID_CONFIG = {
  BLOCK_SIZE: 8,
  MAX_WIDTH_BLOCKS: 20,
  MAX_HEIGHT_BLOCKS: 18,
  DEFAULT_SIZE: { width: 16, height: 16 },
} as const;

export const VALIDATION = {
  HEX_PATTERN: /^[0-9A-Fa-f]{2}$/,
  INVALID_CHARS_PATTERN: /[^a-fA-F0-9]/,
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
