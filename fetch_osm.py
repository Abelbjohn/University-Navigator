import urllib.request
import urllib.parse
import json

query = """[out:json][timeout:25];
(
  way["name"](12.818,80.038,12.830,80.048);
  relation["name"](12.818,80.038,12.830,80.048);
  node["name"](12.818,80.038,12.830,80.048);
);
out tags center;
"""

url = "https://overpass-api.de/api/interpreter?data=" + urllib.parse.quote(query)
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json'
})

try:
    with urllib.request.urlopen(req, timeout=30) as res:
        data = json.loads(res.read())
        elements = data.get('elements', [])
        print(f"Total elements: {len(elements)}")
        results = []
        for el in elements:
            tags = el.get('tags', {})
            center = el.get('center', {})
            lat = center.get('lat', el.get('lat'))
            lon = center.get('lon', el.get('lon'))
            results.append({
                'name': tags.get('name'),
                'type': el.get('type'),
                'lat': lat,
                'lon': lon,
                'building': tags.get('building'),
                'amenity': tags.get('amenity')
            })
        results.sort(key=lambda x: str(x['name']))
        for r in results:
            print(f"{r['name']} -> lat={r['lat']}, lon={r['lon']} (bldg: {r['building']}, amenity: {r['amenity']})")
        with open('osm_results.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2)
except Exception as e:
    print("Fetch error:", e)
