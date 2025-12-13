/**
 * Default email validation using a simple regex pattern
 */
export const defaultEmailValidator = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Generate a unique ID for chips
 * Uses crypto.randomUUID when available, falls back to a simple implementation
 */
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Parse input value and extract email
 * Handles cases like "Name <email@example.com>" format
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
 * Check if the input contains a delimiter that should trigger chip creation
 */
export const containsDelimiter = (input: string): boolean => {
  return input.includes(',') || input.includes(';');
};

/**
 * Split input by delimiters and return clean email strings
 */
export const splitByDelimiters = (input: string): string[] => {
  return input
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

