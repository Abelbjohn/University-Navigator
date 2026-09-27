import urllib.request
import re

url = "https://webstor.srmist.edu.in/web_assets/srmist-virtual-tour-vo/script_general.js?v=1643618266401"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        print(f"script_general.js length: {len(content)}")
        with open("script_general.js", "w", encoding="utf-8") as f:
            f.write(content)
        print("Saved to script_general.js")
        # Search for images, maps, floorplans
        images = re.findall(r'["\']([^"\']+\.(?:png|jpg|svg))["\']', content)
        print("Images found:", set(images))
except Exception as e:
    print("Error:", e)
