#!/usr/bin/env bash
# Build an "In This Town" episode end to end.
#   stories/engine/build.sh <episode-folder-name> <piper-voices-dir> [voice]  (or set "tts" in script.json: {"engine":"kokoro","voice":"am_fenrir","speed":0.84,"pitch":5})
# Steps: narration (Piper + Whisper word timing) -> music/SFX -> 3D frames -> final MP4 in renders/
set -euo pipefail
EP="$1"; VOICES="$2"; VOICE="${3:-en_US-lessac-high}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/stories/$EP"
python3 ../engine/tts.py "$VOICES" "$VOICE"
python3 ../engine/$(python3 -c 'import json;print(json.load(open("script.json")).get("audio","audio"))').py
MV=$(python3 -c 'import json;print(json.load(open("script.json")).get("mix",{}).get("music",0.16))')
SV=$(python3 -c 'import json;print(json.load(open("script.json")).get("mix",{}).get("sfx",0.55))')
rm -rf build/frames
node ../engine/render.cjs "$EP"
mkdir -p "$ROOT/renders"
ffmpeg -loglevel error -y -framerate 30 -i build/frames/%05d.jpg -i build/narration.wav -i build/music.wav -i build/sfx.wav \
  -filter_complex "[1]aresample=44100,pan=stereo|c0=c0|c1=c0[v];[2]volume=${MV}[m];[3]volume=${SV}[s];[v][m][s]amix=inputs=3:duration=longest:normalize=0,alimiter=limit=0.95[a];[0]eq=saturation=1.12:contrast=1.04,format=yuv420p[vid]" \
  -map "[vid]" -map "[a]" -c:v libx264 -preset slow -crf 19 -c:a aac -b:a 192k -movflags +faststart -shortest "$ROOT/renders/$EP.mp4"
echo "done: renders/$EP.mp4"
