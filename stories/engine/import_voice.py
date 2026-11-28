"""Use a ready-made voiceover (mp3/wav) instead of TTS.
Aligns script.json words to the audio with faster-whisper word timestamps
-> build/narration.wav + build/timings.json (same format as tts.py).
Usage (from the episode folder): python3 ../engine/import_voice.py <voice-file>
"""
import json, os, re, subprocess, sys, wave, difflib
import numpy as np
from faster_whisper import WhisperModel

SRC = sys.argv[1]
S = json.load(open("script.json"))
os.makedirs("build", exist_ok=True)
SR = 44100
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", SRC, "-ac", "1", "-ar", str(SR), "build/narration.wav"], check=True)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", SRC, "-ac", "1", "-ar", "16000", "build/_w16.wav"], check=True)
with wave.open("build/_w16.wav") as w:
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
with wave.open("build/narration.wav") as w:
    total = w.getnframes() / SR
os.remove("build/_w16.wav")

wm = WhisperModel("small", compute_type="int8")
ww = [x for s in wm.transcribe(a, language="en", word_timestamps=True)[0] for x in s.words]
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
W = [norm(x.word) for x in ww]

toks = []  # (line, raw token)
for i, ln in enumerate(S["lines"]):
    for t in ln["text"].split():
        toks.append((i, t))
T = [norm(t.replace("*", "")) for _, t in toks]
starts, ends = [None] * len(toks), [None] * len(toks)
for blk in difflib.SequenceMatcher(None, T, W, autojunk=False).get_matching_blocks():
    for k in range(blk.size):
        starts[blk.a + k] = ww[blk.b + k].start; ends[blk.a + k] = ww[blk.b + k].end
matched = sum(s is not None for s in starts)
# fill gaps by interpolating between known neighbours
known = [i for i, s in enumerate(starts) if s is not None]
for i in range(len(toks)):
    if starts[i] is None:
        prev = max([j for j in known if j < i], default=None); nxt = min([j for j in known if j > i], default=None)
        t0 = ends[prev] if prev is not None else 0.0
        t1 = starts[nxt] if nxt is not None else total
        n0 = prev if prev is not None else -1; n1 = nxt if nxt is not None else len(toks)
        frac = (i - n0) / (n1 - n0)
        starts[i] = t0 + (t1 - t0) * frac; ends[i] = starts[i] + 0.2

words, lines = [], []
for idx, (li, raw) in enumerate(toks):
    clean = re.sub(r"[^\w'’:,.-]", "", raw.replace("*", "")).strip(".,")
    words.append({"w": clean, "start": round(starts[idx], 3), "line": li, "emph": raw.strip(".,?!").startswith("*")})
for i, ln in enumerate(S["lines"]):
    ids = [k for k, (li, _) in enumerate(toks) if li == i]
    lines.append({"start": round(starts[ids[0]], 3), "end": round(ends[ids[-1]], 3), "shots": ln["shots"], "weights": ln.get("weights"),
                  "sfx": ln.get("sfx", []), "rain": ln.get("rain", False)})
json.dump({"duration": round(total + 0.4, 3), "musicSwitchLine": S.get("musicSwitchLine"), "music": S.get("music", {}), "lines": lines, "words": words},
          open("build/timings.json", "w"), indent=1)
print(f"duration {total:.1f}s, {len(words)} words, matched {matched}/{len(toks)} to the audio")
