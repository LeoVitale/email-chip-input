import { useCallback, useRef } from 'react';
import { defaultEmailValidator } from '../utils/email-utils';

type ValidateEmailFn = (email: string) => boolean | Promise<boolean>;

interface UseEmailValidationOptions {
  validateEmail?: ValidateEmailFn;
}

interface UseEmailValidationReturn {
  validate: (email: string) => Promise<boolean>;
  validateSync: (email: string) => boolean;
}

export const useEmailValidation = ({
  validateEmail,
}: UseEmailValidationOptions = {}): UseEmailValidationReturn => {
  const validatorRef = useRef<ValidateEmailFn>(validateEmail || defaultEmailValidator);

  // Keep validator ref updated
  validatorRef.current = validateEmail || defaultEmailValidator;

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

