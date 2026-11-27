# "In This Town" — the 6-step workflow

Studied frame by frame from @get_rich_with_david (TikTok 7708625293765922068), 1:06–2:57. Each step below has what the tutorial shows (with timestamps) and how we'll do it with our tools.

Status: **1 References ✅ · 2 Study ✅ · 3 Engine ⬜ · 4 Story ⬜ · 5 Render ⬜ · 6 Fix ⬜**

---

## The formula (1:06–1:22)
The tutorial's checklist, shown before the steps:
1. **Short.**
2. **One weird rule,** shown as a "NO YAWNING" sign.
3. **Simple, colourful characters:** blue, red and green blocky figures.
4. **Word-by-word captions.**
5. **A twist at the end,** which makes people "watch again".

Our references say the length should be 60–170 s rather than "short". See `STYLE.md`.

## 01 References (1:24–1:30) ✅
- **What they show:** grab 3+ viral "In This Town" videos to copy the style from.
- **What we did:** downloaded 5 references to `downloads/ref-*.mp4` with yt-dlp.

## 02 Study (1:33–1:47) ✅
- **What they show:** go through the references "frame by frame" and pull out 5 things: blocky characters, bright colours, camera angles, shot speed and captions. Then write them into a `style-rules.md`. Their file has 5 lines:
  1. blocky R15 characters
  2. saturated, bright palette
  3. close-ups, eye-level cams
  4. new shot every 1–2 s
  5. one big word on screen
- **What we did:** `STYLE.md` covers the same 5 points with measured numbers, plus the story structure, captions and audio.

## 03 Engine (1:48–2:05)
**What they show**

"Its own little animation studio": Claude writes `engine.js`, shown on screen as:
```js
const town = new Town()
const kid  = makeCharacter({ shirt: "blue" })
camera.follow(kid, { angle: "eye" })
lights.sun({ warm: true })
scene.render(30)
```
- **Pieces:** a character made of a head, arms and legs; a whole town (houses, a school, trees); a camera; lights.
- **"Build it once":** the ENGINE box feeds episode 1, episode 2 and so on. Every episode reuses it.

**How we'll do it**
- **Use:** Remotion plus `@remotion/three` (three.js / react-three-fiber) for real 3D, which matches the synelite1 and herrorbit look.
  - These aren't installed yet. We'd add `@remotion/three`, `three` and `@react-three/fiber`.
- **Kit to build:**

| Part | What it does |
|---|---|
| `<Character>` | Shirt, pants, skin and hair colours; poses (idle, walk, run, wave, point, jump, sit); face expressions (happy, shocked, sad, angry, sleepy) |
| `<Town>` sets | Street, house interior, school classroom, park/fountain, plus 1–2 special sets per episode |
| `<Camera>` presets | `eye` close-up, `wide`, `over-shoulder`, `push-in`, `orbit`, `follow` |
| Lights | Day, sunset, night |
| Insert components | Phone screen, TV, scoreboard, sign/label for the in-world text |

- **Requirement:** everything is driven by props, so an episode is data (a shot list), not new code.

## 04 Story (2:06–2:16)
**What they show**
- "One strange rule → a short script". The input is just 2 fields:
  - **THE RULE:** "When someone yawns, day turns to night."
  - **THE KID:** "One guy yawns at everything."
- Then record the voiceover in **ElevenLabs**.

**How we'll do it**
- Write the script from the rule and the kid using the 8-beat structure in `STYLE.md`, about 150–400 words.
- Also write a **shot list**: one entry for every 1–2 s of narration, with the set, characters, pose, expression, camera and any sign text.
- Make the voiceover with ElevenLabs, which is already connected in this environment.
  - Use one kid narrator voice, plus 1–2 extra voices for dialogue.

## 05 Render (2:17–2:29)
**What they show**

"Upload the voiceover. Timed to your voice, then rendered." Their timeline has 5 tracks:

| Track | What it is |
|---|---|
| voice | The waveform |
| shots | Orange blocks, one per shot, cut to the voice |
| captions | Pink word chips: "in", "this", "town", "when", "one", "guy", "yawns" |
| music | One bed for the whole video |
| sound fx | Sound effects |

The result is a vertical render, shown as "rendering 9 %".

**How we'll do it**
- **Captions:** Whisper word timestamps on the voiceover go into `captions.json`, which drives the word-by-word captions.
- **Shots:** sentence and clause timestamps set the start and end of each shot in the shot list.
- **Render:** Remotion renders 1080×1920 at 30 fps.
- **Mix:** FFmpeg mixes the voice, music bed and sound effects, then does the final export.

## 06 Fix (2:30–2:44)
**What they show**
- "Never perfect the first time. Watch. Write notes. Send them back."
- A `notes.txt` with timestamps, for example:
  - `0:07 character walks through a wall` ✅
  - `0:12 caption is too fast` ✅
- "Round after round": v1 → v2 → v3.

**How we'll do it**
- After each render, you watch it and send notes as `time + problem`.
- I fix it, re-render, and bump the version (`v1`, `v2`, `v3`…).

## The skill (2:51–2:57)
- They package the whole workflow (style rules, engine, steps) as one Claude skill called `in-this-town`.
- We can do the same once the engine works. Then a new episode would only need "rule + kid".
