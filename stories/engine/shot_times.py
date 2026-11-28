"""Print mid-time of each shot (or of the named shots): python3 ../engine/shot_times.py [name,name]"""
import json, sys
T = json.load(open("build/timings.json")); L = T["lines"]; want = sys.argv[1].split(",") if len(sys.argv) > 1 else None; out = []
for i, l in enumerate(L):
    s0 = 0 if i == 0 else l["start"] - 0.08; s1 = L[i + 1]["start"] - 0.08 if i + 1 < len(L) else T["duration"]
    w = l.get("weights") or [1] * len(l["shots"]); tot = sum(w); acc = s0
    for j, n in enumerate(l["shots"]):
        d = (s1 - s0) * w[j] / tot
        if not want or n in want: out.append(round(acc + d * 0.6, 2))
        acc += d
print(",".join(map(str, out)))
