# -*- coding: utf-8 -*-
"""
بطاقة التعريف — نسخة مطابقة لتصميم البطاقة المرجعية
لوحة لازوردية + دائرة تعريف + حافة ذهبية منحنية + نخيل ولاماسو وشمش
باركود حقيقي قابل للمسح + بيانات صحيحة (بلا أي محتوى مخترع)
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

# ---------------- الألوان ----------------
NAVY_TOP = (24, 66, 116)
NAVY_BOT = (10, 31, 58)
NAVY = (13, 42, 77)
INK = (16, 36, 62)
GOLD = (216, 181, 106)
GOLD_2 = (243, 226, 179)
BRONZE = (176, 141, 87)
IVORY = (245, 241, 230)
IVORY_2 = (235, 229, 214)
WAVE = (206, 225, 238)
WAVE_2 = (184, 214, 224)
TEAL = (110, 176, 192)
LATIN = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

W, H = 1800, 1140
R = 48

def F(name, size):
    return ImageFont.truetype(os.path.join(BUILD, name), size)
def FL(size):
    return ImageFont.truetype(LATIN, size)
def ar(t):
    return get_display(arabic_reshaper.reshape(t))
def lerp(a, b, t):
    return tuple(int(x + (y - x) * t) for x, y in zip(a, b))
def vgrad(size, top, bot):
    w, h = size
    img = Image.new("RGB", size, top)
    d = ImageDraw.Draw(img)
    for y in range(h):
        d.line([(0, y), (w, y)], fill=lerp(top, bot, y / (h - 1)))
    return img
def bezier(p0, p1, p2, p3, n=220):
    out = []
    for i in range(n + 1):
        t, m = i / n, 1 - i / n
        out.append((
            m**3*p0[0] + 3*m*m*t*p1[0] + 3*m*t*t*p2[0] + t**3*p3[0],
            m**3*p0[1] + 3*m*m*t*p1[1] + 3*m*t*t*p2[1] + t**3*p3[1],
        ))
    return out
def qcurve(p0, p1, p2, n=26):
    out = []
    for i in range(n + 1):
        t, m = i / n, 1 - i / n
        out.append((m*m*p0[0] + 2*m*t*p1[0] + t*t*p2[0],
                    m*m*p0[1] + 2*m*t*p1[1] + t*t*p2[1]))
    return out
def star_pts(cx, cy, ro, ri, n=8, rot=-math.pi/2):
    pts = []
    for i in range(n * 2):
        r = ro if i % 2 == 0 else ri
        a = rot + i * math.pi / n
        pts.append((cx + r*math.cos(a), cy + r*math.sin(a)))
    return pts
def star(d, cx, cy, r, fill, ratio=0.42, n=8):
    d.polygon(star_pts(cx, cy, r, r*ratio, n), fill=fill)
def spaced(d, cx, y, text, font, fill, sp=5):
    widths = [d.textlength(ch, font=font) for ch in text]
    x = cx - (sum(widths) + sp*(len(text)-1)) / 2
    for ch, wch in zip(text, widths):
        d.text((x, y), ch, font=font, fill=fill)
        x += wch + sp

def palm(d, bx, by, h, col, alpha=215, width=7):
    """نخلة بابلية بخطوط ذهبية."""
    c = col + (alpha,)
    crown = (bx, by - h)
    trunk = [(bx + 11*math.sin(t*1.15)*t, by - h*t) for t in [i/14 for i in range(15)]]
    d.line(trunk, fill=c, width=width, joint="curve")
    for i in range(1, 13):
        x, y = trunk[i]
        d.line([(x-6, y), (x+6, y-2)], fill=c, width=2)
    n = 10
    for k in range(n):
        ang = math.radians(205 - k*130/(n-1))
        L = h * 0.46
        ex = crown[0] + L*math.cos(ang)
        ey = crown[1] + L*math.sin(ang)*0.92
        ctrl = (crown[0] + L*0.6*math.cos(ang), crown[1] + L*0.6*math.sin(ang) - 22)
        d.line(qcurve(crown, ctrl, (ex, ey)), fill=c, width=4)

def winged_sun(d, cx, cy, s, col, alpha=205):
    """قرص الشمس المجنّح — رمز ميزوبوتامي."""
    c = col + (alpha,)
    d.ellipse([cx-.3*s, cy-.3*s, cx+.3*s, cy+.3*s], outline=c, width=4)
    d.ellipse([cx-.11*s, cy-.11*s, cx+.11*s, cy+.11*s], fill=c)
    for side in (-1, 1):
        for r in range(4):
            y0 = cy - 20 + r*13
            tip = (cx + side*s, cy - 30 + r*22)
            ctrl = (cx + side*s*0.55, y0 - 16)
            d.line(qcurve((cx + side*.3*s, y0), ctrl, tip), fill=c, width=3)
    for side in (-1, 1):
        d.line(qcurve((cx+side*9, cy+.28*s), (cx+side*22, cy+.55*s), (cx+side*36, cy+.74*s)), fill=c, width=3)

def rosette(d, cx, cy, R, col, alpha=200):
    """وردة شمش البابلية."""
    c = col + (alpha,)
    d.ellipse([cx-R, cy-R, cx+R, cy+R], outline=c, width=4)
    d.ellipse([cx-R*.6, cy-R*.6, cx+R*.6, cy+R*.6], outline=c, width=3)
    for i in range(22):
        a = i*math.pi/11
        d.line([(cx+math.cos(a)*R*.66, cy+math.sin(a)*R*.66),
                (cx+math.cos(a)*R*.93, cy+math.sin(a)*R*.93)], fill=c, width=4)
    d.ellipse([cx-13, cy-13, cx+13, cy+13], fill=col+(min(alpha+40, 255),))

# ================= بناء البطاقة =================
card = Image.new("RGBA", (W, H), (0, 0, 0, 0))
base = Image.new("RGBA", (W, H), IVORY + (255,))
bd = ImageDraw.Draw(base)

# موجات ضوئية في الخلفية البيضاء
ribbon1 = bezier((620, 1140), (1050, 980), (1450, 900), (1800, 760))
bd.polygon(ribbon1 + [(1800, 1140)], fill=WAVE + (255,))
ribbon2 = bezier((700, 1140), (1120, 1080), (1500, 1010), (1800, 940))
bd.polygon(ribbon2 + [(1800, 1140)], fill=WAVE_2 + (200,))
wave3 = bezier((820, 560), (1150, 700), (1500, 640), (1800, 470))
bd.line(wave3, fill=TEAL + (120,), width=10)
card = Image.alpha_composite(card, base)

# كوكبة نقطية خفيفة في المنطقة البيضاء
stars_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
sd = ImageDraw.Draw(stars_layer)
pts = [(960, 120), (1080, 80), (1210, 150), (1340, 95), (1470, 170), (1600, 120),
       (1700, 250), (1550, 300), (1380, 240), (1200, 300), (1030, 260), (920, 350)]
for a, b in zip(pts, pts[1:] + pts[:1]):
    sd.line([a, b], fill=INK + (34,), width=2)
for x, y in pts:
    sd.ellipse([x-4, y-4, x+4, y+4], fill=INK + (55,))
card = Image.alpha_composite(card, stars_layer)

# ---------------- اللوحة اللازوردية ----------------
edge = bezier((852, 0), (706, 320), (948, 780), (588, 1140))
panel_mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(panel_mask).polygon([(0, 0)] + edge + [(0, H)], fill=255)
panel = vgrad((W, H), NAVY_TOP, NAVY_BOT).convert("RGBA")
card = Image.composite(panel, card, panel_mask)

# نسيج مسماري داخل اللوحة
tex = Image.new("RGBA", (W, H), (0, 0, 0, 0))
td = ImageDraw.Draw(tex)
for row in range(7):
    for col in range(14):
        x = 56 + col*62 + (row % 2)*18
        y = 56 + row*160
        if x > 880:
            continue
        td.polygon([(x, y), (x+20, y+7), (x, y+14)], fill=GOLD + (30,))
        td.line([(x+27, y+7), (x+47, y+7)], fill=(125, 180, 238, 26), width=3)
        td.line([(x, y+34), (x+12, y+44), (x, y+54)], fill=GOLD + (26,), width=3)
card = Image.alpha_composite(card, Image.composite(tex, Image.new("RGBA", (W, H), (0, 0, 0, 0)), panel_mask))

# الحافة الذهبية المنحنية
band = Image.new("RGBA", (W, H), (0, 0, 0, 0))
bd2 = ImageDraw.Draw(band)
bd2.line(edge, fill=(143, 111, 51, 255), width=30, joint="curve")
bd2.line(edge, fill=GOLD + (255,), width=12, joint="curve")
card = Image.alpha_composite(card, band)
d = ImageDraw.Draw(card)

# أيقونة متوهجة أعلى اللوحة (نجمة عشتار مضيئة بدل رأس الذكاء الاصطناعي)
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gx, gy = 712, 196
gd.ellipse([gx-90, gy-90, gx+90, gy+90], fill=(125, 196, 255, 90))
glow = glow.filter(ImageFilter.GaussianBlur(34))
card = Image.alpha_composite(card, glow)
d = ImageDraw.Draw(card)
star(d, gx, gy, 52, (159, 212, 255, 255))
star(d, gx, gy, 22, GOLD_2 + (255,))

# اسم على اللوحة
f_panel = FL(58)
d.text((84, 118), "HUSSEIN ABBAS", font=f_panel, fill=GOLD)
d.text((84, 188), "FARHOOD", font=f_panel, fill=GOLD_2)
d.line([(86, 268), (560, 268)], fill=GOLD + (150,), width=2)

# نخيل داخل اللوحة
palm_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
pld = ImageDraw.Draw(palm_layer)
palm(pld, 150, 800, 300, GOLD, 225)
palm(pld, 300, 830, 235, GOLD, 190, width=6)
card = Image.alpha_composite(card, palm_layer)
d = ImageDraw.Draw(card)

# ---------------- دائرة التعريف ----------------
ccx, ccy, cr = 566, 596, 198
ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
rd = ImageDraw.Draw(ring)
rd.ellipse([ccx-cr-14, ccy-cr-14, ccx+cr+14, ccy+cr+14], fill=GOLD + (255,))
rg = Image.new("RGBA", (W, H), (0, 0, 0, 0))
rgd = ImageDraw.Draw(rg)
rgd.ellipse([ccx-cr-30, ccy-cr-30, ccx+cr+30, ccy+cr+30], fill=(216, 181, 106, 120))
rg = rg.filter(ImageFilter.GaussianBlur(26))
card = Image.alpha_composite(card, rg)
card = Image.alpha_composite(card, ring)
d = ImageDraw.Draw(card)
# خلفية الدائرة التدرّجية
inner = Image.new("RGBA", (cr*2, cr*2), (0, 0, 0, 0))
idw = ImageDraw.Draw(inner)
for i in range(cr*2):
    t = i / (cr*2)
    idw.line([(0, i), (cr*2, i)], fill=lerp((29, 79, 134), (8, 26, 50), t))
mask_c = Image.new("L", (cr*2, cr*2), 0)
ImageDraw.Draw(mask_c).ellipse([0, 0, cr*2-1, cr*2-1], fill=255)
card.paste(inner, (ccx-cr, ccy-cr), mask_c)
d = ImageDraw.Draw(card)
d.ellipse([ccx-cr+16, ccy-cr+16, ccx+cr-16, ccy+cr-16], outline=(125, 180, 238, 130), width=2)
# تُستخدم الصورة الشخصية تلقائياً إن وُجدت assets/portrait.jpg، وإلا شعار نجمة عشتار
portrait_path = os.path.join(ASSETS, "portrait.jpg")
if os.path.exists(portrait_path):
    photo = Image.open(portrait_path).convert("RGB")
    side = min(photo.size)
    photo = photo.crop(((photo.width-side)//2, (photo.height-side)//2,
                        (photo.width+side)//2, (photo.height+side)//2)).resize((cr*2-32, cr*2-32))
    pmask = Image.new("L", (cr*2-32, cr*2-32), 0)
    ImageDraw.Draw(pmask).ellipse([0, 0, cr*2-33, cr*2-33], fill=255)
    card.paste(photo, (ccx-(cr*2-32)//2, ccy-(cr*2-32)//2), pmask)
    d = ImageDraw.Draw(card)
else:
    star(d, ccx, ccy-18, 108, GOLD_2 + (255,))
    star(d, ccx, ccy-18, 44, GOLD + (255,))
    for ang in (35, 145, 255, 325):
        a = math.radians(ang)
        star(d, ccx+132*math.cos(a), ccy-18+132*math.sin(a), 12, (159, 212, 255, 230))

# ---------------- الجهة البيضاء: العنوان والباركود ----------------
f_h1, f_h2 = FL(46), FL(34)
spaced(d, 1280, 96, "PERSONAL CV", f_h1, INK, sp=4)
spaced(d, 1280, 158, "PROFILE CARD", f_h2, INK, sp=4)

# نخيلتان خلف حاوية الباركود
palm2 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
p2d = ImageDraw.Draw(palm2)
palm(p2d, 1650, 720, 360, BRONZE, 200, width=6)
palm(p2d, 1722, 700, 280, GOLD, 170, width=5)
card = Image.alpha_composite(card, palm2)
d = ImageDraw.Draw(card)

# حاوية الباركود الداكنة
qx0, qy0, qx1, qy1 = 975, 246, 1575, 846
qgrad = vgrad((qx1-qx0, qy1-qy0), (20, 52, 92), (10, 28, 52)).convert("RGBA")
qm = Image.new("L", (qx1-qx0, qy1-qy0), 0)
ImageDraw.Draw(qm).rounded_rectangle([0, 0, qx1-qx0-1, qy1-qy0-1], radius=30, fill=255)
card.paste(qgrad, (qx0, qy0), qm)
d = ImageDraw.Draw(card)
d.rounded_rectangle([qx0, qy0, qx1, qy1], radius=30, outline=GOLD + (220,), width=3)
spaced(d, (qx0+qx1)/2, qy0+30, "SCAN FOR DIRECT CONTACT PAGE", FL(25), GOLD_2, sp=2)
spaced(d, (qx0+qx1)/2, qy0+72, "SCAN TO VIEW COMPLETE CV", FL(22), GOLD, sp=2)
# الصندوق الأبيض والباركود الحقيقي
wx0, wy0, wx1, wy1 = qx0+40, qy0+118, qx1-40, qy1-36
d.rounded_rectangle([wx0, wy0, wx1, wy1], radius=22, fill=(255, 255, 255, 255),
                    outline=BRONZE + (255,), width=2)
qr = Image.open(os.path.join(ASSETS, "qr-contact.png")).convert("RGB").resize((430, 430))
card_rgb = card.convert("RGB")
card_rgb.paste(qr, ((wx0+wx1)//2 - 215, (wy0+wy1)//2 - 215))
card = card_rgb.convert("RGBA")
d = ImageDraw.Draw(card)

# زخرفة المثلثات الصغيرة
tx, ty = 878, 762
for i in range(4):
    d.polygon([(tx+i*22, ty), (tx+10+i*22, ty+16), (tx-2+i*22, ty+16)], fill=TEAL + (220,))
d.ellipse([tx+104, ty-2, tx+126, ty+20], outline=BRONZE + (255,), width=3)

# القرص المجنّح (بعيداً عن حبّة الرابط)
winged_sun(d, 812, 846, 118, BRONZE, 190)

# حبّة الرابط
url_font = FL(24)
uw = d.textlength(URL, font=url_font)
ux = 1278
d.rounded_rectangle([ux-uw/2-42, 884, ux+uw/2+42, 942], radius=29, fill=INK + (255,))
star(d, ux-uw/2-18, 913, 9, GOLD)
d.text((ux, 914), URL, font=url_font, fill=GOLD_2, anchor="mm")

# ---------------- الكتلة السفلية اليسرى (ألوان فاتحة فوق اللازوردي) ----------------
d.text((132, 828), "HUSSEIN ABBAS FARHOOD", font=FL(38), fill=GOLD_2)
d.line([(134, 886), (560, 886)], fill=GOLD + (200,), width=2)
d.text((134, 900), ar("حسين عباس فرهود"), font=F("Amiri-Bold.ttf", 42), fill=(255, 255, 255, 255))
d.text((134, 962), ar("مهندس وراثي"), font=F("Cairo-Bold.ttf", 30), fill=(159, 212, 255, 255))
d.text((134, 1012), "GENETIC ENGINEER", font=FL(25), fill=GOLD)

# صف مسماري سفلي
for i in range(16):
    x = 120 + i*42
    d.polygon([(x, 1085), (x+15, 1092), (x, 1099)], fill=GOLD + (150,))

# شعار Farhood CV
lx, ly = 1108, 1002
d.rounded_rectangle([lx, ly, lx+58, ly+58], radius=14, fill=NAVY + (255,))
star(d, lx+29, ly+29, 14, GOLD)
d.text((lx+74, ly+2), "Farhood", font=FL(29), fill=INK)
d.text((lx+74, ly+34), "CV • BABYLON", font=FL(19), fill=BRONZE)

# وردة شمش في الزاوية السفلية اليمنى (مقصوصة جزئياً)
ros = Image.new("RGBA", (W, H), (0, 0, 0, 0))
rosd = ImageDraw.Draw(ros)
rosette(rosd, 1758, 1112, 165, BRONZE, 190)
card = Image.alpha_composite(card, ros)
d = ImageDraw.Draw(card)

# ---------------- القص النهائي والإطار ----------------
mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, W-1, H-1], radius=R, fill=255)
flat = Image.new("RGBA", (W, H), (0, 0, 0, 0))
flat.paste(card, (0, 0), mask)
d = ImageDraw.Draw(flat)
d.rounded_rectangle([9, 9, W-10, H-10], radius=R-9, outline=GOLD + (160,), width=2)
d.rounded_rectangle([17, 17, W-18, H-18], radius=R-15, outline=BRONZE + (80,), width=1)

out_png = os.path.join(ASSETS, "farhood-cv-card.png")
flat.convert("RGB").save(out_png, quality=95)
flat.convert("RGB").save(os.path.join(ASSETS, "farhood-cv-card.pdf"), "PDF", resolution=300.0)
print("saved:", out_png, flat.size)
