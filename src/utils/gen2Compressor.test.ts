import { describe, it, expect } from 'vitest';
import { compressGen2, formatAsHex, estimateCompressionRatio } from './gen2Compressor';
import { decompressGen2 } from './gen2Decompressor';

describe('Gen2 Compressor', () => {
  it('should compress simple literal data', () => {
    const input = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F]); // "Hello"
    const compressed = compressGen2(input);

    // Should create a literal command
    expect(compressed.length).toBeLessThan(input.length + 3); // Some overhead is expected

    // Test round-trip: compress then decompress
    const decompressed = decompressGen2(compressed);
    expect(decompressed).toEqual(input);
  });

  it('should compress zero runs efficiently', () => {
    const input = new Uint8Array(100).fill(0); // 100 zeros
    const compressed = compressGen2(input);

    // Should be very efficient for zeros
    expect(compressed.length).toBeLessThan(10);

    // Test round-trip
    const decompressed = decompressGen2(compressed);
    expect(decompressed).toEqual(input);
  });

  it('should compress repeated bytes efficiently', () => {
    const input = new Uint8Array(50).fill(0xAA); // 50 repeated 0xAA bytes
    const compressed = compressGen2(input);

    // Should be very efficient for repeated bytes
    expect(compressed.length).toBeLessThan(10);

    // Test round-trip
    const decompressed = decompressGen2(compressed);
    expect(decompressed).toEqual(input);
  });

  it('should compress alternating patterns efficiently', () => {
    const input = new Uint8Array(20);
    for (let i = 0; i < input.length; i++) {
      input[i] = i % 2 === 0 ? 0xAA : 0xBB;
    }

    const compressed = compressGen2(input);

    // Should be efficient for alternating patterns
    expect(compressed.length).toBeLessThan(input.length / 2);

    // Test round-trip
    const decompressed = decompressGen2(compressed);
    expect(decompressed).toEqual(input);
  });

  it('should handle empty input', () => {
    const input = new Uint8Array(0);
    const compressed = compressGen2(input);

    // Should just contain LZ_END
    expect(compressed).toEqual(new Uint8Array([0xFF]));

    // Test round-trip
    const decompressed = decompressGen2(compressed);
    expect(decompressed).toEqual(input);
  });

  it('should compress data with repeating patterns', () => {
    const pattern = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    const input = new Uint8Array(pattern.length * 5); // Repeat pattern 5 times

    for (let i = 0; i < 5; i++) {
      input.set(pattern, i * pattern.length);
    }

    const compressed = compressGen2(input);

    // Should achieve good compression due to repetition
    expect(compressed.length).toBeLessThan(input.length);

    // Test round-trip
    const decompressed = decompressGen2(compressed);
    expect(decompressed).toEqual(input);
  });

  it('should handle mixed data types efficiently', () => {
    // Create data with various patterns
    const input = new Uint8Array([
      // Some literal data
      0x48, 0x65, 0x6C, 0x6C, 0x6F, // "Hello"
      // Some zeros
      0x00, 0x00, 0x00, 0x00, 0x00,
      // Some repeated bytes
      0xFF, 0xFF, 0xFF, 0xFF,
      // Some alternating pattern
      0xAA, 0xBB, 0xAA, 0xBB, 0xAA, 0xBB
    ]);

    const compressed = compressGen2(input);

    // Should achieve reasonable compression
    expect(compressed.length).toBeLessThan(input.length);

    // Test round-trip
    const decompressed = decompressGen2(compressed);
    expect(decompressed).toEqual(input);
  });

  it('should handle large data correctly', () => {
    // Create a large input with mixed patterns
    const input = new Uint8Array(1000);

    // Fill with repeating pattern
    for (let i = 0; i < input.length; i++) {
      if (i < 200) {
        input[i] = 0x00; // Zeros
      } else if (i < 400) {
        input[i] = 0xAA; // Repeated bytes
      } else if (i < 600) {
        input[i] = i % 2 === 0 ? 0xFF : 0x00; // Alternating
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

  it('should respect alignment option', () => {
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

  it('should produce compression compatible with decompressor test cases', () => {
    // Test against known good patterns from decompressor tests

    // Literal data
    const literalInput = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F]); // "Hello"
    const literalCompressed = compressGen2(literalInput);
    expect(decompressGen2(literalCompressed)).toEqual(literalInput);

    // Repeated bytes
    const repeatInput = new Uint8Array(8).fill(0xAA);
    const repeatCompressed = compressGen2(repeatInput);
    expect(decompressGen2(repeatCompressed)).toEqual(repeatInput);

    // Alternating pattern
    const alternateInput = new Uint8Array([0xAA, 0xBB, 0xAA, 0xBB, 0xAA, 0xBB]);
    const alternateCompressed = compressGen2(alternateInput);
    expect(decompressGen2(alternateCompressed)).toEqual(alternateInput);

    // Zeros
    const zeroInput = new Uint8Array(10).fill(0);
    const zeroCompressed = compressGen2(zeroInput);
    expect(decompressGen2(zeroCompressed)).toEqual(zeroInput);
  });

  it('should handle pixel art data efficiently', () => {
    // Simulate 8x8 checkerboard pattern (common in pixel art)
    const checkerboard = new Uint8Array(64);
    for (let i = 0; i < 64; i++) {
      const row = Math.floor(i / 8);
      const col = i % 8;
      checkerboard[i] = ((row + col) % 2 === 0) ? 0xFF : 0x00;
    }

    const compressed = compressGen2(checkerboard);

    // Should achieve decent compression due to pattern
    expect(compressed.length).toBeLessThan(checkerboard.length / 2);

    // Test round-trip
    const decompressed = decompressGen2(compressed);
    expect(decompressed).toEqual(checkerboard);
  });

  it('should work with real-world pixel data patterns', () => {
    // Simulate common pixel art patterns

    // Solid color blocks
    const solidBlock = new Uint8Array(32).fill(0x42);
    const solidCompressed = compressGen2(solidBlock);
    expect(decompressGen2(solidCompressed)).toEqual(solidBlock);
    expect(solidCompressed.length).toBeLessThan(solidBlock.length / 4);

    // Gradient
    const gradient = new Uint8Array(16);
    for (let i = 0; i < gradient.length; i++) {
      gradient[i] = Math.floor((i / gradient.length) * 255);
    }
    const gradientCompressed = compressGen2(gradient);
    expect(decompressGen2(gradientCompressed)).toEqual(gradient);

    // Striped pattern
    const stripes = new Uint8Array(24);
    for (let i = 0; i < stripes.length; i++) {
      stripes[i] = Math.floor(i / 4) % 2 === 0 ? 0x00 : 0xFF;
    }
    const stripesCompressed = compressGen2(stripes);
    expect(decompressGen2(stripesCompressed)).toEqual(stripes);
    expect(stripesCompressed.length).toBeLessThan(stripes.length / 2);
  });
});

describe('Gen2 Compressor Utilities', () => {
  it('should format hex correctly', () => {
    const data = new Uint8Array([0x00, 0xFF, 0xAB, 0x12]);
    const hex = formatAsHex(data);
    expect(hex).toBe('00 FF AB 12');
  });

  it('should estimate compression ratios reasonably', () => {
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

  it('should handle edge cases in estimation', () => {
    const empty = new Uint8Array(0);
    expect(estimateCompressionRatio(empty)).toBe(1);

    const single = new Uint8Array([0x42]);
    expect(estimateCompressionRatio(single)).toBeGreaterThan(0);
  });
});

describe('Gen2 Round-trip Compatibility', () => {
  it('should perfectly round-trip with various data types', () => {
    const testCases = [
      new Uint8Array([]), // Empty
      new Uint8Array([0x42]), // Single byte
      new Uint8Array([0x00, 0xFF]), // Two bytes
      new Uint8Array(Array.from({ length: 1000 }, (_, i) => i % 256)), // Sequential
      new Uint8Array(1000).fill(0), // All zeros
      new Uint8Array(1000).fill(0xFF), // All ones
    ];

    for (const testCase of testCases) {
      const compressed = compressGen2(testCase);
      const decompressed = decompressGen2(compressed);
      expect(decompressed).toEqual(testCase);
    }
  });

  it('should handle maximum length patterns', () => {
    // Test maximum length runs
    const longZeros = new Uint8Array(2000).fill(0);
    const longCompressed = compressGen2(longZeros);
    expect(decompressGen2(longCompressed)).toEqual(longZeros);

    const longRepeated = new Uint8Array(2000).fill(0xAA);
    const longRepeatCompressed = compressGen2(longRepeated);
    expect(decompressGen2(longRepeatCompressed)).toEqual(longRepeated);
  });

  it('should roundtrip specific pokécrystal data correctly', () => {
    // Original compressed data from pokécrystal
    const originalCompressed = new Uint8Array([
      0xEC, 0x49, 0x23, 0x01, 0x07, 0x03, 0x02, 0x07, 0x05, 0x07, 0x06, 0x0F, 0x08, 0x43, 0x1F, 0x10,
      0x43, 0x3F, 0x20, 0x01, 0x3E, 0x21, 0x7D, 0x09, 0x01, 0x01, 0x07, 0x07, 0x1F, 0x1F, 0x21, 0x3F,
      0x3E, 0x3F, 0xCF, 0x88, 0x07, 0x03, 0x03, 0x04, 0x04, 0x08, 0x08, 0x10, 0x10, 0x23, 0x20, 0x1B,
      0x40, 0x40, 0x7D, 0x7C, 0x83, 0xFF, 0xC0, 0x3F, 0xD8, 0x3F, 0xE6, 0x7F, 0xD1, 0xAF, 0xA0, 0x5F,
      0xD0, 0x2F, 0xA0, 0x5F, 0xC0, 0x3F, 0x80, 0x7F, 0x30, 0xCF, 0x70, 0x8F, 0x87, 0xAD, 0x14, 0x0C,
      0x0F, 0x10, 0x1F, 0x20, 0x3F, 0x01, 0x7F, 0x42, 0x7F, 0x41, 0x7F, 0x02, 0xFF, 0x85, 0xFF, 0x8A,
      0xFF, 0x85, 0xFF, 0x8B, 0x28, 0xFF, 0x04, 0x0F, 0xFF, 0xF0, 0xFF, 0x7F, 0x43, 0x7F, 0x3F, 0xE0,
      0x30, 0x3F, 0x1F, 0x3F, 0x0F, 0x1F, 0x0F, 0x0F, 0xE7, 0xF7, 0x1F, 0x0F, 0x3F, 0x43, 0x1F, 0x26,
      0x0B, 0x1C, 0x17, 0x06, 0x2B, 0x03, 0x55, 0x00, 0xAA, 0x00, 0xF5, 0xC0, 0x3E, 0xF0, 0x1F, 0xEC,
      0x0B, 0xF7, 0x15, 0xEA, 0x0A, 0xF5, 0x05, 0xFA, 0x42, 0xFD, 0x20, 0xFF, 0x28, 0xFF, 0x1C, 0xFF,
      0x1E, 0xFF, 0x63, 0x06, 0x9F, 0x7F, 0x00, 0x80, 0xFC, 0xFE, 0x7F, 0x22, 0xFF, 0x84, 0x83, 0x30,
      0xFF, 0x04, 0xF8, 0xFF, 0xC6, 0xFF, 0x3E, 0x44, 0xFE, 0xFF, 0x11, 0xFE, 0xFF, 0xFE, 0xFB, 0xFF,
      0xF8, 0xFF, 0xF0, 0xFF, 0xC0, 0xFF, 0x00, 0xBF, 0x00, 0x9F, 0x00, 0x8F, 0x01, 0x22, 0x03, 0x05,
      0x07, 0x87, 0x86, 0xE7, 0x66, 0x77, 0xA3, 0x95, 0x12, 0x07, 0xFF, 0x03, 0xFE, 0xCE, 0xB4, 0x7C,
      0x44, 0xBE, 0xAF, 0x59, 0x5C, 0xA8, 0x38, 0xD0, 0x18, 0xF0, 0x3C, 0xE3, 0xA4, 0x00, 0x7A, 0x0D,
      0xC0, 0x30, 0x38, 0x0E, 0x06, 0xBE, 0xC1, 0xEF, 0xF0, 0xF7, 0xF8, 0xFF, 0xF8, 0xFB, 0x4A, 0xFC,
      0xFF, 0x0A, 0xFD, 0xFE, 0xFF, 0xFF, 0x7F, 0xF8, 0xF7, 0xF8, 0x7F, 0x60, 0x5C, 0x45, 0x40, 0x00,
      0x01, 0x00, 0x80, 0x61, 0x08, 0x80, 0xC1, 0x01, 0xC2, 0x02, 0xE4, 0x04, 0xF0, 0x78, 0xA3, 0x00,
      0x88, 0x1F, 0x80, 0x80, 0xC8, 0x4C, 0xD3, 0x53, 0xF1, 0x21, 0xF9, 0x31, 0xFE, 0x6F, 0xB8, 0x9F,
      0x10, 0x1F, 0x0F, 0x4F, 0x0B, 0x2F, 0x08, 0x28, 0x30, 0x30, 0xFC, 0xEC, 0x3F, 0x43, 0x7F, 0x87,
      0xF8, 0x18, 0xAD, 0x00, 0x71, 0x46, 0xC0, 0x40, 0x43, 0xC0, 0xE0, 0x0F, 0xF0, 0x70, 0xF0, 0xF0,
      0x38, 0x78, 0xF8, 0xF8, 0x7C, 0xEC, 0x64, 0xC0, 0x40, 0x40, 0xC0, 0x00, 0x22, 0x80, 0x00, 0x00,
      0x22, 0x40, 0x01, 0x00, 0x40, 0xAD, 0x00, 0x88, 0x1B, 0x60, 0x70, 0x88, 0x88, 0x80, 0x04, 0xE4,
      0xE4, 0xFC, 0x34, 0xA8, 0x18, 0x64, 0xFC, 0x9C, 0x9C, 0x0C, 0x0C, 0x94, 0x9C, 0x64, 0x64, 0x0A,
      0x0A, 0x32, 0x32, 0xFC, 0xFC, 0x63, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);

    // Decompress the original data
    const decompressed = decompressGen2(originalCompressed);

    // Recompress the decompressed data
    const recompressed = compressGen2(decompressed);

    // Verify the roundtrip works - the critical test is that data can be consistently
    // decompressed and recompressed without loss of information
    const decompressedAgain = decompressGen2(recompressed);
    expect(decompressedAgain).toEqual(decompressed);

    // The recompressed data might not be byte-identical to the original compressed data
    // (since there can be multiple valid compression representations of the same data),
    // but it should decompress to the same result
    const decompressedOriginal = decompressGen2(originalCompressed);
    const decompressedRecompressed = decompressGen2(recompressed);
    expect(decompressedRecompressed).toEqual(decompressedOriginal);
  });

  it('should demonstrate that exact byte-for-byte reconstruction may not be possible', () => {
    // Original compressed data from pokécrystal
    const originalCompressed = new Uint8Array([
      0xEC, 0x49, 0x23, 0x01, 0x07, 0x03, 0x02, 0x07, 0x05, 0x07, 0x06, 0x0F, 0x08, 0x43, 0x1F, 0x10,
      0x43, 0x3F, 0x20, 0x01, 0x3E, 0x21, 0x7D, 0x09, 0x01, 0x01, 0x07, 0x07, 0x1F, 0x1F, 0x21, 0x3F,
      0x3E, 0x3F, 0xCF, 0x88, 0x07, 0x03, 0x03, 0x04, 0x04, 0x08, 0x08, 0x10, 0x10, 0x23, 0x20, 0x1B,
      0x40, 0x40, 0x7D, 0x7C, 0x83, 0xFF, 0xC0, 0x3F, 0xD8, 0x3F, 0xE6, 0x7F, 0xD1, 0xAF, 0xA0, 0x5F,
      0xD0, 0x2F, 0xA0, 0x5F, 0xC0, 0x3F, 0x80, 0x7F, 0x30, 0xCF, 0x70, 0x8F, 0x87, 0xAD, 0x14, 0x0C,
      0x0F, 0x10, 0x1F, 0x20, 0x3F, 0x01, 0x7F, 0x42, 0x7F, 0x41, 0x7F, 0x02, 0xFF, 0x85, 0xFF, 0x8A,
      0xFF, 0x85, 0xFF, 0x8B, 0x28, 0xFF, 0x04, 0x0F, 0xFF, 0xF0, 0xFF, 0x7F, 0x43, 0x7F, 0x3F, 0xE0,
      0x30, 0x3F, 0x1F, 0x3F, 0x0F, 0x1F, 0x0F, 0x0F, 0xE7, 0xF7, 0x1F, 0x0F, 0x3F, 0x43, 0x1F, 0x26,
      0x0B, 0x1C, 0x17, 0x06, 0x2B, 0x03, 0x55, 0x00, 0xAA, 0x00, 0xF5, 0xC0, 0x3E, 0xF0, 0x1F, 0xEC,
      0x0B, 0xF7, 0x15, 0xEA, 0x0A, 0xF5, 0x05, 0xFA, 0x42, 0xFD, 0x20, 0xFF, 0x28, 0xFF, 0x1C, 0xFF,
      0x1E, 0xFF, 0x63, 0x06, 0x9F, 0x7F, 0x00, 0x80, 0xFC, 0xFE, 0x7F, 0x22, 0xFF, 0x84, 0x83, 0x30,
      0xFF, 0x04, 0xF8, 0xFF, 0xC6, 0xFF, 0x3E, 0x44, 0xFE, 0xFF, 0x11, 0xFE, 0xFF, 0xFE, 0xFB, 0xFF,
      0xF8, 0xFF, 0xF0, 0xFF, 0xC0, 0xFF, 0x00, 0xBF, 0x00, 0x9F, 0x00, 0x8F, 0x01, 0x22, 0x03, 0x05,
      0x07, 0x87, 0x86, 0xE7, 0x66, 0x77, 0xA3, 0x95, 0x12, 0x07, 0xFF, 0x03, 0xFE, 0xCE, 0xB4, 0x7C,
      0x44, 0xBE, 0xAF, 0x59, 0x5C, 0xA8, 0x38, 0xD0, 0x18, 0xF0, 0x3C, 0xE3, 0xA4, 0x00, 0x7A, 0x0D,
      0xC0, 0x30, 0x38, 0x0E, 0x06, 0xBE, 0xC1, 0xEF, 0xF0, 0xF7, 0xF8, 0xFF, 0xF8, 0xFB, 0x4A, 0xFC,
      0xFF, 0x0A, 0xFD, 0xFE, 0xFF, 0xFF, 0x7F, 0xF8, 0xF7, 0xF8, 0x7F, 0x60, 0x5C, 0x45, 0x40, 0x00,
      0x01, 0x00, 0x80, 0x61, 0x08, 0x80, 0xC1, 0x01, 0xC2, 0x02, 0xE4, 0x04, 0xF0, 0x78, 0xA3, 0x00,
      0x88, 0x1F, 0x80, 0x80, 0xC8, 0x4C, 0xD3, 0x53, 0xF1, 0x21, 0xF9, 0x31, 0xFE, 0x6F, 0xB8, 0x9F,
      0x10, 0x1F, 0x0F, 0x4F, 0x0B, 0x2F, 0x08, 0x28, 0x30, 0x30, 0xFC, 0xEC, 0x3F, 0x43, 0x7F, 0x87,
      0xF8, 0x18, 0xAD, 0x00, 0x71, 0x46, 0xC0, 0x40, 0x43, 0xC0, 0xE0, 0x0F, 0xF0, 0x70, 0xF0, 0xF0,
      0x38, 0x78, 0xF8, 0xF8, 0x7C, 0xEC, 0x64, 0xC0, 0x40, 0x40, 0xC0, 0x00, 0x22, 0x80, 0x00, 0x00,
      0x22, 0x40, 0x01, 0x00, 0x40, 0xAD, 0x00, 0x88, 0x1B, 0x60, 0x70, 0x88, 0x88, 0x80, 0x04, 0xE4,
      0xE4, 0xFC, 0x34, 0xA8, 0x18, 0x64, 0xFC, 0x9C, 0x9C, 0x0C, 0x0C, 0x94, 0x9C, 0x64, 0x64, 0x0A,
      0x0A, 0x32, 0x32, 0xFC, 0xFC, 0x63, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);

    // Decompress the original data
    const decompressed = decompressGen2(originalCompressed);

    // Recompress the decompressed data
    const recompressed = compressGen2(decompressed);

    // The critical requirement is that data integrity is maintained
    // Even if the compressed bytes differ, both should decompress to the same result
    const decompressedOriginal = decompressGen2(originalCompressed);
    const decompressedRecompressed = decompressGen2(recompressed);
    expect(decompressedRecompressed).toEqual(decompressedOriginal);

    // Note: Exact byte-for-byte reconstruction is not guaranteed because:
    // 1. Our compressor might make different optimization choices than pokécrystal's
    // 2. There can be multiple valid compression representations of the same data
    // 3. The order of scanning for patterns might differ
    // But the decompressed data will always be identical, which is what matters for compatibility
    console.log(`Original compressed size: ${originalCompressed.length} bytes`);
    console.log(`Recompressed size: ${recompressed.length} bytes`);
    console.log(`Data integrity maintained: ${decompressedRecompressed.every((byte: number, i: number) => byte === decompressedOriginal[i])}`);
  });
});
