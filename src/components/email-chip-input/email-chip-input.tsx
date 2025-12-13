import { useState, useRef, useCallback, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import type { EmailChipInputProps, EmailChip as EmailChipType, Suggestion } from '../types';
import { EmailChip } from '../email-chip';
import { SuggestionsList } from '../suggestions-list';
import { useChipNavigation } from '../../hooks/use-chip-navigation';
import { useEmailValidation } from '../../hooks/use-email-validation';
import { useSuggestions } from '../../hooks/use-suggestions';
import { generateId, parseEmailInput, containsDelimiter, splitByDelimiters } from '../../utils/email-utils';

/**
 * A controlled email input component that displays email addresses as chips.
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
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);

  const { validate } = useEmailValidation({ validateEmail });

  // Create chip from email string
  const createChip = useCallback(
    async (input: string): Promise<EmailChipType | null> => {
      const { email, label } = parseEmailInput(input);
      if (!email) return null;

      // Check for duplicates
      const isDuplicate = value.some(
        (chip) => chip.email.toLowerCase() === email.toLowerCase()
      );
      if (isDuplicate) return null;

      const isValid = await validate(email);

      return {
        id: generateId(),
        email,
        label,
        isValid,
      };
    },
    [value, validate]
  );

  // Add chip(s) from input value
  const addChipsFromInput = useCallback(
    async (input: string) => {
      const emails = containsDelimiter(input) ? splitByDelimiters(input) : [input];
      const newChips: EmailChipType[] = [];

      for (const emailStr of emails) {
        const chip = await createChip(emailStr);
        if (chip) {
          newChips.push(chip);
        }
      }

      if (newChips.length > 0) {
        onChange([...value, ...newChips]);
      }

      setInputValue('');
    },
    [createChip, onChange, value]
  );

  // Delete chip by id
  const deleteChip = useCallback(
    (id: string) => {
      onChange(value.filter((chip) => chip.id !== id));
    },
    [onChange, value]
  );

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    async (suggestion: Suggestion) => {
      // Set flag to prevent blur interference
      isSelectingRef.current = true;
      const inputString = suggestion.label ? `${suggestion.label} <${suggestion.email}>` : suggestion.email;
      const chip = await createChip(inputString);
      if (chip) {
        onChange([...value, chip]);
      }
      setInputValue('');
      // Reset flag after a short delay to allow onChange to process
      setTimeout(() => {
        isSelectingRef.current = false;
        inputRef.current?.focus();
      }, 0);
    },
    [createChip, onChange, value]
  );

  // Suggestions hook
  const {
    suggestions,
    highlightedIndex,
    isVisible: suggestionsVisible,
    search: searchSuggestions,
    handleKeyDown: handleSuggestionsKeyDown,
    handleSelect: handleSuggestionsSelect,
    handleHighlight,
    close: closeSuggestions,
    clear: clearSuggestions,
  } = useSuggestions({
    onSearch,
    debounceMs: searchDebounceMs,
    onSelect: handleSuggestionSelect,
  });

  // Navigation hook
  const {
    selectedChipIndex,
    handleKeyDown: handleNavigationKeyDown,
    handleChipClick,
    clearSelection,
  } = useChipNavigation({
    chips: value,
    inputRef,
    onDeleteChip: deleteChip,
    onInputChange: () => {
      // Search for suggestions when input changes
      searchSuggestions(inputValue);
    },
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Check if the input contains a delimiter - if so, create chips immediately
    if (containsDelimiter(newValue)) {
      addChipsFromInput(newValue);
      return;
    }

    setInputValue(newValue);
    searchSuggestions(newValue);
  };

  // Handle key down events
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // First, let suggestions handle the key
    if (handleSuggestionsKeyDown(e)) {
      return;
    }

    // Then, let navigation handle the key
    handleNavigationKeyDown(e);

    // Handle chip creation keys
    switch (e.key) {
      case 'Enter':
      case 'Tab':
        if (inputValue.trim()) {
          e.preventDefault();
          addChipsFromInput(inputValue);
          closeSuggestions();
        }
        break;

      case ',':
      case ';':
        if (inputValue.trim()) {
          e.preventDefault();
          addChipsFromInput(inputValue);
          closeSuggestions();
        }
        break;

      case 'Escape':
        if (suggestionsVisible) {
          e.preventDefault();
          closeSuggestions();
        }
        break;
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    if (containsDelimiter(pastedText) || pastedText.includes('\n')) {
      e.preventDefault();
      const emails = pastedText
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      
      if (emails.length > 0) {
        addChipsFromInput(emails.join(','));
      }
    }
  };

  // Handle container click - focus input
  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      inputRef.current?.focus();
      clearSelection();
    }
  };

  // Handle blur - create chip from remaining input
  const handleBlur = (e: React.FocusEvent) => {
    // Don't process blur if we're in the middle of selecting a suggestion
    if (isSelectingRef.current) {
      return;
    }
    // Don't create chip if clicking within the container (e.g., suggestions)
    if (containerRef.current?.contains(e.relatedTarget)) {
      return;
    }

    if (inputValue.trim()) {
      addChipsFromInput(inputValue);
    }
    closeSuggestions();
  };

  // Clear suggestions when value changes externally
  useEffect(() => {
    if (value.length === 0) {
      clearSuggestions();
    }
  }, [value.length, clearSuggestions]);

  return (
    <div
      ref={containerRef}
      className={classNames?.container || undefined}
      onClick={handleContainerClick}
      role="group"
      aria-label={ariaLabel}
    >
      {value.map((chip, index) => (
        <EmailChip
          key={chip.id}
          chip={chip}
          isSelected={selectedChipIndex === index}
          onDelete={deleteChip}
          onClick={handleChipClick}
          classNames={classNames}
          disabled={disabled}
        />
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={handleBlur}
        onFocus={clearSelection}
        placeholder={value.length === 0 ? placeholder : undefined}
        disabled={disabled}
        className={classNames?.input || undefined}
        aria-label={ariaLabel}
        aria-autocomplete={onSearch ? 'list' : undefined}
        aria-controls={suggestionsVisible ? 'email-suggestions' : undefined}
        aria-expanded={suggestionsVisible}
        role="combobox"
      />
      <SuggestionsList
        suggestions={suggestions}
        highlightedIndex={highlightedIndex}
        onSelect={handleSuggestionsSelect}
        onHighlight={handleHighlight}
        classNames={classNames}
        isVisible={suggestionsVisible}
      />
    </div>
  );
};

