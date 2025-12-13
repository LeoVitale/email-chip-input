import { describe, it, expect } from 'vitest';
import {
  defaultEmailValidator,
  generateId,
  parseEmailInput,
  containsDelimiter,
  splitByDelimiters,
} from '../email-utils';

describe('defaultEmailValidator', () => {
  it('should return true for valid email addresses', () => {
    expect(defaultEmailValidator('user@example.com')).toBe(true);
    expect(defaultEmailValidator('john.doe@company.org')).toBe(true);
    expect(defaultEmailValidator('test+label@domain.io')).toBe(true);
  });

  it('should return false for invalid email addresses', () => {
    expect(defaultEmailValidator('invalid')).toBe(false);
    expect(defaultEmailValidator('no@domain')).toBe(false);
    expect(defaultEmailValidator('@nodomain.com')).toBe(false);
    expect(defaultEmailValidator('spaces in@email.com')).toBe(false);
    expect(defaultEmailValidator('')).toBe(false);
  });

  it('should trim whitespace before validation', () => {
    expect(defaultEmailValidator('  user@example.com  ')).toBe(true);
    expect(defaultEmailValidator('\tuser@example.com\n')).toBe(true);
  });
});

describe('generateId', () => {
  it('should return a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('should return unique IDs on each call', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });
});

describe('parseEmailInput', () => {
  it('should parse plain email addresses', () => {
    const result = parseEmailInput('user@example.com');
    expect(result).toEqual({ email: 'user@example.com' });
  });

  it('should parse "Name <email>" format', () => {
    const result = parseEmailInput('John Doe <john@example.com>');
    expect(result).toEqual({
      email: 'john@example.com',
      label: 'John Doe',
    });
  });

  it('should handle names with special characters', () => {
    const result = parseEmailInput('O\'Brien, James <james@example.com>');
    expect(result).toEqual({
      email: 'james@example.com',
      label: 'O\'Brien, James',
    });
  });

  it('should trim whitespace', () => {
    expect(parseEmailInput('  user@example.com  ')).toEqual({
      email: 'user@example.com',
    });
    expect(parseEmailInput('  John Doe  <john@example.com>  ')).toEqual({
      email: 'john@example.com',
      label: 'John Doe',
    });
  });

  it('should handle email-only input without angle brackets', () => {
    const result = parseEmailInput('simple@test.com');
    expect(result.email).toBe('simple@test.com');
    expect(result.label).toBeUndefined();
  });
});

describe('containsDelimiter', () => {
  it('should return true for strings containing comma', () => {
    expect(containsDelimiter('a@test.com, b@test.com')).toBe(true);
    expect(containsDelimiter(',')).toBe(true);
  });

  it('should return true for strings containing semicolon', () => {
    expect(containsDelimiter('a@test.com; b@test.com')).toBe(true);
    expect(containsDelimiter(';')).toBe(true);
  });

  it('should return false for strings without delimiters', () => {
    expect(containsDelimiter('user@example.com')).toBe(false);
    expect(containsDelimiter('John Doe <john@example.com>')).toBe(false);
    expect(containsDelimiter('')).toBe(false);
  });
});

describe('splitByDelimiters', () => {
  it('should split by comma', () => {
    const result = splitByDelimiters('a@test.com, b@test.com, c@test.com');
    expect(result).toEqual(['a@test.com', 'b@test.com', 'c@test.com']);
  });

  it('should split by semicolon', () => {
    const result = splitByDelimiters('a@test.com; b@test.com; c@test.com');
    expect(result).toEqual(['a@test.com', 'b@test.com', 'c@test.com']);
  });

  it('should split by mixed delimiters', () => {
    const result = splitByDelimiters('a@test.com, b@test.com; c@test.com');
    expect(result).toEqual(['a@test.com', 'b@test.com', 'c@test.com']);
  });

  it('should trim whitespace from results', () => {
    const result = splitByDelimiters('  a@test.com  ,  b@test.com  ');
    expect(result).toEqual(['a@test.com', 'b@test.com']);
  });

  it('should filter out empty strings', () => {
    const result = splitByDelimiters('a@test.com,,, b@test.com');
    expect(result).toEqual(['a@test.com', 'b@test.com']);
  });

  it('should return empty array for empty input', () => {
    expect(splitByDelimiters('')).toEqual([]);
    expect(splitByDelimiters('   ')).toEqual([]);
  });
});

