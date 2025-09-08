from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib import colors
from typing import Dict
from pathlib import Path


def export_book_to_pdf(book: Dict, output_path: str) -> None:
    out_path = Path(output_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # Landscape A4 for big images
    page_width, page_height = landscape(A4)
    c = canvas.Canvas(str(out_path), pagesize=(page_width, page_height))

    title = book.get("title", "Mein Bilderbuch")

    # Cover page
    c.setFillColor(colors.HexColor("#ffd54f"))
    c.rect(0, 0, page_width, page_height, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#37474f"))
    c.setFont("Helvetica-Bold", 42)
    c.drawCentredString(page_width / 2, page_height / 2, title)
    c.showPage()

    for page in book.get("pages", []):
        image_path = page.get("image_path") or page.get("image")
        caption = page.get("caption", "")
        img = ImageReader(image_path)

        # Calculate image size to fit with margins
        margin = 36
        max_w = page_width - margin * 2
        max_h = page_height - margin * 2 - 60  # leave room for caption
        iw, ih = img.getSize()
        scale = min(max_w / iw, max_h / ih)
        w = iw * scale
        h = ih * scale
        x = (page_width - w) / 2
        y = (page_height - h) / 2 + 30

        # Background
        c.setFillColor(colors.HexColor("#e1f5fe"))
        c.rect(0, 0, page_width, page_height, fill=1, stroke=0)

        c.drawImage(img, x, y, width=w, height=h, preserveAspectRatio=True, mask='auto')

        # Caption area
        c.setFillColor(colors.HexColor("#ffffff"))
        c.roundRect(margin, margin, page_width - 2 * margin, 50, 10, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#424242"))
        c.setFont("Helvetica", 16)
        c.drawCentredString(page_width / 2, margin + 18, caption[:180])
        c.showPage()

    c.save()

