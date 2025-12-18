import {
  EmailExample,
  TagsExample,
  PhoneExample,
  FruitsExample,
  TeamExample,
  DelimitersExample,
} from './examples';
import './App.css';

function App() {
  return (
    <div className="app">
      <h1>ChipInput Examples</h1>
      <EmailExample />
      <TagsExample />
      <PhoneExample />
      <FruitsExample />
      <TeamExample />
      <DelimitersExample />
    </div>
  );
}

export default App;
