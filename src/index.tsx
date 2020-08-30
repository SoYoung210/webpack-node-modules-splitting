import './index.css';

import { now } from 'lodash';
import lottie, { AnimationItem } from 'lottie-web';
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

export const EntryRoute = () => {
  // const testVar = is
  console.log('@@ now', now());
  const container = useRef<HTMLDivElement | null>(null);
  const player = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (container.current == null) {
      return;
    }

    player.current = lottie.loadAnimation({
      container: container.current,
      loop: true,
      autoplay: true,
      renderer: 'svg',
      path: 'https://assets1.lottiefiles.com/packages/lf20_65SMqF.json',
      rendererSettings: {
        progressiveLoad: true,
        hideOnTransparent: true,
      },
    });

    return () => {
      player.current?.destroy();
    };
  }, []);

  return (
    <div className='test' ref={ container } />
  );
};

ReactDOM.render(<EntryRoute />, document.getElementById('wrap'));
