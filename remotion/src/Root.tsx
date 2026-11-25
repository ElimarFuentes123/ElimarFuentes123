import React from 'react';
import {AbsoluteFill, Composition, interpolate, useCurrentFrame} from 'remotion';

const Title: React.FC<{text: string}> = ({text}) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 15], [1.4, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000', justifyContent: 'center', alignItems: 'center'}}>
      <h1 style={{color: '#fff', fontSize: 140, fontFamily: 'sans-serif', transform: `scale(${s})`}}>{text}</h1>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition id="CarTitle" component={Title} durationInFrames={60} fps={30} width={1080} height={1920}
    defaultProps={{text: 'CAR EDIT'}} />
);
