/**
 * Represents an email chip with validation status.
 * Used to display email addresses as interactive chips in the input.
 */
export interface EmailChip {
  /** Unique identifier for the chip */
  id: string;
  /** The email address */
  email: string;
  /** Optional display label (e.g., person's name) */
  label?: string;
  /** Whether the email passed validation */
  isValid: boolean;
}

/**
 * Represents a suggestion for autocomplete.
 * Returned by the search function and displayed in the suggestions dropdown.
 */
export interface Suggestion {
  /** Unique identifier for the suggestion */
  id: string;
  /** The email address */
  email: string;
  /** Optional display label (e.g., person's name) */
  label?: string;
}

/**
 * CSS class names for styling EmailChipInput components.
 * Allows complete customization of component appearance.
 */
export interface EmailChipInputClassNames {
  /** Class for the outer container element */
  container?: string;
  /** Class for the text input element */
  input?: string;
  /** Base class for email chips */
  chip?: string;
  /** Class applied to chips with invalid emails */
  chipInvalid?: string;
  /** Class applied to the currently selected chip */
  chipSelected?: string;
  /** Class for the delete button within chips */
  deleteButton?: string;
  /** Class for the suggestions dropdown container */
  suggestionsList?: string;
  /** Class for individual suggestion items */
  suggestionItem?: string;
  /** Class for the highlighted/focused suggestion */
  suggestionItemHighlighted?: string;
}

/**
 * Props for the EmailChipInput component.
 *
 * @example
 * ```tsx
 * <EmailChipInput
 *   value={chips}
 *   onChange={setChips}
 *   validateEmail={(email) => email.includes('@')}
 *   onSearch={async (query) => fetchContacts(query)}
 *   placeholder="Add recipients..."
 *   classNames={{ container: 'my-input', chip: 'my-chip' }}
 * />
 * ```
 */
export interface EmailChipInputProps {
  /** Current array of email chips (controlled component) */
  value: EmailChip[];
  /** Callback when chips change (add, remove, reorder) */
  onChange: (chips: EmailChip[]) => void;

  /**
   * Custom email validation function.
   * Can be sync or async. If not provided, uses default regex validation.
   */
  validateEmail?: (email: string) => boolean | Promise<boolean>;

  /**
   * Async function to search for suggestions.
   * If not provided, autocomplete is disabled.
   */
  onSearch?: (query: string) => Promise<Suggestion[]>;
  /**
   * Debounce delay for search in milliseconds.
   * @default 300
   */
  searchDebounceMs?: number;

  /** Custom CSS class names for styling */
  classNames?: EmailChipInputClassNames;

  /**
   * Placeholder text shown when no chips are present.
   * @default 'Enter email addresses...'
   */
  placeholder?: string;
  /**
   * Accessible label for the input.
   * @default 'Email input'
   */
  ariaLabel?: string;
  /**
   * Whether the input is disabled.
   * @default false
   */
  disabled?: boolean;
}

/**
 * Props for the EmailChip component.
 * Internal component used to render individual email chips.
 */
export interface EmailChipProps {
  /** The chip data to display */
  chip: EmailChip;
  /** Whether this chip is currently selected */
  isSelected: boolean;
  /** Callback when delete button is clicked */
  onDelete: (id: string) => void;
  /** Callback when the chip is clicked */
  onClick: (id: string) => void;
  /** CSS class names for styling */
  classNames?: Pick<EmailChipInputClassNames, 'chip' | 'chipInvalid' | 'chipSelected' | 'deleteButton'>;
  /** Whether the chip is disabled */
  disabled?: boolean;
}

/**
 * Props for the SuggestionsList component.
 * Internal component used to render the autocomplete dropdown.
 */
export interface SuggestionsListProps {
  /** Array of suggestions to display */
  suggestions: Suggestion[];
  /** Index of the currently highlighted suggestion */
  highlightedIndex: number;
  /** Callback when a suggestion is selected */
  onSelect: (suggestion: Suggestion) => void;
  /** Callback when a suggestion is highlighted (hover/keyboard) */
  onHighlight: (index: number) => void;
  /** CSS class names for styling */
  classNames?: Pick<EmailChipInputClassNames, 'suggestionsList' | 'suggestionItem' | 'suggestionItemHighlighted'>;
  /** Whether the suggestions list is visible */
  isVisible: boolean;
}

// Re-export generic types from chip-input for convenience
export type {
  Chip,
  Suggestion as ChipSuggestion,
  ChipInputClassNames,
  ChipInputProps,
  ChipProps,
  SuggestionsListProps as ChipSuggestionsListProps,
} from './chip-input/types';

