"""Music bed + sound effects for an episode (all synthesized, royalty-free) -> build/mix_bg.wav
Reads build/timings.json (lines carry sfx cues [[type, fraction_of_line]] and a rain flag).
Section A (before musicSwitchLine): playful pizzicato. Section B: emotional piano, lifting to major for the last 3 lines.
"""
import json, wave
import numpy as np

SR = 44100
T = json.load(open("build/timings.json"))
dur = T["duration"]; n = int(SR * dur)
L = np.zeros(n, np.float32); R = np.zeros(n, np.float32)
rnd = np.random.default_rng(7)
lines = T["lines"]
sw = lines[T.get("musicSwitchLine") or len(lines)]["start"] if T.get("musicSwitchLine") is not None else dur
lift = lines[-3]["start"] - 0.3 if len(lines) > 3 else dur

def hz(m): return 440 * 2 ** ((m - 69) / 12)
def add(sig, t0, gain=1.0, pan=0.0):
    s = int(t0 * SR)
    if s >= n or s + len(sig) <= 0: return
    a, b = max(0, -s), min(len(sig), n - s)
    L[s + a:s + b] += sig[a:b] * gain * (1 - max(0, pan)); R[s + a:s + b] += sig[a:b] * gain * (1 + min(0, pan))
def tone(m, length, decay, harm=6, bright=1.6):
    t = np.arange(int(length * SR)) / SR; f = hz(m)
    w = sum(np.sin(2 * np.pi * f * k * t) / k ** bright * np.exp(-t * (decay + k * 0.8)) for k in range(1, harm + 1))
    return (w * np.minimum(1, t / 0.004)).astype(np.float32)
def noise(length): return rnd.standard_normal(int(length * SR)).astype(np.float32)
def lowpass(x, a):  # one-pole, a in (0,1): smaller = darker
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
    return y

# ---- section A: playful pizzicato (C major, 112 bpm) ----
beat = 60 / 112
progA = [[48, 52, 55, 60], [45, 48, 52, 57], [41, 45, 48, 53], [43, 47, 50, 55]]
t = 0.0; bar = 0
while t < sw - 0.1:
    ch = progA[bar % 4]
    for b in range(4):
        tb = t + b * beat
        if tb >= sw: break
        add(tone(ch[0] - 12 if b % 2 == 0 else ch[2] - 12, 0.5, 5, 4), tb, 0.22)
        add(tone(ch[(b + 1) % 4] + 12, 0.35, 9, 5, 1.2), tb, 0.10, -0.3)
        add(tone(ch[(b + 3) % 4] + 12, 0.3, 9, 5, 1.2), tb + beat / 2, 0.08, 0.3)
        click = noise(0.03) * np.exp(-np.arange(int(0.03 * SR)) / SR * 160)
        add(click, tb + beat / 2, 0.03)
    t += beat * 4; bar += 1

# ---- section B: emotional piano (A minor, 70 bpm), lifts to C major near the end ----
beatB = 60 / 70
progB = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
progC = [[53, 57, 60], [55, 59, 62], [48, 52, 55], [57, 60, 64]]
t = sw; bar = 0
while t < dur - 0.5:
    ch = (progC if t >= lift else progB)[bar % 4]
    tt = np.arange(int((beatB * 4 + 1.5) * SR)) / SR; env = np.minimum(1, tt / 1.0) * np.minimum(1, (beatB * 4 + 1.5 - tt) / 1.0)
    pad = sum(np.sin(2 * np.pi * hz(m - 12) * tt) + 0.5 * np.sin(2 * np.pi * hz(m - 12) * 1.004 * tt) for m in ch) * env
    add(pad.astype(np.float32), t, 0.028)
    add(tone(ch[0] - 12, 4, 0.9), t, 0.26)
    for i, m in enumerate([ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12]):
        add(tone(m, 2.5, 1.3), t + i * beatB, 0.12 if t < lift else 0.15, (-0.2, 0.2)[i % 2])
    t += beatB * 4; bar += 1

