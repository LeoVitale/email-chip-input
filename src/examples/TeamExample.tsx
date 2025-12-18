import { useState } from 'react';
import { ChipInput } from '../components';
import type { ChipType, ChipSuggestion } from '../components';

interface Person {
  id: number;
  name: string;
  role: string;
}

const teamMembers: ChipSuggestion<Person>[] = [
  { id: 'p1', value: { id: 1, name: 'Alice', role: 'Developer' }, label: 'Alice - Developer' },
  { id: 'p2', value: { id: 2, name: 'Bob', role: 'Designer' }, label: 'Bob - Designer' },
  { id: 'p3', value: { id: 3, name: 'Carol', role: 'PM' }, label: 'Carol - PM' },
  { id: 'p4', value: { id: 4, name: 'David', role: 'QA' }, label: 'David - QA' },
];

export const TeamExample = () => {
  const [chips, setChips] = useState<ChipType<Person>[]>([
    { id: 'tm1', value: { id: 1, name: 'Alice', role: 'Developer' }, label: 'Alice' },
  ]);

  const handleSearch = async (query: string): Promise<ChipSuggestion<Person>[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const lowerQuery = query.toLowerCase();
    return teamMembers.filter(
      (member) =>
        member.value.name.toLowerCase().includes(lowerQuery) ||
        member.value.role.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    <section className="example-section">
      <h2>👥 Team Members</h2>
      <p className="description">
        <code>ChipInput</code> with custom object type. Demonstrates type safety with complex data.
      </p>
      <div className="input-wrapper">
        <ChipInput<Person>
          value={chips}
          onChange={setChips}
          onSearch={handleSearch}
          parseInput={(input) => ({
            value: { id: Date.now(), name: input, role: 'New Member' },
          })}
          formatValue={(person) => `${person.name} (${person.role})`}
          isEqual={(a, b) => a.id === b.id}
          placeholder="Add team members..."
          classNames={{
            container: 'chip-input-container chip-input-container--team',
            input: 'chip-input',
            chip: 'team-chip',
            chipSelected: 'team-chip--selected',
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

