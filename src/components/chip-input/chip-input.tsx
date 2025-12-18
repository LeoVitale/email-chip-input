import { useState, useRef, useCallback, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import type { ChipInputProps, Chip, Suggestion } from './types';
import { Chip as ChipComponent } from '../chip';
import { SuggestionsList } from '../suggestions-list';
import { useChipNavigation } from '../../hooks/use-chip-navigation';
import { useChipValidation } from '../../hooks/use-chip-validation';
import { useSuggestions } from '../../hooks/use-suggestions';
import {
  generateId,
  containsDelimiter,
  splitByDelimiters,
  defaultFormatValue,
  defaultIsEqual,
  defaultNormalize,
  DEFAULT_DELIMITERS,
} from '../../utils/chip-utils';

/**
 * A controlled chip input component that displays values as chips.
 *
 * Features:
 * - **Chip creation**: Enter, Tab, comma, semicolon, or blur
 * - **Multi-value paste**: Automatically splits pasted text by delimiters
 * - **Keyboard navigation**: Arrow keys to navigate between chips
 * - **Chip deletion**: Backspace/Delete to remove chips
 * - **Optional validation**: Sync or async validation with visual feedback
 * - **Autocomplete**: Optional search-based suggestions dropdown
 * - **Accessibility**: Full ARIA support and keyboard navigation
 *
 * @typeParam TValue - The type of the chip's value (default: string)
 * @param props - Component props
 * @returns The rendered chip input
 *
 * @example
 * ```tsx
 * // Simple string chips
 * const [chips, setChips] = useState<Chip<string>[]>([]);
 *
 * <ChipInput
 *   value={chips}
 *   onChange={setChips}
 *   placeholder="Add tags..."
 * />
 *
 * // With validation
 * <ChipInput
 *   value={chips}
 *   onChange={setChips}
 *   validate={(value) => value.length >= 3}
 * />
 * ```
 */
export const ChipInput = <TValue = string,>({
  value,
  onChange,
  parseInput,
  validate,
  isEqual = defaultIsEqual,
  normalize = defaultNormalize,
  formatValue = defaultFormatValue,
  delimiters = DEFAULT_DELIMITERS,
  onSearch,
  searchDebounceMs = 300,
  classNames,
  placeholder = 'Enter values...',
  ariaLabel = 'Chip input',
  disabled = false,
}: ChipInputProps<TValue>) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);

  const { validate: validateValue, hasValidator } = useChipValidation<TValue>({
    validate,
  });

  // Default parse function for string types
  const defaultParseInput = useCallback(
    (input: string): Pick<Chip<TValue>, 'value' | 'label'> | null => {
      const trimmed = input.trim();
      if (!trimmed) return null;
      // Cast to TValue - this works for string types
      return { value: trimmed as unknown as TValue };
    },
    []
  );

  const parseInputFn = parseInput ?? defaultParseInput;

  // Create chip from input string
  const createChip = useCallback(
    async (input: string): Promise<Chip<TValue> | null> => {
      const parsed = parseInputFn(input);
      if (!parsed || parsed.value === undefined || parsed.value === null) return null;

      // Check for duplicates using normalize and isEqual
      const normalizedValue = normalize(parsed.value);
      const isDuplicate = value.some((chip) =>
        isEqual(normalize(chip.value), normalizedValue)
      );
      if (isDuplicate) return null;

      // Validate if validator is provided
      const isValid = hasValidator ? await validateValue(parsed.value) : undefined;

      return {
        id: generateId(),
        value: parsed.value,
        label: parsed.label,
        isValid,
      };
    },
    [value, validateValue, hasValidator, parseInputFn, normalize, isEqual]
  );

  // Add chip(s) from input value
  const addChipsFromInput = useCallback(
    async (input: string) => {
      const values = containsDelimiter(input, delimiters)
        ? splitByDelimiters(input, delimiters)
        : [input];
      const newChips: Chip<TValue>[] = [];

      for (const val of values) {
        const chip = await createChip(val);
        if (chip) {
          newChips.push(chip);
        }
      }

      if (newChips.length > 0) {
        onChange([...value, ...newChips]);
      }

      setInputValue('');
    },
    [createChip, onChange, value, delimiters]
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
    async (suggestion: Suggestion<TValue>) => {
      // Set flag to prevent blur interference
      isSelectingRef.current = true;

      // Check for duplicates
      const normalizedValue = normalize(suggestion.value);
      const isDuplicate = value.some((chip) =>
        isEqual(normalize(chip.value), normalizedValue)
      );

      if (!isDuplicate) {
        // Validate if validator is provided
        const isValid = hasValidator
          ? await validateValue(suggestion.value)
          : undefined;

        const chip: Chip<TValue> = {
          id: generateId(),
          value: suggestion.value,
          label: suggestion.label,
          isValid,
        };

        onChange([...value, chip]);
      }

      setInputValue('');
      // Reset flag after a short delay to allow onChange to process
      setTimeout(() => {
        isSelectingRef.current = false;
        inputRef.current?.focus();
      }, 0);
    },
    [value, onChange, normalize, isEqual, hasValidator, validateValue]
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
  } = useSuggestions<TValue>({
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
  } = useChipNavigation<TValue>({
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
    if (containsDelimiter(newValue, delimiters)) {
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

      case 'Escape':
        if (suggestionsVisible) {
          e.preventDefault();
          closeSuggestions();
        }
        break;

      default:
        // Check if the key is a delimiter
        if (delimiters.includes(e.key) && inputValue.trim()) {
          e.preventDefault();
          addChipsFromInput(inputValue);
          closeSuggestions();
        }
        break;
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');

    if (containsDelimiter(pastedText, delimiters) || pastedText.includes('\n')) {
      e.preventDefault();
      // Split by delimiters and newlines - use splitByDelimiters which handles escaping
      const allDelimiters = [...delimiters, '\n'];
      const values = splitByDelimiters(pastedText, allDelimiters);

      if (values.length > 0) {
        addChipsFromInput(values.join(delimiters[0]));
      }
    }
  };

  // Handle container click - focus input
  const handleContainerClick = (e: React.MouseEvent) => {
    // Only focus if clicking directly on the container, not on chips or input
    if (e.target === containerRef.current) {
      inputRef.current?.focus();
      clearSelection();
    }
  };

  // Handle container keyboard events for accessibility
  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    // Focus input on Enter or Space when container is focused
    if ((e.key === 'Enter' || e.key === ' ') && e.target === containerRef.current) {
      e.preventDefault();
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
      onKeyDown={handleContainerKeyDown}
      aria-label={ariaLabel}
    >
      {value.map((chip, index) => (
        <ChipComponent<TValue>
          key={chip.id}
          chip={chip}
          isSelected={selectedChipIndex === index}
          onDelete={deleteChip}
          onClick={handleChipClick}
          formatValue={formatValue}
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
        aria-controls={suggestionsVisible ? 'chip-suggestions' : undefined}
        aria-expanded={suggestionsVisible}
        role="combobox"
      />
      <SuggestionsList<TValue>
        suggestions={suggestions}
        highlightedIndex={highlightedIndex}
        onSelect={handleSuggestionsSelect}
        onHighlight={handleHighlight}
        formatSuggestion={(s) => s.label ?? formatValue(s.value)}
        classNames={classNames}
        isVisible={suggestionsVisible}
        ariaLabel="Suggestions"
      />
    </div>
  );
};

