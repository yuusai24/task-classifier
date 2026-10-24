#!/usr/bin/env python3
"""
撮影する前にしくみを試すための、テスト用の動画（3本）を作るスクリプト。
3つの円すいの置き物を、引き・横移動・アップから引き で撮ったような動画を input/ に作ります。

使い方:
    python3 make_test_clips.py
"""

import os
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "input")
W, H, FPS = 1080, 1920, 30
COLORS = [(150, 110, 190), (240, 190, 200), (130, 210, 190)]


def stage():
    """3つの置き物がならんだ、大きめの1枚絵（ここをカメラで写すイメージ）。"""
    sw, sh = W * 2, H * 2
    ramp = np.linspace(0, 1, sh)[:, None]
    top = np.array([150, 200, 190]) * (1 - ramp) + np.array([60, 100, 80]) * ramp
    img = Image.fromarray(np.repeat(top[:, None, :], sw, axis=1).astype(np.uint8))
    d = ImageDraw.Draw(img)
    table = int(sh * 0.55)
    d.rectangle([0, table, sw, sh], fill=(120, 70, 45))
    d.rectangle([sw * 0.12, table + 120, sw * 0.88, table + 330], fill=(215, 170, 115))
    for k, color in enumerate(COLORS):
        cx = sw * (0.25 + 0.25 * k)
        base = table + 150
        d.polygon([(cx, base - 520), (cx - 190, base), (cx + 190, base)], fill=color)
        d.ellipse([cx - 60, base - 200, cx + 60, base - 80], fill=(230, 200, 110))
    return img.filter(ImageFilter.GaussianBlur(2))


def camera(img, cx, cy, zoom):
    """1枚絵の (cx, cy) を中心に、zoom 倍で写した1コマを返す。"""
    cw, ch = W * 2 / zoom, H * 2 / zoom
    box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    return img.crop(tuple(int(v) for v in box)).resize((W, H))


def write(name, frames):
    path = os.path.join(OUT, name)
    proc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                             "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                             "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", path],
                            stdin=subprocess.PIPE)
    for f in frames:
        proc.stdin.write(f.tobytes())
    proc.stdin.close()
    proc.wait()
    print(f"作りました: {path}")


def ease(a, b, p):
    p = p * p * (3 - 2 * p)
    return a + (b - a) * p


def main():
    os.makedirs(OUT, exist_ok=True)
    img = stage()
    sw, sh = img.size
    mid_y = sh * 0.55
    xs = [sw * (0.25 + 0.25 * k) for k in range(3)]

    write("wide.mp4", (camera(img, sw / 2, sh / 2, 1.0) for _ in range(FPS * 3)))

    # 左へ寄る → 1つずつ止まりながら右へ
    keys = [(0.0, sw / 2, sh / 2, 1.0), (0.8, xs[0], mid_y, 2.2), (1.6, xs[0], mid_y, 2.2),
            (2.5, xs[1], mid_y, 2.2), (3.1, xs[1], mid_y, 2.2), (3.9, xs[2], mid_y, 2.2),
            (5.0, xs[2], mid_y, 2.2)]
    pan = []
    for i in range(int(FPS * 4.9)):
        t = i / FPS
        k = max(j for j in range(len(keys)) if keys[j][0] <= t)
        a, b = keys[k], keys[min(k + 1, len(keys) - 1)]
        p = 0 if b[0] == a[0] else (t - a[0]) / (b[0] - a[0])
        pan.append(camera(img, ease(a[1], b[1], p), ease(a[2], b[2], p), ease(a[3], b[3], p)))
    write("pan.mp4", pan)

    pull = []
    for i in range(int(FPS * 5.2)):
        p = min(1.0, i / (FPS * 1.2))
        pull.append(camera(img, ease(xs[2], sw / 2, p), ease(mid_y, sh / 2, p), ease(2.2, 1.0, p)))
    write("pullback.mp4", pull)


if __name__ == "__main__":
    main()
