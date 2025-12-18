/**
 * @react-email-chip-input
 *
 * A fully customizable, accessible chip input component for React.
 * Supports keyboard navigation, validation, autocomplete suggestions, and more.
 *
 * This package provides both a generic ChipInput component that works with any
 * data type, and a specialized EmailChipInput for email address handling.
 *
 * @packageDocumentation
 */

// =============================================================================
// Generic Components (for any data type)
// =============================================================================

export { ChipInput } from './components/chip-input';
export { Chip } from './components/chip';

// Generic Types
export type {
  Chip as ChipType,
  Suggestion as ChipSuggestion,
  ChipInputProps,
  ChipProps,
  ChipInputClassNames,
  SuggestionsListProps as ChipSuggestionsListProps,
} from './components/chip-input/types';

// Generic Hooks
export { useChipValidation } from './hooks/use-chip-validation';

// Generic Utilities
export {
  generateId,
  containsDelimiter,
  splitByDelimiters,
  defaultFormatValue,
  defaultIsEqual,
  defaultNormalize,
  DEFAULT_DELIMITERS,
} from './utils/chip-utils';

// =============================================================================
// Email-Specific Components (specialized for email addresses)
// =============================================================================

export { EmailChipInput } from './components/email-chip-input';
export { EmailChip } from './components/email-chip';
export { SuggestionsList } from './components/suggestions-list';

// Email Types
export type {
  EmailChip as EmailChipType,
  EmailChipInputProps,
  EmailChipProps,
  EmailChipInputClassNames,
  Suggestion,
  SuggestionsListProps,
} from './components/types';

// Email-Specific Hooks
export { useChipNavigation } from './hooks/use-chip-navigation';
export { useEmailValidation } from './hooks/use-email-validation';
export { useSuggestions } from './hooks/use-suggestions';

// Email-Specific Utilities
export {
  defaultEmailValidator,
  parseEmailInput,
  containsDelimiter as containsEmailDelimiter,
  splitByDelimiters as splitEmailsByDelimiters,
} from './utils/email-utils';
