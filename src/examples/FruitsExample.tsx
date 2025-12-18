import { useState } from 'react';
import { ChipInput } from '../components';
import type { ChipType, ChipSuggestion } from '../components';

const fruitSuggestions: ChipSuggestion<string>[] = [
  { id: 'f1', value: 'apple', label: '🍎 Apple' },
  { id: 'f2', value: 'banana', label: '🍌 Banana' },
  { id: 'f3', value: 'orange', label: '🍊 Orange' },
  { id: 'f4', value: 'strawberry', label: '🍓 Strawberry' },
  { id: 'f5', value: 'grape', label: '🍇 Grape' },
  { id: 'f6', value: 'watermelon', label: '🍉 Watermelon' },
  { id: 'f7', value: 'mango', label: '🥭 Mango' },
  { id: 'f8', value: 'pineapple', label: '🍍 Pineapple' },
];

const fruitEmojis: Record<string, string> = {
  apple: '🍎',
  banana: '🍌',
  orange: '🍊',
  strawberry: '🍓',
  grape: '🍇',
  watermelon: '🍉',
  mango: '🥭',
  pineapple: '🍍',
};

export const FruitsExample = () => {
  const [chips, setChips] = useState<ChipType<string>[]>([
    { id: 'fr1', value: 'apple', label: '🍎 Apple' },
  ]);

  const handleSearch = async (query: string): Promise<ChipSuggestion<string>[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const lowerQuery = query.toLowerCase();
    return fruitSuggestions.filter(
      (fruit) =>
        fruit.value.toLowerCase().includes(lowerQuery) ||
        fruit.label?.toLowerCase().includes(lowerQuery)
    );
  };

  const formatValue = (value: string): string => {
    const emoji = fruitEmojis[value] || '🍏';
    return `${emoji} ${value.charAt(0).toUpperCase() + value.slice(1)}`;
  };

  return (
    <section className="example-section">
      <h2>🍎 Fruits</h2>
      <p className="description">
        <code>ChipInput</code> with autocomplete suggestions. Start typing to see suggestions.
      </p>
      <div className="input-wrapper">
        <ChipInput<string>
          value={chips}
          onChange={setChips}
          onSearch={handleSearch}
          formatValue={formatValue}
          placeholder="Add fruits..."
          classNames={{
            container: 'chip-input-container chip-input-container--fruits',
            input: 'chip-input',
            chip: 'fruit-chip',
            chipSelected: 'fruit-chip--selected',
            deleteButton: 'chip-delete-btn',
            suggestionsList: 'suggestions-list',
            suggestionItem: 'suggestion-item',
            suggestionItemHighlighted: 'suggestion-item--highlighted',
            insertCursor: 'insert-cursor',
          }}
        />
      </div>
      <div className="debug-box">
        <strong>State:</strong>
        <pre>{JSON.stringify(chips, null, 2)}</pre>
      </div>
    </section>
  );
};

