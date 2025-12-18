import { useState } from 'react';
import { ChipInput } from '../components';
import type { ChipType } from '../components';

export const TagsExample = () => {
  const [chips, setChips] = useState<ChipType<string>[]>([
    { id: 't1', value: 'react' },
    { id: 't2', value: 'typescript' },
  ]);

  return (
    <section className="example-section">
      <h2>🏷️ Simple Tags</h2>
      <p className="description">
        Basic <code>ChipInput</code> without validation or autocomplete. Just type and press Enter.
      </p>
      <div className="input-wrapper">
        <ChipInput<string>
          value={chips}
          onChange={setChips}
          placeholder="Add tags..."
          classNames={{
            container: 'chip-input-container chip-input-container--tags',
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

