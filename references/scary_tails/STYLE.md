# Filipino folklore horror shorts — style rules

Studied 2026-11-28 from 5 @scary_tailsaround TikToks (series "Hatinggabi"):
Tiktik ep 13, Aswang ep 14, Duwende ep 15, Santelmo ep 16, Pugot ep 17.
Views 16K–162K; the full-story Santelmo episode (145 s) did best.
The video files are gitignored; re-download with `npm run yt -- <url>`.

## Format
- Vertical 720×1280, 30 fps, 76–145 s. Episodes are either "Full Story" or "[1 of 2]" cliffhangers.
- Low-poly 3D night scenes: blue moonlit barrio, nipa huts, rice paddies, banana and palm trees, fireflies, fog.
  Simple blocky people with drawn faces. Warm practical lights (windows, lanterns) against cool blue.
- Shots change every 2–4 s with slow push-ins, and many medium shots that show the whole character.

## Narration (one calm, deep male voice, about 150 wpm)
1. **Hook rule**: "In the Philippines, if <sign>, don't <X> and never <Y>."
2. **What it is**: "Because it's a <creature>, a <one-line description>."
3. **Old folks say**: where it comes from and what it does to you.
4. **The rule from elders**: "That's why our lolas/lolos…" (garlic, salt, tabi tabi po, praying…)
5. **Personal story**: "In <year>, my <relative> <name>…", told step by step with short sentences.
6. **Escalation**: the creature uses a familiar voice, splits, follows, or asks a question.
7. **Twist / echo**: it comes back years later to the next generation, or a cliffhanger question.
8. **CTA**: "What story should we do next?" (full story) or "Part 2 next. Follow so you don't miss it."

## On-screen graphics
- Captions: 2–3 words at a time, bold condensed uppercase (Oswald/Anton), white with a black stroke,
  at about 80% of the screen height. Key words are in **red**.
- Opening: a red pill "SERIES · CREATURE · PART 1 OF 2" plus a two-line hook title (white, then yellow).
- Creature card: a dark box with a red border, "THE <CREATURE>", and WHAT / WHO / WANTS rows typed in.
- Rule card: a white paper note, slightly rotated, with a red "THE RULE" header. The last line is red.
  The same layout is reused for "HIS MOTHER'S WORDS" and similar.
- Name tags: a small dark label "NAME / RELATION, YEAR" with a thin line down to the character's head.
- Place and year stamp top-left: "• NUEVA ECIJA · 1985".
- End: a yellow question plus a red pill "PART 2 NEXT · FOLLOW".

## Sound
A low drone, night insects, wind, booms on reveals, string stings, and a heartbeat at peak fear. No upbeat music.

Engine: `stories/engine/` (three.js + Playwright renderer). Sound: `stories/engine/horror_audio.py`.
First episode built with this style: `stories/kapre/`.
