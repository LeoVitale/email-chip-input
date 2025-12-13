/**
 * Shared types for Email Chip Input component
 * These types are used across components, hooks, and utilities
 */

/**
 * Represents an email chip with validation status
 */
export interface EmailChip {
  id: string;
  email: string;
  label?: string;
  isValid: boolean;
}

/**
 * Represents a suggestion for autocomplete
 */
export interface Suggestion {
  id: string;
  email: string;
  label?: string;
}

