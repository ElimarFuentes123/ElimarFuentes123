"""Soft synthesized piano + pad bed (original, royalty-free) -> build/music.wav"""
import json, wave, numpy as np
SR = 44100
T = json.load(open("build/timings.json"))
dur = T["duration"]
n = int(SR * dur)
out = np.zeros(n, np.float32)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def piano(m, t0, vel=0.25, length=3.0):
    s = int(t0 * SR); L = min(int(length * SR), n - s)
    if L <= 0: return
    t = np.arange(L) / SR; f = hz(m)
    w = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.6 * np.exp(-t * (1.2 + k * 0.7)) for k in range(1, 7))
    w *= np.minimum(1, t / 0.005)
    out[s:s + L] += vel * w
def pad(ms, t0, length, vel=0.035):
    s = int(t0 * SR); L = min(int(length * SR), n - s)
    t = np.arange(L) / SR
    env = np.minimum(1, t / 1.2) * np.minimum(1, (length - t) / 1.2)
    for m in ms:
        f = hz(m)
        out[s:s + L] += vel * env * (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.003 * t))
# Am F C G (sad), then turn hopeful: F G C Am / F G C
beat = 60 / 72
prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
t = 0.0; bar = 0
while t < dur - 1:
    ch = prog[bar % 4]
    pad([c - 12 for c in ch], t, beat * 4 + 1.2)
    piano(ch[0] - 12, t, 0.22, 4)
    # arpeggio pattern
    pat = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12]
    for i, m in enumerate(pat):
        piano(m, t + i * beat, 0.11 if bar < 7 else 0.14, 2.5)
    t += beat * 4; bar += 1
# shimmer sfx when the hand turns warm again
sh = next(l for l in T["lines"] if l["shot"] == "handback")["start"] - 0.3
for i, m in enumerate([84, 88, 91, 96, 100]):
    piano(m, sh + i * 0.07, 0.07, 2.0)
out = np.tanh(out * 1.2)
fade = int(SR * 2.5); out[-fade:] *= np.linspace(1, 0, fade)
out[:int(SR * 1.0)] *= np.linspace(0, 1, int(SR * 1.0))
st = np.stack([out, np.roll(out, 300) * 0.95], 1)
st = st / np.abs(st).max() * 0.6
with wave.open("build/music.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print("ok")
