import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSuggestions } from './use-suggestions';
import type { Suggestion } from '../../components/types';
import type { KeyboardEvent } from 'react';

const mockSuggestions: Suggestion[] = [
  { id: '1', email: 'alice@example.com', label: 'Alice' },
  { id: '2', email: 'bob@example.com', label: 'Bob' },
  { id: '3', email: 'charlie@example.com', label: 'Charlie' },
];

const createKeyboardEvent = (key: string) =>
  ({
    key,
    preventDefault: vi.fn(),
  }) as unknown as KeyboardEvent<HTMLInputElement>;

describe('useSuggestions', () => {
  let mockOnSearch: ReturnType<typeof vi.fn>;
  let mockOnSelect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnSearch = vi.fn().mockResolvedValue(mockSuggestions);
    mockOnSelect = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should have empty suggestions initially', () => {
      const { result } = renderHook(() =>
        useSuggestions({
          onSearch: mockOnSearch,
          onSelect: mockOnSelect,
        })
      );

      expect(result.current.suggestions).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isVisible).toBe(false);
      expect(result.current.highlightedIndex).toBe(-1);
    });
  });

  describe('search', () => {
    it('should debounce search calls', async () => {
      const { result } = renderHook(() =>
        useSuggestions({
          onSearch: mockOnSearch,
          onSelect: mockOnSelect,
          debounceMs: 300,
        })
      );

      act(() => {
        result.current.search('a');
        result.current.search('al');
        result.current.search('ali');
      });

      expect(mockOnSearch).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(300);
        await Promise.resolve(); // Flush microtasks
      });

      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('ali');
    });

    it('should update suggestions after search', async () => {
      const { result } = renderHook(() =>
        useSuggestions({
          onSearch: mockOnSearch,
          onSelect: mockOnSelect,
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.search('test');
      });

      // Advance timers and flush promises
      await act(async () => {
        vi.advanceTimersByTime(100);
        await Promise.resolve();
        await Promise.resolve(); // Extra flush for setState
      });

      expect(result.current.suggestions).toEqual(mockSuggestions);
      expect(result.current.isVisible).toBe(true);
      expect(result.current.highlightedIndex).toBe(0);
    });

    it('should hide suggestions for empty query', async () => {
      const { result } = renderHook(() =>
        useSuggestions({
          onSearch: mockOnSearch,
          onSelect: mockOnSelect,
        })
      );

      // First, get some suggestions
      act(() => {
        result.current.search('test');
      });

      await act(async () => {
        vi.advanceTimersByTime(300);
        await Promise.resolve();
        await Promise.resolve();
      });

      // Then clear
      act(() => {
        result.current.search('');
      });

      expect(result.current.suggestions).toEqual([]);
      expect(result.current.isVisible).toBe(false);
    });

    it('should not search if no onSearch provided', async () => {
      const { result } = renderHook(() =>
        useSuggestions({
          onSelect: mockOnSelect,
        })
      );

      act(() => {
        result.current.search('test');
      });

      await act(async () => {
        vi.advanceTimersByTime(300);
        await Promise.resolve();
      });

      expect(result.current.suggestions).toEqual([]);
      expect(result.current.isVisible).toBe(false);
    });
  });

  describe('keyboard navigation', () => {
    async function setupWithSuggestions() {
      const { result } = renderHook(() =>
        useSuggestions({
          onSearch: mockOnSearch,
          onSelect: mockOnSelect,
          debounceMs: 0,
        })
      );

      act(() => {
        result.current.search('test');
      });

      await act(async () => {
        vi.advanceTimersByTime(0);
        await Promise.resolve();
        await Promise.resolve();
      });

      return result;
    }

    it('should navigate down with ArrowDown', async () => {
      const result = await setupWithSuggestions();

      expect(result.current.isVisible).toBe(true);
      expect(result.current.highlightedIndex).toBe(0);

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowDown'));
      });

      expect(result.current.highlightedIndex).toBe(1);
    });

    it('should navigate up with ArrowUp', async () => {
      const result = await setupWithSuggestions();

      // Move to index 1
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowDown'));
      });

      // Move back to index 0
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowUp'));
      });

      expect(result.current.highlightedIndex).toBe(0);
    });

    it('should wrap around when navigating past end', async () => {
      const result = await setupWithSuggestions();

      // Move to last item
      act(() => {
        result.current.handleHighlight(2);
      });

      // Arrow down should wrap to first
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowDown'));
      });

      expect(result.current.highlightedIndex).toBe(0);
    });

    it('should select on Enter', async () => {
      const result = await setupWithSuggestions();

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Enter'));
      });

      expect(mockOnSelect).toHaveBeenCalledWith(mockSuggestions[0]);
    });

    it('should close on Escape', async () => {
      const result = await setupWithSuggestions();

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Escape'));
      });

      expect(result.current.isVisible).toBe(false);
    });
  });

  describe('handleSelect', () => {
    it('should call onSelect and reset state', async () => {
      const { result } = renderHook(() =>
        useSuggestions({
          onSearch: mockOnSearch,
          onSelect: mockOnSelect,
          debounceMs: 0,
        })
      );

      act(() => {
        result.current.search('test');
      });

      await act(async () => {
        vi.advanceTimersByTime(0);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(result.current.suggestions.length).toBeGreaterThan(0);

      act(() => {
        result.current.handleSelect(mockSuggestions[0]);
      });

      expect(mockOnSelect).toHaveBeenCalledWith(mockSuggestions[0]);
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.isVisible).toBe(false);
      expect(result.current.highlightedIndex).toBe(-1);
    });
  });

  describe('close and clear', () => {
    it('should close suggestions without clearing them', async () => {
      const { result } = renderHook(() =>
        useSuggestions({
          onSearch: mockOnSearch,
          onSelect: mockOnSelect,
          debounceMs: 0,
        })
      );

      act(() => {
        result.current.search('test');
      });

      await act(async () => {
        vi.advanceTimersByTime(0);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(result.current.isVisible).toBe(true);

      act(() => {
        result.current.close();
      });

      expect(result.current.isVisible).toBe(false);
      expect(result.current.suggestions).toEqual(mockSuggestions);
    });

    it('should clear all state', async () => {
      const { result } = renderHook(() =>
        useSuggestions({
          onSearch: mockOnSearch,
          onSelect: mockOnSelect,
          debounceMs: 0,
        })
      );

      act(() => {
        result.current.search('test');
      });

      await act(async () => {
        vi.advanceTimersByTime(0);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(result.current.suggestions.length).toBeGreaterThan(0);

      act(() => {
        result.current.clear();
      });

      expect(result.current.suggestions).toEqual([]);
      expect(result.current.isVisible).toBe(false);
      expect(result.current.highlightedIndex).toBe(-1);
    });
  });

  describe('error handling', () => {
    it('should call onError callback when search fails', async () => {
      const searchError = new Error('Search failed');
      const failingSearch = vi.fn().mockRejectedValue(searchError);
      const handleError = vi.fn();

      const { result } = renderHook(() =>
        useSuggestions({
          onSearch: failingSearch,
          onSelect: mockOnSelect,
          debounceMs: 0,
          onError: handleError,
        })
      );

      act(() => {
        result.current.search('test');
      });

      await act(async () => {
        vi.advanceTimersByTime(0);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(handleError).toHaveBeenCalledWith(searchError);
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.isVisible).toBe(false);
      expect(result.current.highlightedIndex).toBe(-1);
    });

    it('should not call onError for AbortError', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      const abortingSearch = vi.fn().mockRejectedValue(abortError);
      const handleError = vi.fn();

      const { result } = renderHook(() =>
        useSuggestions({
          onSearch: abortingSearch,
          onSelect: mockOnSelect,
          debounceMs: 0,
          onError: handleError,
        })
      );

      act(() => {
        result.current.search('test');
      });

      await act(async () => {
        vi.advanceTimersByTime(0);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(handleError).not.toHaveBeenCalled();
    });

    it('should clean up state on error', async () => {
      const searchError = new Error('Search failed');
      const failingSearch = vi.fn().mockRejectedValue(searchError);

      const { result } = renderHook(() =>
        useSuggestions({
          onSearch: failingSearch,
          onSelect: mockOnSelect,
          debounceMs: 0,
        })
      );

      act(() => {
        result.current.search('test');
      });

      await act(async () => {
        vi.advanceTimersByTime(0);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(result.current.suggestions).toEqual([]);
      expect(result.current.isVisible).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.highlightedIndex).toBe(-1);
    });
  });
});

