import type { EmailChipProps } from './types';

export const EmailChip = ({
  chip,
  isSelected,
  onDelete,
  onClick,
  classNames,
  disabled,
}: EmailChipProps) => {
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
    !chip.isValid && classNames?.chipInvalid,
    isSelected && classNames?.chipSelected,
  ]
    .filter(Boolean)
    .join(' ');

  const displayText = chip.label || chip.email;

  return (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`${displayText}${!chip.isValid ? ' (invalid email)' : ''}`}
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

