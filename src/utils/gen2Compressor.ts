const SHORT_COMMAND_COUNT = 32;
const MAX_COMMAND_COUNT = 1024;
const LOOKBACK_LIMIT = 128;
const LZ_END = 0xFF;

// Bit-flipping table from global.c
const BIT_FLIPPING_TABLE = new Uint8Array([
  0x00, 0x80, 0x40, 0xc0, 0x20, 0xa0, 0x60, 0xe0, 0x10, 0x90, 0x50, 0xd0, 0x30, 0xb0, 0x70, 0xf0,
  0x08, 0x88, 0x48, 0xc8, 0x28, 0xa8, 0x68, 0xe8, 0x18, 0x98, 0x58, 0xd8, 0x38, 0xb8, 0x78, 0xf8,
  0x04, 0x84, 0x44, 0xc4, 0x24, 0xa4, 0x64, 0xe4, 0x14, 0x94, 0x54, 0xd4, 0x34, 0xb4, 0x74, 0xf4,
  0x0c, 0x8c, 0x4c, 0xcc, 0x2c, 0xac, 0x6c, 0xec, 0x1c, 0x9c, 0x5c, 0xdc, 0x3c, 0xbc, 0x7c, 0xfc,
  0x02, 0x82, 0x42, 0xc2, 0x22, 0xa2, 0x62, 0xe2, 0x12, 0x92, 0x52, 0xd2, 0x32, 0xb2, 0x72, 0xf2,
  0x0a, 0x8a, 0x4a, 0xca, 0x2a, 0xaa, 0x6a, 0xea, 0x1a, 0x9a, 0x5a, 0xda, 0x3a, 0xba, 0x7a, 0xfa,
  0x06, 0x86, 0x46, 0xc6, 0x26, 0xa6, 0x66, 0xe6, 0x16, 0x96, 0x56, 0xd6, 0x36, 0xb6, 0x76, 0xf6,
  0x0e, 0x8e, 0x4e, 0xce, 0x2e, 0xae, 0x6e, 0xee, 0x1e, 0x9e, 0x5e, 0xde, 0x3e, 0xbe, 0x7e, 0xfe,
  0x01, 0x81, 0x41, 0xc1, 0x21, 0xa1, 0x61, 0xe1, 0x11, 0x91, 0x51, 0xd1, 0x31, 0xb1, 0x71, 0xf1,
  0x09, 0x89, 0x49, 0xc9, 0x29, 0xa9, 0x69, 0xe9, 0x19, 0x99, 0x59, 0xd9, 0x39, 0xb9, 0x79, 0xf9,
  0x05, 0x85, 0x45, 0xc5, 0x25, 0xa5, 0x65, 0xe5, 0x15, 0x95, 0x55, 0xd5, 0x35, 0xb5, 0x75, 0xf5,
  0x0d, 0x8d, 0x4d, 0xcd, 0x2d, 0xad, 0x6d, 0xed, 0x1d, 0x9d, 0x5d, 0xdd, 0x3d, 0xbd, 0x7d, 0xfd,
  0x03, 0x83, 0x43, 0xc3, 0x23, 0xa3, 0x63, 0xe3, 0x13, 0x93, 0x53, 0xd3, 0x33, 0xb3, 0x73, 0xf3,
  0x0b, 0x8b, 0x4b, 0xcb, 0x2b, 0xab, 0x6b, 0xeb, 0x1b, 0x9b, 0x5b, 0xdb, 0x3b, 0xbb, 0x7b, 0xfb,
  0x07, 0x87, 0x47, 0xc7, 0x27, 0xa7, 0x67, 0xe7, 0x17, 0x97, 0x57, 0xd7, 0x37, 0xb7, 0x77, 0xf7,
  0x0f, 0x8f, 0x4f, 0xcf, 0x2f, 0xaf, 0x6f, 0xef, 0x1f, 0x9f, 0x5f, 0xdf, 0x3f, 0xbf, 0x7f, 0xff
]);

