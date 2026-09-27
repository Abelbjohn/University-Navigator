import xml.etree.ElementTree as ET

tree = ET.parse('srm_raw_osm.xml')
nodes = {n.get('id'): (float(n.get('lat')), float(n.get('lon'))) for n in tree.findall('.//node')}

ways = tree.findall('.//way')

# Determine bounds for SRM Campus area
# We want from lat: 12.818 to 12.827, lon: 80.038 to 80.049
min_lat, max_lat = 12.819, 12.827
min_lon, max_lon = 12.838, 12.849 # wait, lon is 80.038 to 80.049
min_lon, max_lon = 80.038, 80.049

svg_w, svg_h = 1000, 700

def to_svg(lat, lon):
    # In standard maps: North is UP (max_lat -> 0), East is RIGHT (max_lon -> svg_w)
    x = (lon - min_lon) / (max_lon - min_lon) * (svg_w - 80) + 40
    y = (max_lat - lat) / (max_lat - min_lat) * (svg_h - 80) + 40
    return x, y

elements_svg = []

# First draw highways/roads
for w in ways:
    tags = {t.get('k'): t.get('v') for t in w.findall('tag')}
    highway = tags.get('highway')
    if highway:
        nd_refs = [nd.get('ref') for nd in w.findall('nd')]
        pts = [to_svg(*nodes[ref]) for ref in nd_refs if ref in nodes]
        if len(pts) >= 2:
            pts_str = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
            w_stroke = 6 if highway in ['trunk', 'primary', 'secondary'] else 2.5
            color = "#555555" if highway in ['trunk', 'primary'] else "#333333"
            elements_svg.append(f'<polyline points="{pts_str}" fill="none" stroke="{color}" stroke-width="{w_stroke}" />')
            if 'name' in tags:
                mid = pts[len(pts)//2]
                elements_svg.append(f'<text x="{mid[0]}" y="{mid[1]}" fill="#aaaaaa" font-size="8">{tags["name"]}</text>')

# Draw buildings
for w in ways:
    tags = {t.get('k'): t.get('v') for t in w.findall('tag')}
    bldg = tags.get('building')
    name = tags.get('name')
    if bldg or name:
        nd_refs = [nd.get('ref') for nd in w.findall('nd')]
        pts = [to_svg(*nodes[ref]) for ref in nd_refs if ref in nodes]
        if len(pts) >= 3:
            pts_str = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
            fill = "#2a2a2e" if name else "#1e1e22"
            stroke = "#ffffff" if name else "#444444"
            elements_svg.append(f'<polygon points="{pts_str}" fill="{fill}" stroke="{stroke}" stroke-width="1" />')
            if name:
                cx = sum(p[0] for p in pts) / len(pts)
                cy = sum(p[1] for p in pts) / len(pts)
                elements_svg.append(f'<text x="{cx}" y="{cy}" fill="#ffffff" font-size="8" text-anchor="middle" font-weight="bold">{name}</text>')

# Also draw named nodes
for n in tree.findall('.//node'):
    tags = {t.get('k'): t.get('v') for t in n.findall('tag')}
    if 'name' in tags:
        lat, lon = float(n.get('lat')), float(n.get('lon'))
        if min_lat <= lat <= max_lat and min_lon <= lon <= max_lon:
            x, y = to_svg(lat, lon)
            elements_svg.append(f'<circle cx="{x}" cy="{y}" r="3" fill="#00ffcc" />')
            elements_svg.append(f'<text x="{x}" y="{y+10}" fill="#00ffcc" font-size="7" text-anchor="middle">{tags["name"]}</text>')

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_w} {svg_h}" width="{svg_w}" height="{svg_h}" style="background:#111;">
{''.join(elements_svg)}
</svg>'''

with open('osm_plot.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)
print("Saved osm_plot.svg successfully!")
