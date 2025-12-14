import { useState, useCallback, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import type { Suggestion } from '../../components/types';

/**
 * Function type for searching suggestions.
 * Should return a Promise that resolves to an array of Suggestion objects.
 */
type SearchFn = (query: string) => Promise<Suggestion[]>;

/**
 * Configuration options for the useSuggestions hook.
 */
interface UseSuggestionsOptions {
  /**
   * Async function to search for suggestions.
   * If not provided, suggestions will never be shown.
   */
  onSearch?: SearchFn;
  /**
   * Debounce delay in milliseconds before triggering search.
   * @default 300
   */
  debounceMs?: number;
  /** Callback invoked when a suggestion is selected */
  onSelect: (suggestion: Suggestion) => void;
  /**
   * Optional callback invoked when a search error occurs.
   * AbortError is automatically ignored and will not trigger this callback.
   * If not provided, errors are logged to console in development mode.
   */
  onError?: (error: Error) => void;
}

/**
 * Return value from the useSuggestions hook.
 */
interface UseSuggestionsReturn {
  /** Current list of suggestions */
  suggestions: Suggestion[];
  /** Whether a search is currently in progress */
  isLoading: boolean;
  /** Index of the currently highlighted suggestion (-1 if none) */
  highlightedIndex: number;
  /** Whether the suggestions dropdown should be visible */
  isVisible: boolean;
  /** Trigger a search with the given query (debounced) */
  search: (query: string) => void;
  /** Keyboard event handler for suggestion navigation. Returns true if event was handled. */
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => boolean;
  /** Handle selection of a suggestion */
  handleSelect: (suggestion: Suggestion) => void;
  /** Set the highlighted suggestion index */
  handleHighlight: (index: number) => void;
  /** Close the suggestions dropdown */
  close: () => void;
  /** Clear suggestions and reset state */
  clear: () => void;
}

/**
 * Custom hook for managing autocomplete suggestions with debounced search.
 *
 * Features:
 * - Debounced search to avoid excessive API calls
 * - Automatic request cancellation when query changes
 * - Keyboard navigation (ArrowUp/ArrowDown, Enter, Tab, Escape)
 * - Highlight management for mouse hover
 *
 * @param options - Configuration options
 * @returns Suggestion state and handlers
 *
 * @example
 * ```tsx
 * const {
 *   suggestions,
 *   isVisible,
 *   highlightedIndex,
 *   search,
 *   handleKeyDown,
 *   handleSelect,
 *   handleHighlight,
 *   close
 * } = useSuggestions({
 *   onSearch: async (query) => {
 *     const response = await fetch(`/api/contacts?q=${query}`);
 *     return response.json();
 *   },
 *   debounceMs: 300,
 *   onSelect: (suggestion) => addChip(suggestion)
 * });
 * ```
 */
export const useSuggestions = ({
  onSearch,
  debounceMs = 300,
  onSelect,
  onError,
}: UseSuggestionsOptions): UseSuggestionsReturn => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef<string>('');
  const onErrorRef = useRef(onError);

  // Keep onError ref updated
  onErrorRef.current = onError;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const search = useCallback(
    (query: string) => {
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const trimmedQuery = query.trim();
      lastQueryRef.current = trimmedQuery;

      // Close suggestions if query is empty or no search function
      if (!trimmedQuery || !onSearch) {
        setSuggestions([]);
        setIsVisible(false);
        setHighlightedIndex(-1);
        return;
      }

      // Debounce the search
      debounceTimerRef.current = setTimeout(async () => {
        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();

        setIsLoading(true);

        try {
          const results = await onSearch(trimmedQuery);
          
          // Only update if this is still the current query
          if (lastQueryRef.current === trimmedQuery) {
            setSuggestions(results);
            setIsVisible(results.length > 0);
            setHighlightedIndex(results.length > 0 ? 0 : -1);
          }
        } catch (error) {
          // Ignore abort errors
          if (error instanceof Error && error.name !== 'AbortError') {
            // Call custom error handler if provided, otherwise log to console
            if (onErrorRef.current) {
              onErrorRef.current(error);
            } else if (process.env.NODE_ENV === 'development') {
              console.error('Search error:', error);
            }
          }
          // Always clean up state on error
          setSuggestions([]);
          setIsVisible(false);
          setHighlightedIndex(-1);
        } finally {
          setIsLoading(false);
        }
      }, debounceMs);
    },
    [onSearch, debounceMs]
  );

  const handleSelect = useCallback(
    (suggestion: Suggestion) => {
      onSelect(suggestion);
      setSuggestions([]);
      setIsVisible(false);
      setHighlightedIndex(-1);
    },
    [onSelect]
  );

  const handleHighlight = useCallback((index: number) => {
    setHighlightedIndex(index);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    setHighlightedIndex(-1);
  }, []);

  const clear = useCallback(() => {
    setSuggestions([]);
    setIsVisible(false);
    setHighlightedIndex(-1);
    lastQueryRef.current = '';
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>): boolean => {
      if (!isVisible || suggestions.length === 0) {
        return false;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          return true;

        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          return true;

        case 'Enter':
          if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
            e.preventDefault();
            handleSelect(suggestions[highlightedIndex]);
            return true;
          }
          return false;

        case 'Escape':
          e.preventDefault();
          close();
          return true;

        case 'Tab':
          // Allow tab to select the highlighted suggestion
          if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
            e.preventDefault();
            handleSelect(suggestions[highlightedIndex]);
            return true;
          }
          close();
          return false;

        default:
          return false;
      }
    },
    [isVisible, suggestions, highlightedIndex, handleSelect, close]
  );

  return {
    suggestions,
    isLoading,
    highlightedIndex,
    isVisible,
    search,
    handleKeyDown,
    handleSelect,
    handleHighlight,
    close,
    clear,
  };
};

