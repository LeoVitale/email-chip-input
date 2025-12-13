import { useState, useCallback } from 'react';
import type { RefObject, KeyboardEvent } from 'react';
import type { EmailChip } from '../components/EmailChipInput/types';

interface UseChipNavigationOptions {
  chips: EmailChip[];
  inputRef: RefObject<HTMLInputElement | null>;
  onDeleteChip: (id: string) => void;
  onInputChange: () => void;
}

interface UseChipNavigationReturn {
  selectedChipIndex: number | null;
  setSelectedChipIndex: (index: number | null) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleChipClick: (id: string) => void;
  clearSelection: () => void;
}

export const useChipNavigation = ({
  chips,
  inputRef,
  onDeleteChip,
  onInputChange,
}: UseChipNavigationOptions): UseChipNavigationReturn => {
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
          case 'Delete':
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

