import urllib.request

url = "https://webstor.srmist.edu.in/web_assets/srmist-virtual-tour-vo/locale/en.txt?v=1643618266401"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    lines = resp.read().decode('utf-8', errors='ignore').splitlines()

print(f"Total lines in locale/en.txt: {len(lines)}")
# Print lines with meaningful labels or titles
with open("vt_en_lines.txt", "w", encoding="utf-8") as f:
    for line in lines:
        if any(term in line.lower() for term in ["park", "building", "hall", "gate", "road", "block", "auditorium", "entry", "zone", "hostel", "statue", "library", "hospital", "arch", "canteen", "quad"]):
            f.write(line + "\n")
            print(line)

print("Saved filtered lines to vt_en_lines.txt")
