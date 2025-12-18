import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailChipInput } from './email-chip-input';
import type { EmailChip } from '../types';

const mockChips: EmailChip[] = [
  { id: '1', email: 'alice@example.com', label: 'Alice', isValid: true },
  { id: '2', email: 'bob@example.com', isValid: true },
];

describe('EmailChipInput', () => {
  describe('rendering', () => {
    it('should render input element', () => {
      render(<EmailChipInput value={[]} onChange={vi.fn()} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render chips', () => {
      render(<EmailChipInput value={mockChips} onChange={vi.fn()} />);

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });

    it('should show placeholder when no chips', () => {
      render(
        <EmailChipInput
          value={[]}
          onChange={vi.fn()}
          placeholder="Add emails..."
        />
      );

      expect(screen.getByPlaceholderText('Add emails...')).toBeInTheDocument();
    });

    it('should hide placeholder when chips exist', () => {
      render(
        <EmailChipInput
          value={mockChips}
          onChange={vi.fn()}
          placeholder="Add emails..."
        />
      );

      expect(screen.queryByPlaceholderText('Add emails...')).not.toBeInTheDocument();
    });
  });

  describe('chip creation', () => {
    it('should create chip on Enter', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<EmailChipInput value={[]} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'test@example.com');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips).toHaveLength(1);
        expect(newChips[0].email).toBe('test@example.com');
      });
    });

    it('should create chip on Tab', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<EmailChipInput value={[]} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'test@example.com');
      await user.keyboard('{Tab}');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    });

    it('should create chip on comma delimiter', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<EmailChipInput value={[]} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'test@example.com,');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    });

    it('should create multiple chips from pasted text', async () => {
      const handleChange = vi.fn();

      render(<EmailChipInput value={[]} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      const pasteData = 'a@test.com, b@test.com, c@test.com';

      fireEvent.paste(input, {
        clipboardData: {
          getData: () => pasteData,
        },
      });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips).toHaveLength(3);
      });
    });
  });

  describe('chip deletion', () => {
    it('should delete chip when delete button is clicked', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<EmailChipInput value={mockChips} onChange={handleChange} />);

      const deleteButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(deleteButtons[0]);

      expect(handleChange).toHaveBeenCalledWith([mockChips[1]]);
    });

    it('should delete last chip on Backspace when input is empty', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<EmailChipInput value={mockChips} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.keyboard('{Backspace}');

      expect(handleChange).toHaveBeenCalledWith([mockChips[0]]);
    });
  });

  describe('validation', () => {
    it('should mark invalid emails', async () => {
      const handleChange = vi.fn();
      const validateEmail = vi.fn((email: string) => email.endsWith('@valid.com'));
      const user = userEvent.setup();

      render(
        <EmailChipInput
          value={[]}
          onChange={handleChange}
          validateEmail={validateEmail}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'test@invalid.com');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips[0].isValid).toBe(false);
      });
    });

    it('should mark valid emails', async () => {
      const handleChange = vi.fn();
      const validateEmail = vi.fn((email: string) => email.endsWith('@valid.com'));
      const user = userEvent.setup();

      render(
        <EmailChipInput
          value={[]}
          onChange={handleChange}
          validateEmail={validateEmail}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'test@valid.com');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips[0].isValid).toBe(true);
      });
    });
  });

  describe('duplicates', () => {
    it('should not create duplicate chips', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <EmailChipInput value={mockChips} onChange={handleChange} />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'alice@example.com');
      await user.keyboard('{Enter}');

      // Should not call onChange because it's a duplicate
      await waitFor(() => {
        expect(handleChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('disabled state', () => {
    it('should disable input when disabled', () => {
      render(
        <EmailChipInput value={mockChips} onChange={vi.fn()} disabled={true} />
      );

      expect(screen.getByRole('combobox')).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(
        <EmailChipInput
          value={[]}
          onChange={vi.fn()}
          ariaLabel="Recipients"
        />
      );

      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-label', 'Recipients');
    });

    it('should have combobox role', () => {
      render(<EmailChipInput value={[]} onChange={vi.fn()} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should apply custom class names', () => {
      const { container } = render(
        <EmailChipInput
          value={mockChips}
          onChange={vi.fn()}
          classNames={{
            container: 'custom-container',
            input: 'custom-input',
            chip: 'custom-chip',
          }}
        />
      );

      // Container has custom class
      expect(container.querySelector('.custom-container')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveClass('custom-input');
    });
  });
});

