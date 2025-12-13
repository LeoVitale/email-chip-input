import type { SuggestionsListProps } from '../types';

/**
 * Suggestions dropdown component for email autocomplete.
 *
 * Displays a list of email suggestions with:
 * - Keyboard navigation highlighting
 * - Mouse hover highlighting
 * - Click to select
 * - ARIA listbox semantics for accessibility
 *
 * Returns null when not visible or when there are no suggestions.
 *
 * @param props - Component props
 * @returns The rendered suggestions list or null
 */
export const SuggestionsList = ({
  suggestions,
  highlightedIndex,
  onSelect,
  onHighlight,
  classNames,
  isVisible,
}: SuggestionsListProps) => {
  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <ul
      id="email-suggestions"
      role="listbox"
      aria-label="Email suggestions"
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
            {suggestion.label ? (
              <>
                <span>{suggestion.label}</span>
                <span> &lt;{suggestion.email}&gt;</span>
              </>
            ) : (
              <span>{suggestion.email}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
};

