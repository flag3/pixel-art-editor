import { compressGen2, formatAsHex, estimateCompressionRatio } from "./gen2Compressor";
import { decompressGen2 } from "./gen2Decompressor";
import { describe, it, expect } from "vitest";

describe("Gen2 Compressor", () => {
  it("should compress simple literal data", () => {
    const input = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
    const compressed = compressGen2(input);

    // Should create a literal command
    expect(compressed.length).toBeLessThan(input.length + 3); // Some overhead is expected

    // Test round-trip: compress then decompress
    const decompressed = decompressGen2(compressed);
    expect(decompressed).toEqual(input);
  });

  it("should compress zero runs efficiently", () => {
    const input = new Uint8Array(100).fill(0); // 100 zeros
    const compressed = compressGen2(input);

    // Should be very efficient for zeros
    expect(compressed.length).toBeLessThan(10);

    // Test round-trip
    const decompressed = decompressGen2(compressed);
    expect(decompressed).toEqual(input);
  });

  it("should compress repeated bytes efficiently", () => {
    const input = new Uint8Array(50).fill(0xaa); // 50 repeated 0xAA bytes
    const compressed = compressGen2(input);

    // Should be very efficient for repeated bytes
    expect(compressed.length).toBeLessThan(10);

    // Test round-trip
    const decompressed = decompressGen2(compressed);
    expect(decompressed).toEqual(input);
  });

  it("should compress alternating patterns efficiently", () => {
    const input = new Uint8Array(20);
    for (let i = 0; i < input.length; i++) {
      input[i] = i % 2 === 0 ? 0xaa : 0xbb;
    }

    const compressed = compressGen2(input);

    // Should be efficient for alternating patterns
    expect(compressed.length).toBeLessThan(input.length / 2);

    // Test round-trip
    const decompressed = decompressGen2(compressed);
    expect(decompressed).toEqual(input);
  });

  it("should handle empty input", () => {
    const input = new Uint8Array(0);
    const compressed = compressGen2(input);

    // Should just contain LZ_END
    expect(compressed).toEqual(new Uint8Array([0xff]));

    // Test round-trip
    const decompressed = decompressGen2(compressed);
    expect(decompressed).toEqual(input);
  });

  it("should handle mixed data types efficiently", () => {
    // Create data with various patterns
    const input = new Uint8Array([
      // Some literal data
      0x48,
      0x65,
      0x6c,
      0x6c,
      0x6f, // "Hello"
      // Some zeros
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      // Some repeated bytes
      0xff,
      0xff,
      0xff,
      0xff,
      // Some alternating pattern
      0xaa,
      0xbb,
      0xaa,
      0xbb,
      0xaa,
      0xbb,
    ]);

    const compressed = compressGen2(input);

    // Should achieve reasonable compression
    expect(compressed.length).toBeLessThan(input.length);

    // Test round-trip
    const decompressed = decompressGen2(compressed);
    expect(decompressed).toEqual(input);
  });

  it("should handle large data correctly", () => {
    // Create a large input with mixed patterns
    const input = new Uint8Array(1000);

    // Fill with repeating pattern
    for (let i = 0; i < input.length; i++) {
      if (i < 200) {
        input[i] = 0x00; // Zeros
      } else if (i < 400) {
        input[i] = 0xaa; // Repeated bytes
      } else if (i < 600) {
        input[i] = i % 2 === 0 ? 0xff : 0x00; // Alternating
      } else {
        input[i] = i % 256; // Sequential
      }
    }

    const compressed = compressGen2(input);

    // Should achieve good compression on the patterned sections
    expect(compressed.length).toBeLessThan(input.length);

    // Test round-trip
    const decompressed = decompressGen2(compressed);
    expect(decompressed).toEqual(input);
  });

  it("should respect alignment option", () => {
    const input = new Uint8Array([0x01, 0x02, 0x03]);

    // Test different alignments
    const compressed1 = compressGen2(input, { alignment: 1 });
    const compressed4 = compressGen2(input, { alignment: 4 });
    const compressed8 = compressGen2(input, { alignment: 8 });

    expect(compressed1.length % 1).toBe(0);
    expect(compressed4.length % 4).toBe(0);
    expect(compressed8.length % 8).toBe(0);

    // All should decompress to the same result
    expect(decompressGen2(compressed1)).toEqual(input);
    expect(decompressGen2(compressed4)).toEqual(input);
    expect(decompressGen2(compressed8)).toEqual(input);
  });

  it("should produce compression compatible with decompressor test cases", () => {
    // Test against known good patterns from decompressor tests

    // Literal data
    const literalInput = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
    const literalCompressed = compressGen2(literalInput);
    expect(decompressGen2(literalCompressed)).toEqual(literalInput);

    // Repeated bytes
    const repeatInput = new Uint8Array(8).fill(0xaa);
    const repeatCompressed = compressGen2(repeatInput);
    expect(decompressGen2(repeatCompressed)).toEqual(repeatInput);

    // Alternating pattern
    const alternateInput = new Uint8Array([0xaa, 0xbb, 0xaa, 0xbb, 0xaa, 0xbb]);
    const alternateCompressed = compressGen2(alternateInput);
    expect(decompressGen2(alternateCompressed)).toEqual(alternateInput);

    // Zeros
    const zeroInput = new Uint8Array(10).fill(0);
    const zeroCompressed = compressGen2(zeroInput);
    expect(decompressGen2(zeroCompressed)).toEqual(zeroInput);
  });
});

