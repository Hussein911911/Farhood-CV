# -*- coding: utf-8 -*-
"""
بطاقة التعريف — نسخة مطابقة للتصميم المرجعي (copy layout)
لوحة لازوردية منحنية + سوش ذهبي + موجات ضوئية + دائرة تعريف + نخيل ولاماسو وشمش
باركود حقيقي قابل للمسح. تُدمج الصورة الشخصية تلقائياً إن وُجدت assets/portrait.jpg
"""
import math
import os
import arabic_reshaper
from bidi.algorithm import get_display
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "tools", ".build")
ASSETS = os.path.join(ROOT, "assets")
URL = "https://farhood-cv.onrender.com/"

# ---------------- الألوان ----------------
NAVY_TOP = (26, 70, 122)
NAVY_BOT = (9, 28, 54)
NAVY = (13, 42, 77)
INK = (17, 35, 60)
GOLD = (216, 181, 106)
GOLD_2 = (243, 226, 179)
BRONZE = (176, 141, 87)
IVORY = (245, 241, 230)
IVORY_2 = (234, 228, 212)
WAVE = (205, 224, 238)
WAVE_2 = (183, 212, 226)
TEAL = (106, 172, 190)
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
def bezier(p0, p1, p2, p3, n=240):
    out = []
    for i in range(n + 1):
        t, m = i / n, 1 - i / n
        out.append((
            m**3*p0[0] + 3*m*m*t*p1[0] + 3*m*t*t*p2[0] + t**3*p3[0],
            m**3*p0[1] + 3*m*m*t*p1[1] + 3*m*t*t*p2[1] + t**3*p3[1],
        ))
    return out
def qcurve(p0, p1, p2, n=28):
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

def palm(d, bx, by, h, col, alpha=215, width=6):
    c = col + (alpha,)
    crown = (bx, by - h)
    trunk = [(bx + 10*math.sin(t*1.1)*t, by - h*t) for t in [i/14 for i in range(15)]]
    d.line(trunk, fill=c, width=width, joint="curve")
    for i in range(1, 13):
        x, y = trunk[i]
        d.line([(x-5, y), (x+5, y-2)], fill=c, width=2)
    for k in range(10):
        ang = math.radians(205 - k*130/9)
        L = h * 0.46
        ex = crown[0] + L*math.cos(ang)
        ey = crown[1] + L*math.sin(ang)*0.92
        d.line(qcurve(crown, (crown[0] + L*0.6*math.cos(ang), crown[1] + L*0.6*math.sin(ang) - 20), (ex, ey)),
               fill=c, width=4)

