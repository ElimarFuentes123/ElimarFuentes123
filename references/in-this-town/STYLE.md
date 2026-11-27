# "In This Town" — style rules

Studied 2026-11-27 from 5 TikTok references and 1 tutorial. The video files are in `downloads/`, which isn't committed.

| # | Creator | Video id | Length | Rule |
|---|---|---|---|---|
| 1 | @zaylento.yt | 7706894821323033889 | 1:48 | Everyone watches "In This Town" videos (an ad for their academy) |
| 2 | @synelite1 | 7710291075755216160 | 1:06 | Everyone plays GTA 6, except me (basketball) |
| 3 | @elii.rbl | 7711080329414528270 | 2:43 | Nobody is allowed to sleep |
| 4 | @herrorbit | 7710619102678764833 | 2:06 | Everything *almost* happens |
| 5 | @concet5612 | 7705923908448439583 | 2:50 | Monsters eat everyone, except me (horror twist) |
| T | @get_rich_with_david | 7708625293765922068 | 3:13 | Tutorial: 6-step workflow with Claude |

## Numbers (measured)
| | Length | Cuts | Avg shot | Median shot | Longest | Speech |
|---|---|---|---|---|---|---|
| synelite1 | 66 s | 66 | 1.0 s | 0.96 s | 1.9 s | 222 wpm |
| concet5612 | 170 s | 131 | 1.3 s | 1.13 s | 4.2 s | 270 wpm |
| elii.rbl | 163 s | 104 | 1.6 s | 1.50 s | 6.1 s | 233 wpm |
| herrorbit | 126 s | 65 | 1.9 s | 1.73 s | 4.3 s | 167 wpm |
| zaylento.yt | 108 s | 54 | 2.0 s | 1.97 s | 3.6 s | 175 wpm |

- **Target length:** 60–170 s. The tutorial says 20–60 s, but the videos that actually went viral are longer.
- **Cuts:** a new shot every 1–2 s, and no shot longer than about 4 s. Cut on each sentence or clause.
- **Narration:** fast, about 170–270 words per minute, with no dead air.
- **Format:** vertical 1080×1920.

## Story structure (all 5 follow it)
1. **Hook in the first sentence:** "In this town, <rule>." The rule is one short, absurd sentence about everyday life (sleep, yawning, GTA, "almost", monsters).
2. **Rule montage (10–20 s):** 4–8 quick examples, one shot each, using everyday townspeople: the baker, mailman, grandma, teacher, pigeons, police. Each example is one line and one visual gag.
3. **"Except me":** the first-person kid narrator is the exception or the one who breaks the rule. Give one concrete detail (name, age, "500 shots before school").
4. **Stakes:** a person they love (a little sister such as Ava or Cora, grandma, or a crush), or a challenge letter, empty warehouse or contest.
5. **Quirky side character or rival:** "random kid" whose voice puts people to sleep, or Chad who wins everything, or Mr. Tate's warning.
6. **The plan, then a montage:** "Day 1… Day 10… Day 20…" or "one week of training".
7. **Climax in public with the whole town watching:** game day, the live midnight "wake check", the run up the bell hill. The underdog wins at the last second.
8. **Twist that echoes the first line:** the hero ends up doing the rule ("Now everyone plays basketball… except me. I'm on the couch playing GTA 6."). Or the side character's gag repeats ("I woke up in the bus garage"). Or, for horror, the rule was never what it seemed ("I wasn't special. I was the door.").

**Writing tips**
- Short sentences. Exact numbers ($40, 31 weddings, 14,610 days, 49 to 50). People's names.
- A running sound gag that repeats 3–6 times, such as "Swish" or "Almost, almost, almost".
- A few lines of dialogue in other voices: the mayor, grandma, the rival.

## Visuals
- **Characters:** blocky R15-style figures with bright clothing, readable faces and exaggerated expressions (shocked, crying, grinning).
  - Roblox-engine look: elii.rbl and concet5612.
  - Custom low-poly 3D look, which is easier to build ourselves: synelite1 and herrorbit.
- **Shot mix:**
  - Wide street or town establishing shots.
  - Eye-level close-ups of faces.
  - Over-the-shoulder shots.
  - Crowd shots for the "whole town" moments.
  - Inserts of screens: phones, TVs, scoreboards, chat bubbles saying "typing…".
- **Text in the world tells the story without words:** "DAYS AWAKE 14,610", a "NO SLEEPING" sign, "DAY 20" on a calendar, the HOME/GUEST scoreboard, "RING THE BELL — WIN $1,000,000", a TOWN MAP.
- **Lighting:** bright, saturated daylight with blue sky and clouds. Night and dark scenes are for tension. Sunset is for the emotional climax.
- **Camera:** slow push-ins and gentle drift, with no static shots. Use slow motion for the last-second shot or jump.

## Captions
- One word at a time, timed exactly to the voice (Whisper word timestamps).
- **Position:** centered, about 60–70 % down the frame, below the faces and above TikTok's UI.
- **Font:** heavy rounded sans (a Fredoka/Nunito Black type), white with a thick black outline or shadow, lowercase. elii.rbl uses UPPERCASE with a blue-to-yellow gradient on key words.
- Highlight an occasional key word in color (green "both" in concet5612).
- Use a small pop or scale-in on each word, and no full sentences on screen.
- A creator watermark can sit faintly in the middle of the frame (elii.rbl does this).

## Audio
- **Voice:** the narrator's voice is always on top. The tutorial uses ElevenLabs.
- **Music:** light, playful music underneath that switches to tense or emotional at the climax. Drop it out for the twist line.
- **Sound effects on every action:** swish, bell "bong", crowd sighs and cheers, phone buzz, confetti.

## Production plan (for when we start editing)
1. **Engine:** a reusable Remotion scene kit in `remotion/`.
   - Blocky character component (pose, expression, clothing colors).
   - Town backdrop set (street, school, house, park, stadium).
   - Camera move presets.
   - Screen inserts and in-world sign components.
2. **Story:** write a script using the 8-beat structure above, 150–400 words.
3. **Voice:** record the narration with ElevenLabs.
4. **Caption timing:** Whisper word timestamps go to a captions JSON file, which drives the word-by-word captions.
5. **Shot timing:** shots follow the sentence and clause timestamps, 1–2 s each.
6. **Render:** export at 1080×1920. Use FFmpeg for the final mix (voice, music and sound effects) and export.
7. **Fix:** watch it, write timestamped notes, and revise.
