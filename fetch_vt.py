import urllib.request
import re

url = "https://webstor.srmist.edu.in/web_assets/srmist-virtual-tour-vo/index.htm"
headers = {'User-Agent': 'Mozilla/5.0'}
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print(f"HTML length: {len(html)}")
        # Look for script tags, xml files, tour data
        scripts = re.findall(r'<script[^>]*src=["\']([^"\']+)["\']', html)
        print("Scripts:", scripts)
        xmls = re.findall(r'[\w\-\./]+\.xml', html)
        print("XMLs:", xmls)
        # Check title
        title = re.findall(r'<title>([^<]+)</title>', html)
        print("Title:", title)
except Exception as e:
    print("Error:", e)
