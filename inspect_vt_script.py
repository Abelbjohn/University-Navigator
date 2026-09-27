import urllib.request
import re

url = "https://webstor.srmist.edu.in/web_assets/srmist-virtual-tour-vo/script.js?v=1643618266401"
headers = {'User-Agent': 'Mozilla/5.0'}
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        print(f"Content length: {len(content)}")
        # Look for scenes, panoramas, floorplans, maps
        matches = re.findall(r'(\b[A-Za-z0-9_]+\.(?:jpg|png|json|xml|txt)\b)', content)
        print("Unique file matches:", sorted(list(set(matches)))[:30])
        # Look for keywords
        for kw in ["map", "floor", "plan", "building", "road", "gate", "locale", "data"]:
            count = len(re.findall(kw, content, re.IGNORECASE))
            print(f"Keyword '{kw}': {count} occurrences")
        # Save a sample to inspect
        with open("vt_script_sample.txt", "w", encoding="utf-8") as f:
            f.write(content[:20000])
        print("Saved sample to vt_script_sample.txt")
except Exception as e:
    print("Error:", e)
