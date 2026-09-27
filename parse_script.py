import re

with open("vt_script_sample.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Search for URLs or paths
urls = re.findall(r'["\']([^"\']+\.(?:png|jpg|json|txt|js))["\']', text)
print("File URLs in script:", set(urls))

# Check where 'map' occurs
for line in text.splitlines():
    if "map" in line.lower() or "locale" in line.lower():
        print(line[:120])
