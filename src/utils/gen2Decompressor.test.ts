import { describe, it, expect } from 'vitest';
import { decompressGen2, parseCompressedHex } from './gen2Decompressor';

describe('Gen2 Decompressor', () => {
  it('should parse hex string correctly', () => {
    const hexString = '00 05 48 65 6C 6C 6F FF';
    const bytes = parseCompressedHex(hexString);
    expect(bytes).toEqual(new Uint8Array([0x00, 0x05, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0xFF]));
  });

  it('should decompress literal data', () => {
    // LZ_LITERAL command with 5 bytes: "Hello"
    const compressed = new Uint8Array([
      0x04, // Command: LITERAL (0) + length-1 (4)
      0x48, 0x65, 0x6C, 0x6C, 0x6F, // "Hello"
      0xFF  // LZ_END
    ]);

    const result = decompressGen2(compressed);
    const expected = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F]);
    expect(result).toEqual(expected);
  });

  it('should decompress iterated data', () => {
    // LZ_ITERATE command: repeat 0xAA 8 times
    const compressed = new Uint8Array([
      0x27, // Command: ITERATE (1<<5) + length-1 (7)
      0xAA, // Byte to repeat
      0xFF  // LZ_END
    ]);

    const result = decompressGen2(compressed);
    const expected = new Uint8Array([0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA]);
    expect(result).toEqual(expected);
  });

  it('should decompress alternated data', () => {
    // LZ_ALTERNATE command: alternate 0xAA and 0xBB for 6 bytes
    const compressed = new Uint8Array([
      0x45, // Command: ALTERNATE (2<<5) + length-1 (5)
      0xAA, // First byte
      0xBB, // Second byte
      0xFF  // LZ_END
    ]);

    const result = decompressGen2(compressed);
    const expected = new Uint8Array([0xAA, 0xBB, 0xAA, 0xBB, 0xAA, 0xBB]);
    expect(result).toEqual(expected);
  });

  it('should decompress zero data', () => {
    // LZ_ZERO command: write 10 zeros
    const compressed = new Uint8Array([
      0x69, // Command: ZERO (3<<5) + length-1 (9)
      0xFF  // LZ_END
    ]);

    const result = decompressGen2(compressed);
    const expected = new Uint8Array(10).fill(0);
    expect(result).toEqual(expected);
  });

  it('should decompress complex data with multiple commands', () => {
    // Complex example with multiple commands
    const compressed = new Uint8Array([
      // Literal: "Hi"
      0x01, 0x48, 0x69,
      // Zero: 3 zeros
      0x62,
      // Iterate: 4 0xFFs
      0x23, 0xFF,
      0xFF // LZ_END
    ]);

    const result = decompressGen2(compressed);
    const expected = new Uint8Array([0x48, 0x69, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF]);
    expect(result).toEqual(expected);
  });

  it('should handle LZ_LONG command', () => {
    // LZ_LONG command for a large literal (300 bytes of 'A')
    const compressed = new Uint8Array([
      0xE1, // Command: LONG (7<<5) + (LITERAL<<3) + high bits (1)
      0x2B, // Low bits: 299 (300-1 = 0x12B, low byte = 0x2B)
      ...Array(300).fill(0x41), // 300 'A's
      0xFF  // LZ_END
    ]);

    const result = decompressGen2(compressed);
    expect(result.length).toBe(300);
    expect(result.every(byte => byte === 0x41)).toBe(true);
  });

  it('should decompress data with LZ_REPEAT command', () => {
    // LZ_REPEAT command: copy previously written data
    const compressed = new Uint8Array([
      // First write some literal data: "ABCD"
      0x03, 0x41, 0x42, 0x43, 0x44,
      // Then repeat the first 4 bytes: "ABCD" again
      0x83, // Command: REPEAT (4<<5) + length-1 (3) for 4 bytes
      0x84, // Negative offset: -4 (0x80 | 0x04)
      0xFF  // LZ_END
    ]);

    const result = decompressGen2(compressed);
    const expected = new Uint8Array([0x41, 0x42, 0x43, 0x44, 0x41, 0x42, 0x43, 0x44]);
    expect(result).toEqual(expected);
  });

  it('should decompress data with LZ_REPEAT using absolute offset', () => {
    // LZ_REPEAT with absolute offset
    const compressed = new Uint8Array([
      // Write "Hello"
      0x04, 0x48, 0x65, 0x6C, 0x6C, 0x6F,
      // Write " World"
      0x05, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64,
      // Repeat "Hello" from absolute offset 0
      0x84, // Command: REPEAT (4<<5) + length-1 (4) for 5 bytes
      0x00, 0x00, // Absolute offset: 0
      0xFF  // LZ_END
    ]);

    const result = decompressGen2(compressed);
    const expected = new Uint8Array([
      0x48, 0x65, 0x6C, 0x6C, 0x6F, // "Hello"
      0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64, // " World"
      0x48, 0x65, 0x6C, 0x6C, 0x6F  // "Hello" again
    ]);
    expect(result).toEqual(expected);
  });

  it('should decompress data with LZ_FLIP command', () => {
    // LZ_FLIP command: copy data with bits reversed
    const compressed = new Uint8Array([
      // First write some data with specific bit patterns
      0x03,
      0b10110000, // 0xB0
      0b11110000, // 0xF0
      0b00001111, // 0x0F
      0b10101010, // 0xAA
      // Then flip the bits of these 4 bytes
      0xA3, // Command: FLIP (5<<5) + length-1 (3) for 4 bytes
      0x84, // Negative offset: -4 (0x80 | 0x04)
      0xFF  // LZ_END
    ]);

    const result = decompressGen2(compressed);
    const expected = new Uint8Array([
      0b10110000, // 0xB0
      0b11110000, // 0xF0
      0b00001111, // 0x0F
      0b10101010, // 0xAA
      0b00001101, // 0x0D (0xB0 with bits flipped)
      0b00001111, // 0x0F (0xF0 with bits flipped)
      0b11110000, // 0xF0 (0x0F with bits flipped)
      0b01010101, // 0x55 (0xAA with bits flipped)
    ]);
    expect(result).toEqual(expected);
  });

  it('should decompress data with LZ_FLIP using absolute offset', () => {
    // LZ_FLIP with absolute offset
    const compressed = new Uint8Array([
      // Write some bytes
      0x02, 0xFF, 0x00, 0x81,
      // Write padding
      0x02, 0x00, 0x00, 0x00,
      // Flip first 3 bytes from absolute offset 0
      0xA2, // Command: FLIP (5<<5) + length-1 (2) for 3 bytes
      0x00, 0x00, // Absolute offset: 0
      0xFF  // LZ_END
    ]);

    const result = decompressGen2(compressed);
    const expected = new Uint8Array([
      0xFF, 0x00, 0x81, // Original
      0x00, 0x00, 0x00, // Padding
      0xFF, 0x00, 0x81  // Flipped (0xFF→0xFF, 0x00→0x00, 0x81→0x81)
    ]);
    expect(result).toEqual(expected);
  });
});

