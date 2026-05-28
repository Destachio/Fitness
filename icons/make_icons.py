"""Generate PWA icons: dark rounded tile with a neon-blue dumbbell glyph."""
from PIL import Image, ImageDraw, ImageFilter
import os

BG_TOP = (13, 19, 25)
BG_BOT = (5, 7, 10)
ACCENT = (47, 230, 255)
OUT = os.path.dirname(__file__)


def gradient(size):
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        px_row = tuple(int(BG_TOP[i] + (BG_BOT[i] - BG_TOP[i]) * t) for i in range(3))
        for x in range(size):
            px[x, y] = px_row
    return img


def rounded_mask(size, radius):
    m = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return m


def draw_dumbbell(draw, cx, cy, scale, color):
    # geometry relative to scale (a unit ~ scale)
    bar_h = scale * 0.18
    bar_w = scale * 1.7
    # bar
    draw.rounded_rectangle(
        [cx - bar_w / 2, cy - bar_h / 2, cx + bar_w / 2, cy + bar_h / 2],
        radius=bar_h / 2, fill=color,
    )
    # weight plates (inner + outer) each side
    plate_specs = [
        (0.78, 1.30),  # inner plate: offset, half-height factor
        (1.05, 1.65),  # outer plate
    ]
    plate_w = scale * 0.26
    for sign in (-1, 1):
        for off, hf in plate_specs:
            x = cx + sign * scale * off
            h = scale * hf
            draw.rounded_rectangle(
                [x - plate_w / 2, cy - h / 2, x + plate_w / 2, cy + h / 2],
                radius=plate_w * 0.4, fill=color,
            )


def make(size, pad_factor, radius_factor, filename, maskable=False):
    SS = 4  # supersample
    s = size * SS
    base = gradient(s)
    glow = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)

    scale = s * (0.115 if not maskable else 0.105)

    # tactical reticle ring + crosshair ticks around the dumbbell
    ring_r = s * (0.34 if not maskable else 0.30)
    rw = max(2, int(s * 0.006))
    gd.ellipse([s/2 - ring_r, s/2 - ring_r, s/2 + ring_r, s/2 + ring_r],
               outline=ACCENT + (210,), width=rw)
    tick = s * 0.045
    for dx, dy in ((0, -1), (0, 1), (-1, 0), (1, 0)):
        x0 = s/2 + dx * ring_r
        y0 = s/2 + dy * ring_r
        gd.line([x0 - dx * tick - dy * tick * 0, y0 - dy * tick,
                 x0 + dx * tick, y0 + dy * tick], fill=ACCENT + (230,), width=rw)
        gd.line([x0 - dx * tick, y0 - dy * tick, x0 + dx * tick, y0 + dy * tick],
                fill=ACCENT + (230,), width=rw)

    draw_dumbbell(gd, s / 2, s / 2, scale, ACCENT + (255,))

    # glow layer
    blur = glow.filter(ImageFilter.GaussianBlur(s * 0.02))
    base = base.convert("RGBA")
    base.alpha_composite(blur)
    base.alpha_composite(glow)

    base = base.resize((size, size), Image.LANCZOS)

    if maskable:
        # keep full-bleed background (no rounding) for maskable
        base.convert("RGB").save(os.path.join(OUT, filename))
    else:
        mask = rounded_mask(size, int(size * radius_factor))
        out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        out.paste(base, (0, 0), mask)
        out.save(os.path.join(OUT, filename))


make(192, 0, 0.22, "icon-192.png")
make(512, 0, 0.22, "icon-512.png")
make(512, 0, 0.22, "icon-maskable-512.png", maskable=True)
print("icons generated")
