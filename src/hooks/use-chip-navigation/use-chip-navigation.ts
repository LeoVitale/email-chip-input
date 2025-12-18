import { useState, useCallback } from 'react';
import type { RefObject, KeyboardEvent } from 'react';
import type { Chip } from '../../components/chip-input/types';

/**
 * Configuration options for the useChipNavigation hook.
 *
 * @typeParam TValue - The type of the chip's value
 */
interface UseChipNavigationOptions<TValue = string> {
  /** Array of chips to navigate through */
  chips: Chip<TValue>[];
  /** Reference to the input element for focus management */
  inputRef: RefObject<HTMLInputElement | null>;
  /** Callback invoked when a chip should be deleted */
  onDeleteChip: (id: string) => void;
  /** Callback invoked when input content changes */
  onInputChange: () => void;
}

/**
 * Return value from the useChipNavigation hook.
 */
interface UseChipNavigationReturn {
  /** Index of the currently selected chip, or null if no chip is selected */
  selectedChipIndex: number | null;
  /** Function to manually set the selected chip index */
  setSelectedChipIndex: (index: number | null) => void;
  /** Keyboard event handler for chip navigation */
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  /** Click handler for individual chips */
  handleChipClick: (id: string) => void;
  /** Clear the current chip selection */
  clearSelection: () => void;
}

/**
 * Custom hook for managing keyboard navigation between chips.
 *
 * Handles the following keyboard interactions:
 * - **ArrowLeft/ArrowRight**: Navigate between chips
 * - **Backspace/Delete**: Delete the selected chip or last chip when input is empty
 * - **Escape**: Clear selection and focus the input
 * - **Character keys**: Clear selection and allow typing
 *
 * @typeParam TValue - The type of the chip's value
 * @param options - Configuration options
 * @returns Navigation state and event handlers
 *
 * @example
 * ```tsx
 * const {
 *   selectedChipIndex,
 *   handleKeyDown,
 *   handleChipClick,
 *   clearSelection
 * } = useChipNavigation({
 *   chips,
 *   inputRef,
 *   onDeleteChip: (id) => setChips(chips.filter(c => c.id !== id)),
 *   onInputChange: () => searchSuggestions(inputValue)
 * });
 *
 * return (
 *   <input
 *     ref={inputRef}
 *     onKeyDown={handleKeyDown}
 *     onFocus={clearSelection}
 *   />
 * );
 * ```
 */
export const useChipNavigation = <TValue = string>({
  chips,
  inputRef,
  onDeleteChip,
  onInputChange,
}: UseChipNavigationOptions<TValue>): UseChipNavigationReturn => {
  const [selectedChipIndex, setSelectedChipIndex] = useState<number | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedChipIndex(null);
  }, []);

  const handleChipClick = useCallback((id: string) => {
    const index = chips.findIndex((chip) => chip.id === id);
    if (index !== -1) {
      setSelectedChipIndex(index);
    }
  }, [chips]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const input = inputRef.current;
      const inputValue = input?.value || '';
      const cursorPosition = input?.selectionStart ?? 0;
      const isAtStart = cursorPosition === 0 && inputValue.length === 0;
      const hasChips = chips.length > 0;

      // Handle navigation when a chip is selected
      if (selectedChipIndex !== null) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            if (selectedChipIndex > 0) {
              setSelectedChipIndex(selectedChipIndex - 1);
            }
            break;

          case 'ArrowRight':
            e.preventDefault();
            if (selectedChipIndex < chips.length - 1) {
              setSelectedChipIndex(selectedChipIndex + 1);
            } else {
              // Move back to input
              clearSelection();
              input?.focus();
            }
            break;

          case 'Backspace':
          case 'Delete': {
            e.preventDefault();
            const chipToDelete = chips[selectedChipIndex];
            if (chipToDelete) {
              onDeleteChip(chipToDelete.id);
              // Adjust selection after deletion
              if (chips.length === 1) {
                clearSelection();
              } else if (selectedChipIndex >= chips.length - 1) {
                setSelectedChipIndex(chips.length - 2);
              }
            }
            break;
          }

          case 'Escape':
            e.preventDefault();
            clearSelection();
            input?.focus();
            break;

          default:
            // If typing a character, clear selection and let input handle it
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
              clearSelection();
              input?.focus();
            }
            break;
        }
        return;
      }

      // Handle navigation when input is focused (no chip selected)
      switch (e.key) {
        case 'ArrowLeft':
          if (isAtStart && hasChips) {
            e.preventDefault();
            setSelectedChipIndex(chips.length - 1);
          }
          break;

        case 'Backspace':
          if (isAtStart && hasChips) {
            e.preventDefault();
            // Delete the last chip
            const lastChip = chips[chips.length - 1];
            if (lastChip) {
              onDeleteChip(lastChip.id);
            }
          }
          break;

        default:
          // Notify parent about input changes for other keys
          onInputChange();
          break;
      }
    },
    [chips, selectedChipIndex, inputRef, onDeleteChip, onInputChange, clearSelection]
  );

  return {
    selectedChipIndex,
    setSelectedChipIndex,
    handleKeyDown,
    handleChipClick,
    clearSelection,
  };
};

