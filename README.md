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
- **Email Validation**: Sync or async validation with visual feedback
- **Autocomplete**: Optional search-based suggestions dropdown
- **Accessibility**: Full ARIA support and screen reader friendly
- **Fully Customizable**: Complete control over styles via CSS classes
- **TypeScript**: Full type definitions included
- **Zero Dependencies**: Only React as a peer dependency

## Installation

```bash
npm install react-email-chip-input
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

### Custom Email Validation

```tsx
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.endsWith('@company.com');
};

<EmailChipInput
  value={chips}
  onChange={setChips}
  validateEmail={validateEmail}
/>;
```

### Async Validation

```tsx
const validateEmail = async (email: string): Promise<boolean> => {
  const response = await fetch(`/api/validate-email?email=${email}`);
  const { isValid } = await response.json();
  return isValid;
};

<EmailChipInput
  value={chips}
  onChange={setChips}
  validateEmail={validateEmail}
/>;
```

### With Autocomplete

```tsx
import { EmailChipInput, type Suggestion } from 'react-email-chip-input';

const handleSearch = async (query: string): Promise<Suggestion[]> => {
  const response = await fetch(`/api/contacts?q=${query}`);
  return response.json();
};

<EmailChipInput
  value={chips}
  onChange={setChips}
  onSearch={handleSearch}
  searchDebounceMs={300}
/>;
```

## API Reference

### Props

| Prop               | Type                                             | Default                      | Description                      |
| ------------------ | ------------------------------------------------ | ---------------------------- | -------------------------------- |
| `value`            | `EmailChipType[]`                                | **Required**                 | Current array of email chips     |
| `onChange`         | `(chips: EmailChipType[]) => void`               | **Required**                 | Callback when chips change       |
| `validateEmail`    | `(email: string) => boolean \| Promise<boolean>` | Default regex                | Custom email validation function |
| `onSearch`         | `(query: string) => Promise<Suggestion[]>`       | -                            | Async function for autocomplete  |
| `searchDebounceMs` | `number`                                         | `300`                        | Debounce delay for search (ms)   |
| `classNames`       | `EmailChipInputClassNames`                       | -                            | CSS class names for styling      |
| `placeholder`      | `string`                                         | `'Enter email addresses...'` | Input placeholder text           |
| `ariaLabel`        | `string`                                         | `'Email input'`              | Accessible label                 |
| `disabled`         | `boolean`                                        | `false`                      | Disable the input                |

### Types

```typescript
interface EmailChipType {
  id: string;
  email: string;
  label?: string;
  isValid: boolean;
}

interface Suggestion {
  id: string;
  email: string;
  label?: string;
}
```

## Keyboard Shortcuts

| Key         | Action                                                |
| ----------- | ----------------------------------------------------- |
| `Enter`     | Create chip from current input                        |
| `Tab`       | Create chip and move focus                            |
| `,` / `;`   | Create chip from current input                        |
| `Backspace` | Delete selected chip or last chip when input is empty |
| `Delete`    | Delete selected chip                                  |
| `←` / `→`   | Navigate between chips                                |
| `↑` / `↓`   | Navigate suggestions list                             |
| `Escape`    | Close suggestions and deselect chip                   |

## Styling

The component is unstyled by default. Use the `classNames` prop to apply your own styles.

See the complete **[Styling Guide](./docs/STYLING.md)** for:

- CSS Modules examples
- Tailwind CSS integration
- Dark mode support
- Animations
- Accessibility considerations

## Exports

### Components

- `EmailChipInput` - Main component
- `EmailChip` - Individual chip component
- `SuggestionsList` - Suggestions dropdown component

### Hooks

- `useChipNavigation` - Chip keyboard navigation
- `useEmailValidation` - Email validation logic
- `useSuggestions` - Autocomplete state management

### Utilities

- `defaultEmailValidator` - Default email regex
- `generateId` - Unique ID generator
- `parseEmailInput` - Input parsing
- `splitByDelimiters` - Multi-email parsing

## Browser Support

Chrome, Firefox, Safari, Edge (latest versions)

## Development

```bash
pnpm install      # Install dependencies
pnpm dev          # Start dev server
pnpm test         # Run tests
pnpm build:lib    # Build library
```

## License

MIT © [Leonardo Vitale](https://github.com/leonardovitale)
