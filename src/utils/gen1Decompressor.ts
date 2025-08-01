export class Gen1Decompressor {
  private curBit = 7;
  private curByte = 0;

  private static readonly DECODE_TABLE: number[] = [
    0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff, 0x01ff, 0x03ff, 0x07ff, 0x0fff, 0x1fff, 0x3fff,
    0x7fff, 0xffff,
  ];

  private static readonly UNCOMPRESS_CODES: number[][] = [
    [0x0, 0x1, 0x3, 0x2, 0x7, 0x6, 0x4, 0x5, 0xf, 0xe, 0xc, 0xd, 0x8, 0x9, 0xb, 0xa],
    [0xf, 0xe, 0xc, 0xd, 0x8, 0x9, 0xb, 0xa, 0x0, 0x1, 0x3, 0x2, 0x7, 0x6, 0x4, 0x5],
  ];

  private readBit(data: Uint8Array): number {
    if (this.curBit === -1) {
      this.curByte++;
      this.curBit = 7;
    }
    return (data[this.curByte] >> this.curBit--) & 1;
  }

  private readInt(data: Uint8Array, count: number): number {
    let n = 0;
    while (count--) {
      n = (n << 1) | this.readBit(data);
    }
    return n;
  }

  private fillPlane(data: Uint8Array, width: number): Uint8Array {
    let mode = this.readBit(data);
    const size = width * width * 0x20;
    const plane = new Uint8Array(size);
    let len = 0;

    while (len < size) {
      if (mode) {
        // Read bit groups
        while (len < size) {
          const bitGroup = this.readInt(data, 2);
          if (!bitGroup) {
            break;
          }
          plane[len++] = bitGroup;
        }
      } else {
        // Read zero run length
        let w = 0;
        while (this.readBit(data)) {
          w++;
        }
        if (w >= Gen1Decompressor.DECODE_TABLE.length) {
          throw new Error("Invalid compressed data: run length too large");
        }
        const n = Gen1Decompressor.DECODE_TABLE[w] + this.readInt(data, w + 1);
        let count = Math.min(n, size - len);
        while (count-- > 0) {
          plane[len++] = 0;
        }
      }
      mode ^= 1;
    }

    if (len > size) {
      throw new Error("Invalid compressed data: data overflow");
    }

    // Reorganize data
    const ram = new Uint8Array(size);
    len = 0;
    for (let y = 0; y < width; y++) {
      for (let x = 0; x < width * 8; x++) {
        for (let i = 0; i < 4; i++) {
          ram[len++] = plane[(y * 4 + i) * width * 8 + x];
        }
      }
    }

    // Pack 2-bit groups into bytes
    for (let i = 0; i < size - 3; i += 4) {
      ram[i / 4] = (ram[i] << 6) | (ram[i + 1] << 4) | (ram[i + 2] << 2) | ram[i + 3];
    }

    return ram.slice(0, width * width * 8);
  }

  private uncompressPlane(plane: Uint8Array, width: number): void {
    for (let x = 0; x < width * 8; x++) {
      let bit = 0;
      for (let y = 0; y < width; y++) {
        const i = y * width * 8 + x;
        const nybbleHi = (plane[i] >> 4) & 0xf;
        const codeHi = Gen1Decompressor.UNCOMPRESS_CODES[bit][nybbleHi];
        bit = codeHi & 1;
        const nybbleLo = plane[i] & 0xf;
        const codeLo = Gen1Decompressor.UNCOMPRESS_CODES[bit][nybbleLo];
        bit = codeLo & 1;
        plane[i] = (codeHi << 4) | codeLo;
      }
    }
  }

  private transposeData(data: Uint8Array, width: number): Uint8Array {
    const size = width * width;
    const transposed = new Uint8Array(data.length);

    for (let i = 0; i < size; i++) {
      const srcTile = i;
      const dstTile = (i * width + Math.floor(i / width)) % size;

      const srcOffset = srcTile * 16;
      const dstOffset = dstTile * 16;

      for (let j = 0; j < 16; j++) {
        transposed[dstOffset + j] = data[srcOffset + j];
      }
    }

    return transposed;
  }

  decompress(data: Uint8Array): Uint8Array {
    this.curBit = 7;
    this.curByte = 0;

    // Read header
    const width = this.readInt(data, 4);
    const height = this.readInt(data, 4);

    if (width !== height) {
      throw new Error("Image is not square");
    }

    if (width < 1 || width > 15) {
      throw new Error("Invalid image size");
    }

    const size = width * width * 8;
    const rams: Uint8Array[] = [new Uint8Array(size), new Uint8Array(size)];

    // Read order bit
    const order = this.readBit(data);

    // Decompress first plane
    rams[order] = this.fillPlane(data, width);

    // Read mode
    let mode = this.readBit(data);
    if (mode) {
      mode += this.readBit(data);
    }

    // Decompress second plane
    rams[order ^ 1] = this.fillPlane(data, width);

    // Apply inverse Gray code
    this.uncompressPlane(rams[order], width);
    if (mode !== 1) {
      this.uncompressPlane(rams[order ^ 1], width);
    }

    // Apply XOR if needed
    if (mode !== 0) {
      for (let i = 0; i < size; i++) {
        rams[order ^ 1][i] ^= rams[order][i];
      }
    }

    // Interleave planes to create 2bpp data
    const output = new Uint8Array(size * 2);
    for (let i = 0; i < size; i++) {
      output[i * 2] = rams[0][i];
      output[i * 2 + 1] = rams[1][i];
    }

    // Transpose back to original tile order
    return this.transposeData(output, width);
  }
}

export function decompressGen1(data: Uint8Array): Uint8Array {
  const decompressor = new Gen1Decompressor();
  return decompressor.decompress(data);
}

export function parseGen1Hex(hex: string): Uint8Array {
  // Remove all whitespace and convert to uppercase
  const cleanHex = hex.replace(/\s+/g, "").toUpperCase();

  // Validate hex string
  if (!/^[0-9A-F]*$/.test(cleanHex)) {
    throw new Error("Invalid hex string");
  }

  // Convert hex string to bytes
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }

  return bytes;
}