interface Command {
  command: number; // 0-6
  count: number;   // 1-1024
  value: number;   // offset or bytes
}

interface CompressionOptions {
  alignment?: number;
}

/**
 * Main compression function - ports compress() from main.c
 */
export function compressGen2(data: Uint8Array, options: CompressionOptions = {}): Uint8Array {
  if (data.length === 0) {
    return new Uint8Array([LZ_END]);
  }

  const { alignment = 0 } = options;

  // Create bit-flipped version of the data
  const bitflipped = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    bitflipped[i] = BIT_FLIPPING_TABLE[data[i]];
  }

  // Use method 0 for debugging and simplicity
  const bestCommands = tryCompressSinglePass(data, bitflipped, 0);

  // Convert commands to binary output
  return writeCommandsToBytes(bestCommands, data, alignment);
}

/**
 * Single-pass compressor - ports try_compress_single_pass() from spcomp.c
 */
function tryCompressSinglePass(data: Uint8Array, bitflipped: Uint8Array, flags: number): Command[] {
  const commands: Command[] = new Array(data.length);

  // Initialize all commands as dummy (command 7)
  for (let i = 0; i < commands.length; i++) {
    commands[i] = { command: 7, count: 0, value: 0 };
  }

  let currentCommandIndex = 0;
  let position = 0;
  let previousData = 0;
  let scanDelay = 0;
  const scanDelayFlag = Math.floor((flags >> 3) % 3);

  while (position < data.length) {
    const copy = findBestCopy(data, position, data.length, bitflipped, flags);
    const repetition = findBestRepetition(data, position, data.length);

    // Pick best command between copy and repetition based on flag 1
    let bestCommand: Command;
    if (flags & 1) {
      bestCommand = pickBestCommand(repetition, copy);
    } else {
      bestCommand = pickBestCommand(copy, repetition);
    }

    // Compare with literal command
    const literalCommand: Command = { command: 0, count: 1, value: position };
    bestCommand = pickBestCommand(literalCommand, bestCommand);

    // Flag 2: Don't emit copy/repetition equal to size when previous is non-max literal
    if ((flags & 2) && (commandSize(bestCommand) === bestCommand.count)) {
      if (previousData && (previousData !== SHORT_COMMAND_COUNT) && (previousData !== MAX_COMMAND_COUNT)) {
        bestCommand = { command: 0, count: 1, value: position };
      }
    }

    // Scan delay logic: force literal commands after non-literal commands
    if (scanDelayFlag) {
      if (scanDelay >= scanDelayFlag) {
        scanDelay = 0;
      } else if (bestCommand.command) {
        scanDelay++;
        bestCommand = { command: 0, count: 1, value: position };
      }
    }

    commands[currentCommandIndex] = bestCommand;

    if (bestCommand.command) {
      previousData = 0;
    } else {
      previousData += bestCommand.count;
    }

    position += bestCommand.count;
    currentCommandIndex++;

    // Safety check to prevent infinite loops
    if (currentCommandIndex >= commands.length) {
      break;
    }
  }

  // Trim to actual command count
  const actualCommands = commands.slice(0, currentCommandIndex);

  // Optimize and repack commands
  optimize(actualCommands);
  repack(actualCommands);

  return actualCommands;
}

// Removed wouldBeCompressible function as it's not used in this implementation

/**
 * Find best copy command - ports find_best_copy() from spcomp.c
 */
