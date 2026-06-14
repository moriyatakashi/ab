from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Windows のメイリオを登録
pdfmetrics.registerFont(TTFont("Meiryo", "C:/Windows/Fonts/meiryo.ttc"))

txt_path = "test.txt"
pdf_path = "test.pdf"

c = canvas.Canvas(pdf_path)
text = c.beginText(40, 800)
text.setFont("Meiryo", 12)

with open(txt_path, "r", encoding="utf-8") as f:
    for line in f:
        text.textLine(line.rstrip("\n"))

c.drawText(text)
c.save()

print("PDF を作成しました:", pdf_path)
