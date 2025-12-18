import type { ChipProps } from '../chip-input/types';
import { defaultFormatValue } from '../../utils/chip-utils';

/**
 * Individual chip component.
 *
 * Displays a value as an interactive chip with:
 * - Visual indication of validation status (when applicable)
 * - Selection state for keyboard navigation
 * - Delete button for removal
 * - Keyboard accessibility (Enter/Space to select)
 *
 * @typeParam TValue - The type of the chip's value
 * @param props - Component props
 * @returns The rendered chip element
 */
export const Chip = <TValue = string,>({
  chip,
  isSelected,
  onDelete,
  onClick,
  formatValue = defaultFormatValue,
  classNames,
  disabled,
}: ChipProps<TValue>) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onDelete(chip.id);
    }
  };

  const handleChipClick = () => {
    if (!disabled) {
      onClick(chip.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleChipClick();
    }
  };

  // Build className string based on state
  const chipClassName = [
    classNames?.chip,
    chip.isValid === false && classNames?.chipInvalid,
    isSelected && classNames?.chipSelected,
  ]
    .filter(Boolean)
    .join(' ');

  // Use label if available, otherwise format the value
  const displayText = chip.label ?? formatValue(chip.value);

  // Determine if invalid (only when isValid is explicitly false)
  const isInvalid = chip.isValid === false;

  return (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`${displayText}${isInvalid ? ' (invalid)' : ''}`}
      aria-selected={isSelected}
      data-selected={isSelected}
      data-valid={chip.isValid}
      className={chipClassName || undefined}
      onClick={handleChipClick}
      onKeyDown={handleKeyDown}
    >
      <span>{displayText}</span>
      <button
        type="button"
        aria-label={`Remove ${displayText}`}
        onClick={handleDeleteClick}
        disabled={disabled}
        tabIndex={-1}
        className={classNames?.deleteButton || undefined}
      >
        ×
      </button>
    </span>
  );
};

