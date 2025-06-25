// LZ3 Compression Constants - same as decompressor for compatibility
const LZ_END = 0xff;
const LZ_LEN = 0x1f;

const LZ_LITERAL = 0 << 5;
const LZ_ITERATE = 1 << 5;
const LZ_ALTERNATE = 2 << 5;
const LZ_ZERO = 3 << 5;
const LZ_REPEAT = 4 << 5;
const LZ_FLIP = 5 << 5;
const LZ_REVERSE = 6 << 5;
const LZ_LONG = 7 << 5;

const LZ_LONG_HI = 0x03;

interface CompressionCommand {
  type: number;
  length: number;
  data?: Uint8Array;
  offset?: number;
  isLong?: boolean;
}

/**
 * Compresses data using the LZ3 algorithm compatible with pokécrystal lzcomp
 * @param input - The input data to compress
 * @param options - Compression options
 * @returns Compressed data as Uint8Array
 */
export function compressLZ3(input: Uint8Array, options: { alignment?: number } = {}): Uint8Array {
  if (input.length === 0) {
    return new Uint8Array([LZ_END]);
  }

  const output: number[] = [];
  let pos = 0;

  while (pos < input.length) {
    const bestCommand = findBestCommand(input, pos);

    if (bestCommand.length === 0) break;

    encodeCommand(bestCommand, output);
    pos += bestCommand.length;
  }

  // Add end marker
  output.push(LZ_END);

  // Apply alignment padding
  const alignment = options.alignment || 1;
  while (output.length % alignment !== 0) {
    output.push(0);
  }

  return new Uint8Array(output);
}

/**
 * Finds the best compression command for the current position
 */
function findBestCommand(input: Uint8Array, pos: number): CompressionCommand {
  const remaining = input.length - pos;
  if (remaining === 0) {
    return { type: LZ_LITERAL, length: 0 };
  }

  let bestCommand: CompressionCommand | null = null;
  let bestSavings = -1;

  // Check for zero run first (highest priority for compression)
  const zeroRun = findZeroRun(input, pos);
  if (zeroRun >= 2) {
    const savings = zeroRun - 1; // saves zeroRun bytes, costs 1 command byte
    if (savings > bestSavings) {
      bestSavings = savings;
      bestCommand = { type: LZ_ZERO, length: Math.min(zeroRun, 1024) };
    }
  }

  // Check for iteration (single byte repeat)
  const iterateRun = findIterateRun(input, pos);
  if (iterateRun.length >= 2) {
    const savings = iterateRun.length - 2; // saves length bytes, costs 1 command + 1 data byte
    if (savings > bestSavings) {
      bestSavings = savings;
      bestCommand = {
        type: LZ_ITERATE,
        length: Math.min(iterateRun.length, 1024),
        data: new Uint8Array([iterateRun.byte])
      };
    }
  }

  // Check for alternation (two byte pattern)
  const alternateRun = findAlternateRun(input, pos);
  if (alternateRun.length >= 3) {
    const savings = alternateRun.length - 3; // saves length bytes, costs 1 command + 2 data bytes
    if (savings > bestSavings) {
      bestSavings = savings;
      bestCommand = {
        type: LZ_ALTERNATE,
        length: Math.min(alternateRun.length, 1024),
        data: new Uint8Array([alternateRun.byte1, alternateRun.byte2])
      };
    }
  }

  // Check for copy commands (repeat, flip, reverse)
  const bestCopy = findBestCopyCommand(input, pos);
  if (bestCopy && bestCopy.length >= 2) {
    const offsetCost = (bestCopy.offset! <= 127) ? 1 : 2;
    const savings = bestCopy.length - (1 + offsetCost);
    if (savings > bestSavings) {
      bestSavings = savings;
      bestCommand = bestCopy;
    }
  }

  // If we found a good compression command, use it
  if (bestCommand && bestSavings >= 0) {
    return bestCommand;
  }

  // Default to literal - find the best literal run
  let literalLength = 1;
  const maxLiteral = Math.min(remaining, 1024);

  // Look ahead to find a good stopping point for the literal
  for (let i = 2; i <= maxLiteral; i++) {
    // Check if we should stop the literal here
    const nextZeroRun = findZeroRun(input, pos + i);
    const nextIterateRun = findIterateRun(input, pos + i);
    const nextAlternateRun = findAlternateRun(input, pos + i);

    if (nextZeroRun >= 3 || nextIterateRun.length >= 3 || nextAlternateRun.length >= 4) {
      break;
    }

    literalLength = i;

    // Don't make literals too long without a good reason
    if (i >= 32) break;
  }

  return {
    type: LZ_LITERAL,
    length: literalLength,
    data: input.slice(pos, pos + literalLength)
  };
}