def lamassu(d, cx, cy, s, col, alpha=200):
    """ثور مجنّح (لاماسو) برسم خطي أنيق."""
    c = col + (alpha,)
    w = 3
    # الجسم بظهر منحنٍ وصدر
    body = [
        (cx-s*0.98, cy-s*0.20), (cx-s*0.60, cy-s*0.42), (cx+s*0.15, cy-s*0.45),
        (cx+s*0.58, cy-s*0.20), (cx+s*0.60, cy+s*0.32), (cx-s*0.92, cy+s*0.32),
    ]
    d.line(body + [body[0]], fill=c, width=w, joint="curve")
    # الرأس بمواجهة اليسار
    hx, hy = cx-s*1.02, cy-s*0.42
    d.ellipse([hx-s*0.30, hy-s*0.30, hx+s*0.26, hy+s*0.30], outline=c, width=w)
    # خطم
    d.line(qcurve((hx-s*0.24, hy-s*0.02), (hx-s*0.42, hy+s*0.02), (hx-s*0.30, hy+s*0.16)), fill=c, width=w)
    # قرنان
    d.line(qcurve((hx-s*0.10, hy-s*0.26), (hx-s*0.12, hy-s*0.52), (hx+s*0.06, hy-s*0.58)), fill=c, width=w)
    d.line(qcurve((hx+s*0.06, hy-s*0.26), (hx+s*0.14, hy-s*0.50), (hx+s*0.26, hy-s*0.48)), fill=c, width=w)
    # اللحية البابلية المدرّجة
    d.line(qcurve((hx-s*0.16, hy+s*0.14), (hx-s*0.26, hy+s*0.40), (hx-s*0.06, hy+s*0.52)), fill=c, width=w)
    for k in range(3):
        yy = hy+s*(0.22+k*0.10)
        d.line([(hx-s*0.20+k*2, yy), (hx-s*0.08+k*2, yy+4)], fill=c, width=2)
    # العين والأذن
    d.ellipse([hx-3, hy-4, hx+3, hy+2], fill=c)
    d.line(qcurve((hx+s*0.16, hy-s*0.22), (hx+s*0.30, hy-s*0.34), (hx+s*0.34, hy-s*0.18)), fill=c, width=w)
    # الجناح الكبير بريش واضح
    w0 = (cx-s*0.62, cy-s*0.40)
    w1 = (cx+s*0.42, cy-s*0.78)
    w2 = (cx+s*0.52, cy-s*0.18)
    d.line(qcurve(w0, ((w0[0]+w1[0])/2, w1[1]-s*0.12), w1), fill=c, width=w)
    d.line(qcurve(w1, (w1[0]+s*0.12, w1[1]+s*0.30), w2), fill=c, width=w)
    d.line(qcurve(w2, ((w0[0]+w2[0])/2, cy-s*0.05), w0), fill=c, width=w)
    for i in range(6):
        t = 0.18 + i*0.12
        sx = w0[0] + (w1[0]-w0[0])*t
        sy = w0[1] + (w1[1]-w0[1])*t
        d.line(qcurve((sx, sy), (sx+s*0.10, sy+s*0.30), (sx-s*0.04, sy+s*0.52)), fill=c, width=2)
    # الأرجل بحوافر
    for lx in (cx-s*0.72, cx-s*0.28, cx+s*0.12, cx+s*0.45):
        d.line([(lx, cy+s*0.30), (lx-s*0.07, cy+s*0.82)], fill=c, width=w)
        d.line([(lx-s*0.07, cy+s*0.82), (lx+s*0.09, cy+s*0.82)], fill=c, width=w)
    # الذيل
    d.line(qcurve((cx+s*0.58, cy-s*0.05), (cx+s*0.92, cy+s*0.02), (cx+s*0.80, cy+s*0.42)), fill=c, width=w)

def rosette(d, cx, cy, Rr, col, alpha=190):
    c = col + (alpha,)
    d.ellipse([cx-Rr, cy-Rr, cx+Rr, cy+Rr], outline=c, width=4)
    d.ellipse([cx-Rr*0.6, cy-Rr*0.6, cx+Rr*0.6, cy+Rr*0.6], outline=c, width=3)
    for i in range(22):
        a = i*math.pi/11
        d.line([(cx+math.cos(a)*Rr*0.66, cy+math.sin(a)*Rr*0.66),
                (cx+math.cos(a)*Rr*0.93, cy+math.sin(a)*Rr*0.93)], fill=c, width=4)
    d.ellipse([cx-12, cy-12, cx+12, cy+12], fill=col+(min(alpha+50, 255),))

# ================= البناء =================
card = Image.new("RGBA", (W, H), (0, 0, 0, 0))
base = Image.new("RGBA", (W, H), IVORY + (255,))
bd = ImageDraw.Draw(base)
# توهج عاجي دافئ
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gld = ImageDraw.Draw(glow)
gld.ellipse([700, -260, 1900, 760], fill=(255, 250, 235, 120))
glow = glow.filter(ImageFilter.GaussianBlur(160))
base = Image.alpha_composite(base, glow)
card = Image.alpha_composite(card, base)

