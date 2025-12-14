# Styling Guide

This guide covers all aspects of customizing the appearance of `react-email-chip-input`.

## Overview

The component is completely unstyled by default, giving you full control over its appearance. Styling is applied through the `classNames` prop, which accepts CSS class names for each element of the component.

## Class Names Reference

The `EmailChipInputClassNames` interface defines all available styling targets:

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

## Component Structure

Understanding the DOM structure helps with styling:

```
container
├── chip (for each email)
│   ├── chip content (email/label)
│   └── deleteButton
├── input
└── suggestionsList (when visible)
    └── suggestionItem (for each suggestion)
```

## Styling with CSS Modules

The recommended approach for styling is using CSS Modules:

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

## Complete CSS Example

Here's a complete CSS Module example (`EmailInput.module.css`):

```css
/* Container - wraps all chips and input */
.container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  min-height: 48px;
  background: #fff;
  position: relative; /* Required for suggestions positioning */
  transition: border-color 0.2s, box-shadow 0.2s;
}

.container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Input field */
.input {
  flex: 1;
  min-width: 200px;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
}

.input::placeholder {
  color: #94a3b8;
}

/* Email chips */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 12px;
  background: #e2e8f0;
  border-radius: 16px;
  font-size: 14px;
  color: #334155;
  transition: background-color 0.2s;
}

.chip:hover {
  background: #cbd5e1;
}

/* Invalid email chip */
.chipInvalid {
  background: #fee2e2;
  color: #dc2626;
}

.chipInvalid:hover {
  background: #fecaca;
}

/* Selected chip (keyboard navigation) */
.chipSelected {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
}

/* Delete button inside chip */
.deleteButton {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s, background-color 0.2s;
}

.deleteButton:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

.deleteButton:focus {
  outline: none;
  opacity: 1;
}

/* Suggestions dropdown */
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

/* Individual suggestion item */
.suggestionItem {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.suggestionItem:hover {
  background: #f1f5f9;
}

/* Highlighted suggestion (keyboard navigation) */
.suggestionHighlighted {
  background: #e2e8f0;
}
```

## Styling with Tailwind CSS

You can use Tailwind CSS classes directly:

```tsx
<EmailChipInput
  value={chips}
  onChange={setChips}
  classNames={{
    container: 'flex flex-wrap gap-2 p-3 border-2 border-gray-200 rounded-lg min-h-12 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100',
    input: 'flex-1 min-w-48 border-none outline-none text-sm bg-transparent placeholder:text-gray-400',
    chip: 'inline-flex items-center gap-1.5 px-3 py-1 bg-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-300',
    chipInvalid: 'bg-red-100 text-red-600 hover:bg-red-200',
    chipSelected: 'ring-2 ring-blue-500 ring-offset-1',
    deleteButton: 'flex items-center justify-center w-4 h-4 rounded-full opacity-60 hover:opacity-100 hover:bg-black/10',
    suggestionsList: 'absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50',
    suggestionItem: 'px-3 py-2 cursor-pointer hover:bg-gray-100',
    suggestionItemHighlighted: 'bg-gray-200',
  }}
/>
```

## Styling with styled-components

```tsx
import styled from 'styled-components';
import { EmailChipInput } from 'react-email-chip-input';

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  
  &:focus-within {
    border-color: #3b82f6;
  }
`;

// Generate class names
const containerClass = 'email-container';

// Apply styles globally or use CSS-in-JS solution
```

## Dark Mode Example

```css
/* Dark mode styles */
@media (prefers-color-scheme: dark) {
  .container {
    background: #1e293b;
    border-color: #475569;
  }

  .container:focus-within {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
  }

  .input {
    color: #f1f5f9;
  }

  .input::placeholder {
    color: #64748b;
  }

  .chip {
    background: #334155;
    color: #e2e8f0;
  }

  .chip:hover {
    background: #475569;
  }

  .chipInvalid {
    background: #7f1d1d;
    color: #fca5a5;
  }

  .suggestions {
    background: #1e293b;
    border-color: #475569;
  }

  .suggestionItem:hover {
    background: #334155;
  }

  .suggestionHighlighted {
    background: #475569;
  }
}
```

## Responsive Design

```css
/* Mobile-first responsive styles */
.container {
  padding: 8px;
  gap: 6px;
}

.input {
  min-width: 150px;
  font-size: 16px; /* Prevents zoom on iOS */
}

.chip {
  font-size: 13px;
  padding: 3px 6px 3px 10px;
}

@media (min-width: 640px) {
  .container {
    padding: 12px;
    gap: 8px;
  }

  .input {
    min-width: 200px;
    font-size: 14px;
  }

  .chip {
    font-size: 14px;
    padding: 4px 8px 4px 12px;
  }
}
```

## Animation Examples

```css
/* Chip enter animation */
.chip {
  animation: chipEnter 0.2s ease-out;
}

@keyframes chipEnter {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Suggestions slide-in */
.suggestions {
  animation: slideIn 0.15s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Delete button rotation on hover */
.deleteButton {
  transition: transform 0.2s;
}

.deleteButton:hover {
  transform: rotate(90deg);
}
```

## Accessibility Considerations

When styling, keep accessibility in mind:

1. **Focus indicators**: Always maintain visible focus states
2. **Color contrast**: Ensure sufficient contrast ratios (WCAG 2.1 AA)
3. **Touch targets**: Minimum 44x44px for touch devices
4. **Motion**: Respect `prefers-reduced-motion`

```css
/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .chip,
  .suggestions,
  .deleteButton {
    animation: none;
    transition: none;
  }
}

/* Ensure focus visibility */
.chip:focus-visible,
.deleteButton:focus-visible,
.suggestionItem:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

## Tips

1. **Container positioning**: Set `position: relative` on the container for proper suggestions dropdown positioning
2. **Z-index**: Ensure the suggestions dropdown has a high enough z-index to appear above other elements
3. **Overflow**: Use `overflow-y: auto` on suggestions for scrollable long lists
4. **Transitions**: Add smooth transitions for hover and focus states
5. **Touch devices**: Increase padding/sizing for better touch targets on mobile