# crossfade the switch with a soft dip
k = int(sw * SR); f = int(0.6 * SR)
if 0 < k < n:
    w = np.ones(n, np.float32); w[max(0, k - f):k] = np.linspace(1, 0.2, min(f, k)); w[k:k + f] = np.linspace(0.2, 1, len(w[k:k + f]))
    L *= w; R *= w
mus_peak = max(np.abs(L).max(), np.abs(R).max()) + 1e-9
L *= 0.9 / mus_peak; R *= 0.9 / mus_peak
music = (L.copy(), R.copy())
L[:] = 0; R[:] = 0

# ---- sound effects ----
def sfx(kind, t0):
    if kind == "pop":
        tt = np.arange(int(0.18 * SR)) / SR; f = 900 * np.exp(-tt * 14) + 300
        add((np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 22)).astype(np.float32), t0, 0.5)
    elif kind == "sparkle":
        for i, m in enumerate([88, 91, 95, 100, 103]): add(tone(m, 1.2, 3, 3), t0 + i * 0.06, 0.09, (-0.4, 0.4)[i % 2])
    elif kind in ("thunder", "thunder_small"):
        big = kind == "thunder"; ln = 3.5 if big else 1.6
        x = lowpass(noise(ln), 0.02 if big else 0.04); tt = np.arange(len(x)) / SR
        env = (np.minimum(1, tt / 0.03) * np.exp(-tt * (1.1 if big else 2.5))) * (1 + 0.6 * np.sin(tt * 9))
        crack = noise(0.12) * np.exp(-np.arange(int(0.12 * SR)) / SR * 30)
        y = x * env / (np.abs(x).max() + 1e-9)
        add(y.astype(np.float32), t0, 0.9 if big else 0.45); add(lowpass(crack, 0.3), t0, 0.35 if big else 0.15)
    elif kind == "crowd":
        x = lowpass(noise(2.2), 0.08); tt = np.arange(len(x)) / SR
        env = np.minimum(1, tt / 0.4) * np.minimum(1, (2.2 - tt) / 0.6) * (1 + 0.4 * np.sin(tt * 13))
        add((x * env / (np.abs(x).max() + 1e-9)).astype(np.float32), t0, 0.25)
    elif kind == "whoosh":
        ln = 0.35; x = noise(ln); tt = np.arange(len(x)) / SR
        y = np.empty_like(x); acc = 0.0
        for i in range(len(x)):
            a = 0.03 + 0.25 * np.sin(np.pi * tt[i] / ln); acc += a * (x[i] - acc); y[i] = acc
        add((y * np.sin(np.pi * tt / ln) ** 2 / (np.abs(y).max() + 1e-9)).astype(np.float32), t0 - 0.12, 0.12)

for i, ln in enumerate(lines):
    d = ln["end"] - ln["start"]
    for kind, frac in ln.get("sfx", []): sfx(kind, ln["start"] + frac * d)
    if ln["start"] < sw: sfx("whoosh", ln["start"])

# ---- rain ambience: light while personal clouds are on screen, heavy for the storm ----
rain = lowpass(noise(dur), 0.35) * 0.5 + noise(dur) * 0.04
gain = np.zeros(n, np.float32)
for ln in lines:
    if ln.get("rain"):
        a, b = int((ln["start"] - 0.1) * SR), int(min(dur, ln["end"] + 0.4) * SR)
        gain[a:b] = np.maximum(gain[a:b], 1.0 if ln["start"] >= sw else 0.35)
kern = np.ones(int(0.25 * SR)) / int(0.25 * SR); gain = np.convolve(gain, kern, mode="same").astype(np.float32)
rain *= gain / (np.abs(rain).max() + 1e-9) * 0.55
L += rain; R += np.roll(rain, 400)

def write(path, l, r):
    st = np.stack([l, r], 1); st = np.clip(st, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
write("build/music.wav", *music)
write("build/sfx.wav", L, R)
print("music + sfx written", round(dur, 1), "s")