# ---------------- الموجات الضوئية في البياض ----------------
waves = Image.new("RGBA", (W, H), (0, 0, 0, 0))
wd = ImageDraw.Draw(waves)
up1 = bezier((0, 1010), (520, 900), (1180, 800), (1800, 640))
dn1 = bezier((0, 1140), (520, 1050), (1180, 970), (1800, 830))
wd.polygon(up1 + dn1[::-1], fill=WAVE + (235,))
up2 = bezier((0, 1120), (560, 1020), (1200, 950), (1800, 880))
dn2 = [(x, min(y + 150, H)) for x, y in up2]
wd.polygon(up2 + dn2[::-1], fill=WAVE_2 + (200,))
teal_line = bezier((760, 600), (1100, 720), (1450, 660), (1800, 500))
wd.line(teal_line, fill=TEAL + (130,), width=9)
card = Image.alpha_composite(card, waves)

# ---------------- الكوكبة العلوية ----------------
sky = Image.new("RGBA", (W, H), (0, 0, 0, 0))
skd = ImageDraw.Draw(sky)
pts = [(950, 120), (1075, 78), (1205, 150), (1335, 92), (1465, 168), (1595, 118),
       (1690, 248), (1545, 298), (1375, 238), (1195, 298), (1025, 258), (915, 348)]
for a, b in zip(pts, pts[1:] + pts[:1]):
    skd.line([a, b], fill=INK + (32,), width=2)
for x, y in pts:
    skd.ellipse([x-4, y-4, x+4, y+4], fill=INK + (55,))
card = Image.alpha_composite(card, sky)

# ---------------- اللوحة اللازوردية ----------------
scurve = bezier((930, 0), (755, 250), (825, 510), (698, 636))
swoosh = qcurve((698, 636), (430, 770), (0, 882))
panel_outline = [(0, 0), (930, 0)] + scurve[1:] + swoosh[1:]
panel_mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(panel_mask).polygon(panel_outline + [(0, H), (0, 0)], fill=255)
panel = vgrad((W, H), NAVY_TOP, NAVY_BOT).convert("RGBA")
card = Image.composite(panel, card, panel_mask)

# نسيج مسماري داخل اللوحة
tex = Image.new("RGBA", (W, H), (0, 0, 0, 0))
td = ImageDraw.Draw(tex)
for row in range(8):
    for col in range(15):
        x = 52 + col*60 + (row % 2)*16
        y = 50 + row*150
        if x > 900:
            continue
        td.polygon([(x, y), (x+19, y+7), (x, y+14)], fill=GOLD + (30,))
        td.line([(x+26, y+7), (x+45, y+7)], fill=(125, 180, 238, 26), width=3)
        td.line([(x, y+33), (x+11, y+43), (x, y+53)], fill=GOLD + (25,), width=3)
card = Image.alpha_composite(card, Image.composite(tex, Image.new("RGBA", (W, H), (0, 0, 0, 0)), panel_mask))

# السوش الذهبي السميك
band = Image.new("RGBA", (W, H), (0, 0, 0, 0))
bd2 = ImageDraw.Draw(band)
bd2.line(swoosh, fill=(143, 111, 51, 255), width=34, joint="curve")
bd2.line(swoosh, fill=GOLD + (255,), width=14, joint="curve")
bd2.line(scurve, fill=GOLD + (200,), width=8, joint="curve")
card = Image.alpha_composite(card, band)
d = ImageDraw.Draw(card)

# ---------------- اسم اللوحة العلوي ----------------
d.text((84, 112), "HUSSEIN ABBAS", font=FL(56), fill=GOLD)
d.text((84, 180), "FARHOOD", font=FL(56), fill=GOLD_2)
d.line([(86, 262), (540, 262)], fill=GOLD + (160,), width=2)