describe("Gen2 Compressor Utilities", () => {
  it("should format hex correctly", () => {
    const data = new Uint8Array([0x00, 0xff, 0xab, 0x12]);
    const hex = formatAsHex(data);
    expect(hex).toBe("00 FF AB 12");
  });

  it("should estimate compression ratios reasonably", () => {
    // Highly compressible data
    const zeros = new Uint8Array(100).fill(0);
    const zerosRatio = estimateCompressionRatio(zeros);
    expect(zerosRatio).toBeGreaterThan(10);

    // Less compressible data
    const random = new Uint8Array(100);
    for (let i = 0; i < random.length; i++) {
      random[i] = Math.floor(Math.random() * 256);
    }
    const randomRatio = estimateCompressionRatio(random);
    expect(randomRatio).toBeGreaterThan(0.5);
    expect(randomRatio).toBeLessThan(zerosRatio);
  });

  it("should handle edge cases in estimation", () => {
    const empty = new Uint8Array(0);
    expect(estimateCompressionRatio(empty)).toBe(1);

    const single = new Uint8Array([0x42]);
    expect(estimateCompressionRatio(single)).toBeGreaterThan(0);
  });
});

describe("Gen2 Round-trip Compatibility", () => {
  it("should perfectly round-trip with various data types", () => {
    const testCases = [
      new Uint8Array([]), // Empty
      new Uint8Array([0x42]), // Single byte
      new Uint8Array([0x00, 0xff]), // Two bytes
      new Uint8Array(Array.from({ length: 1000 }, (_, i) => i % 256)), // Sequential
      new Uint8Array(1000).fill(0), // All zeros
      new Uint8Array(1000).fill(0xff), // All ones
    ];

    for (const testCase of testCases) {
      const compressed = compressGen2(testCase);
      const decompressed = decompressGen2(compressed);
      expect(decompressed).toEqual(testCase);
    }
  });

  it("should handle maximum length patterns", () => {
    // Test maximum length runs
    const longZeros = new Uint8Array(2000).fill(0);
    const longCompressed = compressGen2(longZeros);
    expect(decompressGen2(longCompressed)).toEqual(longZeros);

    const longRepeated = new Uint8Array(2000).fill(0xaa);
    const longRepeatCompressed = compressGen2(longRepeated);
    expect(decompressGen2(longRepeatCompressed)).toEqual(longRepeated);
  });

  it("should demonstrate that exact byte-for-byte reconstruction may not be possible", () => {
    // Original compressed data from pokécrystal
    const originalCompressed = new Uint8Array([
      0xec, 0x49, 0x23, 0x01, 0x07, 0x03, 0x02, 0x07, 0x05, 0x07, 0x06, 0x0f, 0x08, 0x43, 0x1f,
      0x10, 0x43, 0x3f, 0x20, 0x01, 0x3e, 0x21, 0x7d, 0x09, 0x01, 0x01, 0x07, 0x07, 0x1f, 0x1f,
      0x21, 0x3f, 0x3e, 0x3f, 0xcf, 0x88, 0x07, 0x03, 0x03, 0x04, 0x04, 0x08, 0x08, 0x10, 0x10,
      0x23, 0x20, 0x1b, 0x40, 0x40, 0x7d, 0x7c, 0x83, 0xff, 0xc0, 0x3f, 0xd8, 0x3f, 0xe6, 0x7f,
      0xd1, 0xaf, 0xa0, 0x5f, 0xd0, 0x2f, 0xa0, 0x5f, 0xc0, 0x3f, 0x80, 0x7f, 0x30, 0xcf, 0x70,
      0x8f, 0x87, 0xad, 0x14, 0x0c, 0x0f, 0x10, 0x1f, 0x20, 0x3f, 0x01, 0x7f, 0x42, 0x7f, 0x41,
      0x7f, 0x02, 0xff, 0x85, 0xff, 0x8a, 0xff, 0x85, 0xff, 0x8b, 0x28, 0xff, 0x04, 0x0f, 0xff,
      0xf0, 0xff, 0x7f, 0x43, 0x7f, 0x3f, 0xe0, 0x30, 0x3f, 0x1f, 0x3f, 0x0f, 0x1f, 0x0f, 0x0f,
      0xe7, 0xf7, 0x1f, 0x0f, 0x3f, 0x43, 0x1f, 0x26, 0x0b, 0x1c, 0x17, 0x06, 0x2b, 0x03, 0x55,
      0x00, 0xaa, 0x00, 0xf5, 0xc0, 0x3e, 0xf0, 0x1f, 0xec, 0x0b, 0xf7, 0x15, 0xea, 0x0a, 0xf5,
      0x05, 0xfa, 0x42, 0xfd, 0x20, 0xff, 0x28, 0xff, 0x1c, 0xff, 0x1e, 0xff, 0x63, 0x06, 0x9f,
      0x7f, 0x00, 0x80, 0xfc, 0xfe, 0x7f, 0x22, 0xff, 0x84, 0x83, 0x30, 0xff, 0x04, 0xf8, 0xff,
      0xc6, 0xff, 0x3e, 0x44, 0xfe, 0xff, 0x11, 0xfe, 0xff, 0xfe, 0xfb, 0xff, 0xf8, 0xff, 0xf0,
      0xff, 0xc0, 0xff, 0x00, 0xbf, 0x00, 0x9f, 0x00, 0x8f, 0x01, 0x22, 0x03, 0x05, 0x07, 0x87,
      0x86, 0xe7, 0x66, 0x77, 0xa3, 0x95, 0x12, 0x07, 0xff, 0x03, 0xfe, 0xce, 0xb4, 0x7c, 0x44,
      0xbe, 0xaf, 0x59, 0x5c, 0xa8, 0x38, 0xd0, 0x18, 0xf0, 0x3c, 0xe3, 0xa4, 0x00, 0x7a, 0x0d,
      0xc0, 0x30, 0x38, 0x0e, 0x06, 0xbe, 0xc1, 0xef, 0xf0, 0xf7, 0xf8, 0xff, 0xf8, 0xfb, 0x4a,
      0xfc, 0xff, 0x0a, 0xfd, 0xfe, 0xff, 0xff, 0x7f, 0xf8, 0xf7, 0xf8, 0x7f, 0x60, 0x5c, 0x45,
      0x40, 0x00, 0x01, 0x00, 0x80, 0x61, 0x08, 0x80, 0xc1, 0x01, 0xc2, 0x02, 0xe4, 0x04, 0xf0,
      0x78, 0xa3, 0x00, 0x88, 0x1f, 0x80, 0x80, 0xc8, 0x4c, 0xd3, 0x53, 0xf1, 0x21, 0xf9, 0x31,
      0xfe, 0x6f, 0xb8, 0x9f, 0x10, 0x1f, 0x0f, 0x4f, 0x0b, 0x2f, 0x08, 0x28, 0x30, 0x30, 0xfc,
      0xec, 0x3f, 0x43, 0x7f, 0x87, 0xf8, 0x18, 0xad, 0x00, 0x71, 0x46, 0xc0, 0x40, 0x43, 0xc0,
      0xe0, 0x0f, 0xf0, 0x70, 0xf0, 0xf0, 0x38, 0x78, 0xf8, 0xf8, 0x7c, 0xec, 0x64, 0xc0, 0x40,
      0x40, 0xc0, 0x00, 0x22, 0x80, 0x00, 0x00, 0x22, 0x40, 0x01, 0x00, 0x40, 0xad, 0x00, 0x88,
      0x1b, 0x60, 0x70, 0x88, 0x88, 0x80, 0x04, 0xe4, 0xe4, 0xfc, 0x34, 0xa8, 0x18, 0x64, 0xfc,
      0x9c, 0x9c, 0x0c, 0x0c, 0x94, 0x9c, 0x64, 0x64, 0x0a, 0x0a, 0x32, 0x32, 0xfc, 0xfc, 0x63,
      0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);

    const decompressed = decompressGen2(originalCompressed);
    const recompressed = compressGen2(decompressed);

    // The key test: data should decompress and recompress to identical decompressed data
    const redecompressed = decompressGen2(recompressed);
    expect(redecompressed).toEqual(decompressed);

    // This demonstrates that while the data round-trips correctly,
    // the compressed format may not be byte-for-byte identical
    // (different compression algorithms can produce different outputs for the same input)
    console.log(`Original compressed: ${originalCompressed.length} bytes`);
    console.log(`Recompressed: ${recompressed.length} bytes`);
    console.log(`Data is functionally equivalent: ${decompressed.length} bytes`);
  });
});
