import { describe, it, expect } from 'vitest';
import {
  generateId,
  containsDelimiter,
  splitByDelimiters,
  defaultFormatValue,
  defaultIsEqual,
  defaultNormalize,
  DEFAULT_DELIMITERS,
} from './chip-utils';

describe('generateId', () => {
  it('should return a non-empty string', () => {
    expect(generateId()).toBeTruthy();
  });

  it('should generate unique IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });
});

describe('containsDelimiter', () => {
  it('should return true when input contains comma', () => {
    expect(containsDelimiter('a, b', DEFAULT_DELIMITERS)).toBe(true);
  });

  it('should return true when input contains semicolon', () => {
    expect(containsDelimiter('a; b', DEFAULT_DELIMITERS)).toBe(true);
  });

  it('should return false when input has no delimiter', () => {
    expect(containsDelimiter('abc', DEFAULT_DELIMITERS)).toBe(false);
  });

  it('should work with custom delimiters', () => {
    expect(containsDelimiter('a|b', ['|'])).toBe(true);
    expect(containsDelimiter('a,b', ['|'])).toBe(false);
  });

  it('should use default delimiters when none provided', () => {
    expect(containsDelimiter('a, b')).toBe(true);
    expect(containsDelimiter('a; b')).toBe(true);
    expect(containsDelimiter('abc')).toBe(false);
  });
});

describe('splitByDelimiters', () => {
  it('should split by comma', () => {
    expect(splitByDelimiters('a, b, c')).toEqual(['a', 'b', 'c']);
  });

  it('should split by semicolon', () => {
    expect(splitByDelimiters('a; b; c')).toEqual(['a', 'b', 'c']);
  });

  it('should split by mixed delimiters', () => {
    expect(splitByDelimiters('a, b; c')).toEqual(['a', 'b', 'c']);
  });

  it('should trim whitespace', () => {
    expect(splitByDelimiters('  a  ,  b  ,  c  ')).toEqual(['a', 'b', 'c']);
  });

  it('should filter empty strings', () => {
    expect(splitByDelimiters('a, , b, , c')).toEqual(['a', 'b', 'c']);
  });

  it('should work with custom delimiters', () => {
    expect(splitByDelimiters('a|b|c', ['|'])).toEqual(['a', 'b', 'c']);
  });

  it('should escape special regex characters in delimiters', () => {
    expect(splitByDelimiters('a.b.c', ['.'])).toEqual(['a', 'b', 'c']);
    expect(splitByDelimiters('a+b+c', ['+'])).toEqual(['a', 'b', 'c']);
  });
});

describe('defaultFormatValue', () => {
  it('should convert string to string', () => {
    expect(defaultFormatValue('hello')).toBe('hello');
  });

  it('should convert number to string', () => {
    expect(defaultFormatValue(123)).toBe('123');
  });

  it('should convert object to string', () => {
    expect(defaultFormatValue({ a: 1 })).toBe('[object Object]');
  });
});

describe('defaultIsEqual', () => {
  it('should return true for equal primitives', () => {
    expect(defaultIsEqual('a', 'a')).toBe(true);
    expect(defaultIsEqual(1, 1)).toBe(true);
  });

  it('should return false for different primitives', () => {
    expect(defaultIsEqual('a', 'b')).toBe(false);
    expect(defaultIsEqual(1, 2)).toBe(false);
  });

  it('should use strict equality for objects', () => {
    const obj = { a: 1 };
    expect(defaultIsEqual(obj, obj)).toBe(true);
    expect(defaultIsEqual({ a: 1 }, { a: 1 })).toBe(false);
  });
});

describe('defaultNormalize', () => {
  it('should return the value unchanged', () => {
    expect(defaultNormalize('hello')).toBe('hello');
    expect(defaultNormalize(123)).toBe(123);
    const obj = { a: 1 };
    expect(defaultNormalize(obj)).toBe(obj);
  });
});

