# -*- coding: utf-8 -*-
"""
استبدال الباركود داخل بطاقة التعرف بباركود جديد بنفس الأبعاد والزاوية.
يكتشف رباعي الباركود الحالي في البطاقة ثم يرسم الباركود الجديد بتحويل منظوري.
المخرجات: assets/farhood-cv-card.png + assets/farhood-cv-card.pdf
"""
import os
import cv2
import numpy as np
import qrcode
from qrcode.constants import ERROR_CORRECT_H
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
CARD = os.path.join(ASSETS, "farhood-cv-card.png")
QR_OUT = os.path.join(ASSETS, "qr-contact.png")

# الباركود يفتح الموقع من بدايته (الجذر) بدون أي هاش
URL = "https://farhood-cv.onrender.com/"


def build_qr(path: str) -> None:
    # نسخة 5 = 37 مربعاً، مطابقة لحجم الباركود السابق ليملأ الصفيحة بنفس القدر
    qr = qrcode.QRCode(version=5, error_correction=ERROR_CORRECT_H, box_size=24, border=4)
    qr.add_data(URL)
    qr.make(fit=False)
    img = qr.make_image(fill_color="#0b1626", back_color="white").convert("RGB")
    img.save(path, optimize=True)


def main() -> None:
    build_qr(QR_OUT)
    base = cv2.imread(CARD)
    if base is None:
        raise SystemExit("تعذّر العثور على البطاقة: " + CARD)

    detector = cv2.QRCodeDetector()
    ok, points = detector.detect(base)
    if not ok:
        raise SystemExit("تعذّر اكتشاف منطقة الباركود الحالي في البطاقة")
    dst_quad = points.reshape(4, 2).astype(np.float32)

    qr = cv2.imread(QR_OUT)
    h, w = qr.shape[:2]
    src_quad = np.array([[0, 0], [w, 0], [w, h], [0, h]], dtype=np.float32)

    matrix = cv2.getPerspectiveTransform(src_quad, dst_quad)
    warped = cv2.warpPerspective(
        qr, matrix, (base.shape[1], base.shape[0]),
        flags=cv2.INTER_AREA, borderValue=(255, 255, 255),
    )
    mask = np.zeros(base.shape[:2], dtype=np.uint8)
    cv2.fillConvexPoly(mask, dst_quad.astype(np.int32), 255)
    out = base.copy()
    out[mask > 0] = warped[mask > 0]
    cv2.imwrite(CARD, out)

    # نسخة طباعة
    Image.open(CARD).convert("RGB").save(
        os.path.join(ASSETS, "farhood-cv-card.pdf"), "PDF", resolution=300.0
    )

    data, _, _ = detector.detectAndDecode(cv2.imread(CARD))
    print("encoded URL :", URL)
    print("decoded QR  :", data)
    print("valid       :", data == URL)


if __name__ == "__main__":
    main()
