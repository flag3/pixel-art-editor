import type { Color } from "./../types";
import { pixelsToHex, hexToPixels } from "./hexUtils.ts";
import { expect, describe, it } from "vitest";

const testFourColorPixel = [
  [
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
  ],
  [
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "black",
    "black",
    "white",
    "white",
    "black",
    "black",
    "white",
    "white",
    "white",
    "white",
  ],
  [
    "white",
    "white",
    "white",
    "white",
    "black",
    "black",
    "lightgray",
    "lightgray",
    "black",
    "black",
    "lightgray",
    "lightgray",
    "black",
    "white",
    "white",
    "white",
  ],
  [
    "white",
    "white",
    "black",
    "black",
    "black",
    "black",
    "black",
    "lightgray",
    "black",
    "black",
    "lightgray",
    "lightgray",
    "black",
    "black",
    "black",
    "white",
  ],
  [
    "white",
    "black",
    "darkgray",
    "darkgray",
    "black",
    "lightgray",
    "lightgray",
    "lightgray",
    "lightgray",
    "black",
    "black",
    "black",
    "black",
    "darkgray",
    "darkgray",
    "black",
  ],
  [
    "black",
    "darkgray",
    "darkgray",
    "darkgray",
    "darkgray",
    "black",
    "lightgray",
    "lightgray",
    "lightgray",
    "lightgray",
    "black",
    "black",
    "darkgray",
    "black",
    "darkgray",
    "black",
  ],
  [
    "black",
    "darkgray",
    "darkgray",
    "darkgray",
    "lightgray",
    "black",
    "lightgray",
    "black",
    "black",
    "lightgray",
    "black",
    "black",
    "darkgray",
    "black",
    "darkgray",
    "black",
  ],
  [
    "black",
    "darkgray",
    "darkgray",
    "darkgray",
    "lightgray",
    "black",
    "lightgray",
    "lightgray",
    "lightgray",
    "darkgray",
    "black",
    "black",
    "black",
    "darkgray",
    "black",
    "white",
  ],
  [
    "black",
    "darkgray",
    "darkgray",
    "darkgray",
    "lightgray",
    "black",
    "lightgray",
    "lightgray",
    "lightgray",
    "darkgray",
    "black",
    "black",
    "black",
    "darkgray",
    "black",
    "white",
  ],
  [
    "black",
    "darkgray",
    "darkgray",
    "darkgray",
    "lightgray",
    "black",
    "lightgray",
    "black",
    "black",
    "lightgray",
    "black",
    "black",
    "darkgray",
    "black",
    "darkgray",
    "black",
  ],
  [
    "black",
    "darkgray",
    "darkgray",
    "darkgray",
    "darkgray",
    "black",
    "lightgray",
    "lightgray",
    "lightgray",
    "lightgray",
    "black",
    "black",
    "darkgray",
    "black",
    "darkgray",
    "black",
  ],
  [
    "white",
    "black",
    "darkgray",
    "darkgray",
    "black",
    "lightgray",
    "lightgray",
    "lightgray",
    "lightgray",
    "black",
    "black",
    "black",
    "black",
    "darkgray",
    "darkgray",
    "black",
  ],
  [
    "white",
    "white",
    "black",
    "black",
    "black",
    "black",
    "black",
    "lightgray",
    "black",
    "black",
    "lightgray",
    "lightgray",
    "black",
    "black",
    "black",
    "white",
  ],
  [
    "white",
    "white",
    "white",
    "white",
    "black",
    "black",
    "lightgray",
    "lightgray",
    "black",
    "black",
    "lightgray",
    "lightgray",
    "black",
    "white",
    "white",
    "white",
  ],
  [
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "black",
    "black",
    "white",
    "white",
    "black",
    "black",
    "white",
    "white",
    "white",
    "white",
  ],
  [
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
  ],
] as Color[][];

