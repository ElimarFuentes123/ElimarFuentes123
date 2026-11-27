#!/usr/bin/env python3
"""Roblox rant short generator.

script.txt + obby gameplay -> ElevenLabs voiceover -> phrase captions -> 1080x1920 MP4

Usage:
  python3 roblox-rants/make_rant.py roblox-rants/episodes/ep01_battery.txt GAMEPLAY.mp4 \
      [--voice TX3LPaxmHKxFdv7VOQHJ] [--speed 1.15] [--start 30] [--music music.mp3] \
      [--src-crop W:H:X:Y] [--blur-band Y0:Y1] [--out renders/ep01.mp4]

Notes:
- The script file is plain text. Blank lines and lines starting with # are ignored.
- The voice is cached next to the output (<name>.voice.mp3 + .align.json), so re-renders
  with different gameplay or caption tweaks don't spend ElevenLabs credits again.
- --src-crop / --blur-band are only for test renders that reuse someone else's footage
  (crop away their letterbox, blur their burned-in captions). Don't post those.
"""
import argparse, base64, json, os, random, re, subprocess, sys
import requests

W, H = 1080, 1920          # final frame
GH = 1280                  # gameplay window height (letterboxed like the reference)
GY = (H - GH) // 2         # top of the gameplay window
CAP_Y = 930                # caption centre line (sits over the character)
MAX_WORDS = 7              # max words per caption


def read_script(path):
    lines = [l.strip() for l in open(path, encoding="utf-8")]
    return " ".join(l for l in lines if l and not l.startswith("#"))


def tts(text, voice, speed, base):
    mp3, aj = base + ".voice.mp3", base + ".align.json"
    if os.path.exists(mp3) and os.path.exists(aj):
        a = json.load(open(aj))
        if a.get("text") == text and a.get("voice") == voice and a.get("speed") == speed:
            print("using cached voice", mp3)
            return mp3, a
    r = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps",
        headers={"xi-api-key": os.environ.get("ELEVENLABS_API_KEY", "proxy")},
        json={"text": text, "model_id": "eleven_multilingual_v2",
              "voice_settings": {"stability": 0.35, "similarity_boost": 0.8,
                                 "style": 0.35, "speed": speed}},
        timeout=300)
    r.raise_for_status()
    d = r.json()
    open(mp3, "wb").write(base64.b64decode(d["audio_base64"]))
    a = dict(d["alignment"], text=text, voice=voice, speed=speed)
    json.dump(a, open(aj, "w"))
    return mp3, a


def chunks(text):
    """Split into short caption phrases, breaking at punctuation first."""
    out = []
    for sent in re.findall(r"[^.!?]+[.!?]*", text):
        for part in re.split(r"(?<=,)\s+", sent.strip()):
            words = part.split()
            while words:
                n = len(words)
                take = n if n <= MAX_WORDS else (n + 1) // 2 if n <= MAX_WORDS * 2 else MAX_WORDS
                out.append(" ".join(words[:take])); words = words[take:]
    return [c for c in out if c]


def time_chunks(text, al, caps):
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    spoken = "".join(chars)
    pos, res = 0, []
    for c in caps:
        i = spoken.find(c, pos)
        if i < 0:
            i = pos
        j = min(i + len(c), len(st)) - 1
        res.append([c, st[i], en[j]]); pos = j + 1
    # each caption stays up until the next one starts (no flicker)
    for k in range(len(res) - 1):
        res[k][2] = max(res[k][2], res[k + 1][1])
    res[-1][2] += 0.4
    return res


def ass_time(t):
    t = max(t, 0); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def ass_clean(s):
    s = s.replace("\\", "").replace("{", "(").replace("}", ")")
    return s.replace("“", '"').replace("”", '"')


def write_ass(timed, path):
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Inter SemiBold,54,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2.2,1.5,5,90,90,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    with open(path, "w", encoding="utf-8") as f:
        f.write(head)
        for c, s, e in timed:
            f.write(f"Dialogue: 0,{ass_time(s)},{ass_time(e)},Cap,,0,0,0,,"
                    f"{{\\pos({W//2},{CAP_Y})}}{ass_clean(c)}\n")


def probe_dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                          "-of", "csv=p=0", p]).strip())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script"); ap.add_argument("gameplay")
    ap.add_argument("--voice", default="TX3LPaxmHKxFdv7VOQHJ")  # Liam: young, social-media energy
    ap.add_argument("--speed", type=float, default=1.15)
    ap.add_argument("--start", type=float, help="gameplay start second (default: random)")
    ap.add_argument("--music", help="optional background music, mixed quietly")
    ap.add_argument("--src-crop", help="crop the source first, W:H:X:Y")
    ap.add_argument("--blur-band", help="blur rows Y0:Y1 of the (cropped+scaled) gameplay window")
    ap.add_argument("--out")
    a = ap.parse_args()

    name = os.path.splitext(os.path.basename(a.script))[0]
    out = a.out or f"renders/{name}.mp4"
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    base = os.path.splitext(out)[0]

    text = read_script(a.script)
    mp3, al = tts(text, a.voice, a.speed, base)
    timed = time_chunks(text, al, chunks(text))
    ass = base + ".ass"; write_ass(timed, ass)
    vdur = probe_dur(mp3); total = vdur + 0.5
    words = len(text.split())
    print(f"voice {vdur:.1f}s, {words} words, {words / vdur * 60:.0f} wpm, {len(timed)} captions")

    gdur = probe_dur(a.gameplay)
    start = a.start if a.start is not None else (random.uniform(0, max(0, gdur - total - 1)))
    loop = ["-stream_loop", "-1"] if gdur - start < total else []

    v = "[0:v]"
    if a.src_crop:
        v += f"crop={a.src_crop},"
    v += f"scale={W}:{GH}:force_original_aspect_ratio=increase,crop={W}:{GH},setsar=1"
    if a.blur_band:
        y0, y1 = map(int, a.blur_band.split(":"))
        v += f",split[g][b];[b]crop={W}:{y1-y0}:0:{y0},boxblur=30:3[bb];[g][bb]overlay=0:{y0}"
    v += f",pad={W}:{H}:0:{GY}:black,ass={ass},fps=30,format=yuv420p[v]"

    inputs = [*loop, "-ss", f"{start:.2f}", "-i", a.gameplay, "-i", mp3]
    if a.music:
        inputs += ["-stream_loop", "-1", "-i", a.music]
        aud = "[1:a]volume=1.0[vo];[2:a]volume=0.12[mu];[vo][mu]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5[a]"
    else:
        aud = "[1:a]loudnorm=I=-14:TP=-1.5[a]"
    cmd = ["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", f"{v};{aud}",
           "-map", "[v]", "-map", "[a]", "-t", f"{total:.2f}",
           "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-c:a", "aac", "-b:a", "192k",
           "-movflags", "+faststart", out]
    subprocess.run(cmd, check=True)
    print("wrote", out)


if __name__ == "__main__":
    main()
