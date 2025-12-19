import { useState } from 'react';
import { EmailChipInput } from '../components';
import type { EmailChipType, Suggestion } from '../components';

const mockContacts: Suggestion[] = [
  { id: '1', email: 'leonardo.vitale@xelix.com', label: 'Leonardo Tadeu Vitale' },
  { id: '2', email: 'john.doe@example.com', label: 'John Doe' },
  { id: '3', email: 'jane.smith@example.com', label: 'Jane Smith' },
  { id: '4', email: 'bob.wilson@company.org', label: 'Bob Wilson' },
  { id: '5', email: 'alice.johnson@startup.io', label: 'Alice Johnson' },
];

export const EmailExample = () => {
  const [chips, setChips] = useState<EmailChipType[]>([
    { id: 'e1', email: 'john@example.com', label: 'John Doe', isValid: true },
  ]);

  const handleSearch = async (query: string): Promise<Suggestion[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const lowerQuery = query.toLowerCase();
    return mockContacts.filter(
      (contact) =>
        contact.email.toLowerCase().includes(lowerQuery) ||
        contact.label?.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    <section className="example-section">
      <h2>📧 Email Input</h2>
      <p className="description">
        Using the specialized <code>EmailChipInput</code> component with validation and autocomplete.
      </p>
      <div className="input-wrapper">
        <EmailChipInput
          value={chips}
          onChange={setChips}
          validateEmail={(email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
          onSearch={handleSearch}
          placeholder="Add email addresses..."
          classNames={{
            container: 'chip-input-container',
            input: 'chip-input',
            chip: 'email-chip',
            chipInvalid: 'email-chip--invalid',
            chipSelected: 'email-chip--selected',
            deleteButton: 'chip-delete-btn',
            suggestionsList: 'suggestions-list',
            suggestionItem: 'suggestion-item',
            suggestionItemHighlighted: 'suggestion-item--highlighted',
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

