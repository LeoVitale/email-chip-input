/**
 * Default email validation using a simple regex pattern.
 * Validates that the email contains characters before @, after @, and a domain extension.
 *
 * @param email - The email address to validate
 * @returns `true` if the email matches the pattern, `false` otherwise
 *
 * @example
 * ```ts
 * defaultEmailValidator('user@example.com'); // true
 * defaultEmailValidator('invalid-email'); // false
 * defaultEmailValidator('  user@example.com  '); // true (trims whitespace)
 * ```
 */
export const defaultEmailValidator = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

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
 * Parse input value and extract email address and optional label.
 * Handles both plain email addresses and the "Name <email>" format.
 *
 * @param input - The input string to parse
 * @returns An object containing `email` (required) and `label` (optional)
 *
 * @example
 * ```ts
 * parseEmailInput('John Doe <john@example.com>');
 * // Returns: { email: 'john@example.com', label: 'John Doe' }
 *
 * parseEmailInput('john@example.com');
 * // Returns: { email: 'john@example.com' }
 *
 * parseEmailInput('  user@example.com  ');
 * // Returns: { email: 'user@example.com' }
 * ```
 */
export const parseEmailInput = (input: string): { email: string; label?: string } => {
  const trimmed = input.trim();
  
  // Check for "Name <email>" format
  const bracketMatch = trimmed.match(/^(.+?)\s*<([^>]+)>$/);
  if (bracketMatch) {
    return {
      label: bracketMatch[1].trim(),
      email: bracketMatch[2].trim(),
    };
  }
  
  return { email: trimmed };
};

/**
 * Check if the input contains a delimiter that should trigger chip creation.
 * Recognized delimiters are comma (`,`) and semicolon (`;`).
 *
 * @param input - The input string to check
 * @returns `true` if the input contains a delimiter, `false` otherwise
 *
 * @example
 * ```ts
 * containsDelimiter('email1@example.com, email2@example.com'); // true
 * containsDelimiter('email1@example.com; email2@example.com'); // true
 * containsDelimiter('email@example.com'); // false
 * ```
 */
export const containsDelimiter = (input: string): boolean => {
  return input.includes(',') || input.includes(';');
};

/**
 * Split input by delimiters (comma or semicolon) and return clean email strings.
 * Trims whitespace from each result and filters out empty strings.
 *
 * @param input - The input string to split
 * @returns An array of trimmed, non-empty email strings
 *
 * @example
 * ```ts
 * splitByDelimiters('a@test.com, b@test.com; c@test.com');
 * // Returns: ['a@test.com', 'b@test.com', 'c@test.com']
 *
 * splitByDelimiters('  a@test.com  ,  ,  b@test.com  ');
 * // Returns: ['a@test.com', 'b@test.com']
 * ```
 */
export const splitByDelimiters = (input: string): string[] => {
  return input
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

