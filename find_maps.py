with open("script_general.js", "r", encoding="utf-8") as f:
    text = f.read()

import re

# Look for floorplan or map overlays
for m in re.finditer(r'(?:floorplan|map|overlay|graphic|plan)', text, re.IGNORECASE):
    idx = m.start()
    snippet = text[max(0, idx-50):min(len(text), idx+150)]
    if any(ext in snippet for ext in [".png", ".jpg", ".svg", "title", "label"]):
        print("MATCH:", snippet.replace("\n", " "))
