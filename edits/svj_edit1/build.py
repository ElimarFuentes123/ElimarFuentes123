#!/usr/bin/env python3
"""SVJ car edit #1 — style of references/ref1 (beat-synced, B&W intro, kinetic text, night drop).

Run from repo root:  python3 edits/svj_edit1/build.py
Output: renders/svj_edit1.mp4 (1080x1920, 30fps, song baked in)
"""
import os
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CLIPS = os.path.join(ROOT, "clips")
MUSIC = os.path.join(ROOT, "references", "ref1", "music.m4a")
FONTS = os.path.join(ROOT, "assets", "fonts")
WORK = os.path.join(ROOT, "renders", "svj_edit1_work")
OUT = os.path.join(ROOT, "renders", "svj_edit1.mp4")
W, H, FPS = 1080, 1920, 30
END = 23.9

# Song beats (hyperframes beats, ~111 BPM)
# (start_in_output, clip, src_time, grade, fx, speed, cx)
#   grade: bw | text | build | drop | night | black
#   fx: set of flash / glitch / punch / shake
#   speed: playback speed (0.5 = slow-mo)
#   cx: horizontal crop centre for 16:9 sources (0..1)
SEGS = [
    # --- B&W intro, half-beat cuts
    (0.00, 3, 0.05, "bw", {"punch"}, 1.0, 0.45),
    (0.29, 2, 0.90, "bw", {"flash", "shake"}, 1.0, 0.45),
    (0.54, 4, 2.00, "bw", {"glitch"}, 1.0, 0.5),
    (0.79, 2, 8.80, "bw", {"flash", "punch"}, 1.0, 0.65),
    (1.04, 3, 0.70, "bw", {"shake"}, 1.0, 0.5),
    (1.30, 4, 11.40, "bw", {"flash", "glitch"}, 1.0, 0.5),
    (1.56, 2, 14.80, "bw", {"punch"}, 1.0, 0.5),
    (1.82, 4, 4.00, "bw", {"flash", "shake"}, 1.0, 0.5),
    # --- kinetic text over dark slow-mo
    (2.08, 2, 2.70, "text", {"flash"}, 0.5, 0.5),
    (4.28, 2, 6.70, "text", set(), 0.5, 0.5),
    # --- build-up, desaturated slow-mo, 2 beats each
    (6.33, 1, 3.40, "build", set(), 0.6, 0.5),
    (7.50, 2, 10.70, "build", set(), 0.6, 0.5),
    (8.62, 1, 12.10, "build", set(), 0.6, 0.5),
    (9.73, 4, 6.00, "build", set(), 0.6, 0.5),
    (10.82, 1, 20.10, "build", set(), 0.6, 0.45),
    (11.93, 3, 19.40, "build", set(), 0.6, 0.5),
    (12.96, 4, 14.60, "build", set(), 0.6, 0.5),
    (13.98, 1, 18.10, "build", {"punch"}, 0.6, 0.5),
    # --- drop
    (15.04, 1, 4.00, "drop", {"flash", "shake"}, 1.0, 0.45),
    # --- night section, cut on every beat
    (15.55, 1, 26.80, "night", {"flash", "punch"}, 1.0, 0.3),
    (16.09, 3, 14.00, "night", {"glitch"}, 1.0, 0.5),
    (16.61, 1, 32.70, "night", {"flash", "shake"}, 1.0, 0.5),
    (17.18, 4, 10.00, "night", {"punch"}, 1.0, 0.5),
    (17.80, 1, 25.40, "night", {"glitch", "shake"}, 1.0, 0.5),
    (18.32, 3, 8.90, "night", {"flash"}, 1.0, 0.5),
    (18.89, 1, 28.70, "night", {"glitch", "punch"}, 1.0, 0.45),
    (19.48, 2, 16.80, "night", {"flash"}, 1.0, 0.45),
    (20.05, 1, 14.00, "night", {"shake", "glitch"}, 1.0, 0.5),
    (20.57, 3, 16.70, "night", {"flash", "punch"}, 1.0, 0.5),
    (21.09, 4, 11.40, "night", {"glitch"}, 1.0, 0.5),
    (21.66, 2, 20.80, "night", {"flash", "punch"}, 1.0, 0.5),
    (22.25, 3, 12.00, "night", {"shake"}, 1.0, 0.5),
    (22.80, 1, 31.10, "night", {"flash", "glitch"}, 1.0, 0.5),
    (23.40, 0, 0, "black", set(), 1.0, 0.5),
]

GRADES = {
    "bw": "hue=s=0,eq=contrast=1.45:brightness=-0.02,noise=alls=10:allf=t",
    "text": "hue=s=0,eq=contrast=1.3:brightness=-0.28,vignette=PI/3.5",
    "build": "eq=saturation=0.45:contrast=1.2:brightness=0.0:gamma=1.15,vignette=PI/3.5,noise=alls=6:allf=t",
    "drop": "eq=contrast=1.3,colorchannelmixer=rr=1.2:gg=0.35:bb=0.35,vignette=PI/4",
    "night": "eq=contrast=1.15:saturation=1.2:brightness=0.0:gamma=1.12,"
             "colorbalance=rs=-0.06:gs=0.0:bs=0.10:rh=0.08:bh=-0.05,vignette=PI/4.5",
}


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.exit(f"FAILED: {' '.join(cmd)}\n{r.stderr[-2000:]}")


