import React from 'react';
import {AbsoluteFill, Composition, interpolate, useCurrentFrame} from 'remotion';
import {MinecraftConfession, ConfessionProps} from './MinecraftConfession';
import ep01Captions from '../../minecraft/ep01/captions.json';

const Title: React.FC<{text: string}> = ({text}) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 15], [1.4, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000', justifyContent: 'center', alignItems: 'center'}}>
      <h1 style={{color: '#fff', fontSize: 140, fontFamily: 'sans-serif', transform: `scale(${s})`}}>{text}</h1>
    </AbsoluteFill>
  );
};

const FPS = 30;
const ep01: ConfessionProps = {
  title: 'my phone addiction',
  voice: 'minecraft/ep01/voice.wav',
  captions: ep01Captions,
  gameplay: null, // e.g. 'minecraft/gameplay/survival1.mp4'
  gameplayStart: 0,
  gameplayVolume: 0.25,
};
const lastWord = ep01Captions[ep01Captions.length - 1].words.slice(-1)[0];

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="CarTitle" component={Title} durationInFrames={60} fps={30} width={1080} height={1920}
      defaultProps={{text: 'CAR EDIT'}} />
    <Composition
      id="MC-Ep01"
      component={MinecraftConfession}
      durationInFrames={Math.ceil((lastWord.e + 1.5) * FPS)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={ep01}
    />
  </>
);
