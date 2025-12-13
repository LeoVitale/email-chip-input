import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEmailValidation } from './use-email-validation';

describe('useEmailValidation', () => {
  describe('validate (async)', () => {
    it('should validate email using default validator', async () => {
      const { result } = renderHook(() => useEmailValidation());

      const isValid = await result.current.validate('user@example.com');
      expect(isValid).toBe(true);

      const isInvalid = await result.current.validate('invalid-email');
      expect(isInvalid).toBe(false);
    });

    it('should use custom sync validator', async () => {
      const customValidator = vi.fn((email: string) => email.endsWith('@company.com'));
      const { result } = renderHook(() =>
        useEmailValidation({ validateEmail: customValidator })
      );

      const isValid = await result.current.validate('user@company.com');
      expect(isValid).toBe(true);
      expect(customValidator).toHaveBeenCalledWith('user@company.com');

      const isInvalid = await result.current.validate('user@other.com');
      expect(isInvalid).toBe(false);
    });

    it('should use custom async validator', async () => {
      const asyncValidator = vi.fn(async (email: string) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return email.includes('@');
      });
      const { result } = renderHook(() =>
        useEmailValidation({ validateEmail: asyncValidator })
      );

      const isValid = await result.current.validate('user@example.com');
      expect(isValid).toBe(true);
      expect(asyncValidator).toHaveBeenCalledWith('user@example.com');
    });

    it('should return false for empty email', async () => {
      const { result } = renderHook(() => useEmailValidation());

      expect(await result.current.validate('')).toBe(false);
      expect(await result.current.validate('   ')).toBe(false);
    });

    it('should return false when validator throws', async () => {
      const throwingValidator = vi.fn(() => {
        throw new Error('Validation failed');
      });
      const { result } = renderHook(() =>
        useEmailValidation({ validateEmail: throwingValidator })
      );

      const isValid = await result.current.validate('user@example.com');
      expect(isValid).toBe(false);
    });
  });

  describe('validateSync', () => {
    it('should validate email synchronously', () => {
      const { result } = renderHook(() => useEmailValidation());

      expect(result.current.validateSync('user@example.com')).toBe(true);
      expect(result.current.validateSync('invalid')).toBe(false);
    });

    it('should return true for async validators (assumes valid)', () => {
      const asyncValidator = vi.fn(async () => false);
      const { result } = renderHook(() =>
        useEmailValidation({ validateEmail: asyncValidator })
      );

      // When validator returns a Promise, validateSync assumes valid
      expect(result.current.validateSync('user@example.com')).toBe(true);
    });

    it('should return false for empty email', () => {
      const { result } = renderHook(() => useEmailValidation());

      expect(result.current.validateSync('')).toBe(false);
      expect(result.current.validateSync('   ')).toBe(false);
    });
  });

  describe('validator updates', () => {
    it('should use updated validator when prop changes', async () => {
      const validator1 = vi.fn(() => true);
      const validator2 = vi.fn(() => false);

      const { result, rerender } = renderHook(
        ({ validateEmail }) => useEmailValidation({ validateEmail }),
        { initialProps: { validateEmail: validator1 } }
      );

      await result.current.validate('test@example.com');
      expect(validator1).toHaveBeenCalled();

      rerender({ validateEmail: validator2 });

      await result.current.validate('test@example.com');
      expect(validator2).toHaveBeenCalled();
    });
  });
});

