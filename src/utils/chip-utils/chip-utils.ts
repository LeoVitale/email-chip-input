/**
 * Generate a unique ID for chips.
 * Uses `crypto.randomUUID()` when available (modern browsers),
 * falls back to a timestamp-based implementation for older browsers.
 *
 * @returns A unique string identifier (UUID format or timestamp-based fallback)
 *
 * @example
 * ```ts
 * const id = generateId();
 * // Returns: "550e8400-e29b-41d4-a716-446655440000" (UUID)
 * // Or fallback: "1702489200000-abc123def"
 * ```
 */
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Default delimiters used for chip separation.
 */
export const DEFAULT_DELIMITERS = [',', ';'];

/**
 * Check if the input contains any of the specified delimiters.
 *
 * @param input - The input string to check
 * @param delimiters - Array of delimiter strings to check for
 * @returns `true` if the input contains any delimiter, `false` otherwise
 *
 * @example
 * ```ts
 * containsDelimiter('a, b, c', [',', ';']); // true
 * containsDelimiter('a; b; c', [',', ';']); // true
 * containsDelimiter('abc', [',', ';']); // false
 * containsDelimiter('a|b|c', ['|']); // true
 * ```
 */
export const containsDelimiter = (
  input: string,
  delimiters: string[] = DEFAULT_DELIMITERS
): boolean => {
  return delimiters.some((delimiter) => input.includes(delimiter));
};

/**
 * Split input by the specified delimiters and return clean strings.
 * Trims whitespace from each result and filters out empty strings.
 *
 * @param input - The input string to split
 * @param delimiters - Array of delimiter strings to split by
 * @returns An array of trimmed, non-empty strings
 *
 * @example
 * ```ts
 * splitByDelimiters('a, b; c', [',', ';']);
 * // Returns: ['a', 'b', 'c']
 *
 * splitByDelimiters('  a  ,  ,  b  ', [',']);
 * // Returns: ['a', 'b']
 *
 * splitByDelimiters('a|b|c', ['|']);
 * // Returns: ['a', 'b', 'c']
 * ```
 */
export const splitByDelimiters = (
  input: string,
  delimiters: string[] = DEFAULT_DELIMITERS
): string[] => {
  // Escape special regex characters in delimiters
  const escapedDelimiters = delimiters.map((d) =>
    d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const regex = new RegExp(`[${escapedDelimiters.join('')}]`);

  return input
    .split(regex)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

/**
 * Default string formatter for chip values.
 * Simply converts the value to a string.
 *
 * @param value - The value to format
 * @returns The string representation
 */
export const defaultFormatValue = <TValue>(value: TValue): string => {
  return String(value);
};

/**
 * Default equality comparison for chip values.
 * Uses strict equality (===).
 *
 * @param a - First value
 * @param b - Second value
 * @returns Whether the values are strictly equal
 */
export const defaultIsEqual = <TValue>(a: TValue, b: TValue): boolean => {
  return a === b;
};

/**
 * Identity function for normalization.
 * Returns the value unchanged.
 *
 * @param value - The value to normalize
 * @returns The same value
 */
export const defaultNormalize = <TValue>(value: TValue): TValue => {
  return value;
};

