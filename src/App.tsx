import { useState } from 'react';
import { EmailChipInput } from './components';
import type { EmailChipType, Suggestion } from './components';
import './App.css';

// Mock data for autocomplete suggestions
const mockContacts: Suggestion[] = [
  { id: '1', email: 'leonardo.vitale@xelix.com', label: 'Leonardo Tadeu Vitale' },
  { id: '2', email: 'john.doe@example.com', label: 'John Doe' },
  { id: '3', email: 'jane.smith@example.com', label: 'Jane Smith' },
  { id: '4', email: 'bob.wilson@company.org', label: 'Bob Wilson' },
  { id: '5', email: 'alice.johnson@startup.io', label: 'Alice Johnson' },
  { id: '6', email: 'carlos.santos@empresa.com.br', label: 'Carlos Santos' },
  { id: '7', email: 'maria.silva@empresa.com.br', label: 'Maria Silva' },
];

function App() {
  const [chips, setChips] = useState<EmailChipType[]>([
    { id: 'initial-1', email: 'leonardo.vitale@xelix.com', label: 'Leonardo Tadeu Vitale', isValid: true },
    { id: 'initial-2', email: 'leonardo.vitale@xelix.com', label: 'Leonardo Vitale', isValid: true },
  ]);

  // Simulated async search function
  const handleSearch = async (query: string): Promise<Suggestion[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 150));
    
    const lowerQuery = query.toLowerCase();
    return mockContacts.filter(
      (contact) =>
        contact.email.toLowerCase().includes(lowerQuery) ||
        contact.label?.toLowerCase().includes(lowerQuery)
    );
  };

  // Custom email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="app">
      <div className="email-compose">
        <div className="email-field">
          <span className="field-label">To</span>
          <div className="field-content">
            <EmailChipInput
              value={chips}
              onChange={setChips}
              validateEmail={validateEmail}
              onSearch={handleSearch}
              searchDebounceMs={300}
              placeholder=""
              ariaLabel="To recipients"
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
          <div className="field-actions">
            <button type="button" className="cc-btn">Cc</button>
            <button type="button" className="bcc-btn">Bcc</button>
          </div>
        </div>
      </div>

      <div className="debug-info">
        <h3>Current Chips:</h3>
        <pre>{JSON.stringify(chips, null, 2)}</pre>
      </div>
    </div>
  );
}

export default App;