def frame_filter(clip, cx, fx):
    """Scale/crop to 9:16 with optional punch-zoom and shake."""
    zoom = "1.12"
    if "punch" in fx:
        zoom = "(1.12+0.22*max(0,1-t/0.22))"
    if clip == 4:  # already vertical
        sc = f"scale=w='trunc({W}*{zoom}/2)*2':h='trunc({H}*{zoom}/2)*2':eval=frame"
        xc = "(iw-ow)/2"
    else:
        sc = f"scale=w='trunc({H}*16/9*{zoom}/2)*2':h='trunc({H}*{zoom}/2)*2':eval=frame"
        xc = f"max(0,min(iw-ow,iw*{cx}-ow/2))"
    yc = "(ih-oh)/2"
    if "shake" in fx:
        xc = f"max(0,min(iw-ow,{xc}+if(lt(t,0.3),22*sin(t*95),0)))"
        yc = f"max(0,min(ih-oh,{yc}+if(lt(t,0.3),16*cos(t*80),0)))"
    return f"{sc},crop={W}:{H}:x='{xc}':y='{yc}'"


def build_segment(i, seg, dur):
    start, clip, src, grade, fx, speed, cx = seg
    out = os.path.join(WORK, f"seg{i:02d}.mp4")
    if grade == "black":
        run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i",
             f"color=black:s={W}x{H}:r={FPS}:d={dur:.3f}",
             "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", out])
        return out
    vf = [f"setpts=PTS/{speed}", f"fps={FPS}", frame_filter(clip, cx, fx), GRADES[grade]]
    if "glitch" in fx:
        vf.append("rgbashift=rh=-18:bh=18:gv=6:enable='lt(t,0.14)'")
    if "flash" in fx:
        vf.append("fade=t=in:st=0:d=0.09:color=white")
    vf.append("format=yuv420p")
    run(["ffmpeg", "-y", "-v", "error", "-ss", f"{src:.3f}",
         "-i", os.path.join(CLIPS, f"clip{clip}.mp4"),
         "-vf", ",".join(vf), "-t", f"{dur:.3f}", "-an",
         "-c:v", "libx264", "-crf", "16", "-preset", "fast", "-r", str(FPS), out])
    return out


def text(txt, font, size, t0, t1, y="(h-text_h)/2", pop=True, fade_out=False, color="white"):
    fs = f"{size}*(1+0.35*max(0\\,1-(t-{t0})/0.12))" if pop else str(size)
    alpha = "1"
    if fade_out:
        alpha = f"if(gt(t\\,{t1}-0.4)\\,max(0\\,({t1}-t)/0.4)\\,1)"
    return (f"drawtext=fontfile='{os.path.join(FONTS, font)}':text='{txt}':"
            f"fontsize='{fs}':fontcolor={color}:alpha='{alpha}':"
            f"x=(w-text_w)/2:y={y}:enable='between(t\\,{t0}\\,{t1})':"
            f"shadowcolor=black@0.6:shadowx=0:shadowy=6")


INTER = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
TEXTS = [
    text("THIS", INTER, 300, 2.08, 2.71),
    text("IS", INTER, 300, 2.71, 3.27, y="(h/2-text_h-10)"),
    text("THE", INTER, 300, 2.99, 3.27, y="(h/2+10)"),
    text("LAMBORGHINI", "BodoniModa-Black.ttf", 118, 3.27, 5.22, y="(h/2-text_h-20)"),
    text("AVENTADOR", "BodoniModa-Black.ttf", 140, 4.28, 5.22, y="(h/2+20)"),
    text("SVJ", "Anton.ttf", 520, 5.22, 6.33, fade_out=True),
    text("Some legends don’t need an introduction.", INTER.replace("Black", "SemiBold"), 50,
         9.73, 12.96, y="h*0.74", pop=False, fade_out=True),
    text("V12", "Anton.ttf", 560, 15.04, 15.55, color="white"),
    text("350 KM/H", "Anton.ttf", 210, 22.25, 22.80),
]


def main():
    os.makedirs(WORK, exist_ok=True)
    starts = [s[0] for s in SEGS] + [END]
    files = []
    for i, seg in enumerate(SEGS):
        dur = starts[i + 1] - starts[i]
        files.append(build_segment(i, seg, dur))
        print(f"seg {i:02d} {seg[0]:5.2f}s clip{seg[1]} @{seg[2]} {seg[3]}", flush=True)
    lst = os.path.join(WORK, "list.txt")
    with open(lst, "w") as f:
        f.writelines(f"file '{p}'\n" for p in files)
    run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst,
         "-i", MUSIC,
         "-filter_complex", "[0:v]" + ",".join(TEXTS) + "[v]",
         "-map", "[v]", "-map", "1:a", "-t", str(END),
         "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", OUT])
    print("wrote", OUT)


if __name__ == "__main__":
    main()