# أيقونة متوهجة (نجمة عشتار مضيئة)
glow2 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
g2 = ImageDraw.Draw(glow2)
gx, gy = 712, 182
g2.ellipse([gx-88, gy-88, gx+88, gy+88], fill=(125, 196, 255, 95))
glow2 = glow2.filter(ImageFilter.GaussianBlur(32))
card = Image.alpha_composite(card, glow2)
d = ImageDraw.Draw(card)
star(d, gx, gy, 50, (159, 212, 255, 255))
star(d, gx, gy, 21, GOLD_2 + (255,))

# ---------------- النخيل ----------------
palm_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
pld = ImageDraw.Draw(palm_layer)
palm(pld, 148, 792, 296, GOLD, 220)
palm(pld, 268, 818, 228, GOLD, 185)
palm(pld, 1652, 706, 336, BRONZE, 200)
palm(pld, 1716, 678, 262, GOLD, 165)
card = Image.alpha_composite(card, palm_layer)
d = ImageDraw.Draw(card)

# ---------------- دائرة التعريف تعتلي السوش ----------------
ccx, ccy, cr = 556, 560, 188
rg = Image.new("RGBA", (W, H), (0, 0, 0, 0))
rgd = ImageDraw.Draw(rg)
rgd.ellipse([ccx-cr-30, ccy-cr-30, ccx+cr+30, ccy+cr+30], fill=(216, 181, 106, 115))
rg = rg.filter(ImageFilter.GaussianBlur(26))
card = Image.alpha_composite(card, rg)
d = ImageDraw.Draw(card)
d.ellipse([ccx-cr-14, ccy-cr-14, ccx+cr+14, ccy+cr+14], fill=GOLD + (255,))
inner = Image.new("RGBA", (cr*2, cr*2), (0, 0, 0, 0))
idw = ImageDraw.Draw(inner)
for i in range(cr*2):
    idw.line([(0, i), (cr*2, i)], fill=lerp((30, 80, 136), (8, 25, 48), i/(cr*2)))
