import { useCallback, useRef, useEffect } from 'react';
import { defaultEmailValidator } from '../../utils/email-utils';

/**
 * Function type for email validation.
 * Can be synchronous (returning boolean) or asynchronous (returning Promise<boolean>).
 */
type ValidateEmailFn = (email: string) => boolean | Promise<boolean>;

/**
 * Configuration options for the useEmailValidation hook.
 */
interface UseEmailValidationOptions {
  /**
   * Custom email validation function.
   * If not provided, uses the default regex-based validator.
   * Can be synchronous or asynchronous.
   */
  validateEmail?: ValidateEmailFn;
}

/**
 * Return value from the useEmailValidation hook.
 */
interface UseEmailValidationReturn {
  /**
   * Asynchronously validate an email address.
   * Handles both sync and async validators transparently.
   */
  validate: (email: string) => Promise<boolean>;
  /**
   * Synchronously validate an email address.
   * If the validator is async, assumes valid and defers to async validation.
   */
  validateSync: (email: string) => boolean;
}

/**
 * Custom hook for email validation with support for both sync and async validators.
 *
 * Provides two validation methods:
 * - `validate`: Always returns a Promise, suitable for async workflows
 * - `validateSync`: Returns immediately, useful for UI feedback
 *
 * @param options - Configuration options
 * @param options.validateEmail - Optional custom validator function
 * @returns Object containing `validate` and `validateSync` functions
 *
 * @example
 * ```tsx
 * // Using default validator
 * const { validate } = useEmailValidation();
 * const isValid = await validate('user@example.com');
 *
 * // Using custom async validator
 * const { validate } = useEmailValidation({
 *   validateEmail: async (email) => {
 *     const response = await fetch(`/api/validate?email=${email}`);
 *     return response.ok;
 *   }
 * });
 * ```
 */
export const useEmailValidation = ({
  validateEmail,
}: UseEmailValidationOptions = {}): UseEmailValidationReturn => {
  const validatorRef = useRef<ValidateEmailFn>(validateEmail || defaultEmailValidator);

  // Keep validator ref updated using useEffect to avoid updating during render
  useEffect(() => {
    validatorRef.current = validateEmail || defaultEmailValidator;
  }, [validateEmail]);

  const validate = useCallback(async (email: string): Promise<boolean> => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return false;

    try {
      const result = validatorRef.current(trimmedEmail);
      // Handle both sync and async validators
      if (result instanceof Promise) {
        return await result;
      }
      return result;
    } catch {
      return false;
    }
  }, []);

  const validateSync = useCallback((email: string): boolean => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return false;

    try {
      const result = validatorRef.current(trimmedEmail);
      // For sync validation, we assume the validator is synchronous
      // If it returns a Promise, we assume valid and validate async later
      if (result instanceof Promise) {
        return true; // Assume valid, will be validated async
      }
      return result;
    } catch {
      return false;
    }
  }, []);

  return {
    validate,
    validateSync,
  };
};

