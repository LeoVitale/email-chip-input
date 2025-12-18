// Generic Components
export { ChipInput } from './chip-input';
export { Chip } from './chip';

// Generic Types
export type {
  Chip as ChipType,
  Suggestion as ChipSuggestion,
  ChipInputProps,
  ChipProps,
  ChipInputClassNames,
  SuggestionsListProps as ChipSuggestionsListProps,
} from './chip-input/types';

// Email-Specific Components
export { EmailChipInput } from './email-chip-input';
export { SuggestionsList } from './suggestions-list';

// Email Types
export type {
  EmailChip as EmailChipType,
  EmailChipInputProps,
  EmailChipInputClassNames,
  Suggestion,
  SuggestionsListProps,
} from './types';