mask_c = Image.new("L", (cr*2, cr*2), 0)
ImageDraw.Draw(mask_c).ellipse([0, 0, cr*2-1, cr*2-1], fill=255)
card.paste(inner, (ccx-cr, ccy-cr), mask_c)
d = ImageDraw.Draw(card)
d.ellipse([ccx-cr+15, ccy-cr+15, ccx+cr-15, ccy+cr-15], outline=(125, 180, 238, 130), width=2)
portrait_path = os.path.join(ASSETS, "portrait.jpg")
if os.path.exists(portrait_path):
    photo = Image.open(portrait_path).convert("RGB")
    side = min(photo.size)
    photo = photo.crop(((photo.width-side)//2, (photo.height-side)//2,
                        (photo.width+side)//2, (photo.height+side)//2)).resize((cr*2-30, cr*2-30))
    pmask = Image.new("L", (cr*2-30, cr*2-30), 0)
    ImageDraw.Draw(pmask).ellipse([0, 0, cr*2-31, cr*2-31], fill=255)
    card.paste(photo, (ccx-(cr*2-30)//2, ccy-(cr*2-30)//2), pmask)
    d = ImageDraw.Draw(card)
else:
    star(d, ccx, ccy-14, 104, GOLD_2 + (255,))
    star(d, ccx, ccy-14, 42, GOLD + (255,))
    for ang in (35, 145, 255, 325):
        a = math.radians(ang)
        star(d, ccx+128*math.cos(a), ccy-14+128*math.sin(a), 11, (159, 212, 255, 230))

# ---------------- العنوان العلوي الأيمن ----------------
spaced(d, 1300, 120, "PERSONAL CV", FL(45), INK, sp=4)
spaced(d, 1300, 182, "PROFILE CARD", FL(33), INK, sp=4)

# ---------------- حاوية الباركود ----------------
qx0, qy0, qx1, qy1 = 985, 292, 1605, 844
qgrad = vgrad((qx1-qx0, qy1-qy0), (20, 52, 92), (9, 27, 51)).convert("RGBA")
qm = Image.new("L", (qx1-qx0, qy1-qy0), 0)
ImageDraw.Draw(qm).rounded_rectangle([0, 0, qx1-qx0-1, qy1-qy0-1], radius=30, fill=255)
card.paste(qgrad, (qx0, qy0), qm)
d = ImageDraw.Draw(card)
d.rounded_rectangle([qx0, qy0, qx1, qy1], radius=30, outline=GOLD + (220,), width=3)
spaced(d, (qx0+qx1)/2, qy0+28, "SCAN FOR DIRECT CONTACT PAGE", FL(24), GOLD_2, sp=2)
spaced(d, (qx0+qx1)/2, qy0+70, "SCAN TO VIEW COMPLETE CV", FL(21), GOLD, sp=2)
wx0, wy0, wx1, wy1 = qx0+40, qy0+116, qx1-40, qy1-38
d.rounded_rectangle([wx0, wy0, wx1, wy1], radius=20, fill=(255, 255, 255, 255), outline=BRONZE + (255,), width=2)
qr = Image.open(os.path.join(ASSETS, "qr-contact.png")).convert("RGB").resize((424, 424))
card_rgb = card.convert("RGB")
card_rgb.paste(qr, ((wx0+wx1)//2 - 212, (wy0+wy1)//2 - 212))
card = card_rgb.convert("RGBA")
d = ImageDraw.Draw(card)

# مثلثات وحلقة بجانب الحاوية
tx, ty = 868, 758
for i in range(4):
    d.polygon([(tx+i*22, ty), (tx+10+i*22, ty+16), (tx-2+i*22, ty+16)], fill=TEAL + (230,))
d.ellipse([tx+102, ty-2, tx+124, ty+20], outline=BRONZE + (255,), width=3)

# اللاماسو
lamassu(d, 884, 918, 150, BRONZE, 205)

# حبّة الرابط
url_font = FL(23)
uw = d.textlength(URL, font=url_font)
ux = 1282
d.rounded_rectangle([ux-uw/2-40, 882, ux+uw/2+40, 938], radius=28, fill=INK + (255,))
star(d, ux-uw/2-17, 910, 8, GOLD)
d.text((ux, 911), URL, font=url_font, fill=GOLD_2, anchor="mm")

# ---------------- الكتلة السفلية اليسرى (على البياض) ----------------
d.text((118, 836), "HUSSEIN ABBAS FARHOOD", font=FL(37), fill=INK)
d.line([(120, 894), (596, 894)], fill=BRONZE + (210,), width=2)
d.text((120, 906), ar("حسين عباس فرهود"), font=F("Amiri-Bold.ttf", 40), fill=NAVY)
d.text((120, 966), ar("مهندس وراثي"), font=F("Cairo-Bold.ttf", 29), fill=BRONZE)
d.text((120, 1014), "GENETIC ENGINEER", font=FL(25), fill=INK)

# صف مسماري سفلي
for i in range(16):
    x = 110 + i*42
    d.polygon([(x, 1083), (x+14, 1090), (x, 1097)], fill=BRONZE + (170,))

# شعار Farhood CV
lx, ly = 1106, 1000
d.rounded_rectangle([lx, ly, lx+56, ly+56], radius=14, fill=NAVY + (255,))
star(d, lx+28, ly+28, 14, GOLD)
d.text((lx+72, ly+2), "Farhood", font=FL(28), fill=INK)
d.text((lx+72, ly+33), "CV • BABYLON", font=FL(18), fill=BRONZE)

# وردة شمش الزاوية السفلية اليمنى
ros = Image.new("RGBA", (W, H), (0, 0, 0, 0))
rosd = ImageDraw.Draw(ros)
rosette(rosd, 1768, 1148, 158, BRONZE, 195)
card = Image.alpha_composite(card, ros)
d = ImageDraw.Draw(card)

# ---------------- القص والإطار ----------------
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
