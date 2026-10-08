import os
import collections
from PIL import Image

NEW_IMAGES = {
    'leather_jacket_noir.png': '/Users/Ishant/.gemini/antigravity-ide/brain/02c11d3d-812a-4d6c-8a43-6c2308b2ee65/leather_jacket_fancy_1791470459906.jpg',
    'tee_paradox_graphic.png': '/Users/Ishant/.gemini/antigravity-ide/brain/02c11d3d-812a-4d6c-8a43-6c2308b2ee65/graphic_tee_designer_1791470506587.jpg',
    'jacket_varsity_green.png': '/Users/Ishant/.gemini/antigravity-ide/brain/02c11d3d-812a-4d6c-8a43-6c2308b2ee65/varsity_jacket_designer_1791470548224.jpg',
    'jacket_racing_moto.png': '/Users/Ishant/.gemini/antigravity-ide/brain/02c11d3d-812a-4d6c-8a43-6c2308b2ee65/racing_jacket_designer_1791470588457.jpg',
    'tee_atelier_chrome.png': '/Users/Ishant/.gemini/antigravity-ide/brain/02c11d3d-812a-4d6c-8a43-6c2308b2ee65/white_graphic_designer_1791470619667.jpg',
    'hoodie_gothic_emerald.png': '/Users/Ishant/.gemini/antigravity-ide/brain/02c11d3d-812a-4d6c-8a43-6c2308b2ee65/emerald_hoodie_designer_1791470661170.jpg',
    'jacket_tactical_utility.png': '/Users/Ishant/.gemini/antigravity-ide/brain/02c11d3d-812a-4d6c-8a43-6c2308b2ee65/tactical_jacket_designer_1791470694132.jpg'
}

OUTPUT_DIR = '/Users/Ishant/Downloads/Clapingo/Tshirt Video/public/garments'

def clean_cutout(in_path, out_path):
    img = Image.open(in_path).convert('RGB')
    w, h = img.size
    pix = img.load()
    
    bg = [[False]*h for _ in range(w)]
    q = collections.deque()
    
    # Seed outer edges
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))
        
    # Seed top area around hanger hook
    for y in range(int(h * 0.25)):
        for x in range(int(w * 0.25), int(w * 0.75)):
            r, g, b = pix[x, y]
            brightness = (r + g + b) / 3.0
            diff = max(r, g, b) - min(r, g, b)
            if brightness > 220 and diff < 30:
                q.append((x, y))
                
    visited = [[False]*h for _ in range(w)]
    for x, y in list(q):
        visited[x][y] = True
        
    while q:
        x, y = q.popleft()
        r, g, b = pix[x, y]
        brightness = (r + g + b) / 3.0
        diff = max(r, g, b) - min(r, g, b)
        
        # Studio white background criteria
        is_bg = (brightness >= 200 and diff <= 35) or (brightness >= 230)
        
        if is_bg:
            bg[x][y] = True
            for dx, dy in ((-1,0),(1,0),(0,-1),(0,1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                    visited[nx][ny] = True
                    q.append((nx, ny))
                    
    # Generate RGBA
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    out_pix = out.load()
    
    for x in range(w):
        for y in range(h):
            if not bg[x][y]:
                out_pix[x, y] = (*pix[x, y], 255)
                
    # Defringing passes
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
                        if bright > 205 or (bright > 185 and diff < 22):
                            to_clear.append((x, y))
        for x, y in to_clear:
            out_pix[x, y] = (0, 0, 0, 0)
            
    # Clean borders (except top center hook)
    for x in range(w):
        for y in range(h):
            if x < 6 or x >= w - 6 or y >= h - 6 or (y < 6 and not (int(w*0.44) <= x <= int(w*0.56))):
                out_pix[x, y] = (0, 0, 0, 0)
                
    out.save(out_path, 'PNG')
    print(f"Saved: {out_path}")

for filename, path in NEW_IMAGES.items():
    clean_cutout(path, os.path.join(OUTPUT_DIR, filename))

print("All designer garments processed!")
