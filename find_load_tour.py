with open("vt_script_sample.txt", "r", encoding="utf-8") as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'loadTour', text)]
print("loadTour positions:", matches)
for pos in matches:
    print("--- SNIPPET ---")
    print(text[max(0, pos-200):min(len(text), pos+600)])
