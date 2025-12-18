import { useState } from 'react';
import { ChipInput } from '../components';
import type { ChipType } from '../components';

export const PhoneExample = () => {
  const [chips, setChips] = useState<ChipType<string>[]>([
    { id: 'ph1', value: '11999887766', isValid: true },
  ]);

  const validatePhone = (phone: string): boolean => {
    const digitsOnly = phone.replaceAll(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 11;
  };

  const formatPhone = (phone: string): string => {
    const digits = phone.replaceAll(/\D/g, '');
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  const parsePhoneInput = (input: string): { value: string } | null => {
    const digits = input.replaceAll(/\D/g, '');
    if (!digits) return null;
    return { value: digits };
  };

  return (
    <section className="example-section">
      <h2>📱 Phone Numbers</h2>
      <p className="description">
        <code>ChipInput</code> with custom validation (10-11 digits) and formatting.
      </p>
      <div className="input-wrapper">
        <ChipInput<string>
          value={chips}
          onChange={setChips}
          parseInput={parsePhoneInput}
          validate={validatePhone}
          formatValue={formatPhone}
          placeholder="Add phone numbers..."
          classNames={{
            container: 'chip-input-container chip-input-container--phone',
            input: 'chip-input',
            chip: 'phone-chip',
            chipInvalid: 'phone-chip--invalid',
            chipSelected: 'phone-chip--selected',
            deleteButton: 'chip-delete-btn',
          }}
        />
      </div>
      <div className="debug-box">
        <strong>State:</strong>
        <pre>{JSON.stringify(chips, null, 2)}</pre>
      </div>
    </section>
  );
};

