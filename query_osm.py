import urllib.request
import json

overpass_url = "https://overpass-api.de/api/interpreter"
query = """[out:json][timeout:25];
(
  way["building"](12.818,80.038,12.828,80.050);
  relation["building"](12.818,80.038,12.828,80.050);
  way["highway"](12.818,80.038,12.828,80.050);
  way["leisure"](12.818,80.038,12.828,80.050);
  node["amenity"](12.818,80.038,12.828,80.050);
);
out tags center;"""

req = urllib.request.Request(overpass_url, data=query.encode("utf-8"), headers={"User-Agent": "SRMCampusLocator/1.0"})
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        elements = data.get("elements", [])
        print(f"Total elements returned: {len(elements)}")
        with open("osm_srm.json", "w", encoding="utf-8") as f:
            json.dump(elements, f, indent=2)
        named = [e for e in elements if "tags" in e and ("name" in e["tags"] or "name:en" in e["tags"])]
        print(f"Named elements: {len(named)}")
        for e in named:
            tags = e["tags"]
            name = tags.get("name:en") or tags.get("name")
            center = e.get("center") or {"lat": e.get("lat"), "lon": e.get("lon")}
            kind = tags.get("building") or tags.get("highway") or tags.get("leisure") or tags.get("amenity")
            print(f"[{kind}] {name} at ({center.get('lat')}, {center.get('lon')})")
except Exception as e:
    print("Error:", e)
