import { useState, useRef, useCallback, useEffect } from 'react';
import type { KeyboardEvent, ChangeEvent, ClipboardEvent, FocusEvent } from 'react';
import type { ChipInputProps, Chip, Suggestion } from './types';
import { useChipValidation } from '../../hooks/use-chip-validation';
import { useSuggestions } from '../../hooks/use-suggestions';
import {
  generateId,
  containsDelimiter,
  splitByDelimiters,
  defaultIsEqual,
  defaultNormalize,
  DEFAULT_DELIMITERS,
} from '../../utils/chip-utils';

// ============================================================================
// Types
// ============================================================================

type UseChipInputStateOptions<TValue extends string> = Pick<
  ChipInputProps<TValue>,
  | 'value'
  | 'onChange'
  | 'parseInput'
  | 'validate'
  | 'isEqual'
  | 'normalize'
  | 'delimiters'
  | 'onSearch'
  | 'searchDebounceMs'
  | 'placeholder'
>;

interface UseChipInputStateReturn<TValue extends string> {
  // Refs
  inputRef: React.RefObject<HTMLInputElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  measureRef: React.RefObject<HTMLSpanElement | null>;

  // State
  inputValue: string;
  inputWidth: number;
  insertPosition: number | null;

  // Suggestions state
  suggestions: Suggestion<TValue>[];
  highlightedIndex: number;
  suggestionsVisible: boolean;

  // Handlers
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  handlePaste: (e: ClipboardEvent<HTMLInputElement>) => void;
  handleBlur: (e: FocusEvent) => void;
  handleContainerClick: (e: React.MouseEvent) => void;
  handleContainerKeyDown: (e: React.KeyboardEvent) => void;
  handleChipClick: (id: string) => void;
  handleChipDelete: (id: string) => void;
  handleSuggestionSelect: (suggestion: Suggestion<TValue>) => void;
  handleSuggestionHighlight: (index: number) => void;
}

// ============================================================================
// Helpers
// ============================================================================

/** Compute the new insert position when pressing ArrowLeft */
function computeLeftPosition(
  currentPosition: number | null,
  chipsLength: number
): number {
  if (currentPosition === null) {
    return chipsLength - 1;
  }
  return currentPosition > 0 ? currentPosition - 1 : currentPosition;
}

/** Compute the new insert position when pressing ArrowRight */
function computeRightPosition(
  currentPosition: number,
  chipsLength: number
): number | null {
  return currentPosition < chipsLength - 1 ? currentPosition + 1 : null;
}

/** Context for key handlers */
interface KeyHandlerContext<TValue extends string> {
  isAtStart: boolean;
  isAtEnd: boolean;
  hasChips: boolean;
  inputValue: string;
  insertPosition: number | null;
  value: Chip<TValue>[];
  suggestionsVisible: boolean;
  delimiters: string[];
  setInsertPosition: (pos: number | null) => void;
  handleChipDelete: (id: string) => void;
  addChipsFromInput: (input: string) => Promise<void>;
  closeSuggestions: () => void;
  focusInput: () => void;
}

/** Handle ArrowLeft key */
function handleArrowLeftKey<TValue extends string>(
  e: KeyboardEvent<HTMLInputElement>,
  ctx: KeyHandlerContext<TValue>
): void {
  if (!ctx.isAtStart || !ctx.hasChips) return;

  e.preventDefault();
  ctx.setInsertPosition(computeLeftPosition(ctx.insertPosition, ctx.value.length));
  ctx.focusInput();
}

/** Handle ArrowRight key */
function handleArrowRightKey<TValue extends string>(
  e: KeyboardEvent<HTMLInputElement>,
  ctx: KeyHandlerContext<TValue>
): void {
  if (!ctx.isAtEnd || ctx.insertPosition === null) return;

  e.preventDefault();
  ctx.setInsertPosition(computeRightPosition(ctx.insertPosition, ctx.value.length));
  ctx.focusInput();
}

