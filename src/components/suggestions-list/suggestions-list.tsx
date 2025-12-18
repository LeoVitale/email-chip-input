import type { SuggestionsListProps, Suggestion } from '../chip-input/types';
import { defaultFormatValue } from '../../utils/chip-utils';

/**
 * Default suggestion formatter.
 * Uses label if available, otherwise formats the value.
 */
const defaultFormatSuggestion = <TValue,>(suggestion: Suggestion<TValue>): string => {
  return suggestion.label ?? defaultFormatValue(suggestion.value);
};

/**
 * Suggestions dropdown component for autocomplete.
 *
 * Displays a list of suggestions with:
 * - Keyboard navigation highlighting
 * - Mouse hover highlighting
 * - Click to select
 * - ARIA listbox semantics for accessibility
 *
 * Returns null when not visible or when there are no suggestions.
 *
 * @typeParam TValue - The type of the suggestion's value
 * @param props - Component props
 * @returns The rendered suggestions list or null
 */
export const SuggestionsList = <TValue = string,>({
  suggestions,
  highlightedIndex,
  onSelect,
  onHighlight,
  formatSuggestion = defaultFormatSuggestion,
  classNames,
  isVisible,
  ariaLabel = 'Suggestions',
}: SuggestionsListProps<TValue>) => {
  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <ul
      id="chip-suggestions"
      role="listbox"
      aria-label={ariaLabel}
      className={classNames?.suggestionsList || undefined}
    >
      {suggestions.map((suggestion, index) => {
        const isHighlighted = index === highlightedIndex;
        const itemClassName = [
          classNames?.suggestionItem,
          isHighlighted && classNames?.suggestionItemHighlighted,
        ]
          .filter(Boolean)
          .join(' ');

        const displayText = formatSuggestion(suggestion);

        return (
          <li
            key={suggestion.id}
            role="option"
            aria-selected={isHighlighted}
            data-highlighted={isHighlighted}
            className={itemClassName || undefined}
            onMouseDown={(e) => {
              // Prevent blur from firing before selection
              e.preventDefault();
              // Call onSelect on mousedown to avoid blur event interference
              onSelect(suggestion);
            }}
            onClick={(e) => {
              // Prevent default to avoid double-firing, but selection already happened in mousedown
              e.preventDefault();
            }}
            onMouseEnter={() => onHighlight(index)}
          >
            <span>{displayText}</span>
          </li>
        );
      })}
    </ul>
  );
};

