import { useState } from 'react';
import { EmailChipInput, ChipInput } from './components';
import type { EmailChipType, Suggestion, ChipType, ChipSuggestion } from './components';
import './App.css';

// =============================================================================
// Mock Data
// =============================================================================

// Email contacts for autocomplete
const mockContacts: Suggestion[] = [
  { id: '1', email: 'leonardo.vitale@xelix.com', label: 'Leonardo Tadeu Vitale' },
  { id: '2', email: 'john.doe@example.com', label: 'John Doe' },
  { id: '3', email: 'jane.smith@example.com', label: 'Jane Smith' },
  { id: '4', email: 'bob.wilson@company.org', label: 'Bob Wilson' },
  { id: '5', email: 'alice.johnson@startup.io', label: 'Alice Johnson' },
];

// Fruit suggestions for autocomplete
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

// =============================================================================
// Custom Type Example: Person
// =============================================================================

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

// =============================================================================
// App Component
// =============================================================================

function App() {
  // Email chips (using EmailChipInput wrapper)
  const [emailChips, setEmailChips] = useState<EmailChipType[]>([
    { id: 'e1', email: 'john@example.com', label: 'John Doe', isValid: true },
  ]);

  // Simple tags (no validation, no autocomplete)
  const [tagChips, setTagChips] = useState<ChipType<string>[]>([
    { id: 't1', value: 'react' },
    { id: 't2', value: 'typescript' },
  ]);

  // Phone numbers (with validation)
  const [phoneChips, setPhoneChips] = useState<ChipType<string>[]>([
    { id: 'ph1', value: '11999887766', isValid: true },
  ]);

  // Fruits (with autocomplete)
  const [fruitChips, setFruitChips] = useState<ChipType<string>[]>([
    { id: 'fr1', value: 'apple', label: '🍎 Apple' },
  ]);

  // Team members (custom object type)
  const [teamChips, setTeamChips] = useState<ChipType<Person>[]>([
    { id: 'tm1', value: { id: 1, name: 'Alice', role: 'Developer' }, label: 'Alice' },
  ]);

  // Custom delimiters demo
  const [delimiterChips, setDelimiterChips] = useState<ChipType<string>[]>([]);

  // =============================================================================
  // Handlers
  // =============================================================================

  // Email search
  const handleEmailSearch = async (query: string): Promise<Suggestion[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const lowerQuery = query.toLowerCase();
    return mockContacts.filter(
      (contact) =>
        contact.email.toLowerCase().includes(lowerQuery) ||
        contact.label?.toLowerCase().includes(lowerQuery)
    );
  };

  // Fruit search
  const handleFruitSearch = async (query: string): Promise<ChipSuggestion<string>[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const lowerQuery = query.toLowerCase();
    return fruitSuggestions.filter(
      (fruit) =>
        fruit.value.toLowerCase().includes(lowerQuery) ||
        fruit.label?.toLowerCase().includes(lowerQuery)
    );
  };

  // Team member search
  const handleTeamSearch = async (query: string): Promise<ChipSuggestion<Person>[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const lowerQuery = query.toLowerCase();
    return teamMembers.filter(
      (member) =>
        member.value.name.toLowerCase().includes(lowerQuery) ||
        member.value.role.toLowerCase().includes(lowerQuery)
    );
  };

  // Phone validation (Brazilian format: 11 digits)
  const validatePhone = (phone: string): boolean => {
    const digitsOnly = phone.replaceAll(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 11;
  };

  // Format phone for display
  const formatPhone = (phone: string): string => {
    const digits = phone.replaceAll(/\D/g, '');
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  // Parse phone input (extract only digits)
  const parsePhoneInput = (input: string): { value: string } | null => {
    const digits = input.replaceAll(/\D/g, '');
    if (!digits) return null;
    return { value: digits };
  };

  return (
    <div className="app">
      <h1>ChipInput Examples</h1>

      {/* Example 1: Email (using specialized EmailChipInput) */}
      <section className="example-section">
        <h2>📧 Email Input</h2>
        <p className="description">
          Using the specialized <code>EmailChipInput</code> component with validation and autocomplete.
        </p>
        <div className="input-wrapper">
          <EmailChipInput
            value={emailChips}
            onChange={setEmailChips}
            validateEmail={(email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
            onSearch={handleEmailSearch}
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
          <pre>{JSON.stringify(emailChips, null, 2)}</pre>
        </div>
      </section>

      {/* Example 2: Simple Tags (no validation, no autocomplete) */}
      <section className="example-section">
        <h2>🏷️ Simple Tags</h2>
        <p className="description">
          Basic <code>ChipInput</code> without validation or autocomplete. Just type and press Enter.
        </p>
        <div className="input-wrapper">
          <ChipInput<string>
            value={tagChips}
            onChange={setTagChips}
            placeholder="Add tags..."
            classNames={{
              container: 'chip-input-container chip-input-container--tags',
              input: 'chip-input',
              chip: 'tag-chip',
              chipSelected: 'tag-chip--selected',
              deleteButton: 'chip-delete-btn',
            }}
          />
        </div>
        <div className="debug-box">
          <strong>State:</strong>
          <pre>{JSON.stringify(tagChips, null, 2)}</pre>
        </div>
      </section>

      {/* Example 3: Phone Numbers (with validation) */}
      <section className="example-section">
        <h2>📱 Phone Numbers</h2>
        <p className="description">
          <code>ChipInput</code> with custom validation (10-11 digits) and formatting.
        </p>
        <div className="input-wrapper">
          <ChipInput<string>
            value={phoneChips}
            onChange={setPhoneChips}
            parseInput={parsePhoneInput}
            validate={validatePhone}
            formatValue={formatPhone}
            placeholder="Add phone numbers..."
            classNames={{
              container: 'chip-input-container chip-input-container--phone',
              input: 'chip-input',
              chip: 'phone-chip',
              chipInvalid: 'phone-chip--invalid',
              chipSelected: 'phone-chip--selected',
              deleteButton: 'chip-delete-btn',
            }}
          />
        </div>
        <div className="debug-box">
          <strong>State:</strong>
          <pre>{JSON.stringify(phoneChips, null, 2)}</pre>
        </div>
      </section>

      {/* Example 4: Fruits (with autocomplete) */}
      <section className="example-section">
        <h2>🍎 Fruits</h2>
        <p className="description">
          <code>ChipInput</code> with autocomplete suggestions. Start typing to see suggestions.
        </p>
        <div className="input-wrapper">
          <ChipInput<string>
            value={fruitChips}
            onChange={setFruitChips}
            onSearch={handleFruitSearch}
            formatValue={(value) => {
              const emoji: Record<string, string> = {
                apple: '🍎', banana: '🍌', orange: '🍊', strawberry: '🍓',
                grape: '🍇', watermelon: '🍉', mango: '🥭', pineapple: '🍍',
              };
              return `${emoji[value] || '🍏'} ${value.charAt(0).toUpperCase() + value.slice(1)}`;
            }}
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
            }}
          />
        </div>
        <div className="debug-box">
          <strong>State:</strong>
          <pre>{JSON.stringify(fruitChips, null, 2)}</pre>
        </div>
      </section>

      {/* Example 5: Team Members (custom object type) */}
      <section className="example-section">
        <h2>👥 Team Members</h2>
        <p className="description">
          <code>ChipInput</code> with custom object type. Demonstrates type safety with complex data.
        </p>
        <div className="input-wrapper">
          <ChipInput<Person>
            value={teamChips}
            onChange={setTeamChips}
            onSearch={handleTeamSearch}
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
            }}
          />
        </div>
        <div className="debug-box">
          <strong>State:</strong>
          <pre>{JSON.stringify(teamChips, null, 2)}</pre>
        </div>
      </section>

      {/* Example 6: Custom Delimiters */}
      <section className="example-section">
        <h2>🔧 Custom Delimiters</h2>
        <p className="description">
          <code>ChipInput</code> with custom delimiters. Try separating with <code>|</code> or <code>-</code>.
        </p>
        <div className="input-wrapper">
          <ChipInput<string>
            value={delimiterChips}
            onChange={setDelimiterChips}
            delimiters={['|', '-', ',']}
            placeholder="Type values separated by | or - or ,"
            classNames={{
              container: 'chip-input-container',
              input: 'chip-input',
              chip: 'tag-chip',
              chipSelected: 'tag-chip--selected',
              deleteButton: 'chip-delete-btn',
            }}
          />
        </div>
        <div className="debug-box">
          <strong>State:</strong>
          <pre>{JSON.stringify(delimiterChips, null, 2)}</pre>
        </div>
      </section>
    </div>
  );
}

export default App;
