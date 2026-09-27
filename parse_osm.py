import xml.etree.ElementTree as ET

tree = ET.parse('srm_raw_osm.xml')
nodes = {n.get('id'): (float(n.get('lat')), float(n.get('lon'))) for n in tree.findall('.//node')}

ways = tree.findall('.//way')
items = []

for w in ways:
    tags = {t.get('k'): t.get('v') for t in w.findall('tag')}
    name = tags.get('name')
    nd_refs = [nd.get('ref') for nd in w.findall('nd')]
    coords = [nodes[ref] for ref in nd_refs if ref in nodes]
    if not coords:
        continue
    avg_lat = sum(c[0] for c in coords) / len(coords)
    avg_lon = sum(c[1] for c in coords) / len(coords)
    items.append({
        'name': name,
        'building': tags.get('building'),
        'highway': tags.get('highway'),
        'amenity': tags.get('amenity'),
        'lat': avg_lat,
        'lon': avg_lon
    })

# Also include named nodes
for n in tree.findall('.//node'):
    tags = {t.get('k'): t.get('v') for t in n.findall('tag')}
    if 'name' in tags:
        items.append({
            'name': tags.get('name'),
            'building': tags.get('building'),
            'highway': tags.get('highway'),
            'amenity': tags.get('amenity'),
            'lat': float(n.get('lat')),
            'lon': float(n.get('lon'))
        })

named = [it for it in items if it['name']]
named.sort(key=lambda x: -x['lat'])

print(f"{'NAME':35} | {'LAT':9} | {'LON':9} | {'TAGS'}")
print("-" * 75)
for it in named:
    tag_str = f"bldg={it['building']}, hwy={it['highway']}, am={it['amenity']}"
    print(f"{it['name'][:35]:35} | {it['lat']:.6f} | {it['lon']:.6f} | {tag_str}")