const testTwoColorPixel = [
  [
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
  ],
  [
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "black",
    "black",
    "white",
    "white",
    "black",
    "black",
    "white",
    "white",
    "white",
    "white",
  ],
  [
    "white",
    "white",
    "white",
    "white",
    "black",
    "black",
    "white",
    "white",
    "black",
    "black",
    "white",
    "white",
    "black",
    "white",
    "white",
    "white",
  ],
  [
    "white",
    "white",
    "black",
    "black",
    "black",
    "black",
    "black",
    "white",
    "black",
    "black",
    "white",
    "white",
    "black",
    "black",
    "black",
    "white",
  ],
  [
    "white",
    "black",
    "black",
    "black",
    "black",
    "white",
    "white",
    "white",
    "white",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
  ],
  [
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "white",
    "white",
    "white",
    "white",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
  ],
  [
    "black",
    "black",
    "black",
    "black",
    "white",
    "black",
    "white",
    "black",
    "black",
    "white",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
  ],
  [
    "black",
    "black",
    "black",
    "black",
    "white",
    "black",
    "white",
    "white",
    "white",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "white",
  ],
  [
    "black",
    "black",
    "black",
    "black",
    "white",
    "black",
    "white",
    "white",
    "white",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "white",
  ],
  [
    "black",
    "black",
    "black",
    "black",
    "white",
    "black",
    "white",
    "black",
    "black",
    "white",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
  ],
  [
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "white",
    "white",
    "white",
    "white",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
  ],
  [
    "white",
    "black",
    "black",
    "black",
    "black",
    "white",
    "white",
    "white",
    "white",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
  ],
  [
    "white",
    "white",
    "black",
    "black",
    "black",
    "black",
    "black",
    "white",
    "black",
    "black",
    "white",
    "white",
    "black",
    "black",
    "black",
    "white",
  ],
  [
    "white",
    "white",
    "white",
    "white",
    "black",
    "black",
    "white",
    "white",
    "black",
    "black",
    "white",
    "white",
    "black",
    "white",
    "white",
    "white",
  ],
  [
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "black",
    "black",
    "white",
    "white",
    "black",
    "black",
    "white",
    "white",
    "white",
    "white",
  ],
  [
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
    "white",
  ],
] as Color[][];