function findBestCopy(data: Uint8Array, position: number, length: number, bitflipped: Uint8Array, flags: number): Command {
  let simple: Command = { command: 7, count: 0, value: 0 }; // dummy
  let flipped: Command = { command: 7, count: 0, value: 0 };
  let backwards: Command = { command: 7, count: 0, value: 0 };

  // Scan forwards for normal copy
  const simpleResult = scanForwards(data.slice(position), length - position, data, position);
  if (simpleResult.count > 0) {
    simple = { command: 4, count: simpleResult.count, value: simpleResult.offset };
  }

  // Scan forwards for bit-flipped copy
  const flippedResult = scanForwards(data.slice(position), length - position, bitflipped, position);
  if (flippedResult.count > 0) {
    flipped = { command: 5, count: flippedResult.count, value: flippedResult.offset };
  }

  // Scan backwards for reversed copy
  const backwardsResult = scanBackwards(data, length - position, position);
  if (backwardsResult.count > 0) {
    backwards = { command: 6, count: backwardsResult.count, value: backwardsResult.offset };
  }

  // Pick best based on flags (copy command preference)
  let command: Command;
  switch (Math.floor(flags / 24)) {
    case 0: command = pickBestCommand(simple, backwards, flipped); break;
    case 1: command = pickBestCommand(backwards, flipped, simple); break;
    case 2: command = pickBestCommand(flipped, backwards, simple); break;
    default: command = simple;
  }

  // Flag 4: Don't emit long copy commands
  if ((flags & 4) && (command.count > SHORT_COMMAND_COUNT)) {
    command.count = SHORT_COMMAND_COUNT;
  }

  return command;
}

/**
 * Scan forwards - ports scan_forwards() from spcomp.c
 */
function scanForwards(target: Uint8Array, limit: number, source: Uint8Array, realPosition: number): { count: number; offset: number } {
  let bestMatch = 0;
  let bestLength = 0;

  for (let position = 0; position < realPosition; position++) {
    if (source[position] !== target[0]) continue;

    let currentLength = 0;
    while ((currentLength < limit) &&
      (position + currentLength < source.length) &&
      (source[position + currentLength] === target[currentLength])) {
      currentLength++;
    }

    if (currentLength > MAX_COMMAND_COUNT) currentLength = MAX_COMMAND_COUNT;
    if (currentLength < bestLength) continue;

    bestMatch = position;
    bestLength = currentLength;
  }

  if (!bestLength) return { count: 0, offset: 0 };

  let offset: number;
  if ((bestMatch + LOOKBACK_LIMIT) >= realPosition) {
    offset = bestMatch - realPosition; // negative offset
  } else {
    offset = bestMatch; // positive offset
  }

  return { count: bestLength, offset };
}

/**
 * Scan backwards - ports scan_backwards() from spcomp.c
 */
function scanBackwards(data: Uint8Array, limit: number, realPosition: number): { count: number; offset: number } {
  if (realPosition < limit) limit = realPosition;

  let bestMatch = 0;
  let bestLength = 0;

  for (let position = 0; position < realPosition; position++) {
    if (data[position] !== data[realPosition]) continue;

    let currentLength = 0;
    while ((currentLength <= position) &&
      (currentLength < limit) &&
      (data[position - currentLength] === data[realPosition + currentLength])) {
      currentLength++;
    }

    if (currentLength > MAX_COMMAND_COUNT) currentLength = MAX_COMMAND_COUNT;
    if (currentLength < bestLength) continue;

    bestMatch = position;
    bestLength = currentLength;
  }

  if (!bestLength) return { count: 0, offset: 0 };

  let offset: number;
  if ((bestMatch + LOOKBACK_LIMIT) >= realPosition) {
    offset = bestMatch - realPosition; // negative offset
  } else {
    offset = bestMatch; // positive offset
  }

  return { count: bestLength, offset };
}

/**
 * Find best repetition - ports find_best_repetition() from spcomp.c
 */
function findBestRepetition(data: Uint8Array, position: number, length: number): Command {
  if ((position + 1) >= length) {
    return data[position] ? { command: 7, count: 0, value: 0 } : { command: 3, count: 1, value: 0 };
  }

  const value = [data[position], data[position + 1]];
  let limit = length - position;
  if (limit > MAX_COMMAND_COUNT) limit = MAX_COMMAND_COUNT;

  // Count alternating pattern
  let repcount = 2;
  while ((repcount < limit) && (data[position + repcount] === value[repcount & 1])) {
    repcount++;
  }

  const result: Command = { command: 0, count: repcount, value: 0 };

  if (value[0] !== value[1]) {
    if (!value[0] && (repcount < 3)) {
      return { command: 3, count: 1, value: 0 };
    }
    result.command = 2;
    result.value = value[0] | (value[1] << 8);
  } else if (value[0]) {
    result.command = 1;
    result.value = value[0];
  } else {
    result.command = 3;
  }

  return result;
}

