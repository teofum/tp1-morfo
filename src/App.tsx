import React, { useState } from 'react';
import compo1 from './assets/compo1-web.jpg';
import compo2 from './assets/compo2-web.jpg';
import compo3 from './assets/compo3-web.jpg';
import './App.css';

const SWIPE_DIST = 80;

const images = [compo1, compo2, compo3];

type Fragment = {
  x: number,
  y: number,
  w: number,
  h: number,
  imageX: number,
  imageY: number,
  image: number
};

const key = (frag: Fragment) => frag.x + frag.y * 16 + frag.w * 256 + frag.h * 4096;

function App() {
  const [fragments, setFragments] = useState<Fragment[]>([
    {
      x: 0,
      y: 0,
      w: 16,
      h: 16,
      imageX: 0,
      imageY: 0,
      image: 2,
    },
  ]);

  function divide(frag: Fragment, direction: 'vertical' | 'horizontal') {
    const rest = fragments.filter((f) => f !== frag);

    let posProp: 'x' | 'y';
    let sizeProp: 'w' | 'h';
    let imgPosProp: 'imageX' | 'imageY';

    if (direction === 'vertical') {
      if (frag.w === 1) return;

      posProp = 'x';
      sizeProp = 'w';
      imgPosProp = 'imageX';
    } else {
      if (frag.h === 1) return;

      posProp = 'y';
      sizeProp = 'h';
      imgPosProp = 'imageY';
    }

    // Divide the fragment
    const firstHalf: Fragment = {
      ...frag,
      [sizeProp]: frag[sizeProp] / 2,
    };
    const secondHalf: Fragment = {
      ...frag,
      [posProp]: frag[posProp] + frag[sizeProp] / 2,
      [imgPosProp]: frag[imgPosProp] + frag[sizeProp] / 2,
      [sizeProp]: frag[sizeProp] / 2,
    };

    // eslint-disable-next-line max-len
    [firstHalf[imgPosProp], secondHalf[imgPosProp]] = [secondHalf[imgPosProp], firstHalf[imgPosProp]];

    setFragments([...rest, firstHalf, secondHalf]);
  }

  const clickHandler = (ev: React.MouseEvent<HTMLDivElement>, frag: Fragment) => {
    const rest = fragments.filter((f) => f !== frag);

    setFragments([
      ...rest,
      {
        ...frag,
        image: (frag.image + 1) % 3,
      },
    ]);
  };

  const touchStart = (ev: React.TouchEvent<HTMLDivElement>, frag: Fragment) => {
    const target = ev.target as HTMLDivElement;
    const x0 = ev.touches[0].clientX;
    const y0 = ev.touches[0].clientY;

    let { x, y } = { x: 0, y: 0 };

    const moveHandler = (move: TouchEvent) => {
      x = move.touches[0].clientX;
      y = move.touches[0].clientY;

      const dx = Math.abs(x - x0);
      const dy = Math.abs(y - y0);

      if (dx > dy) {
        target.style.setProperty('--x-alpha', Math.min((dx / SWIPE_DIST) ** 2, 1).toPrecision(4));
        target.style.setProperty('--y-alpha', '0');
      } else {
        target.style.setProperty('--y-alpha', Math.min((dy / SWIPE_DIST) ** 2, 1).toPrecision(4));
        target.style.setProperty('--x-alpha', '0');
      }
    };

    const endHandler = () => {
      if (x && y) {
        const dx = Math.abs(x - x0);
        const dy = Math.abs(y - y0);

        target.style.removeProperty('--y-alpha');
        target.style.removeProperty('--x-alpha');

        if (dx > dy && dx > SWIPE_DIST) divide(frag, 'horizontal');
        else if (dy > SWIPE_DIST) divide(frag, 'vertical');
      }

      target.removeEventListener('touchmove', moveHandler);
      target.removeEventListener('touchend', endHandler);
    };

    target.addEventListener('touchmove', moveHandler, { passive: false });
    target.addEventListener('touchend', endHandler);
  };

  const dragStart = (ev: React.MouseEvent<HTMLDivElement>, frag: Fragment) => {
    const target = ev.target as HTMLDivElement;
    const x0 = ev.clientX;
    const y0 = ev.clientY;

    let { x, y } = { x: 0, y: 0 };

    const moveHandler = (move: MouseEvent) => {
      x = move.clientX;
      y = move.clientY;

      const dx = Math.abs(x - x0);
      const dy = Math.abs(y - y0);

      if (dx > dy) {
        target.style.setProperty('--x-alpha', Math.min((dx / SWIPE_DIST) ** 2, 1).toPrecision(4));
        target.style.setProperty('--y-alpha', '0');
      } else {
        target.style.setProperty('--y-alpha', Math.min((dy / SWIPE_DIST) ** 2, 1).toPrecision(4));
        target.style.setProperty('--x-alpha', '0');
      }
    };

    const endHandler = () => {
      if (x && y) {
        const dx = Math.abs(x - x0);
        const dy = Math.abs(y - y0);

        target.style.removeProperty('--y-alpha');
        target.style.removeProperty('--x-alpha');

        if (dx > dy && dx > SWIPE_DIST) divide(frag, 'horizontal');
        else if (dy > SWIPE_DIST) divide(frag, 'vertical');
      }

      target.removeEventListener('mousemove', moveHandler);
      target.removeEventListener('mouseup', endHandler);
    };

    target.addEventListener('mousemove', moveHandler);
    target.addEventListener('mouseup', endHandler);
  };

  return (
    <div className="App">
      <div className="App-content">
        <img src={images[0]} alt="content" />
        <div className="App-grid">
          {fragments.map((frag) => (
            <div
              key={key(frag)}
              className="App-fragment"
              style={{
                backgroundImage: `url(${images[frag.image]})`,
                backgroundSize: `calc(100% * 16/${frag.w}) calc(100% * 16/${frag.h})`,
                backgroundPositionX: `calc(-100% * 16/${frag.w} * ${frag.imageX} / 16)`,
                backgroundPositionY: `calc(-100% * 16/${frag.h} * ${frag.imageY} / 16)`,
                gridColumn: `${frag.x + 1} / span ${frag.w}`,
                gridRow: `${frag.y + 1} / span ${frag.h}`,
              }}
              onClick={(ev) => clickHandler(ev, frag)}
              onTouchStart={(ev) => touchStart(ev, frag)}
              onMouseDown={(ev) => dragStart(ev, frag)}
            />
          ))}
        </div>
      </div>

      <p>
        <div><em>Tap</em> para cambiar de imagen.</div>
        <div><em>Swipe</em> vertical u horizontal para cortar.</div>
      </p>
    </div>
  );
}

export default App;
