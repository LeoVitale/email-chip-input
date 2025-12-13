import { useState, useCallback, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import type { Suggestion } from '../components/EmailChipInput/types';

type SearchFn = (query: string) => Promise<Suggestion[]>;

interface UseSuggestionsOptions {
  onSearch?: SearchFn;
  debounceMs?: number;
  onSelect: (suggestion: Suggestion) => void;
}

interface UseSuggestionsReturn {
  suggestions: Suggestion[];
  isLoading: boolean;
  highlightedIndex: number;
  isVisible: boolean;
  search: (query: string) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => boolean;
  handleSelect: (suggestion: Suggestion) => void;
  handleHighlight: (index: number) => void;
  close: () => void;
  clear: () => void;
}

export const useSuggestions = ({
  onSearch,
  debounceMs = 300,
  onSelect,
}: UseSuggestionsOptions): UseSuggestionsReturn => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef<string>('');

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
            console.error('Search error:', error);
          }
          setSuggestions([]);
          setIsVisible(false);
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