/**
 * Pick best command - ports pick_best_command() from util.c
 */
function pickBestCommand(...commands: Command[]): Command {
  let best = commands[0];
  for (let i = 1; i < commands.length; i++) {
    if (isBetter(commands[i], best)) {
      best = commands[i];
    }
  }
  return best;
}

/**
 * Check if command is better - ports is_better() from util.c
 */
function isBetter(newCommand: Command, oldCommand: Command): boolean {
  if (newCommand.command === 7) return false;
  if (oldCommand.command === 7) return true;

  const newSavings = newCommand.count - commandSize(newCommand);
  const oldSavings = oldCommand.count - commandSize(oldCommand);

  return newSavings > oldSavings;
}

/**
 * Calculate command size in bytes - ports command_size() from util.c
 */
function commandSize(command: Command): number {
  const headerSize = 1 + (command.count > SHORT_COMMAND_COUNT ? 1 : 0);

  if (command.command & 4) {
    // Copy commands (4, 5, 6)
    return headerSize + 1 + (command.value >= 0 ? 1 : 0);
  }

  // Array lookup: [command.count, 1, 2, 0] for commands [0, 1, 2, 3]
  const commandSizes = [command.count, 1, 2, 0];
  return headerSize + commandSizes[command.command];
}

/**
 * Optimize commands - ports optimize() from packing.c
 */
function optimize(commands: Command[]): void {
  // Remove leading dummy commands
  while (commands.length && commands[0].command === 7) {
    commands.shift();
  }

  if (commands.length < 2) return;

  let current = 0;
  let next = 1;

  while (next < commands.length) {
    if (commands[next].command === 7) {
      next++;
      continue;
    }

    // Optimize inefficient copy commands by merging with literals
    if (
      commands[current].command === 0 && // current is literal
      commandSize(commands[next]) === commands[next].count && // next command is inefficient
      (commands[current].count + commands[next].count) <= MAX_COMMAND_COUNT &&
      (commands[current].count > SHORT_COMMAND_COUNT ||
        (commands[current].count + commands[next].count) <= SHORT_COMMAND_COUNT)
    ) {
      commands[current].count += commands[next].count;
      commands[next].command = 7; // mark as dummy
      next++;
      continue;
    }

    // Merge identical commands
    if (commands[next].command === commands[current].command) {
      switch (commands[current].command) {
        case 0: // literal
          if ((commands[current].value + commands[current].count) === commands[next].value) {
            commands[current].count += commands[next].count;
            commands[next].command = 7;

            if (commands[current].count <= MAX_COMMAND_COUNT) {
              next++;
              continue;
            }

            // Split if too large
            commands[next].command = 0;
            commands[next].value = commands[current].value + MAX_COMMAND_COUNT;
            commands[next].count = commands[current].count - MAX_COMMAND_COUNT;
            commands[current].count = MAX_COMMAND_COUNT;
          }
          break;

        case 1: // iterate
          if (commands[current].value === commands[next].value) {
            if ((commands[current].count + commands[next].count) <= MAX_COMMAND_COUNT) {
              commands[current].count += commands[next].count;
              commands[next].command = 7;
              next++;
              continue;
            }

            commands[next].count = (commands[current].count + commands[next].count) - MAX_COMMAND_COUNT;
            commands[current].count = MAX_COMMAND_COUNT;
          }
          break;

        case 3: // zero
          if ((commands[current].count + commands[next].count) <= MAX_COMMAND_COUNT) {
            commands[current].count += commands[next].count;
            commands[next].command = 7;
            next++;
            continue;
          }

          commands[next].count = (commands[current].count + commands[next].count) - MAX_COMMAND_COUNT;
          commands[current].count = MAX_COMMAND_COUNT;
          break;
      }
    }

    current = next;
    next++;
  }
}

