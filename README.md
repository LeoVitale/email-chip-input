# react-email-chip-input

[![npm version](https://img.shields.io/npm/v/react-email-chip-input.svg)](https://www.npmjs.com/package/react-email-chip-input)
[![npm downloads](https://img.shields.io/npm/dm/react-email-chip-input.svg)](https://www.npmjs.com/package/react-email-chip-input)
[![license](https://img.shields.io/npm/l/react-email-chip-input.svg)](https://github.com/leonardovitale/react-email-chip-input/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A fully customizable, accessible email chip input component for React. Perfect for email recipient fields, tag inputs, and multi-value text inputs.

## Features

- **Chip Creation**: Create chips with Enter, Tab, comma, semicolon, or on blur
- **Multi-Email Paste**: Automatically splits pasted text by common delimiters
- **Keyboard Navigation**: Full arrow key navigation between chips
- **Chip Deletion**: Remove chips with Backspace or Delete keys
- **Email Validation**: Sync or async validation with visual feedback
- **Autocomplete**: Optional search-based suggestions dropdown
- **Accessibility**: Full ARIA support and screen reader friendly
- **Fully Customizable**: Complete control over styles via CSS classes
- **TypeScript**: Written in TypeScript with full type definitions
- **Zero Dependencies**: Only React as a peer dependency
- **Tree-Shakable**: ESM and CJS builds with proper exports

## Installation

```bash
# npm
npm install react-email-chip-input

# yarn
yarn add react-email-chip-input

# pnpm
pnpm add react-email-chip-input
```

## Quick Start

```tsx
import { useState } from 'react';
import { EmailChipInput, type EmailChipType } from 'react-email-chip-input';

function App() {
  const [chips, setChips] = useState<EmailChipType[]>([]);

  return (
    <EmailChipInput
      value={chips}
      onChange={setChips}
      placeholder='Enter email addresses...'
    />
  );
}
```

## Examples

### Basic Usage

```tsx
import { useState } from 'react';
import { EmailChipInput, type EmailChipType } from 'react-email-chip-input';

function BasicExample() {
  const [chips, setChips] = useState<EmailChipType[]>([]);

  return (
    <div>
      <EmailChipInput
        value={chips}
        onChange={setChips}
        placeholder='Add recipients...'
      />
      <p>Selected: {chips.map((c) => c.email).join(', ')}</p>
    </div>
  );
}
```

### With Custom Validation

```tsx
import { useState } from 'react';
import { EmailChipInput, type EmailChipType } from 'react-email-chip-input';

function ValidationExample() {
  const [chips, setChips] = useState<EmailChipType[]>([]);

  // Only allow company emails
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.endsWith('@company.com');
  };

  return (
    <EmailChipInput
      value={chips}
      onChange={setChips}
      validateEmail={validateEmail}
      placeholder='Enter company email addresses...'
    />
  );
}
```

### With Async Validation

```tsx
import { useState } from 'react';
import { EmailChipInput, type EmailChipType } from 'react-email-chip-input';

function AsyncValidationExample() {
  const [chips, setChips] = useState<EmailChipType[]>([]);

  // Check email against an API
  const validateEmail = async (email: string): Promise<boolean> => {
    const response = await fetch(`/api/validate-email?email=${email}`);
    const { isValid } = await response.json();
    return isValid;
  };

  return (
    <EmailChipInput
      value={chips}
      onChange={setChips}
      validateEmail={validateEmail}
      placeholder='Enter email addresses...'
    />
  );
}
```

### With Autocomplete

```tsx
import { useState } from 'react';
import {
  EmailChipInput,
  type EmailChipType,
  type Suggestion,
} from 'react-email-chip-input';

const contacts: Suggestion[] = [
  { id: '1', email: 'john@example.com', label: 'John Doe' },
  { id: '2', email: 'jane@example.com', label: 'Jane Smith' },
  { id: '3', email: 'bob@example.com', label: 'Bob Wilson' },
];

function AutocompleteExample() {
  const [chips, setChips] = useState<EmailChipType[]>([]);

  const handleSearch = async (query: string): Promise<Suggestion[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const lowerQuery = query.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.email.toLowerCase().includes(lowerQuery) ||
        contact.label?.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    <EmailChipInput
      value={chips}
      onChange={setChips}
      onSearch={handleSearch}
      searchDebounceMs={300}
      placeholder='Search contacts...'
    />
  );
}
```

### With Custom Styling

```tsx
import { useState } from 'react';
import { EmailChipInput, type EmailChipType } from 'react-email-chip-input';
import styles from './EmailInput.module.css';

function StyledExample() {
  const [chips, setChips] = useState<EmailChipType[]>([]);

  return (
    <EmailChipInput
      value={chips}
      onChange={setChips}
      classNames={{
        container: styles.container,
        input: styles.input,
        chip: styles.chip,
        chipInvalid: styles.chipInvalid,
        chipSelected: styles.chipSelected,
        deleteButton: styles.deleteButton,
        suggestionsList: styles.suggestions,
        suggestionItem: styles.suggestionItem,
        suggestionItemHighlighted: styles.suggestionHighlighted,
      }}
      placeholder='Add recipients...'
    />
  );
}
```

Example CSS Module (`EmailInput.module.css`):

```css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  min-height: 48px;
  background: #fff;
}

.container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input {
  flex: 1;
  min-width: 200px;
  border: none;
  outline: none;
  font-size: 14px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #e2e8f0;
  border-radius: 16px;
  font-size: 14px;
}

.chipInvalid {
  background: #fee2e2;
  color: #dc2626;
}

.chipSelected {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
}

.deleteButton {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.6;
}

.deleteButton:hover {
  opacity: 1;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
}

.suggestionItem {
  padding: 10px 12px;
  cursor: pointer;
}

.suggestionItem:hover {
  background: #f1f5f9;
}

.suggestionHighlighted {
  background: #e2e8f0;
}
```

## API Reference

### EmailChipInput Props

| Prop               | Type                                             | Default                      | Description                                         |
| ------------------ | ------------------------------------------------ | ---------------------------- | --------------------------------------------------- |
| `value`            | `EmailChipType[]`                                | **Required**                 | Current array of email chips (controlled component) |
| `onChange`         | `(chips: EmailChipType[]) => void`               | **Required**                 | Callback when chips change                          |
| `validateEmail`    | `(email: string) => boolean \| Promise<boolean>` | Default regex                | Custom email validation function                    |
| `onSearch`         | `(query: string) => Promise<Suggestion[]>`       | -                            | Async function to search for suggestions            |
| `searchDebounceMs` | `number`                                         | `300`                        | Debounce delay for search in milliseconds           |
| `classNames`       | `EmailChipInputClassNames`                       | -                            | Custom CSS class names for styling                  |
| `placeholder`      | `string`                                         | `'Enter email addresses...'` | Placeholder text for input                          |
| `ariaLabel`        | `string`                                         | `'Email input'`              | Accessible label for the input                      |
| `disabled`         | `boolean`                                        | `false`                      | Whether the input is disabled                       |

### Types

#### EmailChipType

```typescript
interface EmailChipType {
  /** Unique identifier for the chip */
  id: string;
  /** The email address */
  email: string;
  /** Optional display label (e.g., person's name) */
  label?: string;
  /** Whether the email passed validation */
  isValid: boolean;
}
```

#### Suggestion

```typescript
interface Suggestion {
  /** Unique identifier for the suggestion */
  id: string;
  /** The email address */
  email: string;
  /** Optional display label (e.g., person's name) */
  label?: string;
}
```

#### EmailChipInputClassNames

```typescript
interface EmailChipInputClassNames {
  /** Class for the outer container element */
  container?: string;
  /** Class for the text input element */
  input?: string;
  /** Base class for email chips */
  chip?: string;
  /** Class applied to chips with invalid emails */
  chipInvalid?: string;
  /** Class applied to the currently selected chip */
  chipSelected?: string;
  /** Class for the delete button within chips */
  deleteButton?: string;
  /** Class for the suggestions dropdown container */
  suggestionsList?: string;
  /** Class for individual suggestion items */
  suggestionItem?: string;
  /** Class for the highlighted/focused suggestion */
  suggestionItemHighlighted?: string;
}
```

## Keyboard Shortcuts

| Key         | Action                                                |
| ----------- | ----------------------------------------------------- |
| `Enter`     | Create chip from current input                        |
| `Tab`       | Create chip from current input and move focus         |
| `,`         | Create chip from current input                        |
| `;`         | Create chip from current input                        |
| `Backspace` | Delete selected chip or last chip when input is empty |
| `Delete`    | Delete selected chip                                  |
| `←` / `→`   | Navigate between chips                                |
| `↑` / `↓`   | Navigate suggestions list                             |
| `Escape`    | Close suggestions and deselect chip                   |

## Exports

The library exports the following:

### Components

- `EmailChipInput` - Main component
- `EmailChip` - Individual chip component
- `SuggestionsList` - Suggestions dropdown component

### Hooks

- `useChipNavigation` - Hook for chip keyboard navigation
- `useEmailValidation` - Hook for email validation logic
- `useSuggestions` - Hook for autocomplete suggestions

### Utilities

- `defaultEmailValidator` - Default email validation regex
- `generateId` - Utility to generate unique IDs
- `parseEmailInput` - Parse and clean email input
- `containsDelimiter` - Check if string contains delimiters
- `splitByDelimiters` - Split string by email delimiters

### Types

- `EmailChipType` - Type for email chip data
- `EmailChipInputProps` - Props for EmailChipInput
- `EmailChipProps` - Props for EmailChip
- `EmailChipInputClassNames` - Styling class names
- `Suggestion` - Type for autocomplete suggestions
- `SuggestionsListProps` - Props for SuggestionsList

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Build library
pnpm build:lib

# Lint code
pnpm lint
```

## License

MIT © [Leonardo Vitale](https://github.com/leonardovitale)

---

Made with ❤️ for the React community