/** Handle Backspace key */
function handleBackspaceKey<TValue extends string>(
  e: KeyboardEvent<HTMLInputElement>,
  ctx: KeyHandlerContext<TValue>
): void {
  if (!ctx.isAtStart || ctx.inputValue || !ctx.hasChips) return;

  e.preventDefault();
  const deleteIndex =
    ctx.insertPosition === null ? ctx.value.length - 1 : ctx.insertPosition - 1;

  if (deleteIndex >= 0) {
    const chipToDelete = ctx.value[deleteIndex];
    if (chipToDelete) {
      ctx.handleChipDelete(chipToDelete.id);
      if (ctx.insertPosition !== null && ctx.insertPosition > 0) {
        ctx.setInsertPosition(ctx.insertPosition - 1);
      }
    }
  }
}

/** Handle Enter or Tab key */
function handleSubmitKey<TValue extends string>(
  e: KeyboardEvent<HTMLInputElement>,
  ctx: KeyHandlerContext<TValue>
): void {
  if (!ctx.inputValue.trim()) return;

  e.preventDefault();
  void ctx.addChipsFromInput(ctx.inputValue);
  ctx.closeSuggestions();
}

/** Handle Escape key */
function handleEscapeKey<TValue extends string>(
  e: KeyboardEvent<HTMLInputElement>,
  ctx: KeyHandlerContext<TValue>
): void {
  if (ctx.suggestionsVisible) {
    e.preventDefault();
    ctx.closeSuggestions();
    return;
  }

  if (ctx.insertPosition !== null) {
    e.preventDefault();
    ctx.setInsertPosition(null);
  }
}

