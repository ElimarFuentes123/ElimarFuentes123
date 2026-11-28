"""Narration for an episode: Piper TTS per line -> build/narration.wav + build/timings.json.
Word times come from faster-whisper on each line (fallback: proportional by length).
Usage (from the episode folder): python3 ../engine/tts.py <voices_dir> [voice_name]
"""
import io, json, sys, wave, re
import numpy as np
from piper import PiperVoice
from piper.config import SynthesisConfig

VOICES = sys.argv[1]
S = json.load(open("script.json"))
TTS = S.get("tts", {"engine": "piper", "voice": sys.argv[2] if len(sys.argv) > 2 else "en_US-lessac-high"})
if TTS["engine"] == "kokoro":
    # Kokoro voice tuned to the viral-reference narrator style (expressive, ~170 wpm, bright pitch)
    import subprocess, tempfile, soundfile as sf
    from kokoro_onnx import Kokoro
    kk = Kokoro(f"{VOICES}/kokoro-v1.0.onnx", f"{VOICES}/voices-v1.0.bin")
    SR = 24000
elif TTS["engine"] == "elevenlabs":
    # ElevenLabs via HTTPS; the API key is injected by the environment's network proxy (never stored here)
    import subprocess, tempfile, hashlib, os
    SR = 24000
else:
    SR = 22050
    voice = PiperVoice.load(f"{VOICES}/{TTS['voice']}.onnx")
    cfg = SynthesisConfig(length_scale=S.get("speed", 0.9), noise_scale=0.6, noise_w_scale=0.7)

try:
    from faster_whisper import WhisperModel
    wm = WhisperModel("small", compute_type="int8")
except Exception:
    wm = None

def synth(text, prev_text="", next_text=""):
    if TTS["engine"] == "elevenlabs":
        body = {"text": text, "model_id": TTS.get("model", "eleven_multilingual_v2"), "previous_text": prev_text, "next_text": next_text,
                "voice_settings": {"stability": TTS.get("stability", 0.32), "similarity_boost": 0.75, "style": TTS.get("style", 0.45),
                                   "use_speaker_boost": True, "speed": TTS.get("speed", 1.0)}}
        key = hashlib.sha1(json.dumps([TTS, body], sort_keys=True).encode()).hexdigest()[:16]
        os.makedirs("build/el_cache", exist_ok=True)
        mp3 = f"build/el_cache/{key}.mp3"
        if not os.path.exists(mp3):
            with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
                json.dump(body, f)
            r = subprocess.run(["curl", "-sS", "-o", mp3, "-w", "%{http_code}", "-X", "POST",
                                f"https://api.elevenlabs.io/v1/text-to-speech/{TTS['voice_id']}?output_format=mp3_44100_128",
                                "-H", "xi-api-key: proxy-injected", "-H", "Content-Type: application/json", "--data", f"@{f.name}"],
                               capture_output=True, text=True)
            if r.stdout.strip() != "200":
                err = open(mp3, "rb").read()[:300]; os.remove(mp3)
                raise SystemExit(f"ElevenLabs error {r.stdout}: {err}")
        wav = mp3[:-4] + ".wav"
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", mp3, "-ac", "1", "-ar", str(SR), "-f", "s16le", wav], check=True)
        a = np.fromfile(wav, np.int16).astype(np.float32)
        nz = np.where(np.abs(a) > 300)[0]
        return a[max(0, nz[0] - 200): nz[-1] + 400]
    if TTS["engine"] == "kokoro":
        a, sr = kk.create(text, voice=TTS["voice"], speed=TTS.get("speed", 0.92), lang="en-us")
        semi = TTS.get("pitch", 0)
        if semi:
            with tempfile.TemporaryDirectory() as d:
                sf.write(f"{d}/i.wav", a, sr)
                subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", f"{d}/i.wav", "-af", f"rubberband=pitch={2 ** (semi / 12):.4f}:formant=preserved", f"{d}/o.wav"], check=True)
                a, sr = sf.read(f"{d}/o.wav", dtype="float32")
        a = a.astype(np.float32) * 32767 * 0.9 / (np.abs(a).max() + 1e-9)
        nz = np.where(np.abs(a) > 300)[0]
        return a[max(0, nz[0] - 200): nz[-1] + 400]
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
    prev_t = S["lines"][i - 1]["text"].replace("*", "") if i else ""
    next_t = S["lines"][i + 1]["text"].replace("*", "") if i + 1 < len(S["lines"]) else ""
    a = synth(spoken, prev_t, next_t) if TTS["engine"] == "elevenlabs" else synth(spoken)
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
json.dump({"duration": round(total, 3), "musicSwitchLine": S.get("musicSwitchLine"), "music": S.get("music", {}), "lines": lines, "words": words}, open("build/timings.json", "w"), indent=1)
nw = len(words)
print(f"duration {total:.1f}s, {nw} words, {nw / total * 60:.0f} wpm, whisper-aligned {aligned}/{len(lines)} lines")
