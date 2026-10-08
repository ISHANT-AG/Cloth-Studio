import os
import collections
from PIL import Image

IMAGE_MAP = {
    'hoodie_charcoal_front.png': 'hoodie_charcoal_front_1791437892148.jpg',
    'hoodie_emerald_front.png': 'hoodie_emerald_front_1791437932456.jpg',
    'jersey_black_front.png': 'jersey_black_front_1791437814603.jpg',
    'jersey_black_back.png': 'jersey_black_back_1791437850229.jpg',
    'sweatshirt_burgundy_front.png': 'sweatshirt_burgundy_1791438064587.jpg',
    'sweatshirt_sand_front.png': 'sweatshirt_sand_1791438027487.jpg',
    'tee_black_clean_front.png': 'tee_black_front_clean_1791438217788.jpg',
    'tee_clay_front.png': 'tee_clay_front_1791438259036.jpg',
    'tee_olive_front.png': 'tee_olive_1791438110456.jpg',
    'tee_slate_front.png': 'tee_slate_front_1791437968837.jpg',
    'tee_slate_back.png': 'tee_slate_back_1791437998010.jpg',
}

SOURCE_DIR = '/Users/Ishant/.gemini/antigravity-ide/brain/02c11d3d-812a-4d6c-8a43-6c2308b2ee65'
OUTPUT_DIR = '/Users/Ishant/Downloads/Clapingo/Tshirt Video/public/garments'

def process_image(src_file, dst_file):
    in_path = os.path.join(SOURCE_DIR, src_file)
    out_path = os.path.join(OUTPUT_DIR, dst_file)
    
    img = Image.open(in_path).convert('RGB')
    w, h = img.size
    pix = img.load()
    
    bg = [[False]*h for _ in range(w)]
    q = collections.deque()
    
    # 1. Seed all four outer boundaries
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))
        
    # Also seed around the top center (hanger hook and triangular hanger area)
    for y in range(int(h * 0.28)):
        for x in range(int(w * 0.28), int(w * 0.72)):
            r, g, b = pix[x, y]
            brightness = (r + g + b) / 3.0
            diff = max(r, g, b) - min(r, g, b)
            if brightness > 210 and diff < 30:
                q.append((x, y))

    visited = [[False]*h for _ in range(w)]
    for x, y in list(q):
        visited[x][y] = True

    while q:
        x, y = q.popleft()
        r, g, b = pix[x, y]
        brightness = (r + g + b) / 3.0
        diff = max(r, g, b) - min(r, g, b)
        
        # Background criterion: light and low-saturation studio backdrop
        is_bg = (brightness >= 185 and diff <= 35) or (brightness >= 220)
        
        if is_bg:
            bg[x][y] = True
            for dx, dy in ((-1,0),(1,0),(0,-1),(0,1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                    visited[nx][ny] = True
                    q.append((nx, ny))

    # Create RGBA
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    out_pix = out.load()
    
    for x in range(w):
        for y in range(h):
            if not bg[x][y]:
                out_pix[x, y] = (*pix[x, y], 255)

    # 4 Defringing passes: eliminate any white halo or off-white border touching transparency
    for _ in range(4):
        to_clear = []
        for x in range(w):
            for y in range(h):
                r, g, b, a = out_pix[x, y]
                if a > 0:
                    touches_bg = False
                    for dx, dy in ((-1,0),(1,0),(0,-1),(0,1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h and out_pix[nx, ny][3] == 0:
                            touches_bg = True
                            break
                    if touches_bg:
                        bright = (r + g + b) / 3.0
                        diff = max(r, g, b) - min(r, g, b)
                        if bright > 200 or (bright > 180 and diff < 20):
                            to_clear.append((x, y))
        for x, y in to_clear:
            out_pix[x, y] = (0, 0, 0, 0)

    # Force clear margins within 5px of borders except hook top (y < 40 and 0.45w < x < 0.55w)
    for x in range(w):
        for y in range(h):
            if x < 6 or x >= w - 6 or y >= h - 6 or (y < 6 and not (int(w*0.44) <= x <= int(w*0.56))):
                out_pix[x, y] = (0, 0, 0, 0)

    out.save(out_path, 'PNG')
    
    # Audit result
    corners = [(0,0), (w-1,0), (0,h-1), (w-1,h-1)]
    c_alphas = [out_pix[c[0], c[1]][3] for c in corners]
    edge_max = 0
    for x in range(w):
        edge_max = max(edge_max, out_pix[x, h-1][3])
    for y in range(h):
        edge_max = max(edge_max, out_pix[0, y][3], out_pix[w-1, y][3])
        
    print(f"Processed {dst_file:28s} -> corners={c_alphas}, edge_max={edge_max}")

for dst, src in IMAGE_MAP.items():
    process_image(src, dst)
print("All garments cleanly cut out!")
