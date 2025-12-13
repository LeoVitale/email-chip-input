import type { SuggestionsListProps } from './types';

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
            onClick={() => onSelect(suggestion)}
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

