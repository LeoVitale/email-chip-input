# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-12-13

### Added

- Initial release of `react-email-chip-input`
- `EmailChipInput` component with full functionality:
  - Chip creation via Enter, Tab, comma, semicolon, or blur
  - Multi-email paste support with automatic delimiter splitting
  - Keyboard navigation between chips (arrow keys)
  - Chip deletion via Backspace/Delete keys
  - Sync and async email validation support
  - Visual feedback for invalid emails
  - Optional autocomplete with async search
  - Full ARIA accessibility support
  - Customizable styling via CSS class names
- `EmailChip` component for individual chip rendering
- `SuggestionsList` component for autocomplete dropdown
- Custom hooks:
  - `useChipNavigation` for keyboard navigation logic
  - `useEmailValidation` for validation handling
  - `useSuggestions` for autocomplete state management
- Utility functions:
  - `defaultEmailValidator` for standard email validation
  - `generateId` for unique ID generation
  - `parseEmailInput` for input parsing
  - `containsDelimiter` for delimiter detection
  - `splitByDelimiters` for multi-email parsing
- Full TypeScript support with exported types
- ESM and CJS builds
- Comprehensive documentation

### Technical

- Built with React 18+ support (including React 19)
- Zero runtime dependencies (React as peer dependency only)
- Tree-shakable exports
- Source maps included
- Vitest test suite with full coverage

[Unreleased]: https://github.com/leonardovitale/react-email-chip-input/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/leonardovitale/react-email-chip-input/releases/tag/v1.0.0
