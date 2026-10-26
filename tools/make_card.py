# -*- coding: utf-8 -*-
"""
مولّد بطاقة السيرة الذاتية — حسين عباس فرهود
هوية بابلية: لازوردي + ذهبي + عاجي، نجمة عشتار، نقوش مسمارية، رمز شمش
المخرجات:
  assets/farhood-cv-card.png  (بطاقة عالية الدقة)
  assets/farhood-cv-card.pdf  (نسخة طباعة 300 DPI)
يشترط: Pillow, qrcode, arabic-reshaper, python-bidi, fonttools, brotli
"""
import math
import os
import arabic_reshaper
from bidi.algorithm import get_display
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "tools", ".build")
ASSETS = os.path.join(ROOT, "assets")
URL = "https://farhood-cv.onrender.com/#contact"

# ---------------- لوحة الألوان (مطابقة للموقع) ----------------
LAPIS_DEEP = (10, 31, 58)
LAPIS = (18, 58, 102)
LAPIS_MID = (22, 69, 122)
INK_NAVY = (11, 22, 38)
GOLD = (216, 181, 106)
GOLD_2 = (243, 226, 179)
BRONZE = (176, 141, 87)
IVORY = (247, 241, 227)
IVORY_2 = (236, 227, 207)
MUTED = (120, 132, 150)
WHITE = (255, 255, 255)

W, H = 1800, 1140
R = 54

def F(name, size):
    return ImageFont.truetype(os.path.join(BUILD, name), size)

# خط لاتيني كامل (خطوط Cairo المحلية مقصوصة على العربية ولا تحوي لاتينية)
LATIN = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def FL(size):
    return ImageFont.truetype(LATIN, size)

def ar(text):
    return get_display(arabic_reshaper.reshape(text))

def lerp(c1, c2, t):
    return tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))

def vgrad(size, top, bottom):
    w, h = size
    base = Image.new("RGB", size, top)
    d = ImageDraw.Draw(base)
    for y in range(h):
        d.line([(0, y), (w, y)], fill=lerp(top, bottom, y / max(1, h - 1)))
    return base

def rgrad(size, inner, outer, center, radius):
    """تدرّج شعاعي على طبقة RGB."""
    w, h = size
    layer = Image.new("RGB", size, outer)
    px = layer.load()
    cx, cy = center
    for y in range(h):
        for x in range(0, w, 2):
            t = min(1.0, math.hypot(x - cx, y - cy) / radius)
            c = lerp(inner, outer, t * t)
            px[x, y] = c
            if x + 1 < w:
                px[x + 1, y] = c
    return layer

def bezier(p0, p1, p2, p3, n=200):
    pts = []
    for i in range(n + 1):
        t = i / n
        mt = 1 - t
        x = mt**3 * p0[0] + 3 * mt**2 * t * p1[0] + 3 * mt * t**2 * p2[0] + t**3 * p3[0]
        y = mt**3 * p0[1] + 3 * mt**2 * t * p1[1] + 3 * mt * t**2 * p2[1] + t**3 * p3[1]
        pts.append((x, y))
    return pts

def star_points(cx, cy, r_out, r_in, points=8, rot=-math.pi / 2):
    pts = []
    for i in range(points * 2):
        r = r_out if i % 2 == 0 else r_in
        a = rot + i * math.pi / points
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts

def draw_star(d, cx, cy, r_out, fill, r_in_ratio=0.42, points=8):
    d.polygon(star_points(cx, cy, r_out, r_out * r_in_ratio, points), fill=fill)

def spaced_text(d, xy, text, font, fill, spacing=6, align="center"):
    """نص لاتيني بأحرف متباعدة. align: center أو right (لنصوص اللوحة اليسرى)."""
    widths = [d.textlength(ch, font=font) for ch in text]
    total = sum(widths) + spacing * (len(text) - 1)
    x = xy[0] - total / 2 if align == "center" else xy[0] - total
    for ch, wch in zip(text, widths):
        d.text((x, xy[1]), ch, font=font, fill=fill)
        x += wch + spacing

# ---------------- بناء البطاقة ----------------
card = Image.new("RGBA", (W, H), (0, 0, 0, 0))

# خلفية عاجية بتدرّج شعاعي دافئ
ivory = rgrad((W, H), IVORY, IVORY_2, (W * 0.62, H * 0.42), 1300)
card.paste(ivory, (0, 0))

# ===== اللوحة اللازوردية اليسرى بحافة منحنية =====
P0, P1 = (906, 0), (742, H)
curve = bezier(P0, (690, 330), (958, 760), P1)
panel_mask = Image.new("L", (W, H), 0)
md = ImageDraw.Draw(panel_mask)
md.polygon([(0, 0)] + curve + [(0, H)], fill=255)

