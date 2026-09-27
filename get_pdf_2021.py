import urllib.request

url = "https://srmist.edu.in/wp-content/uploads/2021/01/ktr-campus-building-area-details.pdf"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        pdf_bytes = resp.read()
        print(f"PDF size: {len(pdf_bytes)} bytes")
        with open("ktr_building_details_2021.pdf", "wb") as f:
            f.write(pdf_bytes)
        print("Saved successfully!")
except Exception as e:
    print("Download error:", e)
