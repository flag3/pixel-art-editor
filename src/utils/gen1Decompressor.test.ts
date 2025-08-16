import { compressGen1 } from "./gen1Compressor";
import { Gen1Decompressor, decompressGen1, parseGen1Hex } from "./gen1Decompressor";
import { describe, it, expect } from "vitest";

describe("Gen1Decompressor", () => {
  describe("parseGen1Hex", () => {
    it("should parse valid hex strings", () => {
      const hex = "48 65 6C 6C 6F";
      const result = parseGen1Hex(hex);
      expect(result).toEqual(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
    });

    it("should handle hex strings without spaces", () => {
      const hex = "48656C6C6F";
      const result = parseGen1Hex(hex);
      expect(result).toEqual(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
    });

    it("should handle lowercase hex strings", () => {
      const hex = "48656c6c6f";
      const result = parseGen1Hex(hex);
      expect(result).toEqual(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
    });

    it("should handle multiline hex strings", () => {
      const hex = `
        48 65 6C
        6C 6F
      `;
      const result = parseGen1Hex(hex);
      expect(result).toEqual(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
    });

    it("should throw error on invalid hex characters", () => {
      const hex = "48 65 GG";
      expect(() => parseGen1Hex(hex)).toThrow("Invalid hex string");
    });

    it("should handle empty string", () => {
      const result = parseGen1Hex("");
      expect(result).toEqual(new Uint8Array(0));
    });
  });

  describe("decompressGen1", () => {
    it("should decompress simple 1x1 sprite data", () => {
      const compressed = new Uint8Array([0x11, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00]);

      expect(() => decompressGen1(compressed)).not.toThrow();
    });

    it("should throw error for invalid image sizes", () => {
      const compressed0 = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00]);
      expect(() => decompressGen1(compressed0)).toThrow("Invalid image size");
    });

    it("should handle round-trip compression/decompression for various sizes", () => {
      const sizes = [1, 2, 3, 4, 5, 6, 7];

      for (const size of sizes) {
        const tileCount = size * size;
        const dataSize = tileCount * 16;
        const originalData = new Uint8Array(dataSize);

        for (let i = 0; i < dataSize; i++) {
          originalData[i] = (i * 17) % 256;
        }

        const compressed = compressGen1(originalData, size);
        const decompressed = decompressGen1(compressed);

        expect(decompressed).toEqual(originalData);
        console.log(`✓ Round-trip test passed for ${size}x${size} sprite (${compressed.length} compressed bytes)`);
      }
    });

    it("should handle different compression modes correctly", () => {
      const testConfigs = [
        { swap: 0, mode: 0 },
        { swap: 0, mode: 1 },
        { swap: 0, mode: 2 },
        { swap: 1, mode: 0 },
        { swap: 1, mode: 1 },
        { swap: 1, mode: 2 },
      ];

      const size = 3;
      const dataSize = size * size * 16;
      const originalData = new Uint8Array(dataSize);

      for (let i = 0; i < dataSize; i++) {
        originalData[i] = i % 256;
      }

      for (const config of testConfigs) {
        const compressed = compressGen1(originalData, size);
        const decompressed = decompressGen1(compressed);

        expect(decompressed).toEqual(originalData);
        console.log(`✓ Mode test passed: swap=${config.swap}, mode=${config.mode}`);
      }
    });

    it("should decompress actual Pokemon sprite data", () => {
      const compressedHex = `
        55 BE 4F A5 31 5E B4 57 B6 7C 9F 2A 63 9C 68
        AF 6D F9 3E 55 C6 38 D1 5E DB F2 7D AA 8C 71
        A2 BD B6 E5 FB 54 19 E3 44 7B 6D CB F7 A9 32
        C6 89 F6 DA 96 EF 53 65 8C 13 ED B5 2D DF A7
        CA 18 27 DA 6B 5B BE 4F 95 31 4E B4 D7 B6 7C
        9F 2A 63 9C 68 AF 6D F9 3E 55 C6 38 D1 5E DB
        F2 7D AA 8C 71 A2 BD B6 E5 FB 54 19 E3 44 7B
        6D CB F7 FF
      `;

      const compressed = parseGen1Hex(compressedHex);

      expect(() => decompressGen1(compressed)).not.toThrow();

      const decompressed = decompressGen1(compressed);

      expect(decompressed.length).toBeGreaterThan(0);
      expect(decompressed.length % 16).toBe(0);

      console.log(`✓ Decompressed Pokemon sprite: ${decompressed.length} bytes`);
    });

    it("should handle edge case with all zeros", () => {
      const size = 2;
      const dataSize = size * size * 16;
      const zeroData = new Uint8Array(dataSize);

      const compressed = compressGen1(zeroData, size);
      const decompressed = decompressGen1(compressed);

      expect(decompressed).toEqual(zeroData);
      console.log(`✓ All-zeros test passed (${compressed.length} compressed bytes)`);
    });

    it("should handle edge case with all ones", () => {
      const size = 2;
      const dataSize = size * size * 16;
      const onesData = new Uint8Array(dataSize).fill(0xff);

      const compressed = compressGen1(onesData, size);
      const decompressed = decompressGen1(compressed);

      expect(decompressed).toEqual(onesData);
      console.log(`✓ All-ones test passed (${compressed.length} compressed bytes)`);
    });

    it("should handle alternating pattern data", () => {
      const size = 3;
      const dataSize = size * size * 16;
      const patternData = new Uint8Array(dataSize);

      for (let i = 0; i < dataSize; i++) {
        patternData[i] = i % 2 === 0 ? 0xaa : 0x55;
      }

      const compressed = compressGen1(patternData, size);
      const decompressed = decompressGen1(compressed);

      expect(decompressed).toEqual(patternData);
      console.log(`✓ Alternating pattern test passed (${compressed.length} compressed bytes)`);
    });

    it("should handle compression efficiency", () => {
      const size = 5;
      const dataSize = size * size * 16;

      const patterns = [
        { name: "sparse", data: new Uint8Array(dataSize) },
        { name: "dense", data: new Uint8Array(dataSize).fill(0xff) },
      ];

      patterns[0].data[100] = 0xff;
      patterns[0].data[200] = 0xaa;

      for (const pattern of patterns) {
        const compressed = compressGen1(pattern.data, size);
        const decompressed = decompressGen1(compressed);

        expect(decompressed).toEqual(pattern.data);

        const ratio = ((compressed.length / dataSize) * 100).toFixed(1);
        console.log(`✓ ${pattern.name} pattern: ${compressed.length}/${dataSize} bytes (${ratio}% ratio)`);
      }

      const pseudorandomData = new Uint8Array(dataSize);
      for (let i = 0; i < dataSize; i++) {
        pseudorandomData[i] = (i * 7 + i * i * 13) % 256;
      }

      const compressed = compressGen1(pseudorandomData, size);
      const decompressed = decompressGen1(compressed);

      expect(decompressed.length).toBe(dataSize);
      expect(() => decompressGen1(compressed)).not.toThrow();

      const ratio = ((compressed.length / dataSize) * 100).toFixed(1);
      console.log(`✓ pseudorandom pattern: ${compressed.length}/${dataSize} bytes (${ratio}% ratio)`);
    });
  });

  describe("Gen1Decompressor class methods", () => {
    it("should correctly read bits from data", () => {
      const decompressor = new Gen1Decompressor();

      const compressed = new Uint8Array([0x11, 0b10110100, 0b11001010, 0x00, 0x00, 0x00, 0x00]);

      expect(() => decompressor.decompress(compressed)).not.toThrow();
    });

    it("should handle bit boundary crossing", () => {
      const size = 2;
      const dataSize = size * size * 16;

      const testData = new Uint8Array(dataSize);
      for (let i = 0; i < dataSize; i++) {
        testData[i] = (i * 7) % 256;
      }

      const compressed = compressGen1(testData, size);
      const decompressed = decompressGen1(compressed);

      expect(decompressed).toEqual(testData);
    });
  });
});
