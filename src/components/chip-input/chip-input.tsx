import React from 'react';
import type { ChipInputProps, Chip } from './types';
import { Chip as ChipComponent } from '../chip';
import { SuggestionsList } from '../suggestions-list';
import { useChipInputState } from './use-chip-input-state';
import { defaultFormatValue, DEFAULT_DELIMITERS } from '../../utils/chip-utils';

// ============================================================================
// Styles
// ============================================================================

const MEASURE_SPAN_STYLE: React.CSSProperties = {
  position: 'absolute',
  visibility: 'hidden',
  whiteSpace: 'pre',
  fontSize: '14px',
  fontFamily: 'inherit',
  padding: '0 4px',
};

// ============================================================================
// Component
// ============================================================================

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
export const ChipInput = <TValue extends string>({
  value,
  onChange,
  parseInput,
  validate,
  isEqual,
  normalize,
  formatValue = defaultFormatValue,
  delimiters = DEFAULT_DELIMITERS,
  onSearch,
  searchDebounceMs = 300,
  classNames,
  placeholder = 'Enter values...',
  ariaLabel = 'Chip input',
  disabled = false,
}: ChipInputProps<TValue>) => {
  // Destructure all values from the hook to avoid linter confusion
  const {
    inputRef,
    containerRef,
    measureRef,
    inputValue,
    inputWidth,
    insertPosition,
    suggestions,
    highlightedIndex,
    suggestionsVisible,
    handleInputChange,
    handleKeyDown,
    handlePaste,
    handleBlur,
    handleContainerClick,
    handleContainerKeyDown,
    handleChipClick,
    handleChipDelete,
    handleSuggestionSelect,
    handleSuggestionHighlight,
  } = useChipInputState({
    value,
    onChange,
    parseInput,
    validate,
    isEqual,
    normalize,
    delimiters,
    onSearch,
    searchDebounceMs,
    placeholder,
  });

  // Build elements array
  const elements = buildChipElements({
    chips: value,
    insertPosition,
    inputElement: renderInput({
      inputRef,
      inputValue,
      inputWidth,
      placeholder,
      hasChips: value.length > 0,
      disabled,
      ariaLabel,
      hasSearch: !!onSearch,
      suggestionsVisible,
      className: classNames?.input,
      onChange: handleInputChange,
      onKeyDown: handleKeyDown,
      onPaste: handlePaste,
      onBlur: handleBlur,
    }),
    onDelete: handleChipDelete,
    onClick: handleChipClick,
    formatValue,
    classNames,
    disabled,
  });

  return (
    <div
      ref={containerRef}
      className={classNames?.container}
      onClick={handleContainerClick}
      onKeyDown={handleContainerKeyDown}
    >
      {elements}

      <span ref={measureRef} aria-hidden="true" style={MEASURE_SPAN_STYLE} />

      <SuggestionsList<TValue>
        suggestions={suggestions}
        highlightedIndex={highlightedIndex}
        onSelect={handleSuggestionSelect}
        onHighlight={handleSuggestionHighlight}
        formatSuggestion={(s) => s.label ?? formatValue(s.value)}
        classNames={classNames}
        isVisible={suggestionsVisible}
        ariaLabel="Suggestions"
      />
    </div>
  );
};

// ============================================================================
// Render Helpers
// ============================================================================

interface RenderInputParams {
  inputRef: React.RefObject<HTMLInputElement | null>;
  inputValue: string;
  inputWidth: number;
  placeholder: string;
  hasChips: boolean;
  disabled: boolean;
  ariaLabel: string;
  hasSearch: boolean;
  suggestionsVisible: boolean;
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent) => void;
}

function renderInput({
  inputRef,
  inputValue,
  inputWidth,
  placeholder,
  hasChips,
  disabled,
  ariaLabel,
  hasSearch,
  suggestionsVisible,
  className,
  onChange,
  onKeyDown,
  onPaste,
  onBlur,
}: RenderInputParams): React.ReactElement {
  // Only show placeholder when there are no chips and no input value
  const showPlaceholder = !hasChips && !inputValue;

  return (
    <input
      key="chip-input"
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onBlur={onBlur}
      placeholder={showPlaceholder ? placeholder : undefined}
      disabled={disabled}
      className={className}
      style={{ width: `${inputWidth}px` }}
      aria-label={ariaLabel}
      aria-autocomplete={hasSearch ? 'list' : undefined}
      aria-controls={suggestionsVisible ? 'chip-suggestions' : undefined}
      aria-expanded={suggestionsVisible}
      role="combobox"
    />
  );
}

interface BuildChipElementsParams<TValue> {
  chips: Chip<TValue>[];
  insertPosition: number | null;
  inputElement: React.ReactElement;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
  formatValue: (value: TValue) => string;
  classNames?: ChipInputProps<TValue>['classNames'];
  disabled: boolean;
}

/**
 * Builds the array of elements (chips + input) with the input
 * positioned at the correct insertion point.
 */
function buildChipElements<TValue extends string>({
  chips,
  insertPosition,
  inputElement,
  onDelete,
  onClick,
  formatValue,
  classNames,
  disabled,
}: BuildChipElementsParams<TValue>): React.ReactNode[] {
  const elements: React.ReactNode[] = [];

  chips.forEach((chip, index) => {
    // Insert input before this chip if insertPosition matches
    if (insertPosition === index) {
      elements.push(inputElement);
    }

    elements.push(
      <ChipComponent<TValue>
        key={chip.id}
        chip={chip}
        isSelected={false}
        onDelete={onDelete}
        onClick={onClick}
        formatValue={formatValue}
        classNames={classNames}
        disabled={disabled}
      />
    );
  });

  // Input at the end if insertPosition is null or >= chips.length
  if (insertPosition === null || insertPosition >= chips.length) {
    elements.push(inputElement);
  }

  return elements;
}
