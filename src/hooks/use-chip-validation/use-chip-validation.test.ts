import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useChipValidation } from './use-chip-validation';

describe('useChipValidation', () => {
  describe('without validator', () => {
    it('should return hasValidator as false', () => {
      const { result } = renderHook(() => useChipValidation<string>());
      expect(result.current.hasValidator).toBe(false);
    });

    it('should validate any value as true', async () => {
      const { result } = renderHook(() => useChipValidation<string>());
      const isValid = await result.current.validate('anything');
      expect(isValid).toBe(true);
    });

    it('should validateSync any value as true', () => {
      const { result } = renderHook(() => useChipValidation<string>());
      const isValid = result.current.validateSync('anything');
      expect(isValid).toBe(true);
    });
  });

  describe('with sync validator', () => {
    it('should return hasValidator as true', () => {
      const validator = (value: string) => value.length >= 3;
      const { result } = renderHook(() =>
        useChipValidation<string>({ validate: validator })
      );
      expect(result.current.hasValidator).toBe(true);
    });

    it('should validate correctly', async () => {
      const validator = (value: string) => value.length >= 3;
      const { result } = renderHook(() =>
        useChipValidation<string>({ validate: validator })
      );

      expect(await result.current.validate('ab')).toBe(false);
      expect(await result.current.validate('abc')).toBe(true);
    });

    it('should validateSync correctly', () => {
      const validator = (value: string) => value.length >= 3;
      const { result } = renderHook(() =>
        useChipValidation<string>({ validate: validator })
      );

      expect(result.current.validateSync('ab')).toBe(false);
      expect(result.current.validateSync('abc')).toBe(true);
    });
  });

  describe('with async validator', () => {
    it('should validate correctly', async () => {
      const validator = vi.fn().mockImplementation(async (value: string) => {
        return value.length >= 3;
      });
      const { result } = renderHook(() =>
        useChipValidation<string>({ validate: validator })
      );

      expect(await result.current.validate('ab')).toBe(false);
      expect(await result.current.validate('abc')).toBe(true);
    });

    it('should validateSync return true for async validators (assumes valid)', () => {
      const validator = vi.fn().mockImplementation(async (value: string) => {
        return value.length >= 3;
      });
      const { result } = renderHook(() =>
        useChipValidation<string>({ validate: validator })
      );

      // Async validators always return true in sync mode
      expect(result.current.validateSync('ab')).toBe(true);
      expect(result.current.validateSync('abc')).toBe(true);
    });
  });

  describe('with custom types', () => {
    interface PhoneNumber {
      countryCode: string;
      number: string;
    }

    it('should work with object types', async () => {
      const validator = (phone: PhoneNumber) =>
        phone.number.length >= 10;
      const { result } = renderHook(() =>
        useChipValidation<PhoneNumber>({ validate: validator })
      );

      expect(
        await result.current.validate({ countryCode: '+1', number: '123' })
      ).toBe(false);
      expect(
        await result.current.validate({ countryCode: '+1', number: '1234567890' })
      ).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should return false when validator throws', async () => {
      const validator = () => {
        throw new Error('Validation error');
      };
      const { result } = renderHook(() =>
        useChipValidation<string>({ validate: validator })
      );

      expect(await result.current.validate('test')).toBe(false);
    });

    it('should return false when async validator rejects', async () => {
      const validator = async () => {
        throw new Error('Async validation error');
      };
      const { result } = renderHook(() =>
        useChipValidation<string>({ validate: validator })
      );

      expect(await result.current.validate('test')).toBe(false);
    });

    it('should return false when sync validation throws', () => {
      const validator = () => {
        throw new Error('Validation error');
      };
      const { result } = renderHook(() =>
        useChipValidation<string>({ validate: validator })
      );

      expect(result.current.validateSync('test')).toBe(false);
    });
  });

  describe('validator update', () => {
    it('should use updated validator', async () => {
      const validator1 = (value: string) => value.length >= 3;
      const validator2 = (value: string) => value.length >= 5;

      const { result, rerender } = renderHook(
        ({ validate }) => useChipValidation<string>({ validate }),
        { initialProps: { validate: validator1 } }
      );

      expect(await result.current.validate('abc')).toBe(true);

      rerender({ validate: validator2 });

      await waitFor(async () => {
        expect(await result.current.validate('abc')).toBe(false);
        expect(await result.current.validate('abcde')).toBe(true);
      });
    });
  });
});