describe('Gen2 Integration with Pixel Art', () => {
  it('should decompress sample pixel data', () => {
    // Example: 8x8 checkerboard pattern compressed
    // White = 0xFF, Black = 0x00, alternating pattern
    const compressed = new Uint8Array([
      // First row: alternate FF and 00 for 8 bytes
      0x47, 0xFF, 0x00,
      // Second row: alternate 00 and FF for 8 bytes  
      0x47, 0x00, 0xFF,
      // Third row: same as first row (alternate FF and 00 for 8 bytes)
      0x47, 0xFF, 0x00,
      // Fourth row: same as second row (alternate 00 and FF for 8 bytes)
      0x47, 0x00, 0xFF,
      // Fifth row: same as first row
      0x47, 0xFF, 0x00,
      // Sixth row: same as second row
      0x47, 0x00, 0xFF,
      // Seventh row: same as first row
      0x47, 0xFF, 0x00,
      // Eighth row: same as second row
      0x47, 0x00, 0xFF,
      0xFF  // LZ_END
    ]);

    const result = decompressGen2(compressed);
    expect(result.length).toBe(64); // 8x8 = 64 bytes

    // Verify checkerboard pattern
    for (let i = 0; i < 64; i++) {
      const row = Math.floor(i / 8);
      const col = i % 8;
      const expectedValue = ((row + col) % 2 === 0) ? 0xFF : 0x00;
      expect(result[i]).toBe(expectedValue);
    }
  });
});
