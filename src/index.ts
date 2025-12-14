/**
 * @react-email-chip-input
 *
 * A fully customizable, accessible email chip input component for React.
 * Supports keyboard navigation, email validation, autocomplete suggestions, and more.
 *
 * @packageDocumentation
 */

// Components
export { EmailChipInput } from './components/email-chip-input';
export { EmailChip } from './components/email-chip';
export { SuggestionsList } from './components/suggestions-list';

// Types
export type {
  EmailChip as EmailChipType,
  EmailChipInputProps,
  EmailChipProps,
  EmailChipInputClassNames,
  Suggestion,
  SuggestionsListProps,
} from './components/types';

// Hooks
export { useChipNavigation } from './hooks/use-chip-navigation';
export { useEmailValidation } from './hooks/use-email-validation';
export { useSuggestions } from './hooks/use-suggestions';

// Utilities
export {
  defaultEmailValidator,
  generateId,
  parseEmailInput,
  containsDelimiter,
  splitByDelimiters,
} from './utils/email-utils';

