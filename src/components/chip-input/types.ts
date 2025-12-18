/**
 * Represents a generic chip with optional validation status.
 * Used to display values as interactive chips in the input.
 *
 * @typeParam TValue - The type of the chip's value (default: string)
 */
export interface Chip<TValue = string> {
  /** Unique identifier for the chip */
  id: string;
  /** The main value of the chip */
  value: TValue;
  /** Optional display label (e.g., person's name for email) */
  label?: string;
  /** Whether the value passed validation (undefined if no validation) */
  isValid?: boolean;
}

/**
 * Represents a suggestion for autocomplete.
 * Returned by the search function and displayed in the suggestions dropdown.
 *
 * @typeParam TValue - The type of the suggestion's value (default: string)
 */
export interface Suggestion<TValue = string> {
  /** Unique identifier for the suggestion */
  id: string;
  /** The main value of the suggestion */
  value: TValue;
  /** Optional display label */
  label?: string;
}

/**
 * CSS class names for styling ChipInput components.
 * Allows complete customization of component appearance.
 */
export interface ChipInputClassNames {
  /** Class for the outer container element */
  container?: string;
  /** Class for the text input element */
  input?: string;
  /** Base class for chips */
  chip?: string;
  /** Class applied to chips with invalid values */
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
  /** Class for the insertion cursor indicator */
  insertCursor?: string;
}

/**
 * Props for the ChipInput component.
 *
 * @typeParam TValue - The type of the chip's value (default: string)
 *
 * @example
 * ```tsx
 * // Simple string chips (no validation)
 * <ChipInput<string>
 *   value={chips}
 *   onChange={setChips}
 *   placeholder="Add tags..."
 * />
 *
 * // With validation
 * <ChipInput<string>
 *   value={chips}
 *   onChange={setChips}
 *   validate={(value) => value.length >= 3}
 * />
 *
 * // With custom parsing
 * <ChipInput<string>
 *   value={chips}
 *   onChange={setChips}
 *   parseInput={(input) => ({ value: input.trim().toLowerCase() })}
 * />
 * ```
 */
export interface ChipInputProps<TValue = string> {
  /** Current array of chips (controlled component) */
  value: Chip<TValue>[];
  /** Callback when chips change (add, remove, reorder) */
  onChange: (chips: Chip<TValue>[]) => void;

  /**
   * Parse input string into a chip.
   * If not provided, assumes input is the value directly (for string types).
   *
   * @param input - The raw input string
   * @returns Partial chip data or null to reject
   */
  parseInput?: (input: string) => Pick<Chip<TValue>, 'value' | 'label'> | null;

  /**
   * Custom validation function.
   * Can be sync or async. If not provided, all values are considered valid.
   *
   * @param value - The value to validate
   * @returns Whether the value is valid
   */
  validate?: (value: TValue) => boolean | Promise<boolean>;

  /**
   * Compare two values for equality (used for duplicate detection).
   * Default: strict equality (===)
   *
   * @param a - First value
   * @param b - Second value
   * @returns Whether the values are equal
   */
  isEqual?: (a: TValue, b: TValue) => boolean;

  /**
   * Normalize a value before comparison (e.g., lowercase for case-insensitive).
   * Default: identity function (no normalization)
   *
   * @param value - The value to normalize
   * @returns The normalized value
   */
  normalize?: (value: TValue) => TValue;

  /**
   * Format a value for display in the chip.
   * Default: String(value)
   *
   * @param value - The value to format
   * @returns The display string
   */
  formatValue?: (value: TValue) => string;

  /**
   * Delimiters that trigger chip creation.
   * @default [',', ';']
   */
  delimiters?: string[];

  /**
   * Async function to search for suggestions.
   * If not provided, autocomplete is disabled.
   */
  onSearch?: (query: string) => Promise<Suggestion<TValue>[]>;

  /**
   * Debounce delay for search in milliseconds.
   * @default 300
   */
  searchDebounceMs?: number;

  /** Custom CSS class names for styling */
  classNames?: ChipInputClassNames;

  /**
   * Placeholder text shown when no chips are present.
   * @default 'Enter values...'
   */
  placeholder?: string;

  /**
   * Accessible label for the input.
   * @default 'Chip input'
   */
  ariaLabel?: string;

  /**
   * Whether the input is disabled.
   * @default false
   */
  disabled?: boolean;
}

/**
 * Props for the Chip component.
 * Internal component used to render individual chips.
 *
 * @typeParam TValue - The type of the chip's value (default: string)
 */
export interface ChipProps<TValue = string> {
  /** The chip data to display */
  chip: Chip<TValue>;
  /** Whether this chip is currently selected */
  isSelected: boolean;
  /** Callback when delete button is clicked */
  onDelete: (id: string) => void;
  /** Callback when the chip is clicked */
  onClick: (id: string) => void;
  /** Format function for displaying the value */
  formatValue?: (value: TValue) => string;
  /** CSS class names for styling */
  classNames?: Pick<ChipInputClassNames, 'chip' | 'chipInvalid' | 'chipSelected' | 'deleteButton'>;
  /** Whether the chip is disabled */
  disabled?: boolean;
}

/**
 * Props for the SuggestionsList component.
 * Internal component used to render the autocomplete dropdown.
 *
 * @typeParam TValue - The type of the suggestion's value (default: string)
 */
export interface SuggestionsListProps<TValue = string> {
  /** Array of suggestions to display */
  suggestions: Suggestion<TValue>[];
  /** Index of the currently highlighted suggestion */
  highlightedIndex: number;
  /** Callback when a suggestion is selected */
  onSelect: (suggestion: Suggestion<TValue>) => void;
  /** Callback when a suggestion is highlighted (hover/keyboard) */
  onHighlight: (index: number) => void;
  /** Format function for displaying suggestions */
  formatSuggestion?: (suggestion: Suggestion<TValue>) => string;
  /** CSS class names for styling */
  classNames?: Pick<ChipInputClassNames, 'suggestionsList' | 'suggestionItem' | 'suggestionItemHighlighted'>;
  /** Whether the suggestions list is visible */
  isVisible: boolean;
  /** Aria label for the suggestions list */
  ariaLabel?: string;
}