/**
 * Finds the length of consecutive zero bytes
 */
function findZeroRun(input: Uint8Array, pos: number): number {
  let length = 0;
  while (pos + length < input.length && input[pos + length] === 0) {
    length++;
  }
  return length;
}

/**
 * Finds runs of repeated single bytes
 */
function findIterateRun(input: Uint8Array, pos: number): { length: number; byte: number } {
  if (pos >= input.length) return { length: 0, byte: 0 };

  const byte = input[pos];
  let length = 1;

  while (pos + length < input.length && input[pos + length] === byte) {
    length++;
  }

  return { length, byte };
}

/**
 * Finds alternating two-byte patterns
 */
function findAlternateRun(input: Uint8Array, pos: number): { length: number; byte1: number; byte2: number } {
  if (pos + 1 >= input.length) return { length: 0, byte1: 0, byte2: 0 };

  const byte1 = input[pos];
  const byte2 = input[pos + 1];
  let length = 2;

  while (pos + length < input.length) {
    const expectedByte = (length % 2 === 0) ? byte1 : byte2;
    if (input[pos + length] !== expectedByte) break;
    length++;
  }

  return { length, byte1, byte2 };
}

/**
 * Finds the best copy command (repeat, flip, reverse) - simplified version
 */
function findBestCopyCommand(input: Uint8Array, pos: number): CompressionCommand | null {
  let bestCommand: CompressionCommand | null = null;
  let bestLength = 0;
  const maxLength = Math.min(input.length - pos, 1024);

  // Search for matches in the already processed data
  for (let searchPos = 0; searchPos < pos; searchPos++) {
    // Normal repeat
    const repeatMatch = findRepeatMatch(input, pos, searchPos, maxLength);
    if (repeatMatch.length > bestLength) {
      bestLength = repeatMatch.length;
      bestCommand = {
        type: LZ_REPEAT,
        length: repeatMatch.length,
        offset: searchPos
      };
    }

    // Only check flip and reverse if we haven't found a good repeat match
    if (bestLength < 10) {
      // Bit-flipped match
      const flipMatch = findFlipMatch(input, pos, searchPos, maxLength);
      if (flipMatch.length > bestLength) {
        bestLength = flipMatch.length;
        bestCommand = {
          type: LZ_FLIP,
          length: flipMatch.length,
          offset: searchPos
        };
      }

      // Reverse match
      const reverseMatch = findReverseMatch(input, pos, searchPos, maxLength);
      if (reverseMatch.length > bestLength) {
        bestLength = reverseMatch.length;
        bestCommand = {
          type: LZ_REVERSE,
          length: reverseMatch.length,
          offset: searchPos
        };
      }
    }
  }

  return bestCommand;
}

/**
 * Finds matching sequences for repeat command
 */
function findRepeatMatch(input: Uint8Array, pos: number, searchPos: number, maxLength: number): { length: number } {
  let length = 0;

  while (length < maxLength &&
    pos + length < input.length &&
    searchPos + length < pos &&
    input[pos + length] === input[searchPos + length]) {
    length++;
  }

  return { length };
}

/**
 * Finds matching sequences for flip command (bit-reversed)
 */
function findFlipMatch(input: Uint8Array, pos: number, searchPos: number, maxLength: number): { length: number } {
  let length = 0;

  while (length < maxLength &&
    pos + length < input.length &&
    searchPos + length < pos) {
    const originalByte = input[searchPos + length];
    const flippedByte = flipBits(originalByte);

    if (input[pos + length] !== flippedByte) break;
    length++;
  }

  return { length };
}

