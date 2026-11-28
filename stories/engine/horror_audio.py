"""Night-horror score + SFX for folklore episodes (all synthesized) -> build/music.wav, build/sfx.wav
Reads build/timings.json. Line sfx cues: [[kind, fraction_of_line]].
kinds: hit, sting, thud, laugh, heartbeat, rustle, release, phone, riser
Music: low detuned drone + wind + night insects, with dissonant bell pings; swells toward the end.
"""
import json, wave
import numpy as np
from scipy.signal import lfilter, butter, sosfilt

SR = 44100
T = json.load(open("build/timings.json"))
dur = T["duration"]; n = int(SR * dur); t = np.arange(n) / SR
rnd = np.random.default_rng(11)
lines = T["lines"]

def lp(x, fc): return sosfilt(butter(2, fc, "low", fs=SR, output="sos"), x)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def env_ad(length, a, d):
    tt = np.arange(int(length * SR)) / SR
    return np.minimum(1, tt / max(a, 1e-4)) * np.exp(-tt / d)

# ---------------- music bed ----------------
L = np.zeros(n); R = np.zeros(n)
# intensity curve: low at start, rises through the story, dips at the release, peaks at the end
inten = np.full(n, 0.55)
for i, ln in enumerate(lines):
    k = i / max(1, len(lines) - 1)
    a, b = int(ln["start"] * SR), int(min(dur, ln["end"] + 0.3) * SR)
    inten[a:b] = 0.5 + 0.45 * k
for i in (17, 18):  # porch light + morning: breathe out
    if i < len(lines):
        a, b = int(lines[i]["start"] * SR), int(min(dur, lines[i]["end"] + 0.3) * SR); inten[a:b] = 0.35
inten = np.convolve(inten, np.ones(SR) / SR, mode="same")

drone = np.zeros(n)
for m, g in ((38, 1.0), (45, 0.55), (50, 0.35), (51, 0.18)):  # D, A, D, Eb (minor-second rub)
    f = hz(m)
    drone += g * (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.003 * t + 1) + 0.25 * np.sin(2 * np.pi * f * 2.001 * t))
drone *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t)
drone = lp(drone, 420) * inten
wind = lp(rnd.standard_normal(n), 500) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.05 * t + 2)) * 0.9
# night insects: chirp trains around 4.6 kHz and a soft cricket bed
ins = np.zeros(n)
car = np.sin(2 * np.pi * 4600 * t) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 32 * t)))
gate = (np.sin(2 * np.pi * 1.6 * t) > 0.55).astype(float)
gate = np.convolve(gate, np.ones(300) / 300, mode="same")
ins += car * gate * 0.10
ins += bp(rnd.standard_normal(n), 5200, 7200) * 0.04 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * t))
mus = drone / (np.abs(drone).max() + 1e-9) * 0.75 + wind / (np.abs(wind).max() + 1e-9) * 0.18
L += mus + ins; R += mus + np.roll(ins, 900)
# dissonant bell pings every few seconds (left/right)
def bell(f, length=4.0):
    tt = np.arange(int(length * SR)) / SR
    return sum(np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * (1.2 + j)) / (j + 1) for j, r in enumerate((1, 2.76, 5.4, 8.9)))
tb = 3.0; j = 0
while tb < dur - 4:
    s = bell(hz((74, 80, 73, 79)[j % 4])) * 0.07; a = int(tb * SR); b = min(n, a + len(s))
    (L if j % 2 else R)[a:b] += s[:b - a] * (0.6 if j % 2 else 1.0); (R if j % 2 else L)[a:b] += s[:b - a] * 0.4
    tb += 6.5 + rnd.uniform(-1, 1.5); j += 1
pk = max(np.abs(L).max(), np.abs(R).max()) + 1e-9
music = (L / pk * 0.9, R / pk * 0.9)

# ---------------- sound effects ----------------
L = np.zeros(n); R = np.zeros(n)
def add(sig, t0, g=1.0, pan=0.0):
    s = int(t0 * SR)
    if s >= n: return
    a, b = max(0, -s), min(len(sig), n - s)
    if a >= b: return
    L[s + a:s + b] += sig[a:b] * g * (1 - max(0, pan)); R[s + a:s + b] += sig[a:b] * g * (1 + min(0, pan))
def norm(x): return x / (np.abs(x).max() + 1e-9)

