import { useState } from 'react';
import { ChipInput } from '../components';
import type { ChipType } from '../components';

export const DelimitersExample = () => {
  const [chips, setChips] = useState<ChipType<string>[]>([]);

  return (
    <section className="example-section">
      <h2>🔧 Custom Delimiters</h2>
      <p className="description">
        <code>ChipInput</code> with custom delimiters. Try separating with <code>|</code> or <code>-</code>.
      </p>
      <div className="input-wrapper">
        <ChipInput<string>
          value={chips}
          onChange={setChips}
          delimiters={['|', '-', ',']}
          placeholder="Type values separated by | or - or ,"
          classNames={{
            container: 'chip-input-container',
            input: 'chip-input',
            chip: 'tag-chip',
            chipSelected: 'tag-chip--selected',
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

