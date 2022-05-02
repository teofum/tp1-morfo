import React, { useState } from 'react';
import './App.css';

const key = (frag: {
  x: number,
  y: number,
  w: number,
  h: number,
}) => frag.x + frag.y * 16 + frag.w * 256 + frag.h * 4096;

function App() {
  const [fragments, setFragments] = useState([
    {
      x: 0,
      y: 0,
      w: 16,
      h: 16,
      imageX: 0,
      imageY: 0,
    },
  ]);

  return (
    <div className="App">
      <div className="App_grid">
        {fragments.map((frag) => (
          <div
            key={key(frag)}
            className="App_fragment"
            style={{
              background: 'linear-gradient(to right, black, red)',
              gridColumn: `${frag.x + 1} / span ${frag.w}`,
              gridRow: `${frag.y + 1} / span ${frag.h}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
