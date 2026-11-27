import React from 'react';
import '@fontsource/roboto-condensed/400.css';
import '@fontsource/roboto-condensed/700.css';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export type Word = {t: string; s: number; e: number};
export type Group = {words: Word[]};

export type ConfessionProps = {
  title: string;
  voice: string; // path inside public/
  captions: Group[];
  gameplay: string | null; // path inside public/, or null for placeholder
  gameplayStart: number; // seconds into the gameplay file
  gameplayVolume: number;
};

const FONT = '"Roboto Condensed", "Arial Narrow", sans-serif';

const Placeholder: React.FC = () => (
  <AbsoluteFill
    style={{
      background: 'linear-gradient(#7fb2e8 0%, #c9dcef 42%, #6a9a3c 42%, #6a9a3c 47%, #7a5636 47%, #5b3f27 100%)',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: 220,
    }}
  >
    <div style={{fontFamily: FONT, color: 'rgba(255,255,255,.55)', fontSize: 40, letterSpacing: 2}}>
      [ MINECRAFT GAMEPLAY GOES HERE ]
    </div>
  </AbsoluteFill>
);

const Captions: React.FC<{captions: Group[]}> = ({captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = captions.findIndex((g, i) => {
    const next = captions[i + 1];
    const end = next ? next.words[0].s : g.words[g.words.length - 1].e + 1.2;
    return t >= g.words[0].s && t < end;
  });
  if (idx < 0) return null;
  const g = captions[idx];
  // Each group lands in a slightly different spot, like the reference.
  const x = 8 + random(`x${idx}`) * 22; // % from left
  const y = 34 + random(`y${idx}`) * 18; // % from top
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: '70%',
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: 34,
        rowGap: 4,
        fontFamily: FONT,
        fontWeight: 400,
        fontSize: 104,
        lineHeight: 1.12,
        color: '#fff',
        textShadow: '0 0 6px rgba(0,0,0,.55), 0 3px 4px rgba(0,0,0,.45)',
      }}
    >
      {g.words.map((w, i) => (
        <span key={i} style={{opacity: t >= w.s - 0.03 ? 1 : 0}}>
          {w.t}
        </span>
      ))}
    </div>
  );
};

export const MinecraftConfession: React.FC<ConfessionProps> = ({
  title,
  voice,
  captions,
  gameplay,
  gameplayStart,
  gameplayVolume,
}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {gameplay ? (
        <OffthreadVideo
          src={staticFile(gameplay)}
          startFrom={Math.round(gameplayStart * fps)}
          volume={gameplayVolume}
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      ) : (
        <Placeholder />
      )}
      <Audio src={staticFile(voice)} />
      {title ? (
        <div
          style={{
            position: 'absolute',
            top: 150,
            width: '100%',
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 58,
            color: '#fff',
            textShadow: '0 2px 8px rgba(0,0,0,.7)',
          }}
        >
          {title}
        </div>
      ) : null}
      <Captions captions={captions} />
    </AbsoluteFill>
  );
};