def sfx(kind, t0):
    if kind == "hit":  # cinematic boom: sub drop + noise thump + long tail
        ln = 3.5; tt = np.arange(int(ln * SR)) / SR
        f = 55 * np.exp(-tt * 1.2) + 28
        sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.3)
        thump = lp(rnd.standard_normal(len(tt)), 900) * np.exp(-tt * 9)
        tail = lp(rnd.standard_normal(len(tt)), 300) * np.exp(-tt * 1.0) * 0.4
        add(norm(sub + norm(thump) * 0.6 + norm(tail) * 0.3), t0, 0.95)
    elif kind == "sting":  # screechy string cluster
        ln = 1.6; tt = np.arange(int(ln * SR)) / SR
        x = sum(np.sign(np.sin(2 * np.pi * f * tt + np.sin(tt * 37) * 0.4)) for f in (1244, 1318, 1396, 1864))
        x = bp(x, 900, 4200) * np.minimum(1, tt / 0.05) * np.exp(-tt * 1.8)
        add(norm(x), t0, 0.28, -0.2); add(norm(x), t0 + 0.01, 0.2, 0.3)
    elif kind == "thud":  # foot on wood/roots
        ln = 0.5; tt = np.arange(int(ln * SR)) / SR
        add(norm(np.sin(2 * np.pi * 75 * tt) * np.exp(-tt * 18) + lp(rnd.standard_normal(len(tt)), 600) * np.exp(-tt * 30) * 0.6), t0, 0.9)
    elif kind == "laugh":  # slow, deep giant laugh: 4 vowel pulses
        for q in range(4):
            ln = 0.55; tt = np.arange(int(ln * SR)) / SR
            f0 = 62 - q * 3; ph = 2 * np.pi * np.cumsum(f0 + 6 * np.sin(tt * 30)) / SR
            src = sum(np.sin(ph * h) / h for h in range(1, 30))
            v = bp(src, 300, 700) * 1.0 + bp(src, 900, 1300) * 0.5 + lp(src, 250) * 0.8
            v *= np.sin(np.pi * tt / ln) ** 1.5
            add(norm(v), t0 + q * 0.62, 0.75 - q * 0.08, (-0.15, 0.15)[q % 2])
    elif kind == "heartbeat":
        for j in range(5):
            for off, g in ((0, 1.0), (0.24, 0.65)):
                tt = np.arange(int(0.25 * SR)) / SR
                add(np.sin(2 * np.pi * 52 * tt) * np.exp(-tt * 20), t0 + j * 0.85 + off, 0.9 * g)
    elif kind == "rustle":
        ln = 1.2; x = rnd.standard_normal(int(ln * SR)); tt = np.arange(len(x)) / SR
        add(norm(bp(x, 1500, 6000) * (0.5 + 0.5 * np.abs(np.sin(tt * 17))) * np.sin(np.pi * tt / ln)), t0, 0.22)
    elif kind == "release":  # soft warm chord, relief
        ln = 4.0; tt = np.arange(int(ln * SR)) / SR
        x = sum(np.sin(2 * np.pi * hz(m) * tt) for m in (62, 66, 69, 74)) * np.minimum(1, tt / 0.8) * np.exp(-tt * 0.7)
        add(norm(x), t0, 0.16)
    elif kind == "phone":  # vibrate buzz x3
        for j in range(3):
            ln = 0.42; tt = np.arange(int(ln * SR)) / SR
            add(norm(np.sign(np.sin(2 * np.pi * 172 * tt)) * lp(np.ones(len(tt)), 50) + rnd.standard_normal(len(tt)) * 0.05) * np.minimum(1, tt / 0.01) * np.minimum(1, (ln - tt) / 0.02), t0 + j * 0.75, 0.18)
    elif kind == "riser":
        ln = 3.0; tt = np.arange(int(ln * SR)) / SR
        x = bp(rnd.standard_normal(len(tt)), 400, 3000) * (tt / ln) ** 2
        add(norm(x), t0 - ln, 0.25)

for ln in lines:
    d = ln["end"] - ln["start"]
    for kind, frac in ln.get("sfx", []): sfx(kind, ln["start"] + frac * d)
# riser into the last hit
last = lines[-1]
for kind, frac in last.get("sfx", []):
    if kind == "hit": sfx("riser", last["start"] + frac * (last["end"] - last["start"]))

def write(path, l, r):
    st = np.clip(np.stack([l, r], 1), -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
write("build/music.wav", *music)
pk = max(np.abs(L).max(), np.abs(R).max(), 1.0)
write("build/sfx.wav", L / pk, R / pk)
print("horror music + sfx written", round(dur, 1), "s")
