"""img/ フォルダの画像を index.html の中にうめこむ。

画像を追加・差しかえたら、このフォルダで `python3 embed_images.py` を実行する。
index.html だけで（画像ファイルがなくても）表示できるようになる。
"""
import base64
import pathlib
import re

here = pathlib.Path(__file__).parent
html_path = here / "index.html"
entries = []
for f in sorted((here / "img").glob("*.jpg")):
    data = base64.b64encode(f.read_bytes()).decode()
    entries.append(f'  "{f.stem}": "data:image/jpeg;base64,{data}"')
block = ("<!-- IMAGES:START（embed_images.py が自動で書きかえます） -->\n<script>\nconst IMG = {\n"
         + ",\n".join(entries) + "\n};\n</script>\n<!-- IMAGES:END -->")
html = html_path.read_text(encoding="utf8")
html, n = re.subn(r"<!-- IMAGES:START.*?<!-- IMAGES:END -->", lambda m: block, html, flags=re.S)
assert n == 1, "IMAGES の目印が見つかりません"
html_path.write_text(html, encoding="utf8")
print(f"{len(entries)} images embedded")
