import urllib.request

url = "https://webstor.srmist.edu.in/web_assets/srmist-virtual-tour-vo/index.htm"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

print(html)
