export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const validateHexString = (hex: string): ValidationResult<string> => {
  const cleanedHex = hex.replace(/\s+/g, "");

  if (/[^a-fA-F0-9]/.test(cleanedHex)) {
    return {
      success: false,
      error: "Invalid characters detected in the HEX string.",
    };
  }

  if (cleanedHex.length % 2 !== 0) {
    return {
      success: false,
      error: "The HEX string has an odd number of characters.",
    };
  }

  return {
    success: true,
    data: cleanedHex,
  };
};

export const validateHexValue = (hex: string): ValidationResult<boolean> => {
  const hexPattern = /^[0-9A-Fa-f]{2}$/;

  if (!hexPattern.test(hex)) {
    return {
      success: false,
      error: `Invalid HEX value detected: ${hex}. Please use valid HEX values.`,
    };
  }

  return {
    success: true,
    data: true,
  };
};

export const createErrorHandler = (onError?: (error: string) => void) => {
  return (error: string) => {
    if (onError) {
      onError(error);
    } else {
      console.error(error);
    }
  };
};
