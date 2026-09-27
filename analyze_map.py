from PIL import Image
import numpy as np

im = Image.open(r"C:\Users\Abel Baby\.gemini\antigravity-ide\brain\83621720-bf12-4657-a362-beca050d8eeb\.user_uploaded\media_1790265966317.jpg")
print("Original size:", im.size)

# The user uploaded a thumbnail (146, 220).
# Let's inspect where the red buildings (building color) and green areas (lawns) and roads are located on this (146, 220) grid!
rgb = np.array(im.convert("RGB"))
h, w, _ = rgb.shape

# Let's find the main building coordinates (reddish pixels)
# Red in this map is roughly R > 150, G < 120, B < 120
is_red = (rgb[:, :, 0] > 140) & (rgb[:, :, 1] < 120) & (rgb[:, :, 2] < 120)
# Green is G > 140, R < 140
is_green = (rgb[:, :, 1] > 140) & (rgb[:, :, 0] < 180) & (rgb[:, :, 2] < 140)
# Gray / roads
print("Red pixels count:", np.sum(is_red))
print("Green pixels count:", np.sum(is_green))

# Let's print ASCII grid of the map!
ascii_map = []
for y in range(0, h, 4):
    row = []
    for x in range(0, w, 2):
        if is_red[y, x]:
            row.append("#") # Building
        elif is_green[y, x]:
            row.append(".") # Lawn
        elif rgb[y, x, 0] > 230 and rgb[y, x, 1] > 230 and rgb[y, x, 2] > 230:
            row.append(" ") # White background
        else:
            row.append("-") # Road or border
    ascii_map.append("".join(row))

print("\n".join(ascii_map))
