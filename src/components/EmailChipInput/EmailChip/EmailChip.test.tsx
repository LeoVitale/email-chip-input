import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmailChip } from './EmailChip';
import type { EmailChip as EmailChipType } from '../types';

const createMockChip = (overrides: Partial<EmailChipType> = {}): EmailChipType => ({
  id: 'test-chip',
  email: 'user@example.com',
  isValid: true,
  ...overrides,
});

describe('EmailChip', () => {
  describe('rendering', () => {
    it('should render email address', () => {
      const chip = createMockChip();
      render(
        <EmailChip
          chip={chip}
          isSelected={false}
          onDelete={vi.fn()}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    it('should render label when provided', () => {
      const chip = createMockChip({ label: 'John Doe' });
      render(
        <EmailChip
          chip={chip}
          isSelected={false}
          onDelete={vi.fn()}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should have delete button', () => {
      const chip = createMockChip();
      render(
        <EmailChip
          chip={chip}
          isSelected={false}
          onDelete={vi.fn()}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have correct aria-label for valid email', () => {
      const chip = createMockChip();
      render(
        <EmailChip
          chip={chip}
          isSelected={false}
          onDelete={vi.fn()}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: 'user@example.com' })).toBeInTheDocument();
    });

    it('should indicate invalid email in aria-label', () => {
      const chip = createMockChip({ isValid: false });
      render(
        <EmailChip
          chip={chip}
          isSelected={false}
          onDelete={vi.fn()}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /invalid email/i })).toBeInTheDocument();
    });

    it('should have aria-selected when selected', () => {
      const chip = createMockChip();
      render(
        <EmailChip
          chip={chip}
          isSelected={true}
          onDelete={vi.fn()}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: 'user@example.com' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });
  });

  describe('interactions', () => {
    it('should call onClick when chip is clicked', () => {
      const chip = createMockChip();
      const handleClick = vi.fn();
      render(
        <EmailChip
          chip={chip}
          isSelected={false}
          onDelete={vi.fn()}
          onClick={handleClick}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'user@example.com' }));

      expect(handleClick).toHaveBeenCalledWith('test-chip');
    });

    it('should call onDelete when delete button is clicked', () => {
      const chip = createMockChip();
      const handleDelete = vi.fn();
      render(
        <EmailChip
          chip={chip}
          isSelected={false}
          onDelete={handleDelete}
          onClick={vi.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /remove/i }));

      expect(handleDelete).toHaveBeenCalledWith('test-chip');
    });

    it('should not propagate click when delete button is clicked', () => {
      const chip = createMockChip();
      const handleClick = vi.fn();
      const handleDelete = vi.fn();
      render(
        <EmailChip
          chip={chip}
          isSelected={false}
          onDelete={handleDelete}
          onClick={handleClick}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /remove/i }));

      expect(handleDelete).toHaveBeenCalled();
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle Enter key press', () => {
      const chip = createMockChip();
      const handleClick = vi.fn();
      render(
        <EmailChip
          chip={chip}
          isSelected={false}
          onDelete={vi.fn()}
          onClick={handleClick}
        />
      );

      fireEvent.keyDown(screen.getByRole('button', { name: 'user@example.com' }), {
        key: 'Enter',
      });

      expect(handleClick).toHaveBeenCalledWith('test-chip');
    });
  });

  describe('disabled state', () => {
    it('should not call onClick when disabled', () => {
      const chip = createMockChip();
      const handleClick = vi.fn();
      render(
        <EmailChip
          chip={chip}
          isSelected={false}
          onDelete={vi.fn()}
          onClick={handleClick}
          disabled={true}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'user@example.com' }));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onDelete when disabled', () => {
      const chip = createMockChip();
      const handleDelete = vi.fn();
      render(
        <EmailChip
          chip={chip}
          isSelected={false}
          onDelete={handleDelete}
          onClick={vi.fn()}
          disabled={true}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /remove/i }));

      expect(handleDelete).not.toHaveBeenCalled();
    });
  });

  describe('styling', () => {
    it('should apply custom class names', () => {
      const chip = createMockChip();
      render(
        <EmailChip
          chip={chip}
          isSelected={false}
          onDelete={vi.fn()}
          onClick={vi.fn()}
          classNames={{
            chip: 'custom-chip',
            deleteButton: 'custom-delete',
          }}
        />
      );

      expect(screen.getByRole('button', { name: 'user@example.com' })).toHaveClass(
        'custom-chip'
      );
      expect(screen.getByRole('button', { name: /remove/i })).toHaveClass(
        'custom-delete'
      );
    });

    it('should apply invalid class when email is invalid', () => {
      const chip = createMockChip({ isValid: false });
      render(
        <EmailChip
          chip={chip}
          isSelected={false}
          onDelete={vi.fn()}
          onClick={vi.fn()}
          classNames={{
            chip: 'chip',
            chipInvalid: 'chip--invalid',
          }}
        />
      );

      expect(screen.getByRole('button', { name: /invalid/i })).toHaveClass(
        'chip--invalid'
      );
    });

    it('should apply selected class when selected', () => {
      const chip = createMockChip();
      render(
        <EmailChip
          chip={chip}
          isSelected={true}
          onDelete={vi.fn()}
          onClick={vi.fn()}
          classNames={{
            chip: 'chip',
            chipSelected: 'chip--selected',
          }}
        />
      );

      expect(screen.getByRole('button', { name: 'user@example.com' })).toHaveClass(
        'chip--selected'
      );
    });
  });
});