/**
 * Repack commands - ports repack() from packing.c
 */
function repack(commands: Command[]): void {
  // Remove any dummy commands (command 7) in place
  let writeIndex = 0;
  for (let readIndex = 0; readIndex < commands.length; readIndex++) {
    if (commands[readIndex].command !== 7) {
      if (writeIndex !== readIndex) {
        commands[writeIndex] = commands[readIndex];
      }
      writeIndex++;
    }
  }

  // Trim the array to the new length
  commands.length = writeIndex;
}

/**
 * Write commands to binary format - ports write_command_to_file() from output.c
 */
function writeCommandsToBytes(commands: Command[], inputData: Uint8Array, alignment: number): Uint8Array {
  const output: number[] = [];

  for (const command of commands) {
    writeCommandToBytes(output, command, inputData);
  }

  // Add terminator
  output.push(LZ_END);

  // Add alignment padding
  while (output.length % (1 << alignment) !== 0) {
    output.push(0);
  }

  return new Uint8Array(output);
}

/**
 * Write single command to bytes - ports write_command_to_file() from output.c
 */
function writeCommandToBytes(output: number[], command: Command, inputData: Uint8Array): void {
  if (!command.count || command.count > MAX_COMMAND_COUNT) {
    throw new Error('Invalid command in output stream');
  }

  const count = command.count - 1; // Commands store count-1

  if (command.count <= SHORT_COMMAND_COUNT) {
    // Short command: 3-bit command + 5-bit count
    output.push((command.command << 5) + count);
  } else {
    // Long command: exact match to output.c line 112
    output.push(224 + (command.command << 2) + (count >> 8));
    output.push(count & 0xFF);
  }

  switch (command.command) {
    case 1:
    case 2:
      // Write value bytes in little-endian order
      for (let n = 0; n < command.command; n++) {
        output.push((command.value >> (n * 8)) & 0xFF);
      }
      break;

    case 0: // literal
    case 3: // zero
      break;

    default: // 4, 5, 6 (copy commands)
      if (command.value < 0) {
        // Negative offset: exact match to output.c line 124
        // Convert to unsigned byte first, then XOR
        const unsignedByte = (command.value & 0xFF);
        output.push(unsignedByte ^ 127);
      } else {
        // Positive offset: high byte then low byte
        output.push((command.value >> 8) & 0xFF);
        output.push(command.value & 0xFF);
      }
      break;
  }

  // Write literal data after header (if command is 0)
  if (command.command === 0) {
    for (let i = 0; i < command.count; i++) {
      output.push(inputData[command.value + i]);
    }
  }
}

/**
 * Format byte array as hex string
 */
export function formatAsHex(data: Uint8Array): string {
  return Array.from(data)
    .map(byte => byte.toString(16).toUpperCase().padStart(2, '0'))
    .join(' ');
}

/**
 * Estimate compression ratio
 */
export function estimateCompressionRatio(data: Uint8Array): number {
  if (data.length === 0) return 1;

  // Quick estimation based on repetitive patterns
  let compressibleBytes = 0;
  let i = 0;

  while (i < data.length) {
    // Count zeros
    let zeroRun = 0;
    while (i + zeroRun < data.length && data[i + zeroRun] === 0) {
      zeroRun++;
    }
    if (zeroRun > 1) {
      compressibleBytes += zeroRun - 2;
      i += zeroRun;
      continue;
    }

    // Count repeated bytes
    let repeatRun = 1;
    while (i + repeatRun < data.length && data[i + repeatRun] === data[i]) {
      repeatRun++;
    }
    if (repeatRun > 2) {
      compressibleBytes += repeatRun - 3;
      i += repeatRun;
      continue;
    }

    i++;
  }

  return data.length / Math.max(1, data.length - compressibleBytes);
}
