import re

f = open('data.js', encoding='utf-8').read()
matches = set(re.findall(r'buildingId:\s*["\']([^"\']+)["\']', f))
print('Building IDs used by teachers:', matches)
