import json
import re

with open("script_general.js", "r", encoding="utf-8") as f:
    text = f.read()

with open("vt_en_lines.txt", "r", encoding="utf-8") as f:
    en_lines = f.readlines()

label_map = {}
for line in en_lines:
    if ".label =" in line:
        parts = line.strip().split(".label =")
        key = parts[0].strip()
        val = parts[1].strip()
        label_map[key] = val

print(f"Total labeled items: {len(label_map)}")

# Find panorama definitions in script_general.js
# Look for pattern: id:"panorama_...", ...
pano_ids = re.findall(r'id:"(panorama_[A-F0-9_]+)"', text)
print(f"Total panoramas in script: {len(set(pano_ids))}")

# Check which ones have labels
labeled_panos = [(pid, label_map.get(pid, "Unknown")) for pid in set(pano_ids) if pid in label_map]
print("Labeled Panoramas count:", len(labeled_panos))
for pid, lbl in sorted(labeled_panos, key=lambda x: x[1]):
    print(f"{lbl:35} -> {pid}")
