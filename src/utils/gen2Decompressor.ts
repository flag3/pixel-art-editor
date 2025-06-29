const LZ_END = 0xff;
const LZ_CMD = 0xe0;
const LZ_LEN = 0x1f;

const LZ_LITERAL = 0 << 5;
const LZ_ITERATE = 1 << 5;
const LZ_ALTERNATE = 2 << 5;
const LZ_ZERO = 3 << 5;
const LZ_REPEAT = 4 << 5;
const LZ_FLIP = 5 << 5;
const LZ_REVERSE = 6 << 5;
const LZ_LONG = 7 << 5;

const LZ_RW = 2 + 5;
const LZ_LONG_HI = 0x03;

export function decompressGen2(compressed: Uint8Array): Uint8Array {
  const output: number[] = [];
  let srcIndex = 0;
  const startAddress = 0;

  while (srcIndex < compressed.length) {
    const command = compressed[srcIndex];
    srcIndex++;

    if (command === LZ_END) {
      break;
    }

    let cmdType = command & LZ_CMD;
    let length: number;

    if (cmdType === LZ_LONG) {
      // Parse long command according to uncomp.c logic
      cmdType = ((command & LZ_LEN) >> 2) << 5; // extract real command from bits 4-2, shift to proper position

      const highBits = (command & LZ_LONG_HI); // bits 1-0 for high byte of length
      const lowBits = compressed[srcIndex];
      srcIndex++;

      length = (highBits << 8) | lowBits;
      length++;
    } else {
      length = (command & LZ_LEN) + 1;
    }

    const isRewrite = (cmdType & (1 << LZ_RW)) !== 0;

    if (isRewrite) {
      let offset: number;
      const offsetByte = compressed[srcIndex];
      srcIndex++;

      if (offsetByte & 0x80) {
        offset = output.length - (offsetByte & 0x7F); // negative offset: current position - value
      } else {
        const highOffset = offsetByte;
        const lowOffset = compressed[srcIndex];
        srcIndex++;
        offset = startAddress + (highOffset << 8) + lowOffset;
      }

      switch (cmdType) {
        case LZ_REPEAT:
          for (let i = 0; i < length; i++) {
            output.push(output[offset + i]);
          }
          break;

        case LZ_FLIP:
          for (let i = 0; i < length; i++) {
            let byte = output[offset + i];
            let flipped = 0;
            for (let bit = 0; bit < 8; bit++) {
              flipped = (flipped << 1) | (byte & 1);
              byte >>= 1;
            }
            output.push(flipped);
          }
          break;

        case LZ_REVERSE:
          for (let i = 0; i < length; i++) {
            output.push(output[offset - i]);
          }
          break;

        default:
          for (let i = 0; i < length; i++) {
            output.push(output[offset + i]);
          }
          break;
      }
    } else {
      switch (cmdType) {
        case LZ_LITERAL:
          for (let i = 0; i < length; i++) {
            output.push(compressed[srcIndex++]);
          }
          break;

        case LZ_ITERATE: {
          const iterByte = compressed[srcIndex++];
          for (let i = 0; i < length; i++) {
            output.push(iterByte);
          }
          break;
        }

        case LZ_ALTERNATE: {
          const alt1 = compressed[srcIndex++];
          const alt2 = compressed[srcIndex++];
          for (let i = 0; i < length; i++) {
            output.push(i % 2 === 0 ? alt1 : alt2);
          }
          break;
        }

        case LZ_ZERO:
          for (let i = 0; i < length; i++) {
            output.push(0);
          }
          break;
      }
    }
  }

  return new Uint8Array(output);
}

export function parseCompressedHex(hexString: string): Uint8Array | null {
  const cleanHex = hexString.replace(/\s+/g, '').replace(/^0x/i, '');

  if (cleanHex.length % 2 !== 0) {
    return null;
  }

  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    const hex = cleanHex.substr(i, 2);
    const byte = parseInt(hex, 16);
    if (isNaN(byte)) {
      return null;
    }
    bytes[i / 2] = byte;
  }

  return bytes;
}
