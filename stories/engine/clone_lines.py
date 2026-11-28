"""Voice-clone narration lines with Chatterbox (runs in its own venv: /home/user/venvs/clone).
Usage: clone_lines.py <reference_audio> <jobs.json>   jobs: [{"out": path.wav, "text": str, "exaggeration": f, "cfg": f}]
Skips jobs whose output already exists (cache)."""
import json, os, sys
import soundfile as sf
from chatterbox.tts import ChatterboxTTS
ref, jobs = sys.argv[1], [j for j in json.load(open(sys.argv[2])) if not os.path.exists(j["out"])]
if jobs:
    m = ChatterboxTTS.from_pretrained(device="cpu")
    for i, j in enumerate(jobs):
        w = m.generate(j["text"], audio_prompt_path=ref, exaggeration=j.get("exaggeration", 0.4), cfg_weight=j.get("cfg", 0.5))
        sf.write(j["out"], w.squeeze().numpy(), m.sr)
        print(f"cloned {i + 1}/{len(jobs)}", flush=True)