panel = vgrad((W, H), LAPIS_MID, LAPIS_DEEP)
# وهج ذهبي خفيف داخل اللوحة
glow = Image.new("RGB", (W, H), LAPIS_DEEP)
gd = ImageDraw.Draw(glow)
gd.ellipse([-260, 360, 520, 1140], fill=(31, 74, 122))
glow = glow.filter(ImageFilter.GaussianBlur(120))
panel = Image.blend(panel, glow, 0.35)
card.paste(panel, (0, 0), panel_mask)

# نسيج نقش مسماري داخل اللوحة
tex = Image.new("RGBA", (W, H), (0, 0, 0, 0))
td = ImageDraw.Draw(tex)
rng_seed = 7
for row in range(6):
    for col in range(13):
        x = 60 + col * 66 + (row % 2) * 20
        y = 70 + row * 190
        if x > 860:
            continue
        # إسفين مسماري: مثلث صغير + خط
        td.polygon([(x, y), (x + 20, y + 7), (x, y + 14)], fill=(216, 181, 106, 26))
        td.line([(x + 26, y + 7), (x + 46, y + 7)], fill=(125, 180, 238, 20), width=3)
        # شيفرون
        td.line([(x, y + 34), (x + 12, y + 44), (x, y + 54)], fill=(216, 181, 106, 22), width=3)
card = Image.alpha_composite(card, Image.composite(tex, Image.new("RGBA", (W, H), (0, 0, 0, 0)), panel_mask))

# الحافة الذهبية المنحنية (سماكة برونزية ثم ذهبية)
edge = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ed = ImageDraw.Draw(edge)
ed.line(curve, fill=(143, 111, 51, 255), width=15, joint="curve")
ed.line(curve, fill=(216, 181, 106, 255), width=6, joint="curve")
card = Image.alpha_composite(card, edge)

d = ImageDraw.Draw(card)

# ===== رمز شمش (الشمس البابلية) أعلى اليمين =====
sun = Image.new("RGBA", (W, H), (0, 0, 0, 0))
sd = ImageDraw.Draw(sun)
cx_s, cy_s, r_s = 1652, 112, 88
for i in range(16):
    a = -math.pi / 2 + i * math.pi / 8
    p1 = (cx_s + math.cos(a) * (r_s + 8), cy_s + math.sin(a) * (r_s + 8))
    p2 = (cx_s + math.cos(a) * (r_s + 34), cy_s + math.sin(a) * (r_s + 34))
    sd.line([p1, p2], fill=(176, 141, 87, 120), width=5)
for rr, al in [(r_s, 120), (r_s - 22, 95), (r_s - 44, 80)]:
    sd.ellipse([cx_s - rr, cy_s - rr, cx_s + rr, cy_s + rr], outline=(176, 141, 87, al), width=3)
card = Image.alpha_composite(card, sun)
d = ImageDraw.Draw(card)

# ================= المحتوى الأيسر (عربي) =================
f_eyebrow = F("Cairo-Bold.ttf", 27)
f_name = F("Amiri-Bold.ttf", 96)
f_name_en = FL(30)
f_role = F("Cairo-Bold.ttf", 44)
f_role_en = FL(24)
f_info = F("Cairo-Bold.ttf", 29)
f_small = F("Cairo-Regular.ttf", 24)
RX = 772  # محيط اليمين للنصوص العربية

# شريحة العنوان
eyebrow = ar("السيرة الذاتية")
ew = d.textlength(eyebrow, font=f_eyebrow)
d.rounded_rectangle([RX - ew - 58, 96, RX + 4, 152], radius=28,
                    fill=(143, 111, 51), outline=GOLD, width=2)
draw_star(d, RX - 26, 124, 11, GOLD)
d.text((RX - 46, 124), eyebrow, font=f_eyebrow, fill=GOLD_2, anchor="rm")

# الاسم
d.text((RX, 218), ar("حسين عباس فرهود"), font=f_name, fill=GOLD_2, anchor="rm")
spaced_text(d, (RX, 308), "HUSSEIN ABBAS FARHOOD", f_name_en, (125, 180, 238), spacing=5, align="right")

# فاصل بنجمة
d.line([(RX - 360, 372), (RX - 44, 372)], fill=(216, 181, 106, 130), width=2)
draw_star(d, RX - 22, 372, 12, GOLD)

# المسمى الوظيفي
d.text((RX, 446), ar("مهندس وراثي"), font=f_role, fill=WHITE, anchor="rm")
spaced_text(d, (RX, 512), "GENETIC ENGINEER", f_role_en, GOLD, spacing=4, align="right")

