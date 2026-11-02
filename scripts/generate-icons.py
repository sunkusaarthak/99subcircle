import os
import math
from PIL import Image, ImageDraw

def render_icon(size=512, mode='app_icon_dark'):
    scale = 4
    w, h = size * scale, size * scale
    
    if mode == 'app_icon_dark':
        img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        # Rounded black square
        corner_r = int(112 * (size / 512) * scale)
        draw.rounded_rectangle([0, 0, w - 1, h - 1], radius=corner_r, fill=(9, 9, 11, 255))
        # Subtle hairline inner border
        draw.rounded_rectangle([scale, scale, w - scale - 1, h - scale - 1], radius=corner_r - scale, outline=(39, 39, 42, 255), width=max(1, int(2 * scale)))
        fg_color = (255, 255, 255, 255)
        dash_color = (255, 255, 255, 90)
    elif mode == 'app_icon_light':
        img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        corner_r = int(112 * (size / 512) * scale)
        draw.rounded_rectangle([0, 0, w - 1, h - 1], radius=corner_r, fill=(255, 255, 255, 255))
        draw.rounded_rectangle([scale, scale, w - scale - 1, h - scale - 1], radius=corner_r - scale, outline=(228, 228, 231, 255), width=max(1, int(2 * scale)))
        fg_color = (9, 9, 11, 255)
        dash_color = (9, 9, 11, 90)
    elif mode == 'transparent_black':
        img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        fg_color = (9, 9, 11, 255)
        dash_color = (9, 9, 11, 80)
    elif mode == 'transparent_white':
        img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        fg_color = (255, 255, 255, 255)
        dash_color = (255, 255, 255, 100)

    # Geometry coordinates in 48x48 space
    # Scale from 48 -> icon size
    pad = 0.20 if 'app_icon' in mode else 0.05
    inner_w = w * (1.0 - 2 * pad)
    ox = w * pad
    oy = h * pad
    s = inner_w / 48.0

    def pt(x, y):
        return (ox + x * s, oy + y * s)

    cx, cy = pt(24, 24)
    r = 22 * s

    # 1. Outer dashed circle
    dash_segments = 36
    for i in range(dash_segments):
        if i % 2 == 0:
            a1 = (i / dash_segments) * 2 * math.pi
            a2 = ((i + 0.6) / dash_segments) * 2 * math.pi
            deg1 = math.degrees(a1)
            deg2 = math.degrees(a2)
            draw.arc([cx - r, cy - r, cx + r, cy + r], start=deg1, end=deg2, fill=dash_color, width=max(1, int(1.5 * s)))

    stroke_w = max(2, int(2.75 * s))

    # Helper: draw a smooth thick circle/loop for the 9 head
    def draw_nine(head_cx, head_cy, head_r, stem_x, stem_y1, stem_y2, hook_r):
        p1_x, p1_y = pt(head_cx, head_cy)
        hr = head_r * s
        # Draw head circle
        draw.ellipse([p1_x - hr, p1_y - hr, p1_x + hr, p1_y + hr], outline=fg_color, width=stroke_w)
        # Draw descending stem
        sx, sy1 = pt(stem_x, stem_y1)
        _, sy2 = pt(stem_x, stem_y2)
        draw.line([(sx, sy1), (sx, sy2)], fill=fg_color, width=stroke_w)
        # Draw subtle bottom hook arc
        hx, hy = pt(stem_x - hook_r, stem_y2)
        h_rad = hook_r * s
        draw.arc([hx - h_rad, hy - h_rad, hx + h_rad, hy + h_rad], start=0, end=90, fill=fg_color, width=stroke_w)

    # First 9: head at (14, 18), r=6, stem at x=20, y from 18 to 32, hook to 17
    draw_nine(14, 18, 6, 20, 18, 31.5, 3)

    # Second 9: head at (28, 18), r=6, stem at x=34, y from 18 to 32, hook to 31
    draw_nine(28, 18, 6, 34, 18, 31.5, 3)

    # Dot accent at (39, 14)
    dx, dy = pt(39, 14)
    dr = 1.75 * s
    draw.ellipse([dx - dr, dy - dr, dx + dr, dy + dr], fill=fg_color)

    # High quality downsampling
    img_final = img.resize((size, size), Image.Resampling.LANCZOS)
    return img_final

os.makedirs('logo', exist_ok=True)
os.makedirs('client/public', exist_ok=True)

# Generate App Icons
icon_dark_512 = render_icon(512, 'app_icon_dark')
icon_dark_512.save('logo/app-icon-dark.png', 'PNG')
icon_dark_512.save('client/public/icon-512.png', 'PNG')

icon_dark_192 = render_icon(192, 'app_icon_dark')
icon_dark_192.save('logo/app-icon-dark-192.png', 'PNG')
icon_dark_192.save('client/public/icon-192.png', 'PNG')

icon_light_512 = render_icon(512, 'app_icon_light')
icon_light_512.save('logo/app-icon-light.png', 'PNG')

# Transparent versions
icon_black_trans = render_icon(512, 'transparent_black')
icon_black_trans.save('logo/icon-black-transparent.png', 'PNG')

icon_white_trans = render_icon(512, 'transparent_white')
icon_white_trans.save('logo/icon-white-transparent.png', 'PNG')

# Favicon ICO
icon_32 = render_icon(32, 'app_icon_dark')
icon_32.save('client/public/favicon.ico', format='ICO', sizes=[(32, 32)])

print("Successfully generated high-resolution PNG & ICO icons!")

