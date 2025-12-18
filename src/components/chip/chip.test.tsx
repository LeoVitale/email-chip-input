import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Chip } from './chip';
import type { Chip as ChipType } from '../chip-input/types';

describe('Chip', () => {
  const defaultChip: ChipType<string> = {
    id: 'chip-1',
    value: 'test-value',
    isValid: true,
  };

  const defaultProps = {
    chip: defaultChip,
    isSelected: false,
    onDelete: vi.fn(),
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the value using default formatter', () => {
      render(<Chip {...defaultProps} />);
      expect(screen.getByText('test-value')).toBeInTheDocument();
    });

    it('should render the label when provided', () => {
      const chip: ChipType<string> = {
        ...defaultChip,
        label: 'Custom Label',
      };
      render(<Chip {...defaultProps} chip={chip} />);
      expect(screen.getByText('Custom Label')).toBeInTheDocument();
    });

    it('should use custom formatValue function', () => {
      render(
        <Chip
          {...defaultProps}
          formatValue={(value) => `Formatted: ${value}`}
        />
      );
      expect(screen.getByText('Formatted: test-value')).toBeInTheDocument();
    });

    it('should render delete button', () => {
      render(<Chip {...defaultProps} />);
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClick when chip is clicked', () => {
      const onClick = vi.fn();
      render(<Chip {...defaultProps} onClick={onClick} />);
      
      // Get the chip element (the span with role="button", not the inner delete button)
      const chipElement = screen.getByRole('button', { name: 'test-value' });
      fireEvent.click(chipElement);
      expect(onClick).toHaveBeenCalledWith('chip-1');
    });

    it('should call onDelete when delete button is clicked', () => {
      const onDelete = vi.fn();
      render(<Chip {...defaultProps} onDelete={onDelete} />);
      
      fireEvent.click(screen.getByRole('button', { name: /remove/i }));
      expect(onDelete).toHaveBeenCalledWith('chip-1');
    });

    it('should not call onClick when disabled', () => {
      const onClick = vi.fn();
      render(<Chip {...defaultProps} onClick={onClick} disabled />);
      
      const chipElement = screen.getByRole('button', { name: 'test-value' });
      fireEvent.click(chipElement);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should not call onDelete when disabled', () => {
      const onDelete = vi.fn();
      render(<Chip {...defaultProps} onDelete={onDelete} disabled />);
      
      fireEvent.click(screen.getByRole('button', { name: /remove/i }));
      expect(onDelete).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    it('should call onClick on Enter key', () => {
      const onClick = vi.fn();
      render(<Chip {...defaultProps} onClick={onClick} />);
      
      const chipElement = screen.getByRole('button', { name: 'test-value' });
      fireEvent.keyDown(chipElement, { key: 'Enter' });
      expect(onClick).toHaveBeenCalledWith('chip-1');
    });

    it('should call onClick on Space key', () => {
      const onClick = vi.fn();
      render(<Chip {...defaultProps} onClick={onClick} />);
      
      const chipElement = screen.getByRole('button', { name: 'test-value' });
      fireEvent.keyDown(chipElement, { key: ' ' });
      expect(onClick).toHaveBeenCalledWith('chip-1');
    });
  });

  describe('validation state', () => {
    it('should apply invalid class when isValid is false', () => {
      const chip: ChipType<string> = {
        ...defaultChip,
        isValid: false,
      };
      render(
        <Chip
          {...defaultProps}
          chip={chip}
          classNames={{ chipInvalid: 'invalid-class' }}
        />
      );
      
      const chipElement = screen.getByRole('button', { name: 'test-value (invalid)' });
      expect(chipElement).toHaveClass('invalid-class');
    });

    it('should not apply invalid class when isValid is true', () => {
      render(
        <Chip
          {...defaultProps}
          classNames={{ chipInvalid: 'invalid-class' }}
        />
      );
      
      const chipElement = screen.getByRole('button', { name: 'test-value' });
      expect(chipElement).not.toHaveClass('invalid-class');
    });

    it('should not apply invalid class when isValid is undefined', () => {
      const chip: ChipType<string> = {
        id: 'chip-1',
        value: 'test-value',
      };
      render(
        <Chip
          {...defaultProps}
          chip={chip}
          classNames={{ chipInvalid: 'invalid-class' }}
        />
      );
      
      const chipElement = screen.getByRole('button', { name: 'test-value' });
      expect(chipElement).not.toHaveClass('invalid-class');
    });
  });

  describe('selection state', () => {
    it('should apply selected class when isSelected is true', () => {
      render(
        <Chip
          {...defaultProps}
          isSelected
          classNames={{ chipSelected: 'selected-class' }}
        />
      );
      
      const chipElement = screen.getByRole('button', { name: 'test-value' });
      expect(chipElement).toHaveClass('selected-class');
    });
  });

  describe('accessibility', () => {
    it('should have aria-selected attribute', () => {
      render(<Chip {...defaultProps} isSelected />);
      
      const chipElement = screen.getByRole('button', { name: 'test-value' });
      expect(chipElement).toHaveAttribute('aria-selected', 'true');
    });

    it('should have tabIndex -1 when disabled', () => {
      render(<Chip {...defaultProps} disabled />);
      
      const chipElement = screen.getByRole('button', { name: 'test-value' });
      expect(chipElement).toHaveAttribute('tabIndex', '-1');
    });

    it('should have tabIndex 0 when not disabled', () => {
      render(<Chip {...defaultProps} />);
      
      const chipElement = screen.getByRole('button', { name: 'test-value' });
      expect(chipElement).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('with custom types', () => {
    interface Person {
      id: number;
      name: string;
    }

    it('should work with object values', () => {
      const personChip: ChipType<Person> = {
        id: 'person-1',
        value: { id: 1, name: 'John Doe' },
      };

      render(
        <Chip<Person>
          chip={personChip}
          isSelected={false}
          onDelete={vi.fn()}
          onClick={vi.fn()}
          formatValue={(person) => person.name}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});

