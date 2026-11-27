# Minecraft Commentary channel

Format, based on the reference (@lost2U, 12.6M views, `references/minecraft/`):
- A slow, honest first-person "confession" voiceover (~140 wpm) with long 1.5–2 s pauses between thoughts.
- Plain, unedited first-person survival gameplay (walking, mining). No cuts or effects.
- Lowercase white captions, 2–4 words at a time, no punctuation. Each group lands in a slightly different spot near the middle.
- Story arc: confession → when it started → why I keep doing it → how long it's been → what I'd tell my younger self → the life I wish I had.
- 60–75 s, vertical 1080×1920.

## Make a new episode
1. Copy `ep01/` to `ep02/` and write `script.txt`. A `||1.6` line means 1.6 s of silence.
2. Run the voice script (ElevenLabs voice "Will"). `python3 minecraft/tts.py bIHbv24MWmeRgasZH58o minecraft/ep02` (copy `script.txt` in first).
3. Align the captions with Whisper, which produces `captions.json`.
4. Put your gameplay in `public/minecraft/gameplay/` and set `gameplay:` in `remotion/src/Root.tsx`.
5. Preview with `npm run remotion`. Render with `npx remotion render remotion/src/index.ts MC-Ep01 out/ep01.mp4`.

## Gameplay
Best option: record your own (Minecraft on phone or PC, screen record, just walk around and mine). Your own footage avoids YouTube's "reused content" problem.
Free option: Naybr's "Minecraft: Survival - No Copyright Gameplay (Free To Use)" (youtube.com/watch?v=yLGNm-j3Nj8). You must like the video and put this in your description:
`Gameplay - https://www.youtube.com/Naybr`
