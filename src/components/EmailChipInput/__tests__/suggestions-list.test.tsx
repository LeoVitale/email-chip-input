import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SuggestionsList } from '../suggestions-list';
import type { Suggestion } from '../types';

const mockSuggestions: Suggestion[] = [
  { id: '1', email: 'alice@example.com', label: 'Alice' },
  { id: '2', email: 'bob@example.com', label: 'Bob' },
  { id: '3', email: 'charlie@example.com' }, // No label
];

describe('SuggestionsList', () => {
  describe('visibility', () => {
    it('should return null when not visible', () => {
      const { container } = render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={0}
          onSelect={vi.fn()}
          onHighlight={vi.fn()}
          isVisible={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should return null when suggestions are empty', () => {
      const { container } = render(
        <SuggestionsList
          suggestions={[]}
          highlightedIndex={0}
          onSelect={vi.fn()}
          onHighlight={vi.fn()}
          isVisible={true}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when visible with suggestions', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={0}
          onSelect={vi.fn()}
          onHighlight={vi.fn()}
          isVisible={true}
        />
      );

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('rendering', () => {
    it('should render all suggestions', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={0}
          onSelect={vi.fn()}
          onHighlight={vi.fn()}
          isVisible={true}
        />
      );

      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    it('should render label and email for suggestions with labels', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={0}
          onSelect={vi.fn()}
          onHighlight={vi.fn()}
          isVisible={true}
        />
      );

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText(/alice@example\.com/)).toBeInTheDocument();
    });

    it('should render only email for suggestions without labels', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={0}
          onSelect={vi.fn()}
          onHighlight={vi.fn()}
          isVisible={true}
        />
      );

      expect(screen.getByText('charlie@example.com')).toBeInTheDocument();
    });
  });

  describe('highlighting', () => {
    it('should mark highlighted item with aria-selected', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={1}
          onSelect={vi.fn()}
          onHighlight={vi.fn()}
          isVisible={true}
        />
      );

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'false');
      expect(options[1]).toHaveAttribute('aria-selected', 'true');
      expect(options[2]).toHaveAttribute('aria-selected', 'false');
    });

    it('should call onHighlight on mouse enter', () => {
      const handleHighlight = vi.fn();
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={0}
          onSelect={vi.fn()}
          onHighlight={handleHighlight}
          isVisible={true}
        />
      );

      fireEvent.mouseEnter(screen.getAllByRole('option')[2]);

      expect(handleHighlight).toHaveBeenCalledWith(2);
    });
  });

  describe('selection', () => {
    it('should call onSelect when suggestion is clicked', () => {
      const handleSelect = vi.fn();
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={0}
          onSelect={handleSelect}
          onHighlight={vi.fn()}
          isVisible={true}
        />
      );

      fireEvent.click(screen.getAllByRole('option')[1]);

      expect(handleSelect).toHaveBeenCalledWith(mockSuggestions[1]);
    });
  });

  describe('accessibility', () => {
    it('should have listbox role', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={0}
          onSelect={vi.fn()}
          onHighlight={vi.fn()}
          isVisible={true}
        />
      );

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={0}
          onSelect={vi.fn()}
          onHighlight={vi.fn()}
          isVisible={true}
        />
      );

      expect(screen.getByRole('listbox')).toHaveAttribute(
        'aria-label',
        'Email suggestions'
      );
    });

    it('should have option roles for items', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={0}
          onSelect={vi.fn()}
          onHighlight={vi.fn()}
          isVisible={true}
        />
      );

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
    });
  });

  describe('styling', () => {
    it('should apply custom class names', () => {
      render(
        <SuggestionsList
          suggestions={mockSuggestions}
          highlightedIndex={0}
          onSelect={vi.fn()}
          onHighlight={vi.fn()}
          isVisible={true}
          classNames={{
            suggestionsList: 'custom-list',
            suggestionItem: 'custom-item',
            suggestionItemHighlighted: 'custom-item--highlighted',
          }}
        />
      );

      expect(screen.getByRole('listbox')).toHaveClass('custom-list');
      expect(screen.getAllByRole('option')[0]).toHaveClass('custom-item');
      expect(screen.getAllByRole('option')[0]).toHaveClass(
        'custom-item--highlighted'
      );
    });
  });
});

