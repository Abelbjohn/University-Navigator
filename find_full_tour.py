import urllib.request
import re

url = "https://webstor.srmist.edu.in/web_assets/srmist-virtual-tour-vo/script.js?v=1643618266401"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    full_script = resp.read().decode('utf-8', errors='ignore')

matches = [m.start() for m in re.finditer(r'loadTour', full_script)]
print("loadTour positions:", matches)
for pos in matches:
    print("--- SNIPPET ---")
    print(full_script[max(0, pos-100):min(len(full_script), pos+500)])
