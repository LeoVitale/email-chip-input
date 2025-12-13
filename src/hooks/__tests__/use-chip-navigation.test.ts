import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChipNavigation } from '../use-chip-navigation';
import type { EmailChip } from '../../components/EmailChipInput/types';
import type { KeyboardEvent, RefObject } from 'react';

const createMockChips = (count: number): EmailChip[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `chip-${i}`,
    email: `user${i}@example.com`,
    isValid: true,
  }));

const createMockInputRef = (): RefObject<HTMLInputElement | null> => ({
  current: {
    value: '',
    selectionStart: 0,
    focus: vi.fn(),
  } as unknown as HTMLInputElement,
});

const createKeyboardEvent = (key: string, options: Partial<KeyboardEvent<HTMLInputElement>> = {}) =>
  ({
    key,
    preventDefault: vi.fn(),
    ...options,
  }) as unknown as KeyboardEvent<HTMLInputElement>;

describe('useChipNavigation', () => {
  let mockInputRef: RefObject<HTMLInputElement | null>;
  let mockOnDeleteChip: ReturnType<typeof vi.fn>;
  let mockOnInputChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockInputRef = createMockInputRef();
    mockOnDeleteChip = vi.fn();
    mockOnInputChange = vi.fn();
  });

  describe('initial state', () => {
    it('should have no chip selected initially', () => {
      const chips = createMockChips(3);
      const { result } = renderHook(() =>
        useChipNavigation({
          chips,
          inputRef: mockInputRef,
          onDeleteChip: mockOnDeleteChip,
          onInputChange: mockOnInputChange,
        })
      );

      expect(result.current.selectedChipIndex).toBeNull();
    });
  });

  describe('handleChipClick', () => {
    it('should select chip on click', () => {
      const chips = createMockChips(3);
      const { result } = renderHook(() =>
        useChipNavigation({
          chips,
          inputRef: mockInputRef,
          onDeleteChip: mockOnDeleteChip,
          onInputChange: mockOnInputChange,
        })
      );

      act(() => {
        result.current.handleChipClick('chip-1');
      });

      expect(result.current.selectedChipIndex).toBe(1);
    });

    it('should not select if chip id not found', () => {
      const chips = createMockChips(3);
      const { result } = renderHook(() =>
        useChipNavigation({
          chips,
          inputRef: mockInputRef,
          onDeleteChip: mockOnDeleteChip,
          onInputChange: mockOnInputChange,
        })
      );

      act(() => {
        result.current.handleChipClick('nonexistent');
      });

      expect(result.current.selectedChipIndex).toBeNull();
    });
  });

  describe('clearSelection', () => {
    it('should clear the selected chip', () => {
      const chips = createMockChips(3);
      const { result } = renderHook(() =>
        useChipNavigation({
          chips,
          inputRef: mockInputRef,
          onDeleteChip: mockOnDeleteChip,
          onInputChange: mockOnInputChange,
        })
      );

      act(() => {
        result.current.handleChipClick('chip-1');
      });
      expect(result.current.selectedChipIndex).toBe(1);

      act(() => {
        result.current.clearSelection();
      });
      expect(result.current.selectedChipIndex).toBeNull();
    });
  });

  describe('keyboard navigation with selected chip', () => {
    it('should navigate left with ArrowLeft', () => {
      const chips = createMockChips(3);
      const { result } = renderHook(() =>
        useChipNavigation({
          chips,
          inputRef: mockInputRef,
          onDeleteChip: mockOnDeleteChip,
          onInputChange: mockOnInputChange,
        })
      );

      act(() => {
        result.current.setSelectedChipIndex(2);
      });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowLeft'));
      });

      expect(result.current.selectedChipIndex).toBe(1);
    });

    it('should navigate right with ArrowRight', () => {
      const chips = createMockChips(3);
      const { result } = renderHook(() =>
        useChipNavigation({
          chips,
          inputRef: mockInputRef,
          onDeleteChip: mockOnDeleteChip,
          onInputChange: mockOnInputChange,
        })
      );

      act(() => {
        result.current.setSelectedChipIndex(0);
      });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowRight'));
      });

      expect(result.current.selectedChipIndex).toBe(1);
    });

    it('should clear selection and focus input when navigating right past last chip', () => {
      const chips = createMockChips(3);
      const { result } = renderHook(() =>
        useChipNavigation({
          chips,
          inputRef: mockInputRef,
          onDeleteChip: mockOnDeleteChip,
          onInputChange: mockOnInputChange,
        })
      );

      act(() => {
        result.current.setSelectedChipIndex(2);
      });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowRight'));
      });

      expect(result.current.selectedChipIndex).toBeNull();
      expect(mockInputRef.current?.focus).toHaveBeenCalled();
    });

    it('should delete chip on Backspace', () => {
      const chips = createMockChips(3);
      const { result } = renderHook(() =>
        useChipNavigation({
          chips,
          inputRef: mockInputRef,
          onDeleteChip: mockOnDeleteChip,
          onInputChange: mockOnInputChange,
        })
      );

      act(() => {
        result.current.setSelectedChipIndex(1);
      });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Backspace'));
      });

      expect(mockOnDeleteChip).toHaveBeenCalledWith('chip-1');
    });

    it('should clear selection on Escape', () => {
      const chips = createMockChips(3);
      const { result } = renderHook(() =>
        useChipNavigation({
          chips,
          inputRef: mockInputRef,
          onDeleteChip: mockOnDeleteChip,
          onInputChange: mockOnInputChange,
        })
      );

      act(() => {
        result.current.setSelectedChipIndex(1);
      });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Escape'));
      });

      expect(result.current.selectedChipIndex).toBeNull();
      expect(mockInputRef.current?.focus).toHaveBeenCalled();
    });
  });

  describe('keyboard navigation without selected chip', () => {
    it('should select last chip on ArrowLeft when input is empty', () => {
      const chips = createMockChips(3);
      const { result } = renderHook(() =>
        useChipNavigation({
          chips,
          inputRef: mockInputRef,
          onDeleteChip: mockOnDeleteChip,
          onInputChange: mockOnInputChange,
        })
      );

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowLeft'));
      });

      expect(result.current.selectedChipIndex).toBe(2);
    });

    it('should delete last chip on Backspace when input is empty', () => {
      const chips = createMockChips(3);
      const { result } = renderHook(() =>
        useChipNavigation({
          chips,
          inputRef: mockInputRef,
          onDeleteChip: mockOnDeleteChip,
          onInputChange: mockOnInputChange,
        })
      );

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Backspace'));
      });

      expect(mockOnDeleteChip).toHaveBeenCalledWith('chip-2');
    });
  });
});