describe("hexUtils", () => {
  describe("pixelsToHex", () => {
    it("should correctly convert pixels to hex for leftToRight method with fourColors mode", () => {
      const conversionMethod = "leftToRight";
      const colorMode = "fourColors";
      const expected =
        "07 07 08 0F 10 1F 10 1F 3B 3C 3F 37 7F 50 7F 42 E0 E0 10 F0 08 F8 08 F8 DC 3C FC EC FE 0A FE 42 3F 32 3E 39 7F 4F 7F 4F 39 3F 16 1F 11 1F 0E 0E FC 4C 7C 9C FE F2 FE F2 9C FC 68 F8 88 F8 70 70";

      const result = pixelsToHex(testFourColorPixel, conversionMethod, colorMode);
      expect(result).toEqual(expected);
    });

    it("should correctly convert pixels to hex for topToBottomLeft method with fourColors mode", () => {
      const conversionMethod = "topToBottomLeft";
      const colorMode = "fourColors";
      const expected =
        "07 07 08 0F 10 1F 10 1F 3B 3C 3F 37 7F 50 7F 42 3F 32 3E 39 7F 4F 7F 4F 39 3F 16 1F 11 1F 0E 0E E0 E0 10 F0 08 F8 08 F8 DC 3C FC EC FE 0A FE 42 FC 4C 7C 9C FE F2 FE F2 9C FC 68 F8 88 F8 70 70";

      const result = pixelsToHex(testFourColorPixel, conversionMethod, colorMode);
      expect(result).toEqual(expected);
    });

    it("should correctly convert pixels to hex for topToBottomRight method with fourColors mode", () => {
      const conversionMethod = "topToBottomRight";
      const colorMode = "fourColors";
      const expected =
        "E0 E0 10 F0 08 F8 08 F8 DC 3C FC EC FE 0A FE 42 FC 4C 7C 9C FE F2 FE F2 9C FC 68 F8 88 F8 70 70 07 07 08 0F 10 1F 10 1F 3B 3C 3F 37 7F 50 7F 42 3F 32 3E 39 7F 4F 7F 4F 39 3F 16 1F 11 1F 0E 0E";

      const result = pixelsToHex(testFourColorPixel, conversionMethod, colorMode);
      expect(result).toEqual(expected);
    });

    it("should correctly convert pixels to hex for leftToRight method with twoColors mode", () => {
      const conversionMethod = "leftToRight";
      const colorMode = "twoColors";
      const expected =
        "07 0F 1F 1F 3C 37 50 42 E0 F0 F8 F8 3C EC 0A 42 32 39 4F 4F 3F 1F 1F 0E 4C 9C F2 F2 FC F8 F8 70";

      const result = pixelsToHex(testTwoColorPixel, conversionMethod, colorMode);
      expect(result).toEqual(expected);
    });

    it("should correctly convert pixels to hex for topToBottomLeft method with twoColors mode", () => {
      const conversionMethod = "topToBottomLeft";
      const colorMode = "twoColors";
      const expected =
        "07 0F 1F 1F 3C 37 50 42 32 39 4F 4F 3F 1F 1F 0E E0 F0 F8 F8 3C EC 0A 42 4C 9C F2 F2 FC F8 F8 70";

      const result = pixelsToHex(testTwoColorPixel, conversionMethod, colorMode);
      expect(result).toEqual(expected);
    });

    it("should correctly convert pixels to hex for topToBottomRight method with twoColors mode", () => {
      const conversionMethod = "topToBottomRight";
      const colorMode = "twoColors";
      const expected =
        "E0 F0 F8 F8 3C EC 0A 42 4C 9C F2 F2 FC F8 F8 70 07 0F 1F 1F 3C 37 50 42 32 39 4F 4F 3F 1F 1F 0E";

      const result = pixelsToHex(testTwoColorPixel, conversionMethod, colorMode);
      expect(result).toEqual(expected);
    });
  });

  describe("hexToPixels", () => {
    it("should correctly convert hex to pixels for leftToRight method with fourColors mode", () => {
      const hex =
        "07 07 08 0F 10 1F 10 1F 3B 3C 3F 37 7F 50 7F 42 E0 E0 10 F0 08 F8 08 F8 DC 3C FC EC FE 0A FE 42 3F 32 3E 39 7F 4F 7F 4F 39 3F 16 1F 11 1F 0E 0E FC 4C 7C 9C FE F2 FE F2 9C FC 68 F8 88 F8 70 70";
      const size = { width: 16, height: 16 };
      const conversionMethod = "leftToRight";
      const colorMode = "fourColors";

      const result = hexToPixels(hex, size, conversionMethod, colorMode);
      expect(result.success).toBe(true);
      expect(result.data).toStrictEqual(testFourColorPixel);
    });

    it("should correctly convert hex to pixels for topToBottomLeft method with fourColors mode", () => {
      const hex =
        "07 07 08 0F 10 1F 10 1F 3B 3C 3F 37 7F 50 7F 42 3F 32 3E 39 7F 4F 7F 4F 39 3F 16 1F 11 1F 0E 0E E0 E0 10 F0 08 F8 08 F8 DC 3C FC EC FE 0A FE 42 FC 4C 7C 9C FE F2 FE F2 9C FC 68 F8 88 F8 70 70";
      const size = { width: 16, height: 16 };
      const conversionMethod = "topToBottomLeft";
      const colorMode = "fourColors";

      const result = hexToPixels(hex, size, conversionMethod, colorMode);
      expect(result.success).toBe(true);
      expect(result.data).toStrictEqual(testFourColorPixel);
    });

    it("should correctly convert hex to pixels for topToBottomRight method with fourColors mode", () => {
      const hex =
        "E0 E0 10 F0 08 F8 08 F8 DC 3C FC EC FE 0A FE 42 FC 4C 7C 9C FE F2 FE F2 9C FC 68 F8 88 F8 70 70 07 07 08 0F 10 1F 10 1F 3B 3C 3F 37 7F 50 7F 42 3F 32 3E 39 7F 4F 7F 4F 39 3F 16 1F 11 1F 0E 0E";
      const size = { width: 16, height: 16 };
      const conversionMethod = "topToBottomRight";
      const colorMode = "fourColors";

      const result = hexToPixels(hex, size, conversionMethod, colorMode);
      expect(result.success).toBe(true);
      expect(result.data).toStrictEqual(testFourColorPixel);
    });

    it("should correctly convert hex to pixels for leftToRight method with twoColors mode", () => {
      const hex =
        "07 0F 1F 1F 3C 37 50 42 E0 F0 F8 F8 3C EC 0A 42 32 39 4F 4F 3F 1F 1F 0E 4C 9C F2 F2 FC F8 F8 70";
      const size = { width: 16, height: 16 };
      const conversionMethod = "leftToRight";
      const colorMode = "twoColors";

      const result = hexToPixels(hex, size, conversionMethod, colorMode);
      expect(result.success).toBe(true);
      expect(result.data).toStrictEqual(testTwoColorPixel);
    });

    it("should correctly convert hex to pixels for topToBottomLeft method with twoColors mode", () => {
      const hex =
        "07 0F 1F 1F 3C 37 50 42 32 39 4F 4F 3F 1F 1F 0E E0 F0 F8 F8 3C EC 0A 42 4C 9C F2 F2 FC F8 F8 70";
      const size = { width: 16, height: 16 };
      const conversionMethod = "topToBottomLeft";
      const colorMode = "twoColors";

      const result = hexToPixels(hex, size, conversionMethod, colorMode);
      expect(result.success).toBe(true);
      expect(result.data).toStrictEqual(testTwoColorPixel);
    });

    it("should correctly convert hex to pixels for topToBottomRight method with twoColors mode", () => {
      const hex =
        "E0 F0 F8 F8 3C EC 0A 42 4C 9C F2 F2 FC F8 F8 70 07 0F 1F 1F 3C 37 50 42 32 39 4F 4F 3F 1F 1F 0E";
      const size = { width: 16, height: 16 };
      const conversionMethod = "topToBottomRight";
      const colorMode = "twoColors";

      const result = hexToPixels(hex, size, conversionMethod, colorMode);
      expect(result.success).toBe(true);
      expect(result.data).toStrictEqual(testTwoColorPixel);
    });
  });
});
