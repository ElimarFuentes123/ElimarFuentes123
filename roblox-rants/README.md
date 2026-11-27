# Roblox Rant Shorts — playbook

Faceless YouTube Shorts / TikTok niche: **a relatable rant voiceover over Roblox obby gameplay.**

## Reference studied
@rantfinalboss — "autocorrect" rant (TikTok 7525646835533270303): **8.2M views, 1M likes, 116K shares**, 71 s.

| Element | What they do |
|---|---|
| Visual | ONE continuous obby (parkour tower) run, 3rd-person camera behind the avatar. No cuts. Gameplay only keeps the eyes busy. |
| Frame | 1080x1920 with black bars: the gameplay window is 1080x1276 in the middle. |
| Captions | Small white sans (Inter/TikTok-style), thin shadow, **one short phrase at a time**, centered right over the avatar (~48% down). Some emoji. |
| Voice | One young, sarcastic, "talking to my friend" voice. ~186 wpm, with short pauses before the punchlines ("Huh?", "Bro.", "Excuse me?"). |
| Script | Hook = the complaint in the first sentence ("tell me why my autocorrect is out here beefing with me personally"). Then 5–6 escalating examples, each one **setup → absurd result → reaction**. It ends on the funniest example, with no outro. |
| Audio | Voice only, no music. |
| Caption/post | "Follow for daily rants 🥀" + #roblox #robloxrant #relatable #obby #fyp |

## Script formula (60–75 s, 200–240 words)
1. **Hook (0–3 s):** the complaint as a question or an accusation. "Why does my ___ ___ like ___?"
2. **Example 1:** setup → what actually happened → one-word reaction ("Three!", "Bro.").
3. **Escalation:** "And the worst part is…" / "And don't even get me started on…"
4. **Examples 2–4**, each more absurd than the last, with a callback joke.
5. **Final punchline**: the strongest image. Stop right there, so viewers replay it.

Topic bank (everyday + teen/school life): phone battery, autocorrect, group projects, "we have food at home", alarm clocks, Wi-Fi at 1 bar, siblings, school group chats, teachers who say "this is easy", buffering, chargers, fast food orders, online class mics, parents' "5 more minutes", game lag, little brother playing your account, stepping on Lego, shower temperature, dentists, grocery store self-checkout.

## Pipeline (all in this repo)
```bash
# 1. write the script
roblox-rants/episodes/ep02_topic.txt

# 2. render (ElevenLabs voice + phrase captions + gameplay + letterbox)
python3 roblox-rants/make_rant.py roblox-rants/episodes/ep02_topic.txt path/to/obby_gameplay.mp4
#   --speed 1.05   slower voice (1.15 ≈ 230 wpm; the reference is ~186)
#   --voice ID     other ElevenLabs voices: Liam TX3LPaxmHKxFdv7VOQHJ (default),
#                  Will bIHbv24MWmeRgasZH58o (chill), Laura FGY2WhTYpPnrIDTdsKH5 (sassy female)
#   --start 120    which second of the gameplay to start at (default: random)
#   --music bg.mp3 quiet background music (optional; the reference has none)
# -> renders/ep02_topic.mp4
```
The voice is cached (`renders/<name>.voice.mp3`), so a re-render with other gameplay doesn't spend ElevenLabs credits again.

## Gameplay footage — IMPORTANT
- **Best: record your own.** Play any obby or tower game (e.g. a tower/parkour obby) on PC, record with OBS (free) or the Xbox Game Bar (Win+G) at 1080p, and do one long run of 10–30 min. One recording covers about 20 episodes, because the script picks a random start each time.
- On a phone you can use the built-in screen recorder.
- "No copyright / free to use" vertical obby gameplay packs exist on YouTube (e.g. Bloxu, OrbitalNCG +). Download them on your own computer with `npm run yt -- <url>`; YouTube blocks downloads from the cloud server.
- **Don't reuse other creators' rant videos** (like the test render below). YouTube will flag them as "reused content" and they can't be monetized.

## Monetization notes
- YouTube Partner Program for Shorts: 1,000 subs + 10M valid Shorts views in 90 days (or 4,000 watch hours on long-form).
- Swearing (like in the reference) gets limited ads on YouTube. Keep scripts clean or bleep them.
- Original voice + original script + your own gameplay = safest for monetization.
- Post daily, at the same time each day. Test 3–5 topics, then double down on whichever format performs.

## Files
- `make_rant.py` — the generator
- `episodes/ep01_battery.txt` — sample script
- Test render (not committed, not for posting — it reuses @rantfinalboss's gameplay with their captions blurred): `renders/ep01_battery_TEST.mp4`
