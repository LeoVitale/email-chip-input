import { useCallback, useRef, useEffect } from 'react';

/**
 * Function type for value validation.
 * Can be synchronous (returning boolean) or asynchronous (returning Promise<boolean>).
 *
 * @typeParam TValue - The type of value to validate
 */
type ValidateFn<TValue> = (value: TValue) => boolean | Promise<boolean>;

/**
 * Configuration options for the useChipValidation hook.
 *
 * @typeParam TValue - The type of value to validate
 */
interface UseChipValidationOptions<TValue> {
  /**
   * Custom validation function.
   * Can be synchronous or asynchronous.
   * If not provided, all values are considered valid.
   */
  validate?: ValidateFn<TValue>;
}

/**
 * Return value from the useChipValidation hook.
 */
interface UseChipValidationReturn<TValue> {
  /**
   * Asynchronously validate a value.
   * Handles both sync and async validators transparently.
   * Returns true if no validator is provided.
   */
  validate: (value: TValue) => Promise<boolean>;
  /**
   * Synchronously validate a value.
   * If the validator is async, assumes valid and defers to async validation.
   * Returns true if no validator is provided.
   */
  validateSync: (value: TValue) => boolean;
  /**
   * Whether a validator function is provided.
   */
  hasValidator: boolean;
}

/**
 * Custom hook for generic value validation with support for both sync and async validators.
 *
 * Provides two validation methods:
 * - `validate`: Always returns a Promise, suitable for async workflows
 * - `validateSync`: Returns immediately, useful for UI feedback
 *
 * Unlike useEmailValidation, this hook has no default validator.
 * If no validate function is provided, all values are considered valid.
 *
 * @typeParam TValue - The type of value to validate
 * @param options - Configuration options
 * @param options.validate - Optional custom validator function
 * @returns Object containing `validate`, `validateSync`, and `hasValidator`
 *
 * @example
 * ```tsx
 * // Without validator (all values valid)
 * const { validate, hasValidator } = useChipValidation<string>();
 * console.log(hasValidator); // false
 * const isValid = await validate('anything'); // true
 *
 * // With sync validator
 * const { validate } = useChipValidation<string>({
 *   validate: (value) => value.length >= 3
 * });
 * const isValid = await validate('ab'); // false
 *
 * // With async validator
 * const { validate } = useChipValidation<string>({
 *   validate: async (value) => {
 *     const response = await fetch(`/api/validate?value=${value}`);
 *     return response.ok;
 *   }
 * });
 * ```
 */
export const useChipValidation = <TValue = string>({
  validate: validateFn,
}: UseChipValidationOptions<TValue> = {}): UseChipValidationReturn<TValue> => {
  const validatorRef = useRef<ValidateFn<TValue> | undefined>(validateFn);

  // Keep validator ref updated using useEffect to avoid updating during render
  useEffect(() => {
    validatorRef.current = validateFn;
  }, [validateFn]);

  const hasValidator = validateFn !== undefined;

  const validate = useCallback(async (value: TValue): Promise<boolean> => {
    // If no validator, all values are valid
    if (!validatorRef.current) {
      return true;
    }

    try {
      const result = validatorRef.current(value);
      // Handle both sync and async validators
      if (result instanceof Promise) {
        return await result;
      }
      return result;
    } catch {
      return false;
    }
  }, []);

  const validateSync = useCallback((value: TValue): boolean => {
    // If no validator, all values are valid
    if (!validatorRef.current) {
      return true;
    }

    try {
      const result = validatorRef.current(value);
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
    hasValidator,
  };
};

