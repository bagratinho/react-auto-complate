import './App.css';
import Autocomplate from './components/Autocomplate';
import React from "react";

function App() {
  const [value, setValue] = React.useState<string>("");
  const handleSelect = (value: string) => setValue(value);

  return (
    <div className="App">
      <Autocomplate
        value={value}
        onSelect={handleSelect}
        limitResults={5}
        dataEndpoint="https://64b994f479b7c9def6c13355.mockapi.io/api/countries"
      />
      <div>
        <br />
        <br />
        You can use arrow up and arrow down to navigate <br /> through suggestion items and hit enter to select
        <br />
        <br />
        To test server error case, set the throttling <br /> to offline in dev tools network tab
      </div>
    </div>
  );
}

export default App;
