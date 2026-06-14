from reportlab.pdfgen import canvas

# 入力テキストファイル
txt_path = "test.txt"
# 出力PDFファイル
pdf_path = "test.pdf"

# PDFキャンバス作成
c = canvas.Canvas(pdf_path)

# テキストオブジェクト作成
text = c.beginText(40, 800)  # 左40px、上800pxあたりから開始

# テキストファイルを読み込んで1行ずつPDFへ
with open(txt_path, "r", encoding="utf-8") as f:
    for line in f:
        text.textLine(line.rstrip("\n"))

c.drawText(text)
c.save()

print("PDF を作成しました:", pdf_path)