# صفوف المعلومات
info = [
    "بكالوريوس هندسة وراثية — جامعة القاسم الخضراء",
    "كلية التقانات الإحيائية — قسم الهندسة الوراثية",
    "دورة التحليل المخبري الطبي — ٣٦ ساعة معتمدة",
    "العربية لغة الأم  •  الإنجليزية مستوى B2",
    "بابل — العراق",
]
y = 604
for line in info:
    draw_star(d, RX - 14, y, 9, GOLD)
    d.text((RX - 40, y), ar(line), font=f_info, fill=(223, 232, 244), anchor="rm")
    y += 60

# شعار دائري بنجمة عشتار (الزاوية السفلية، بلا تقاطع مع النصوص)
ecx, ecy, er = 226, 984, 104
d.ellipse([ecx - er - 8, ecy - er - 8, ecx + er + 8, ecy + er + 8], fill=GOLD)
d.ellipse([ecx - er, ecy - er, ecx + er, ecy + er], fill=INK_NAVY)
d.ellipse([ecx - er + 14, ecy - er + 14, ecx + er - 14, ecy + er - 14],
         outline=(125, 180, 238, 120), width=2)
draw_star(d, ecx, ecy, 56, GOLD_2)
draw_star(d, ecx, ecy, 23, GOLD)

# صف مسماري سفلي داخل اللوحة (بعيداً عن الشعار)
for i in range(9):
    x = 400 + i * 42
    d.polygon([(x, 1086), (x + 15, 1092), (x, 1098)], fill=(216, 181, 106, 90))

# ================= الجانب الأيمن: الباركود =================
QX = 1300
# عنوان
d.text((QX, 168), ar("امسح الرمز لعرض السيرة والتواصل المباشر"),
       font=F("Cairo-Bold.ttf", 34), fill=INK_NAVY, anchor="mm")
spaced_text(d, (QX, 214), "SCAN TO VIEW COMPLETE CV", FL(21), BRONZE, spacing=4)

# إطار الباركود
frame = [1024, 262, 1576, 814]
d.rounded_rectangle(frame, radius=34, fill=WHITE, outline=LAPIS, width=7)
d.rounded_rectangle([1040, 278, 1560, 798], radius=24, outline=(216, 181, 106, 180), width=2)
qr = Image.open(os.path.join(ASSETS, "qr-contact.png")).convert("RGB").resize((456, 456))
card_rgb = card.convert("RGB")
card_rgb.paste(qr, (1072, 318))
card = card_rgb.convert("RGBA")
d = ImageDraw.Draw(card)

# حبّة URL
url_font = FL(25)
url_txt = "farhood-cv.onrender.com"
uw = d.textlength(url_txt, font=url_font)
pill = [QX - uw / 2 - 44, 858, QX + uw / 2 + 44, 922]
d.rounded_rectangle(pill, radius=32, fill=INK_NAVY)
draw_star(d, pill[0] + 28, 890, 9, GOLD)
d.text((QX, 891), url_txt, font=url_font, fill=GOLD_2, anchor="mm")

# صف الهاتف
phone_font = FL(26)
phone = "+964 771 599 3271"
pw = d.textlength(phone, font=phone_font)
d.rounded_rectangle([QX - pw / 2 - 78, 952, QX + pw / 2 + 36, 1010],
                    radius=29, fill=(226, 233, 242), outline=BRONZE, width=2)
draw_star(d, QX - pw / 2 - 50, 981, 9, BRONZE)
d.text((QX - 26, 982), phone, font=phone_font, fill=LAPIS, anchor="mm")

# علامة Farhood CV السفلية
lx = 1470
d.rounded_rectangle([lx, 1062, lx + 52, 1114], radius=13, fill=LAPIS)
draw_star(d, lx + 26, 1088, 13, GOLD)
d.text((lx + 66, 1075), "Farhood", font=FL(26), fill=INK_NAVY, anchor="ls")
d.text((lx + 66, 1108), "CV • BABYLON", font=FL(18), fill=BRONZE, anchor="ls")

# إطار ذهبي رفيع على حافة البطاقة
mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, W - 1, H - 1], radius=R, fill=255)
flat = Image.new("RGBA", (W, H), (0, 0, 0, 0))
flat.paste(card, (0, 0), mask)
d = ImageDraw.Draw(flat)
d.rounded_rectangle([10, 10, W - 11, H - 11], radius=R - 10, outline=(216, 181, 106, 150), width=2)
d.rounded_rectangle([18, 18, W - 19, H - 19], radius=R - 16, outline=(176, 141, 87, 70), width=1)

out_png = os.path.join(ASSETS, "farhood-cv-card.png")
flat.convert("RGB").save(out_png, quality=95)
flat.convert("RGB").save(os.path.join(ASSETS, "farhood-cv-card.pdf"), "PDF", resolution=300.0)
print("saved:", out_png, flat.size)
