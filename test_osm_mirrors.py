import urllib.request
import urllib.parse
import json

endpoints = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
]

query = """[out:json][timeout:25];
(
  way["name"](12.820,80.038,12.828,80.048);
  node["name"](12.820,80.038,12.828,80.048);
);
out tags center;
"""

for ep in endpoints:
    try:
        url = ep + "?data=" + urllib.parse.quote(query)
        req = urllib.request.Request(url, headers={'User-Agent': 'CampusMapApp/1.0 (contact@srmist.edu.in)'})
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read())
            print(f"Success from {ep}, elements: {len(data.get('elements', []))}")
            for el in data.get('elements', []):
                tags = el.get('tags', {})
                c = el.get('center', {})
                lat = c.get('lat', el.get('lat'))
                lon = c.get('lon', el.get('lon'))
                print(f"  {tags.get('name')} | bldg: {tags.get('building')} | ({lat}, {lon})")
            break
    except Exception as e:
        print(f"Failed {ep}: {e}")
