import urllib.request
import ssl

ctx = ssl._create_unverified_context()
url = "https://srmist.edu.in/wp-content/uploads/2021/01/ktr-campus-building-area-details.pdf"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
        data = resp.read()
        print(f"Downloaded {len(data)} bytes")
        with open("ktr_building_details_2021.pdf", "wb") as f:
            f.write(data)
        print("Saved to ktr_building_details_2021.pdf successfully!")
except Exception as e:
    print("Error:", e)
