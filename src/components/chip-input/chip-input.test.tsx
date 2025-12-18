import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChipInput } from './chip-input';
import type { Chip, Suggestion } from './types';

const mockChips: Chip<string>[] = [
  { id: '1', value: 'tag-one', isValid: true },
  { id: '2', value: 'tag-two', label: 'Tag Two', isValid: true },
  { id: '3', value: 'tag-three', isValid: false },
];

describe('ChipInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render input element', () => {
      render(<ChipInput value={[]} onChange={vi.fn()} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render chips with values', () => {
      render(<ChipInput value={mockChips} onChange={vi.fn()} />);

      expect(screen.getByText('tag-one')).toBeInTheDocument();
      expect(screen.getByText('Tag Two')).toBeInTheDocument();
      expect(screen.getByText('tag-three')).toBeInTheDocument();
    });

    it('should show placeholder when no chips', () => {
      render(
        <ChipInput
          value={[]}
          onChange={vi.fn()}
          placeholder="Add tags..."
        />
      );

      expect(screen.getByPlaceholderText('Add tags...')).toBeInTheDocument();
    });

    it('should hide placeholder when chips exist', () => {
      render(
        <ChipInput
          value={mockChips}
          onChange={vi.fn()}
          placeholder="Add tags..."
        />
      );

      expect(screen.queryByPlaceholderText('Add tags...')).not.toBeInTheDocument();
    });

    it('should render with custom formatValue', () => {
      render(
        <ChipInput
          value={mockChips}
          onChange={vi.fn()}
          formatValue={(v) => v.toUpperCase()}
        />
      );

      expect(screen.getByText('TAG-ONE')).toBeInTheDocument();
    });
  });

  describe('chip creation', () => {
    it('should create chip on Enter', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={[]} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'new-tag');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips).toHaveLength(1);
        expect(newChips[0].value).toBe('new-tag');
      });
    });

    it('should create chip on Tab', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={[]} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'new-tag');
      await user.keyboard('{Tab}');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips[0].value).toBe('new-tag');
      });
    });

    it('should create chip on comma delimiter', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={[]} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'new-tag,');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips[0].value).toBe('new-tag');
      });
    });

    it('should create chip on semicolon delimiter', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={[]} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'new-tag;');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips[0].value).toBe('new-tag');
      });
    });

    it('should create chip with custom delimiters', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ChipInput
          value={[]}
          onChange={handleChange}
          delimiters={['|', '/']}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'new-tag|');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips[0].value).toBe('new-tag');
      });
    });

    it('should create chip on blur', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={[]} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'new-tag');
      await user.click(document.body);

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips[0].value).toBe('new-tag');
      });
    });

    it('should not create chip when input is empty', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={[]} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.keyboard('{Enter}');

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should not create chip when input is only whitespace', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={[]} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, '   ');
      await user.keyboard('{Enter}');

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should trim whitespace from values', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={[]} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, '  new-tag  ');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips[0].value).toBe('new-tag');
      });
    });
  });

  describe('multi-value paste', () => {
    it('should create multiple chips from pasted text with commas', async () => {
      const handleChange = vi.fn();

      render(<ChipInput value={[]} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      const pasteData = 'tag-one, tag-two, tag-three';

      fireEvent.paste(input, {
        clipboardData: {
          getData: () => pasteData,
        },
      });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips).toHaveLength(3);
        expect(newChips[0].value).toBe('tag-one');
        expect(newChips[1].value).toBe('tag-two');
        expect(newChips[2].value).toBe('tag-three');
      });
    });

    it('should create multiple chips from pasted text with newlines', async () => {
      const handleChange = vi.fn();

      render(<ChipInput value={[]} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      const pasteData = 'tag-one\ntag-two\ntag-three';

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

    it('should skip empty values from pasted text', async () => {
      const handleChange = vi.fn();

      render(<ChipInput value={[]} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      const pasteData = 'tag-one,, ,tag-two';

      fireEvent.paste(input, {
        clipboardData: {
          getData: () => pasteData,
        },
      });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips).toHaveLength(2);
      });
    });
  });

  describe('chip deletion', () => {
    it('should delete chip when delete button is clicked', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={mockChips} onChange={handleChange} />);

      const deleteButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(deleteButtons[0]);

      expect(handleChange).toHaveBeenCalledWith([mockChips[1], mockChips[2]]);
    });

    it('should delete last chip on Backspace when input is empty', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={mockChips} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.keyboard('{Backspace}');

      expect(handleChange).toHaveBeenCalledWith([mockChips[0], mockChips[1]]);
    });

    it('should not delete chip when Backspace is pressed with input content', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={mockChips} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'abc');
      await user.keyboard('{Backspace}');

      // Should not call onChange for chip deletion
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    it('should move input left with ArrowLeft at start of input', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={mockChips} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.keyboard('{ArrowLeft}');

      // After ArrowLeft, input should be at position before last chip
      // Verify by pressing Backspace - should delete second-to-last chip
      await user.keyboard('{ArrowLeft}'); // Move to before chip at index 1
      await user.keyboard('{Backspace}'); // Should delete chip at index 0

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    });

    it('should move input right with ArrowRight', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={mockChips} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.click(input);

      // Move left twice
      await user.keyboard('{ArrowLeft}');
      await user.keyboard('{ArrowLeft}');

      // Move right once
      await user.keyboard('{ArrowRight}');

      // Now at position 2, Backspace should delete chip at index 1
      await user.keyboard('{Backspace}');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const result = handleChange.mock.calls[0][0];
        expect(result).toHaveLength(2);
        // chip at index 1 (tag-two) should be deleted
        expect(result.find((c: Chip<string>) => c.id === '2')).toBeUndefined();
      });
    });

    it('should reset input position to end on Escape', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<ChipInput value={mockChips} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.click(input);

      // Move left
      await user.keyboard('{ArrowLeft}');
      await user.keyboard('{ArrowLeft}');

      // Press Escape to reset
      await user.keyboard('{Escape}');

      // Now Backspace should delete last chip (index 2)
      await user.keyboard('{Backspace}');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const result = handleChange.mock.calls[0][0];
        expect(result.find((c: Chip<string>) => c.id === '3')).toBeUndefined();
      });
    });
  });

  describe('insertion position', () => {
    it('should insert new chip at cursor position', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={mockChips} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.click(input);

      // Move to beginning
      await user.keyboard('{ArrowLeft}');
      await user.keyboard('{ArrowLeft}');
      await user.keyboard('{ArrowLeft}');

      // Type new chip
      await user.type(input, 'inserted');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const result = handleChange.mock.calls[0][0];
        expect(result).toHaveLength(4);
        expect(result[0].value).toBe('inserted');
      });
    });
  });

  describe('validation', () => {
    it('should mark valid values with isValid true', async () => {
      const handleChange = vi.fn();
      const validate = vi.fn((value: string) => value.length >= 3);
      const user = userEvent.setup();

      render(
        <ChipInput
          value={[]}
          onChange={handleChange}
          validate={validate}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'valid');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips[0].isValid).toBe(true);
      });
    });

    it('should mark invalid values with isValid false', async () => {
      const handleChange = vi.fn();
      const validate = vi.fn((value: string) => value.length >= 5);
      const user = userEvent.setup();

      render(
        <ChipInput
          value={[]}
          onChange={handleChange}
          validate={validate}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'ab');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips[0].isValid).toBe(false);
      });
    });

    it('should support async validation', async () => {
      const handleChange = vi.fn();
      const validate = vi.fn(async (value: string) => {
        await new Promise((r) => setTimeout(r, 10));
        return value.startsWith('valid');
      });
      const user = userEvent.setup();

      render(
        <ChipInput
          value={[]}
          onChange={handleChange}
          validate={validate}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'valid-tag');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips[0].isValid).toBe(true);
      });
    });

    it('should not set isValid when no validator provided', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={[]} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'any-value');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips[0].isValid).toBeUndefined();
      });
    });
  });

  describe('duplicates', () => {
    it('should not create duplicate chips', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={mockChips} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'tag-one');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(handleChange).not.toHaveBeenCalled();
      });
    });

    it('should use normalize for case-insensitive duplicate detection', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ChipInput
          value={mockChips}
          onChange={handleChange}
          normalize={(v) => v.toLowerCase()}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'TAG-ONE');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(handleChange).not.toHaveBeenCalled();
      });
    });

    it('should use custom isEqual for duplicate detection', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ChipInput
          value={mockChips}
          onChange={handleChange}
          isEqual={(a, b) => a.toLowerCase() === b.toLowerCase()}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'TAG-ONE');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(handleChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('custom parsing', () => {
    it('should use parseInput to transform values', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ChipInput
          value={[]}
          onChange={handleChange}
          parseInput={(input) => ({
            value: input.trim().toUpperCase(),
            label: input.trim(),
          })}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'test');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips[0].value).toBe('TEST');
        expect(newChips[0].label).toBe('test');
      });
    });

    it('should reject invalid input when parseInput returns null', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ChipInput
          value={[]}
          onChange={handleChange}
          parseInput={(input) => {
            if (input.length < 3) return null;
            return { value: input };
          }}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'ab');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(handleChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('suggestions/autocomplete', () => {
    const mockSuggestions: Suggestion<string>[] = [
      { id: 's1', value: 'suggestion-one', label: 'Suggestion One' },
      { id: 's2', value: 'suggestion-two', label: 'Suggestion Two' },
      { id: 's3', value: 'suggestion-three' },
    ];

    it('should call onSearch when typing', async () => {
      const onSearch = vi.fn().mockResolvedValue(mockSuggestions);
      const user = userEvent.setup();

      render(
        <ChipInput
          value={[]}
          onChange={vi.fn()}
          onSearch={onSearch}
          searchDebounceMs={0}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'sug');

      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('sug');
      });
    });

    it('should display suggestions', async () => {
      const onSearch = vi.fn().mockResolvedValue(mockSuggestions);
      const user = userEvent.setup();

      render(
        <ChipInput
          value={[]}
          onChange={vi.fn()}
          onSearch={onSearch}
          searchDebounceMs={0}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'sug');

      await waitFor(() => {
        expect(screen.getByText('Suggestion One')).toBeInTheDocument();
        expect(screen.getByText('Suggestion Two')).toBeInTheDocument();
      });
    });

    it('should create chip when suggestion is clicked', async () => {
      const handleChange = vi.fn();
      const onSearch = vi.fn().mockResolvedValue(mockSuggestions);
      const user = userEvent.setup();

      render(
        <ChipInput
          value={[]}
          onChange={handleChange}
          onSearch={onSearch}
          searchDebounceMs={0}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'sug');

      await waitFor(() => {
        expect(screen.getByText('Suggestion One')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Suggestion One'));

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips[0].value).toBe('suggestion-one');
        expect(newChips[0].label).toBe('Suggestion One');
      });
    });

    it('should navigate suggestions with arrow keys', async () => {
      const handleChange = vi.fn();
      const onSearch = vi.fn().mockResolvedValue(mockSuggestions);
      const user = userEvent.setup();

      render(
        <ChipInput
          value={[]}
          onChange={handleChange}
          onSearch={onSearch}
          searchDebounceMs={0}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'sug');

      await waitFor(() => {
        expect(screen.getByText('Suggestion One')).toBeInTheDocument();
      });

      // First item is highlighted by default (index 0)
      // Navigate down once to second item (index 1)
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips[0].value).toBe('suggestion-two');
      });
    });

    it('should close suggestions on Escape', async () => {
      const onSearch = vi.fn().mockResolvedValue(mockSuggestions);
      const user = userEvent.setup();

      render(
        <ChipInput
          value={[]}
          onChange={vi.fn()}
          onSearch={onSearch}
          searchDebounceMs={0}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'sug');

      await waitFor(() => {
        expect(screen.getByText('Suggestion One')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Suggestion One')).not.toBeInTheDocument();
      });
    });

    it('should not create duplicate from suggestion', async () => {
      const handleChange = vi.fn();
      const existingChips: Chip<string>[] = [
        { id: '1', value: 'suggestion-one' },
      ];
      const onSearch = vi.fn().mockResolvedValue(mockSuggestions);
      const user = userEvent.setup();

      render(
        <ChipInput
          value={existingChips}
          onChange={handleChange}
          onSearch={onSearch}
          searchDebounceMs={0}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'sug');

      await waitFor(() => {
        expect(screen.getByText('Suggestion One')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Suggestion One'));

      await waitFor(() => {
        // Should not add duplicate
        expect(handleChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('disabled state', () => {
    it('should disable input when disabled', () => {
      render(<ChipInput value={mockChips} onChange={vi.fn()} disabled={true} />);

      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('should not create chip when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={[]} onChange={handleChange} disabled={true} />);

      const input = screen.getByRole('combobox');
      // Can't type when disabled
      await user.type(input, 'new-tag');

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(
        <ChipInput
          value={[]}
          onChange={vi.fn()}
          ariaLabel="Tags input"
        />
      );

      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-label', 'Tags input');
    });

    it('should have combobox role', () => {
      render(<ChipInput value={[]} onChange={vi.fn()} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should have aria-expanded false when suggestions not visible', () => {
      render(<ChipInput value={[]} onChange={vi.fn()} />);

      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have aria-autocomplete when onSearch provided', () => {
      render(
        <ChipInput
          value={[]}
          onChange={vi.fn()}
          onSearch={() => Promise.resolve([])}
        />
      );

      expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete', 'list');
    });
  });

  describe('styling', () => {
    it('should apply custom class names to container', () => {
      const { container } = render(
        <ChipInput
          value={mockChips}
          onChange={vi.fn()}
          classNames={{
            container: 'custom-container',
          }}
        />
      );

      expect(container.querySelector('.custom-container')).toBeInTheDocument();
    });

    it('should apply custom class names to input', () => {
      render(
        <ChipInput
          value={[]}
          onChange={vi.fn()}
          classNames={{
            input: 'custom-input',
          }}
        />
      );

      expect(screen.getByRole('combobox')).toHaveClass('custom-input');
    });

    it('should pass classNames to chips', () => {
      render(
        <ChipInput
          value={mockChips}
          onChange={vi.fn()}
          classNames={{
            chip: 'custom-chip',
            chipInvalid: 'custom-invalid',
          }}
        />
      );

      // Valid chips should have chip class
      const validChip = screen.getByRole('button', { name: 'tag-one' });
      expect(validChip).toHaveClass('custom-chip');

      // Invalid chip should have invalid class
      const invalidChip = screen.getByRole('button', { name: 'tag-three (invalid)' });
      expect(invalidChip).toHaveClass('custom-invalid');
    });
  });

  describe('container interaction', () => {
    it('should focus input when container is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ChipInput
          value={mockChips}
          onChange={vi.fn()}
          classNames={{ container: 'chip-container' }}
        />
      );

      const chipContainer = container.querySelector('.chip-container')!;
      await user.click(chipContainer);

      expect(screen.getByRole('combobox')).toHaveFocus();
    });

    it('should focus input on Enter when container is focused', async () => {
      const { container } = render(
        <ChipInput
          value={mockChips}
          onChange={vi.fn()}
          classNames={{ container: 'chip-container' }}
        />
      );

      const chipContainer = container.querySelector('.chip-container')!;
      fireEvent.keyDown(chipContainer, { key: 'Enter' });

      expect(screen.getByRole('combobox')).toHaveFocus();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid typing and deletion', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<ChipInput value={[]} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'abc{Backspace}{Backspace}{Backspace}def');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const newChips = handleChange.mock.calls[0][0];
        expect(newChips[0].value).toBe('def');
      });
    });

    it('should handle empty array value', () => {
      const { container } = render(
        <ChipInput value={[]} onChange={vi.fn()} />
      );

      // Should render without errors
      expect(container).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle undefined label in chip', () => {
      const chips: Chip<string>[] = [
        { id: '1', value: 'test-value' },
      ];

      render(<ChipInput value={chips} onChange={vi.fn()} />);

      // Should display value when label is undefined
      expect(screen.getByText('test-value')).toBeInTheDocument();
    });
  });
});

