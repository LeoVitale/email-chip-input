export interface EmailChip {
  id: string;
  email: string;
  label?: string;
  isValid: boolean;
}

export interface Suggestion {
  id: string;
  email: string;
  label?: string;
}

export interface EmailChipInputClassNames {
  container?: string;
  input?: string;
  chip?: string;
  chipInvalid?: string;
  chipSelected?: string;
  deleteButton?: string;
  suggestionsList?: string;
  suggestionItem?: string;
  suggestionItemHighlighted?: string;
}

export interface EmailChipInputProps {
  // Data
  value: EmailChip[];
  onChange: (chips: EmailChip[]) => void;

  // Validation
  validateEmail?: (email: string) => boolean | Promise<boolean>;

  // Autocomplete
  onSearch?: (query: string) => Promise<Suggestion[]>;
  searchDebounceMs?: number;

  // Style customization (agnostic)
  classNames?: EmailChipInputClassNames;

  // Accessibility
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export interface EmailChipProps {
  chip: EmailChip;
  isSelected: boolean;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
  classNames?: Pick<EmailChipInputClassNames, 'chip' | 'chipInvalid' | 'chipSelected' | 'deleteButton'>;
  disabled?: boolean;
}

export interface SuggestionsListProps {
  suggestions: Suggestion[];
  highlightedIndex: number;
  onSelect: (suggestion: Suggestion) => void;
  onHighlight: (index: number) => void;
  classNames?: Pick<EmailChipInputClassNames, 'suggestionsList' | 'suggestionItem' | 'suggestionItemHighlighted'>;
  isVisible: boolean;
}