/** Handle delimiter key */
function handleDelimiterKey<TValue extends string>(
  e: KeyboardEvent<HTMLInputElement>,
  ctx: KeyHandlerContext<TValue>
): void {
  if (!ctx.delimiters.includes(e.key) || !ctx.inputValue.trim()) return;

  e.preventDefault();
  void ctx.addChipsFromInput(ctx.inputValue);
  ctx.closeSuggestions();
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Encapsulates all state and logic for the ChipInput component.
 * Keeps the component as a thin render layer.
 */
export const useChipInputState = <TValue extends string>({
  value,
  onChange,
  parseInput,
  validate,
  isEqual = defaultIsEqual,
  normalize = defaultNormalize,
  delimiters = DEFAULT_DELIMITERS,
  onSearch,
  searchDebounceMs = 300,
  placeholder = 'Enter values...',
}: UseChipInputStateOptions<TValue>): UseChipInputStateReturn<TValue> => {
  // -------------------------------------------------------------------------
  // Refs
  // -------------------------------------------------------------------------
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const isSelectingRef = useRef(false);

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [inputValue, setInputValue] = useState('');
  const [insertPosition, setInsertPosition] = useState<number | null>(null);
  const [inputWidth, setInputWidth] = useState(2);

  // -------------------------------------------------------------------------
  // Hooks
  // -------------------------------------------------------------------------
  const { validate: validateValue, hasValidator } = useChipValidation<TValue>({
    validate,
  });

  // -------------------------------------------------------------------------
  // Input Auto-Resize
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (measureRef.current) {
      const showPlaceholder = value.length === 0 && !inputValue;
      const textToMeasure = inputValue || (showPlaceholder ? placeholder : '') || '';
      measureRef.current.textContent = textToMeasure;
      const measuredWidth = measureRef.current.offsetWidth;
      const minWidth = inputValue ? 8 : 2;
      setInputWidth(Math.max(minWidth, measuredWidth + 4));
    }
  }, [inputValue, placeholder, value.length]);

  // -------------------------------------------------------------------------
  // Chip Creation
  // -------------------------------------------------------------------------
  const defaultParseInput = useCallback(
    (input: string): Pick<Chip<TValue>, 'value' | 'label'> | null => {
      const trimmed = input.trim();
      if (!trimmed) return null;
      return { value: trimmed as unknown as TValue };
    },
    []
  );

  const parseInputFn = parseInput ?? defaultParseInput;

  const createChip = useCallback(
    async (input: string): Promise<Chip<TValue> | null> => {
      const parsed = parseInputFn(input);
      if (parsed?.value == null) return null;

      const normalizedValue = normalize(parsed.value);
      const isDuplicate = value.some((chip) =>
        isEqual(normalize(chip.value), normalizedValue)
      );
      if (isDuplicate) return null;

      const isValid = hasValidator ? await validateValue(parsed.value) : undefined;

      return {
        id: generateId(),
        value: parsed.value,
        label: parsed.label,
        isValid,
      };
    },
    [value, validateValue, hasValidator, parseInputFn, normalize, isEqual]
  );

  const addChipsFromInput = useCallback(
    async (input: string) => {
      const values = containsDelimiter(input, delimiters)
        ? splitByDelimiters(input, delimiters)
        : [input];

      const newChips: Chip<TValue>[] = [];
      for (const val of values) {
        const chip = await createChip(val);
        if (chip) newChips.push(chip);
      }

      if (newChips.length > 0) {
        const insertAt = insertPosition ?? value.length;
        const newValue = [
          ...value.slice(0, insertAt),
          ...newChips,
          ...value.slice(insertAt),
        ];
        onChange(newValue);

        if (insertPosition !== null) {
          setInsertPosition(insertPosition + newChips.length);
        }
      }

      setInputValue('');
    },
    [createChip, onChange, value, delimiters, insertPosition]
  );

  // -------------------------------------------------------------------------
  // Chip Deletion
  // -------------------------------------------------------------------------
  const handleChipDelete = useCallback(
    (id: string) => {
      onChange(value.filter((chip) => chip.id !== id));
    },
    [onChange, value]
  );

  // -------------------------------------------------------------------------
  // Suggestions
  // -------------------------------------------------------------------------
  const processSuggestionSelection = useCallback(
    async (suggestion: Suggestion<TValue>) => {
      const normalizedValue = normalize(suggestion.value);
      const isDuplicate = value.some((chip) =>
        isEqual(normalize(chip.value), normalizedValue)
      );

      if (!isDuplicate) {
        const isValid = hasValidator ? await validateValue(suggestion.value) : undefined;
        const chip: Chip<TValue> = {
          id: generateId(),
          value: suggestion.value,
          label: suggestion.label,
          isValid,
        };

        const insertAt = insertPosition ?? value.length;
        const newValue = [
          ...value.slice(0, insertAt),
          chip,
          ...value.slice(insertAt),
        ];
        onChange(newValue);

        if (insertPosition !== null) {
          setInsertPosition(insertPosition + 1);
        }
      }

      setInputValue('');
    },
    [value, onChange, normalize, isEqual, hasValidator, validateValue, insertPosition]
  );

  const handleSuggestionSelectInternal = useCallback(
    (suggestion: Suggestion<TValue>): void => {
      isSelectingRef.current = true;

      processSuggestionSelection(suggestion)
        .catch(() => {
          // Silently handle validation errors
        })
        .finally(() => {
          setTimeout(() => {
            isSelectingRef.current = false;
            inputRef.current?.focus();
          }, 0);
        });
    },
    [processSuggestionSelection]
  );

  const {
    suggestions,
    highlightedIndex,
    isVisible: suggestionsVisible,
    search: searchSuggestions,
    handleKeyDown: handleSuggestionsKeyDown,
    handleSelect: handleSuggestionsSelect,
    handleHighlight,
    close: closeSuggestions,
    clear: clearSuggestions,
  } = useSuggestions<TValue>({
    onSearch,
    debounceMs: searchDebounceMs,
    onSelect: handleSuggestionSelectInternal,
  });

  // Clear suggestions when value is empty
  useEffect(() => {
    if (value.length === 0) clearSuggestions();
  }, [value.length, clearSuggestions]);

  // -------------------------------------------------------------------------
  // Event Handlers
  // -------------------------------------------------------------------------
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const hasDelimiter = containsDelimiter(newValue, delimiters);

      if (hasDelimiter) {
        addChipsFromInput(newValue).catch(() => {
          // Silently handle any errors during chip creation
        });
        return;
      }

      setInputValue(newValue);
      searchSuggestions(newValue);
    },
    [delimiters, addChipsFromInput, searchSuggestions]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      // Let suggestions handle first
      if (handleSuggestionsKeyDown(e)) return;

      const cursorPos = inputRef.current?.selectionStart ?? 0;
      const ctx: KeyHandlerContext<TValue> = {
        isAtStart: cursorPos === 0,
        isAtEnd: cursorPos === inputValue.length,
        hasChips: value.length > 0,
        inputValue,
        insertPosition,
        value,
        suggestionsVisible,
        delimiters,
        setInsertPosition,
        handleChipDelete,
        addChipsFromInput,
        closeSuggestions,
        focusInput: () => setTimeout(() => inputRef.current?.focus(), 0),
      };

      switch (e.key) {
        case 'ArrowLeft':
          handleArrowLeftKey(e, ctx);
          break;
        case 'ArrowRight':
          handleArrowRightKey(e, ctx);
          break;
        case 'Backspace':
          handleBackspaceKey(e, ctx);
          break;
        case 'Enter':
        case 'Tab':
          handleSubmitKey(e, ctx);
          break;
        case 'Escape':
          handleEscapeKey(e, ctx);
          break;
        default:
          handleDelimiterKey(e, ctx);
      }
    },
    [
      handleSuggestionsKeyDown,
      inputValue,
      value,
      insertPosition,
      delimiters,
      addChipsFromInput,
      closeSuggestions,
      suggestionsVisible,
      handleChipDelete,
    ]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      const pastedText = e.clipboardData.getData('text');
      const hasDelimiter = containsDelimiter(pastedText, delimiters);
      const hasNewline = pastedText.includes('\n');

      if (hasDelimiter || hasNewline) {
        e.preventDefault();
        const allDelimiters = [...delimiters, '\n'];
        const values = splitByDelimiters(pastedText, allDelimiters);
        if (values.length > 0) {
          void addChipsFromInput(values.join(delimiters[0]));
        }
      }
    },
    [delimiters, addChipsFromInput]
  );

  const handleBlur = useCallback(
    (e: FocusEvent) => {
      if (isSelectingRef.current) return;
      if (containerRef.current?.contains(e.relatedTarget)) return;

      if (inputValue.trim()) {
        void addChipsFromInput(inputValue);
      }
      closeSuggestions();
    },
    [inputValue, addChipsFromInput, closeSuggestions]
  );

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setInsertPosition(null);
      inputRef.current?.focus();
    }
  }, []);

  const handleContainerKeyDown = useCallback((e: React.KeyboardEvent) => {
    const isActivationKey = e.key === 'Enter' || e.key === ' ';
    if (isActivationKey && e.target === containerRef.current) {
      e.preventDefault();
      setInsertPosition(null);
      inputRef.current?.focus();
    }
  }, []);

  const handleChipClick = useCallback(
    (id: string) => {
      const index = value.findIndex((chip) => chip.id === id);
      if (index !== -1) {
        setInsertPosition(index);
        inputRef.current?.focus();
      }
    },
    [value]
  );

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------
  return {
    // Refs
    inputRef,
    containerRef,
    measureRef,

    // State
    inputValue,
    inputWidth,
    insertPosition,

    // Suggestions
    suggestions,
    highlightedIndex,
    suggestionsVisible,

    // Handlers
    handleInputChange,
    handleKeyDown,
    handlePaste,
    handleBlur,
    handleContainerClick,
    handleContainerKeyDown,
    handleChipClick,
    handleChipDelete,
    handleSuggestionSelect: handleSuggestionsSelect,
    handleSuggestionHighlight: handleHighlight,
  };
};
