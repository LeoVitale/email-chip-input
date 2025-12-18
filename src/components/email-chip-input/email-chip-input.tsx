import { useCallback, useMemo } from 'react';
import type { EmailChipInputProps, EmailChip, Suggestion as EmailSuggestion } from '../types';
import { ChipInput } from '../chip-input';
import type { Chip, Suggestion } from '../chip-input/types';
import { parseEmailInput, defaultEmailValidator } from '../../utils/email-utils';

/**
 * Convert EmailChip to generic Chip<string>
 */
const emailChipToChip = (emailChip: EmailChip): Chip<string> => ({
  id: emailChip.id,
  value: emailChip.email,
  label: emailChip.label,
  isValid: emailChip.isValid,
});

/**
 * Convert generic Chip<string> to EmailChip
 */
const chipToEmailChip = (chip: Chip<string>): EmailChip => ({
  id: chip.id,
  email: chip.value,
  label: chip.label,
  isValid: chip.isValid ?? true,
});

/**
 * Convert EmailSuggestion to generic Suggestion<string>
 */
const emailSuggestionToSuggestion = (suggestion: EmailSuggestion): Suggestion<string> => ({
  id: suggestion.id,
  value: suggestion.email,
  label: suggestion.label,
});

/**
 * A controlled email input component that displays email addresses as chips.
 *
 * This is a specialized wrapper around the generic ChipInput component,
 * configured specifically for email address handling.
 *
 * Features:
 * - **Chip creation**: Enter, Tab, comma, semicolon, or blur
 * - **Multi-email paste**: Automatically splits pasted text by delimiters
 * - **Keyboard navigation**: Arrow keys to navigate between chips
 * - **Chip deletion**: Backspace/Delete to remove chips
 * - **Email validation**: Sync or async validation with visual feedback
 * - **Autocomplete**: Optional search-based suggestions dropdown
 * - **Accessibility**: Full ARIA support and keyboard navigation
 *
 * @param props - Component props
 * @returns The rendered email chip input
 *
 * @example
 * ```tsx
 * const [chips, setChips] = useState<EmailChip[]>([]);
 *
 * <EmailChipInput
 *   value={chips}
 *   onChange={setChips}
 *   onSearch={async (query) => {
 *     const response = await fetch(`/api/contacts?q=${query}`);
 *     return response.json();
 *   }}
 *   validateEmail={(email) => email.endsWith('@company.com')}
 *   placeholder="Add team members..."
 *   classNames={{
 *     container: 'email-input',
 *     chip: 'chip',
 *     chipInvalid: 'chip--invalid'
 *   }}
 * />
 * ```
 */
export const EmailChipInput = ({
  value,
  onChange,
  validateEmail,
  onSearch,
  searchDebounceMs = 300,
  classNames,
  placeholder = 'Enter email addresses...',
  ariaLabel = 'Email input',
  disabled = false,
}: EmailChipInputProps) => {
  // Convert EmailChip[] to Chip<string>[]
  const chips = useMemo(() => value.map(emailChipToChip), [value]);

  // Handle change by converting back to EmailChip[]
  const handleChange = useCallback(
    (newChips: Chip<string>[]) => {
      onChange(newChips.map(chipToEmailChip));
    },
    [onChange]
  );

  // Parse email input with "Name <email>" format support
  const parseInput = useCallback(
    (input: string): Pick<Chip<string>, 'value' | 'label'> | null => {
      const { email, label } = parseEmailInput(input);
      if (!email) return null;
      return { value: email, label };
    },
    []
  );

  // Email validation (use default if not provided)
  const validate = useCallback(
    (email: string): boolean | Promise<boolean> => {
      if (validateEmail) {
        return validateEmail(email);
      }
      return defaultEmailValidator(email);
    },
    [validateEmail]
  );

  // Case-insensitive comparison for emails
  const isEqual = useCallback((a: string, b: string): boolean => {
    return a.toLowerCase() === b.toLowerCase();
  }, []);

  // Normalize emails to lowercase for comparison
  const normalize = useCallback((email: string): string => {
    return email.toLowerCase();
  }, []);

  // Wrap onSearch to convert EmailSuggestion to Suggestion<string>
  const handleSearch = useMemo(() => {
    if (!onSearch) return undefined;
    return async (query: string): Promise<Suggestion<string>[]> => {
      const emailSuggestions = await onSearch(query);
      return emailSuggestions.map(emailSuggestionToSuggestion);
    };
  }, [onSearch]);

  // Format suggestion for display (email with optional label)
  const formatSuggestion = useCallback(
    (suggestion: Suggestion<string>): string => {
      if (suggestion.label) {
        return `${suggestion.label} <${suggestion.value}>`;
      }
      return suggestion.value;
    },
    []
  );

  return (
    <ChipInput<string>
      value={chips}
      onChange={handleChange}
      parseInput={parseInput}
      validate={validate}
      isEqual={isEqual}
      normalize={normalize}
      formatValue={(email) => email}
      onSearch={handleSearch}
      searchDebounceMs={searchDebounceMs}
      classNames={classNames}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      disabled={disabled}
    />
  );
};
