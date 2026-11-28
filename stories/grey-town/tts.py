"""Narration: Piper TTS per line -> narration.wav + timings.json (line + word timings)."""
import json, sys, wave, io, numpy as np
from piper import PiperVoice
from piper.config import SynthesisConfig

VOICES = sys.argv[1]
SR = 22050
lines = json.load(open("script.json"))
narr = PiperVoice.load(f"{VOICES}/en_US-lessac-high.onnx")
gpa = PiperVoice.load(f"{VOICES}/en_US-ryan-high.onnx")

def synth(v, text, cfg):
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        v.synthesize_wav(text, w, syn_config=cfg)
    buf.seek(0)
    with wave.open(buf) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)
    nz = np.where(np.abs(a) > 300)[0]
    return a[nz[0]:nz[-1] + 1]

out, t, timings, words = [], 0.6, [], []
out.append(np.zeros(int(SR * 0.6), np.float32))
for i, ln in enumerate(lines):
    if ln.get("voice") == "grandpa":
        a = synth(gpa, ln["text"], SynthesisConfig(length_scale=1.12, noise_scale=0.6))
    else:
        a = synth(narr, ln["text"], SynthesisConfig(length_scale=1.0, noise_scale=0.55))
    dur = len(a) / SR
    timings.append({"shot": ln["shot"], "start": round(t, 3), "end": round(t + dur, 3)})
    # word timings proportional to character length (+ weight for punctuation pauses)
    ws = ln["text"].split()
    wt = [len(w.strip(".,?!")) + 2 + (4 if w[-1] in ".?!" else 2 if w[-1] == "," else 0) for w in ws]
    acc = 0
    for w, k in zip(ws, wt):
        words.append({"w": w.strip(".,?!"), "start": round(t + dur * acc / sum(wt), 3)})
        acc += k
    out.append(a)
    gap = 0.75 if i in (3, 8, 9, 11) else 0.45
    out.append(np.zeros(int(SR * gap), np.float32))
    t += dur + gap
out.append(np.zeros(int(SR * 1.5), np.float32))
audio = np.concatenate(out)
audio = audio / np.abs(audio).max() * 0.9 * 32767
with wave.open("build/narration.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(audio.astype(np.int16).tobytes())
total = len(audio) / SR
json.dump({"duration": round(total, 3), "lines": timings, "words": words}, open("build/timings.json", "w"), indent=1)
print("duration", total)