/**
 * Finds matching sequences for reverse command
 */
function findReverseMatch(input: Uint8Array, pos: number, searchPos: number, maxLength: number): { length: number } {
  let length = 0;

  while (length < maxLength &&
    pos + length < input.length &&
    searchPos - length >= 0) {
    if (input[pos + length] !== input[searchPos - length]) break;
    length++;
  }

  return { length };
}

/**
 * Flips all bits in a byte
 */
function flipBits(byte: number): number {
  let flipped = 0;
  for (let i = 0; i < 8; i++) {
    flipped = (flipped << 1) | (byte & 1);
    byte >>= 1;
  }
  return flipped;
}



/**
 * Encodes a single command into the output buffer to match the original decompressor
 */
function encodeCommand(command: CompressionCommand, output: number[]): void {
  if (command.length === 0) return;

  const needsLong = command.length > 32;

  if (needsLong) {
    // LZ_LONG format - match original decompressor exactly
    // The decompressor does: cmdType = ((nextByte << 3) & LZ_CMD);
    // So if we want cmdType to be command.type, we need:
    // (encoded_byte << 3) & 0xE0 = command.type
    // Therefore: encoded_byte = command.type >> 3

    const lengthMinusOne = command.length - 1;
    const highBits = (lengthMinusOne >> 8) & LZ_LONG_HI;
    const lowBits = lengthMinusOne & 0xFF;

    // To get the right cmdType when decompressed:
    // decompressor does: cmdType = ((byte << 3) & LZ_CMD)
    // So if we want cmdType = command.type, we need: 
    // (byte << 3) & 0xE0 = command.type
    // byte = command.type >> 3
    const cmdTypeBits = command.type >> 3;

    // First byte: LZ_LONG | cmdTypeBits | highBits
    output.push(LZ_LONG | cmdTypeBits | highBits);
    // Second byte: lowBits
    output.push(lowBits);
  } else {
    // Standard format
    const lengthMinusOne = Math.min(command.length - 1, LZ_LEN);
    output.push(command.type | lengthMinusOne);
  }

  // Add command-specific data
  switch (command.type) {
    case LZ_LITERAL:
      if (command.data) {
        output.push(...Array.from(command.data));
      }
      break;

    case LZ_ITERATE:
      if (command.data) {
        output.push(command.data[0]);
      }
      break;

    case LZ_ALTERNATE:
      if (command.data) {
        output.push(command.data[0], command.data[1]);
      }
      break;

    case LZ_REPEAT:
    case LZ_FLIP:
    case LZ_REVERSE:
      if (command.offset !== undefined) {
        // Calculate position after the command bytes are written
        const currentPos = output.length + 1; // +1 for the offset byte we're about to add
        const relativeOffset = currentPos - command.offset;

        if (relativeOffset <= 127 && relativeOffset > 0) {
          output.push(0x80 | relativeOffset);
        } else {
          // Use absolute offset (2 bytes)
          output.push((command.offset >> 8) & 0xFF);
          output.push(command.offset & 0xFF);
        }
      }
      break;
  }
}

/**
 * Utility function to format compressed data as hex string for debugging
 */
export function formatAsHex(data: Uint8Array): string {
  return Array.from(data)
    .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

/**
 * Estimates compression ratio before actually compressing
 */
export function estimateCompressionRatio(input: Uint8Array): number {
  if (input.length === 0) return 1;

  // Quick heuristic based on data patterns
  let estimatedCompressedSize = 0;
  let pos = 0;

  while (pos < input.length) {
    const zeroRun = findZeroRun(input, pos);
    const iterateRun = findIterateRun(input, pos);

    if (zeroRun > 3) {
      estimatedCompressedSize += 1; // Command only
      pos += zeroRun;
    } else if (iterateRun.length > 3) {
      estimatedCompressedSize += 2; // Command + data byte
      pos += iterateRun.length;
    } else {
      // Assume literal
      const literalLength = Math.min(input.length - pos, 32);
      estimatedCompressedSize += 1 + literalLength;
      pos += literalLength;
    }
  }

  estimatedCompressedSize += 1; // LZ_END

  return input.length / estimatedCompressedSize;
}
