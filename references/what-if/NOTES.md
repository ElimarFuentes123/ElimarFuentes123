# "What If" videos: notes

Source: TikTok by @vibecodingiseasy, "How People Are Making Those Viral 'What If' Videos" (video 7701822100725566750, 2:15, 1080×1920). The full transcript is in [TRANSCRIPT.md](TRANSCRIPT.md).
Their example: **"What If You Jumped from 120,000 ft"**. It uses real satellite ground, a falling first-person view, a live altitude/speed counter and short serif captions. The wind sound is generated in code too.

## The recipe (4 rules every viral one follows)
1. **The question is on screen in the first 0–2 s.** The title card *is* the hook ("What if you jumped from 120,000 ft?").
2. **One number ticks the whole time.** It is the backbone of the video. In the example, altitude drops (`119,582 → 117,279 → 104,777 → 36,440 FT`) with speed underneath (`283 MPH → 636 MPH`) and later `IMPACT IN 2:23`.
3. **A short caption every few seconds**, a single sentence each: "The door opens." / "Your lungs empty." / "You black out." / "Two minutes without oxygen. Your skin turns blue."
4. **Every step is worse than the last.** It escalates until the end, which is why people can't scroll away.

Key idea: *copy the recipe, not the video.* Watch 3 viral ones and write down what they all share.

## Picking a topic
- The what-if needs **a number that moves**: a fall (height), a countdown (time left), a temperature, a depth, a speed, money draining.
- Ask "what *really* happens, second by second?"
- **Use real science.** "The comments will check. Real numbers get people arguing, and arguing is views."

## Production pipeline (from the video, mapped to this repo)
| Step | Video says | In this repo |
|---|---|---|
| 1. Script | Second-by-second timeline, one short caption per beat, real facts | `references/what-if/<topic>/script.md` with a `time · caption · counter value` row per beat |
| 2. **Voice first** | ElevenLabs: paste each caption, deep voice, download one file per line (the free plan is enough) | ElevenLabs is connected to this environment, so I can generate the lines directly |
| 3. Time captions to voice | Each caption lasts as long as its voice line | Use each line's audio duration, or Whisper word timestamps |
| 4. Build | Claude Code: "build this as a 3D video, tall like a phone, with a counter and these captions" as a web page | HyperFrames (HTML→MP4) or Remotion with three.js; 1080×1920 |
| 5. **Stills before video** | Render one still per caption, fix those, *then* render the full video | `remotion still` / a HyperFrames frame per caption, then a full render |
| 6. Fix rounds | A few rounds of fixes | Timestamped notes → revise |

## Look of the example "What If" video
- Vertical 9:16, a realistic first-person / falling camera over real satellite imagery.
- Counter card: small caps label (`ALTITUDE`), big serif number, smaller sub-line (`FT · 283 MPH`), on a dark translucent panel.
- Captions: serif italic, 1 sentence, cream/white on a dark panel.
- Generated ambient sound (wind) that changes as things escalate.
- A filename-style title bar at the top ("What If You Jumped from 120,000 ft.mp4").

## Look of the tutorial itself (also worth copying for explainer posts)
- Two low-poly 3D characters talking (a kid asking questions, a red spiky mascot answering) in a hot-air-balloon basket.
- Big bold word-by-word captions, with the key word in orange/yellow.
- Cream "THE RECIPE" cards with a 4-dot progress indicator, a yellow "STEP 1" tag, and "COPY THIS / NOT THIS" callouts.
- It ends on a joke: "What if I never cleaned my room again?" → "That's not a what-if, that's a documentary."

## What-if ideas that fit the rules (each has a moving number)
- What if you fell into the Mariana Trench? (depth + pressure)
- What if you were locked in a car on a 40 °C day? (inside temperature)
- What if you stopped sleeping? (hours awake)
- What if the Sun disappeared? (minutes since, temperature on Earth)
- What if your car's brakes failed going downhill? (speed, distance to the bottom). This ties in with car edits.
- What if you stood next to a Formula 1 car at full speed? (dB / speed)

## Download gotcha (TikTok)
yt-dlp's default `bv*+ba` on TikTok merges the 1080p video with the **background-music track** (the `audio` format), not the voiceover. Use `npm run yt:tiktok -- <url>`, which takes the combined H.264 file with the original voice (720p). Or remux the 1080p video with that file's audio:
`ffmpeg -i video1080.mp4 -i h264_720p.mp4 -map 0:v -map 1:a -c copy out.mp4`.
