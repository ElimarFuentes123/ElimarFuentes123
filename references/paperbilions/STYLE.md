# Reference: @paperbilions — style breakdown

Sources (TikTok, all by Paper Bilions, downloaded 2026-11-27 to `downloads/ref3/`, not committed):

| ID | Title | Length | Cuts | Median shot |
|---|---|---|---|---|
| 7707530625200295199 | The Biggest IPO in History Lost $80 Billion (Anthropic) | 14:08 | 164 | 3.4 s |
| 7707912578046938381 | Why the Stock Market Just Crashed (Nvidia / AI bubble) | 14:59 | 229 | 3.2 s |
| 7708051736556047629 | How a Chinese Spy Got Inside Nvidia | 16:29 | 365 | 2.1 s |

Format: **16:9 long-form, 14–17 min**, 30 fps (TikTok only serves 640x360; render ours at 1920x1080).
The channel says in a caption that it is made with the **Overnight** app (madeovernight.com), which researches, writes, voices and animates each video. It is an automated faceless channel.

## Narration
- One calm male documentary narrator, **~150–155 wpm**, ~2,100–2,300 words per video.
- Short, punchy sentences. Lots of fragments: "A lot of it." "Nobody had." "You know how that one ends."
- Plain-English explainers for jargon, with one metaphor each: compute = "rent for a brain"; IOU; a bubble and a pin.
- Every big number is converted into something you can feel: "$80B = about $18 million an hour. Nights included." "$35 of every $100 in your index fund."
- **Character dialogue gags** voiced by other voices, 1–3 lines and absurd, every 1–2 minutes: "Wait, it lost how much? 80 billion! Okay, where do I tap?"
- Real quotes from real people (CEO podcast, a professor, a filing) are shown as documents with the source written small underneath.
- Callbacks: "Hold on to that. It comes back with a very big number attached."
- Loudness about -15 to -22 LUFS (target -14 LUFS for YouTube).

## Script structure (same in all 3)
1. **Cold open, 0–30 s.** The shocking number plus a paradox: "lost $80B … and Wall Street's answer? We want in." / "Nvidia lost $400B … and it hadn't done anything wrong."
2. **Gag line**, then **the question** on a black screen: "So why did the stock market just crash?"
3. **"The short answer is …"**: three things in one sentence (optional).
4. **"The long answer starts …" + place and date**: "San Francisco, January 2021." Then the chronological backstory.
5. **Chapters** as numbered cracks/steps ("Crack one."), each with a number, a metaphor, a gag and a quote.
6. **Return to the opening thread**: "Now, back to February and that podcast."
7. **"Here's where it stands."** Current facts and upcoming dates.
8. **Closing line that reframes the title**, often a quote: "As Mr. IPO put it, a lot of things have to go right."

## Visual style
- **Flat 2D cartoon, vector, thick dark outlines.** Characters have big round heads, dot eyes, glasses and tiny bodies. Real people become simple caricatures with recognisable hair, glasses or clothes.
- Backgrounds: offices, trading floors with tickers, server-rack corridors, streets, maps (beige land, light-blue sea, the subject country in red).
- Palette: muted beige and grey paper for explainer scenes; dark navy and teal for night or spy scenes; **neon green** = Nvidia / money up; **red** = loss.
- **Font:** a handwritten marker font in all caps for titles and labels (e.g. "Permanent Marker" / "Gochi Hand" style).
- Recurring scene types:
  - **Chart on paper**: bars and lines draw on, green for in and red hatched for out, numbers in marker.
  - **Document zoom**: a filing, memo or newspaper with the key line highlighted in yellow and the source credit small at the bottom.
  - **Black screen, one white handwritten line** typing on (used for the question, a pause, "The short answer").
  - **Visual metaphor**: a bubble with a pin, a balloon labelled "mostly air", burning cash, a lemonade stand, a vault.
  - **Calendar page** flipping for dates; **stopwatch** for "six minutes".
  - **Map** with a dotted route line.
  - **"ON AIR" podcast set** for quotes from interviews.
- Camera: slow push-ins and pans on still illustrations; there is little character animation (blinks, mouth flaps, pop-in props).
- Cut every **2–3.5 s** (median). The spy video, with more story, cuts faster.

## Our recipe
- Script: 2,200 words, using the 8-step structure above, with sources checked.
- Voice: ElevenLabs narrator, plus 2–3 character voices for the gags.
- Visuals: build a reusable Remotion "cartoon kit" once (character rig, chart, document, black-text card, map, calendar, metaphor props), then make each video by filling in a shot list timed to the voiceover's word timestamps (Whisper).
- Assembly: Remotion render at 1080p30, FFmpeg loudness normalize to -14 LUFS, soft background music under the voice.
- Upload: YouTube 16:9 long-form, plus optional 60 s vertical cut-downs of the cold open for Shorts.
