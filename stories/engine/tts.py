"""Narration for an episode: Piper TTS per line -> build/narration.wav + build/timings.json.
Word times come from faster-whisper on each line (fallback: proportional by length).
Usage (from the episode folder): python3 ../engine/tts.py <voices_dir> [voice_name]
"""
import io, json, sys, wave, re
import numpy as np
from piper import PiperVoice
from piper.config import SynthesisConfig

VOICES = sys.argv[1]
VOICE = sys.argv[2] if len(sys.argv) > 2 else "en_US-lessac-high"
S = json.load(open("script.json"))
SR = 22050
voice = PiperVoice.load(f"{VOICES}/{VOICE}.onnx")
cfg = SynthesisConfig(length_scale=S.get("speed", 0.9), noise_scale=0.6, noise_w_scale=0.7)

try:
    from faster_whisper import WhisperModel
    wm = WhisperModel("small", compute_type="int8")
except Exception:
    wm = None

def synth(text):
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        voice.synthesize_wav(text, w, syn_config=cfg)
    buf.seek(0)
    with wave.open(buf) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)
    nz = np.where(np.abs(a) > 300)[0]
    return a[max(0, nz[0] - 200): nz[-1] + 400]

def whisper_starts(a, n):
    if wm is None:
        return None
    # resample 22050 -> 16000 (linear) for whisper
    x = np.interp(np.arange(0, len(a), SR / 16000), np.arange(len(a)), a) / 32768
    segs = wm.transcribe(x.astype(np.float32), language="en", word_timestamps=True)[0]
    ws = [w for s in segs for w in s.words]
    return [w.start for w in ws] if len(ws) == n else None

out = [np.zeros(int(SR * 0.15), np.float32)]
t = 0.15
lines, words, aligned = [], [], 0
gap = S.get("gap", 0.15)
for i, ln in enumerate(S["lines"]):
    raw = ln["text"]
    spoken = raw.replace("*", "")
    a = synth(spoken)
    dur = len(a) / SR
    toks = raw.split()
    starts = whisper_starts(a, len(toks))
    if starts:
        aligned += 1
    else:
        wt = [len(re.sub(r"[^\w]", "", w)) + 2 + (4 if w.rstrip("*")[-1] in ".?!" else 2 if w.rstrip("*")[-1] == "," else 0) for w in toks]
        acc, starts = 0, []
        for k in wt:
            starts.append(dur * acc / sum(wt)); acc += k
    for tok, st in zip(toks, starts):
        clean = re.sub(r"[^\w'’:-]", "", tok)
        words.append({"w": clean, "start": round(t + st, 3), "line": i, "emph": tok.strip(".,?!").startswith("*")})
    lines.append({"start": round(t, 3), "end": round(t + dur, 3), "shots": ln["shots"], "weights": ln.get("weights"), "sfx": ln.get("sfx", []), "rain": ln.get("rain", False)})
    out.append(a)
    g = ln.get("pause", gap)
    out.append(np.zeros(int(SR * g), np.float32))
    t += dur + g
out.append(np.zeros(int(SR * 1.6), np.float32))
audio = np.concatenate(out)
audio = audio / np.abs(audio).max() * 0.92 * 32767
import os
os.makedirs("build", exist_ok=True)
with wave.open("build/narration.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(audio.astype(np.int16).tobytes())
total = len(audio) / SR
json.dump({"duration": round(total, 3), "musicSwitchLine": S.get("musicSwitchLine"), "lines": lines, "words": words}, open("build/timings.json", "w"), indent=1)
nw = len(words)
print(f"duration {total:.1f}s, {nw} words, {nw / total * 60:.0f} wpm, whisper-aligned {aligned}/{len(lines)} lines")
