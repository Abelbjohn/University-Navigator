import urllib.request
import urllib.parse
import json

landmarks = [
    "Tech Park SRM Kattankulathur",
    "University Building SRM Kattankulathur",
    "T.P. Ganesan Auditorium SRM",
    "SRM Central Library Kattankulathur",
    "Bioengineering block SRM",
    "SRM Hospital Kattankulathur",
    "Potheri Railway Station",
    "Java Canteen SRM",
    "Basic Engineering Lab SRM",
    "Main Arch Gate SRM",
    "Paari Hostel SRM",
    "Kaari Hostel SRM"
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

for lm in landmarks:
    url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(lm)}&format=json&limit=1"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            res = json.loads(r.read().decode('utf-8'))
            if res:
                print(f"{lm:35} -> lat: {res[0]['lat']}, lon: {res[0]['lon']}, name: {res[0]['display_name'][:60]}")
            else:
                print(f"{lm:35} -> Not found on Nominatim")
    except Exception as e:
        print(f"{lm:35} -> Error: {e}")
