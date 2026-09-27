import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageFont

tree = ET.parse('srm_raw_osm.xml')
nodes = {n.get('id'): (float(n.get('lat')), float(n.get('lon'))) for n in tree.findall('.//node')}

ways = tree.findall('.//way')

min_lat, max_lat = 12.818, 12.827
min_lon, max_lon = 80.038, 80.049

img_w, img_h = 1400, 950
img = Image.new('RGB', (img_w, img_h), color=(15, 17, 21))
draw = ImageDraw.Draw(img)

def to_px(lat, lon):
    x = (lon - min_lon) / (max_lon - min_lon) * (img_w - 100) + 50
    y = (max_lat - lat) / (max_lat - min_lat) * (img_h - 100) + 50
    return x, y

# Highways
for w in ways:
    tags = {t.get('k'): t.get('v') for t in w.findall('tag')}
    highway = tags.get('highway')
    if highway:
        nd_refs = [nd.get('ref') for nd in w.findall('nd')]
        pts = [to_px(*nodes[ref]) for ref in nd_refs if ref in nodes]
        if len(pts) >= 2:
            color = (120, 120, 130) if highway in ['trunk', 'primary'] else (60, 60, 70)
            width = 8 if highway in ['trunk', 'primary'] else 3
            draw.line(pts, fill=color, width=width)
            if 'name' in tags:
                mid = pts[len(pts)//2]
                draw.text((mid[0]+4, mid[1]+4), tags['name'], fill=(160, 160, 170))

# Buildings
for w in ways:
    tags = {t.get('k'): t.get('v') for t in w.findall('tag')}
    bldg = tags.get('building')
    name = tags.get('name')
    if bldg or name:
        nd_refs = [nd.get('ref') for nd in w.findall('nd')]
        pts = [to_px(*nodes[ref]) for ref in nd_refs if ref in nodes]
        if len(pts) >= 3:
            fill_color = (45, 48, 58) if name else (28, 30, 36)
            outline_color = (255, 255, 255) if name else (70, 75, 85)
            draw.polygon(pts, fill=fill_color, outline=outline_color)
            if name:
                cx = sum(p[0] for p in pts) / len(pts)
                cy = sum(p[1] for p in pts) / len(pts)
                draw.text((cx, cy), name, fill=(255, 255, 255), anchor="mm")

# Named nodes
for n in tree.findall('.//node'):
    tags = {t.get('k'): t.get('v') for t in n.findall('tag')}
    if 'name' in tags:
        lat, lon = float(n.get('lat')), float(n.get('lon'))
        if min_lat <= lat <= max_lat and min_lon <= lon <= max_lon:
            x, y = to_px(lat, lon)
            draw.ellipse([x-4, y-4, x+4, y+4], fill=(0, 220, 200), outline=(255, 255, 255))
            draw.text((x, y+8), tags['name'], fill=(0, 220, 200), anchor="mt")

img.save('true_osm_map.png')
print('Saved true_osm_map.png successfully!')
