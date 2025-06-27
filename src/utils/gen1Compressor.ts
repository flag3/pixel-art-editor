export class Gen1Compressor {
  /**
   * Compresses data using specified swap and mode parameters
   * @param data - Input sprite data  
   * @param width - Width of sprite in tiles (must equal height)
   * @param swap - Bitplane swap flag (0 or 1)
   * @param mode - Compression mode (0, 1, or 2)
   * @returns Compressed data as Uint8Array
   */
  compressWithParams(data: Uint8Array, width: number, swap: number, mode: number): Uint8Array {
    if (width < 1 || width > 15) {
      throw new Error("Invalid sprite width");
    }

    return this.compressInternal(data, width, swap, mode);
  }

  /**
   * Compresses sprite data using all 6 methods and returns the best result
   * @param data - Input sprite data
   * @param width - Width of sprite in tiles
   * @returns Best compressed result
   */
  compress(data: Uint8Array, width: number): Uint8Array {
    const expectedSize = width * width * 16;
    if (data.length !== expectedSize) {
      throw new Error(`Invalid data size: expected ${expectedSize}, got ${data.length}`);
    }

    // Try all 6 compression methods
    const methods = [
      { swap: 0, mode: 0 },
      { swap: 0, mode: 1 },
      { swap: 0, mode: 2 },
      { swap: 1, mode: 0 },
      { swap: 1, mode: 1 },
      { swap: 1, mode: 2 },
    ];

    let bestCompressed = null;
    let bestSize = Infinity;

    for (const method of methods) {
      const compressed = this.compressInternal(data, width, method.swap, method.mode);
      if (compressed.length < bestSize) {
        bestSize = compressed.length;
        bestCompressed = compressed;
      }
    }

    return bestCompressed!;
  }

  private compressInternal(data: Uint8Array, width: number, swap: number, mode: number): Uint8Array {
    const height = width; // Square sprites only

    // Convert input data to 2D bitplanes
    const input = this.convertToBitplanes(data, width, height);

    // Apply preprocessing based on mode and swap
    const processed = this.preprocess(input, swap, mode, width, height);

    // Create output bit array
    const output: number[] = [];

    // Header: sprite dimensions + swap bit
    for (let i = 3; i >= 0; i--) output.push((width >> i) & 1);
    for (let i = 3; i >= 0; i--) output.push((height >> i) & 1);
    output.push(swap);

    const bp0 = swap;
    const bp1 = 1 ^ swap;

    // Process bitplane 0
    this.compressBitplane(processed[bp0], output, width, height);

    // Mode indicator bits
    if (mode === 0) {
      output.push(0);
    } else {
      output.push(1);
      output.push(mode === 1 ? 0 : 1);
    }

    // Process bitplane 1
    this.compressBitplane(processed[bp1], output, width, height);

    // Convert bits to bytes
    return this.packBits(output);
  }

  private convertToBitplanes(data: Uint8Array, width: number, height: number): number[][][] {
    const bitplanes: number[][][] = [[], []];

    // Initialize bitplanes
    for (let bp = 0; bp < 2; bp++) {
      for (let y = 0; y < height * 8; y++) {
        bitplanes[bp][y] = [];
        for (let x = 0; x < width * 8; x++) {
          bitplanes[bp][y][x] = 0;
        }
      }
    }

    // Convert 2bpp Game Boy tile data to bitplanes
    let dataIdx = 0;
    for (let tileY = 0; tileY < height; tileY++) {
      for (let tileX = 0; tileX < width; tileX++) {
        for (let row = 0; row < 8; row++) {
          const byte0 = data[dataIdx++]; // Low bitplane
          const byte1 = data[dataIdx++]; // High bitplane

          for (let col = 0; col < 8; col++) {
            const x = tileX * 8 + col;
            const y = tileY * 8 + row;
            const bitPos = 7 - col;

            bitplanes[0][y][x] = (byte0 >> bitPos) & 1;
            bitplanes[1][y][x] = (byte1 >> bitPos) & 1;
          }
        }
      }
    }

    return bitplanes;
  }

  private preprocess(input: number[][][], swap: number, mode: number, width: number, height: number): number[][][] {
    const result: number[][][] = [
      input[0].map(row => [...row]),
      input[1].map(row => [...row])
    ];

    const bp0 = swap;
    const bp1 = 1 ^ swap;

    // XOR preprocessing
    if (mode !== 0) {
      for (let y = 0; y < height * 8; y++) {
        for (let x = 0; x < width * 8; x++) {
          const p = result[bp0][y][x] ^ result[bp1][y][x];
          result[bp1][y][x] = p;
        }
      }
    }

    // Delta preprocessing for bp0
    for (let y = 0; y < height * 8; y++) {
      let prev = 0;
      for (let x = 0; x < width * 8; x++) {
        const now = result[bp0][y][x];
        result[bp0][y][x] = (now === prev ? 0 : 1);
        prev = now;
      }
    }

    // Delta preprocessing for bp1 (if mode != 1)
    if (mode !== 1) {
      for (let y = 0; y < height * 8; y++) {
        let prev = 0;
        for (let x = 0; x < width * 8; x++) {
          const now = result[bp1][y][x];
          result[bp1][y][x] = (now === prev ? 0 : 1);
          prev = now;
        }
      }
    }

    return result;
  }

  private compressBitplane(plane: number[][], output: number[], width: number, height: number): void {
    const totalWidth = width * 8;
    const totalHeight = height * 8;

    let count = 0;
    let rle = false;

    // Check if we should start in RLE mode
    if (plane[0][0] === 0 && plane[0][1] === 0) {
      rle = true;
    }
    output.push(rle ? 0 : 1);

    // Process pairs of bits
    for (let x = 0; x < totalWidth; x += 2) {
      for (let y = 0; y < totalHeight; y++) {
        const a = plane[y][x];
        const b = x + 1 < totalWidth ? plane[y][x + 1] : 0;

        if (rle) {
          // In RLE mode - count zero pairs
          if (a === 0 && b === 0) {
            count++;
          }

          if (a !== 0 || b !== 0 || (x === totalWidth - 2 && y === totalHeight - 1)) {
            // End of zero run - encode count
            const enc = count + 1;
            let pow = 1;
            let dig = -1;

            // Calculate bits needed
            while (pow <= enc) {
              pow <<= 1;
              dig++;
            }
            pow >>= 1;

            const val = enc - pow;
            pow -= 2;

            // Write prefix bits
            for (let i = 0; i < dig; i++) {
              output.push((pow >> (dig - i - 1)) & 1);
            }
            // Write value bits
            for (let i = 0; i < dig; i++) {
              output.push((val >> (dig - i - 1)) & 1);
            }

            if (x !== totalWidth - 2 || y !== totalHeight - 1) {
              output.push(a);
              output.push(b);
              rle = false;
            }
            count = 0;
          }
        } else {
          // Not in RLE mode
          if (a === 0 && b === 0) {
            // Start RLE mode
            output.push(0);
            output.push(0);
            count = 1;
            rle = true;
            if (x === totalWidth - 2 && y === totalHeight - 1) {
              // Special case for end
              output.push(0);
              output.push(0);
            }
          } else {
            // Output literal bits
            output.push(a);
            output.push(b);
          }
        }
      }
    }
  }

  private packBits(bits: number[]): Uint8Array {
    const bytes: number[] = [];
    const len = Math.ceil(bits.length / 8);

    for (let i = 0; i < len; i++) {
      let b = 0;
      for (let j = 0; j < 8; j++) {
        const idx = 8 * i + j;
        b = (b << 1) | (idx < bits.length ? bits[idx] : 0);
      }
      bytes.push(b);
    }

    return new Uint8Array(bytes);
  }
}

export function compressGen1(data: Uint8Array, width?: number): Uint8Array {
  // Auto-detect width if not provided (assume square sprite)
  if (!width) {
    const totalBytes = data.length;
    const tilesCount = totalBytes / 16; // 16 bytes per 8x8 tile in 2bpp
    width = Math.sqrt(tilesCount);

    if (!Number.isInteger(width)) {
      throw new Error("Cannot auto-detect sprite width - data size doesn't form a square");
    }
  }

  const compressor = new Gen1Compressor();
  return compressor.compress(data, width);
}

export function formatGen1Hex(data: Uint8Array): string {
  return Array.from(data)
    .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}
