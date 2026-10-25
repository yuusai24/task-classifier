#!/usr/bin/env python3
"""
「型（テンプレート）」と「リール設定」から、縦型リール動画を自動で作るスクリプト。

使い方:
    python3 make_reel.py reels/shugorei_shindan.json
    python3 make_reel.py reels/shugorei_shindan.json --preview   # 確認用の静止画だけ作る

型（templates/*.json）  … 時間・文字の位置・色・カウントダウンなど「レシピ」
リール設定（reels/*.json）… 使う動画ファイル・入れる文字・BGMなど「材料」
"""

import argparse
import json
import math
import os
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))

FONTS = {
    "serif": ("/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc", 0),
    "sans": ("/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc", 0),
}

# 文字のデザイン。size は画面の横幅に対する割合。
STYLES = {
    "title": {"font": "sans", "size": 0.13, "gradient": ["#c8f57a", "#3f9e1c"],
              "stroke": ["#ffffff", 0.008], "shadow": True},
    "pink": {"font": "serif", "size": 0.072, "fill": "#fff0fb",
             "stroke": ["#ff8fe6", 0.003], "glow": ["#ff2fcf", 0.018]},
    "blue": {"font": "serif", "size": 0.072, "fill": "#ffffff",
             "stroke": ["#9cc8ff", 0.002], "glow": ["#2f7bff", 0.018]},
    "green": {"font": "serif", "size": 0.068, "fill": "#8fe05a",
              "stroke": ["#ffffff", 0.005], "glow": ["#2fae2f", 0.012]},
    "green_small": {"font": "serif", "size": 0.052, "fill": "#8fe05a",
                    "stroke": ["#ffffff", 0.004], "glow": ["#2fae2f", 0.010]},
    "label": {"font": "serif", "size": 0.09, "fill": "#ffe27a",
              "stroke": ["#a87a10", 0.002], "glow": ["#fff3b0", 0.012]},
}

EMPHASIS_SCALE = 1.45  # {かみ} のように {} でかこんだ文字の大きさ
MAX_TEXT_WIDTH = 0.92  # 文字が横にはみ出さないための最大幅（画面の横幅に対する割合）


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def font(kind, px):
    path, index = FONTS[kind]
    return ImageFont.truetype(path, max(int(px), 8), index=index)


def parse_runs(line):
    """「答えは「{かみ}」」→ [("答えは「", False), ("かみ", True), ("」", False)]"""
    runs, buf, emph = [], "", False
    for ch in line:
        if ch in "{}":
            if buf:
                runs.append((buf, emph))
            buf, emph = "", ch == "{"
        else:
            buf += ch
    if buf:
        runs.append((buf, emph))
    return runs


def layout_text(text, style, width):
    """各行の文字の並び（runs）と、はみ出さない大きさを決める。"""
    lines = [parse_runs(l) for l in text.split("\n")]
    base = style["size"] * width

    def line_width(runs, px):
        return sum(font(style["font"], px * (EMPHASIS_SCALE if e else 1)).getlength(s)
                   for s, e in runs)

    widest = max(line_width(r, base) for r in lines)
    if widest > width * MAX_TEXT_WIDTH:
        base *= width * MAX_TEXT_WIDTH / widest
    return lines, base, line_width


def render_text(text, style, width):
    """文字を、フチ・光・グラデーションつきの透明画像（RGBA）にする。"""
    lines, px, line_width = layout_text(text, style, width)
    pad = int(px * 0.6)
    line_heights = [px * (EMPHASIS_SCALE if any(e for _, e in r) else 1) * 1.25 for r in lines]
    w = int(max(line_width(r, px) for r in lines)) + pad * 2
    h = int(sum(line_heights)) + pad * 2
    stroke_w = int(style.get("stroke", [None, 0])[1] * width)

    mask = Image.new("L", (w, h), 0)      # 文字の形
    stroke = Image.new("L", (w, h), 0)    # 文字＋フチの形
    dm, ds = ImageDraw.Draw(mask), ImageDraw.Draw(stroke)
    y = pad
    for runs, lh in zip(lines, line_heights):
        x = (w - line_width(runs, px)) / 2
        for s, e in runs:
            f = font(style["font"], px * (EMPHASIS_SCALE if e else 1))
            baseline = y + lh * 0.85
            dm.text((x, baseline), s, font=f, fill=255, anchor="ls")
            ds.text((x, baseline), s, font=f, fill=255, anchor="ls",
                     stroke_width=stroke_w, stroke_fill=255)
            x += f.getlength(s)
        y += lh

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    if "box" in style:
        # 文字のうしろに、角の丸い半透明の下じきをしく
        color, alpha = style["box"]
        m = int(pad * 0.45)
        ImageDraw.Draw(out).rounded_rectangle([m, m, w - m, h - m], radius=int(px * 0.4),
                                              fill=hex_rgb(color) + (alpha,))
    if style.get("shadow"):
        sh = stroke.filter(ImageFilter.GaussianBlur(px * 0.05))
        layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        layer.paste((40, 60, 30, 160), (int(px * 0.04), int(px * 0.06)), sh)
        out = Image.alpha_composite(out, layer)
    if "halo" in style:
        # 明るい背景でも読めるように、文字のまわりにうすい影をしく
        color, opacity, radius = style["halo"]
        grow = max(3, int(radius * width)) | 1
        hl = stroke.filter(ImageFilter.MaxFilter(grow)).filter(ImageFilter.GaussianBlur(radius * width))
        layer = Image.new("RGBA", (w, h), hex_rgb(color) + (0,))
        layer.putalpha(hl.point(lambda v: int(v * opacity)))
        out = Image.alpha_composite(out, layer)
    if "glow" in style:
        color, radius = style["glow"]
        g = stroke.filter(ImageFilter.GaussianBlur(radius * width))
        g = g.point(lambda v: min(255, v * 2))
        for _ in range(2):
            layer = Image.new("RGBA", (w, h), hex_rgb(color) + (0,))
            layer.putalpha(g)
            out = Image.alpha_composite(out, layer)
    if "stroke" in style:
        layer = Image.new("RGBA", (w, h), hex_rgb(style["stroke"][0]) + (0,))
        layer.putalpha(stroke)
        out = Image.alpha_composite(out, layer)
    if "gradient" in style:
        top, bottom = (np.array(hex_rgb(c), float) for c in style["gradient"])
        ramp = np.linspace(0, 1, h)[:, None, None]
        grad = (top * (1 - ramp) + bottom * ramp).repeat(w, axis=1).astype(np.uint8)
        fill = Image.fromarray(grad, "RGB").convert("RGBA")
    else:
        fill = Image.new("RGBA", (w, h), hex_rgb(style["fill"]) + (255,))
    fill.putalpha(mask)
    return np.array(Image.alpha_composite(out, fill))


def render_band(width, height_frac, full_h, color="#ffffff", alpha=140):
    h = int(height_frac * full_h)
    band = np.zeros((h, width, 4), np.uint8)
    band[...] = hex_rgb(color) + (alpha,)
    return band


def render_countdown(t_local, width, color="#ffffff"):
    """映画のはじまりのようなカウントダウン（3・2・1）。t_local は始まってからの秒数。"""
    size = int(width * 0.46)
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    rgb = hex_rgb(color)
    c = size / 2
    r_out, r_in = size * 0.40, size * 0.32
    lw = max(2, int(size * 0.012))
    number = max(1, 3 - int(t_local))
    frac = t_local % 1.0
    d.ellipse([c - r_out, c - r_out, c + r_out, c + r_out], fill=rgb + (70,))
    d.pieslice([c - r_out, c - r_out, c + r_out, c + r_out], -90, -90 + 360 * frac,
               fill=rgb + (110,))
    d.ellipse([c - r_out, c - r_out, c + r_out, c + r_out], outline=rgb + (200,), width=lw)
    d.ellipse([c - r_in, c - r_in, c + r_in, c + r_in], outline=rgb + (200,), width=lw)
    d.line([0, c, size, c], fill=rgb + (170,), width=lw)
    d.line([c, 0, c, size], fill=rgb + (170,), width=lw)
    d.text((c, c), str(number), font=font("sans", size * 0.30), fill=(255, 255, 255, 255),
           anchor="mm", stroke_width=max(1, lw // 2), stroke_fill=(80, 80, 80, 200))
    return np.array(img)


def blend(frame, rgba, cx, cy):
    """frame（BGR）の (cx, cy) を中心に、透明画像 rgba を重ねる。"""
    h, w = rgba.shape[:2]
    x0, y0 = int(cx - w / 2), int(cy - h / 2)
    fx0, fy0 = max(0, x0), max(0, y0)
    fx1, fy1 = min(frame.shape[1], x0 + w), min(frame.shape[0], y0 + h)
    if fx0 >= fx1 or fy0 >= fy1:
        return
    part = rgba[fy0 - y0:fy1 - y0, fx0 - x0:fx1 - x0].astype(np.float32)
    alpha = part[..., 3:4] / 255.0
    roi = frame[fy0:fy1, fx0:fx1].astype(np.float32)
    rgb_as_bgr = part[..., 2::-1]
    frame[fy0:fy1, fx0:fx1] = (roi * (1 - alpha) + rgb_as_bgr * alpha).astype(np.uint8)


def cover(frame, w, h):
    """動画を、すき間なく画面いっぱいになるよう拡大して、はみ出た所を切る。"""
    fh, fw = frame.shape[:2]
    s = max(w / fw, h / fh)
    resized = cv2.resize(frame, (math.ceil(fw * s), math.ceil(fh * s)), interpolation=cv2.INTER_AREA)
    y0 = (resized.shape[0] - h) // 2
    x0 = (resized.shape[1] - w) // 2
    return resized[y0:y0 + h, x0:x0 + w]


def star_sprite(size):
    """ぼんやり光る点に、十字のきらめきをつけた星の形（0〜1 の明るさ）。"""
    r = size * 4
    yy, xx = np.mgrid[-r:r + 1, -r:r + 1].astype(np.float32)
    dist = np.sqrt(xx ** 2 + yy ** 2)
    core = np.exp(-(dist / max(size * 0.6, 0.6)) ** 2)
    cross = (np.exp(-(xx / 0.8) ** 2) * np.exp(-np.abs(yy) / (size * 1.3))
             + np.exp(-(yy / 0.8) ** 2) * np.exp(-np.abs(xx) / (size * 1.3)))
    return np.clip(core + cross * 0.6, 0, 1)[..., None]


class Look:
    """映像の世界観（色のトーン・まわりを暗く・星雲・星のきらめき・流れ星）をつける。"""

    def __init__(self, cfg, W, H, total):
        cfg = cfg or {}
        self.W, self.H = W, H
        self.grade = cfg.get("grade")
        self.vignette = None
        if cfg.get("vignette"):
            yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
            r2 = ((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2
            self.vignette = np.clip(1 - cfg["vignette"] * r2 / 2, 0, 1)[..., None]
        self.nebula = None
        if cfg.get("nebula"):
            yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
            neb = np.zeros((H, W, 3), np.float32)
            for b in cfg["nebula"]:
                g = np.exp(-(((xx - b["x"] * W) ** 2 + (yy - b["y"] * H) ** 2) / (b["r"] * W) ** 2))
                bgr = np.array(hex_rgb(b["color"])[::-1], np.float32) / 255
                neb += g[..., None] * bgr * b.get("alpha", 0.3)
            self.nebula = np.clip(neb, 0, 1)
        self.stars = []
        st = cfg.get("stars")
        if st:
            rng = np.random.default_rng(st.get("seed", 1))
            top = st.get("area", [0.0, 1.0])
            sprites = {s: star_sprite(s) for s in (1, 2, 3)}
            color = np.array(hex_rgb(st.get("color", "#ffffff"))[::-1], np.float32) / 255
            for _ in range(st.get("count", 120)):
                size = int(rng.choice([1, 1, 1, 2, 2, 3]))
                self.stars.append({
                    "x": rng.uniform(0, W), "y": rng.uniform(top[0] * H, top[1] * H),
                    "sprite": sprites[size] * color, "phase": rng.uniform(0, 2 * np.pi),
                    "speed": rng.uniform(1.0, 3.0), "level": rng.uniform(0.4, 1.0)})
        self.shooting = cfg.get("shooting", [])

    def apply(self, frame, t):
        f = frame.astype(np.float32) / 255
        g = self.grade
        if g:
            orig = f
            f = (f - 0.5) * g.get("contrast", 1.0) + 0.5
            f *= g.get("exposure", 1.0)
            gray = f.mean(axis=2, keepdims=True)
            f = gray + (f - gray) * g.get("saturation", 1.0)
            if "multiply" in g:
                m = np.array(hex_rgb(g["multiply"])[::-1], np.float32) / 255
                f *= 1 - (1 - m) * g.get("multiply_strength", 1.0)
            if "lift" in g:
                lift = np.array(hex_rgb(g["lift"])[::-1], np.float32) / 255
                f = lift + f * (1 - lift)
            f = np.clip(f, 0, 1)
            mix = g.get("mix", 1.0)  # 0.6 なら、色のトーンを6割だけかける（もとの映像の色を4割残す）
            f = orig * (1 - mix) + f * mix
        if self.vignette is not None:
            f *= self.vignette
        if self.nebula is not None:
            f = 1 - (1 - f) * (1 - self.nebula)
        for s in self.stars:
            bright = s["level"] * (0.55 + 0.45 * math.sin(s["phase"] + t * s["speed"] * 2 * math.pi))
            self._add(f, s["sprite"] * bright, s["x"], s["y"])
        for sh in self.shooting:
            p = (t - sh["start"]) / sh.get("duration", 0.7)
            if 0 <= p <= 1:
                self._shooting_star(f, sh, p)
        return (np.clip(f, 0, 1) * 255).astype(np.uint8)

    def _add(self, f, sprite, cx, cy):
        h, w = sprite.shape[:2]
        x0, y0 = int(cx - w / 2), int(cy - h / 2)
        fx0, fy0, fx1, fy1 = max(0, x0), max(0, y0), min(self.W, x0 + w), min(self.H, y0 + h)
        if fx0 < fx1 and fy0 < fy1:
            f[fy0:fy1, fx0:fx1] += sprite[fy0 - y0:fy1 - y0, fx0 - x0:fx1 - x0]

    def _shooting_star(self, f, sh, p):
        (x0, y0), (x1, y1) = sh["from"], sh["to"]
        head = (x0 + (x1 - x0) * p, y0 + (y1 - y0) * p)
        tail_len = 0.35
        layer = np.zeros((self.H, self.W), np.float32)
        steps = 24
        for k in range(steps):
            q = max(0.0, p - tail_len * k / steps)
            a = (x0 + (x1 - x0) * q, y0 + (y1 - y0) * q)
            b = (x0 + (x1 - x0) * max(0.0, q - tail_len / steps), y0 + (y1 - y0) * max(0.0, q - tail_len / steps))
            cv2.line(layer, (int(a[0] * self.W), int(a[1] * self.H)), (int(b[0] * self.W), int(b[1] * self.H)),
                     float(1 - k / steps), max(1, int(4 * (1 - k / steps))), cv2.LINE_AA)
        layer = cv2.GaussianBlur(layer, (0, 0), 1.5)
        fade = math.sin(p * math.pi)
        f += layer[..., None] * fade
        self._add(f, star_sprite(4) * fade, head[0] * self.W, head[1] * self.H)


class ClipReader:
    """動画を前から順に読み、指定した時間のコマを返す。最後まで行ったら最後のコマを返し続ける。"""

    def __init__(self, path, start, speed=1.0):
        self.cap = cv2.VideoCapture(path)
        if not self.cap.isOpened():
            sys.exit(f"動画が開けません: {path}")
        self.fps = self.cap.get(cv2.CAP_PROP_FPS) or 30
        self.cap.set(cv2.CAP_PROP_POS_MSEC, start * 1000)
        self.speed = speed  # 2.0 なら2倍速
        self.index = -1
        self.frame = None

    def at(self, t):
        want = int(t * self.speed * self.fps)
        while self.index < want:
            ok, f = self.cap.read()
            if not ok:
                break
            self.frame, self.index = f, self.index + 1
        return self.frame


def build_layers(template, reel, W, H):
    """型とリール設定から、重ねる素材（文字・帯など）を前もって作っておく。"""
    texts = reel.get("texts", {})
    # 文字のデザインは、リール設定の styles で一部だけ変えられる
    styles = {name: dict(s, **reel.get("styles", {}).get(name, {})) for name, s in STYLES.items()}
    layers = []
    for spec in template["layers"]:
        kind = spec["type"]
        layer = dict(spec)
        if kind == "text":
            value = texts.get(spec["key"])
            if not value:
                continue
            layer.update(reel.get("positions", {}).get(spec["key"], {}))  # 文字の位置をリールごとに変える
            layer["image"] = render_text(value, styles[spec["style"]], W)
        elif kind == "label":
            label = dict(spec, **reel.get("labels", {}).get(spec["text"], {}))
            layer.update(label)
            layer["image"] = render_text(label["text"], styles["label"], W)
        elif kind == "band":
            layer.update(reel.get("positions", {}).get("band", {}))
            band = reel.get("band", {})
            layer["image"] = render_band(W, spec["height"], H, band.get("color", "#ffffff"), band.get("alpha", 140))
        elif kind == "countdown":
            layer["color"] = reel.get("countdown", {}).get("color", "#ffffff")
        layers.append(layer)
    return layers


def draw_overlays(frame, layers, t, W, H, total):
    for layer in layers:
        end = layer.get("end") or total
        if not (layer["start"] <= t < end):
            continue
        cx, cy = layer.get("x", 0.5) * W, layer["y"] * H
        if layer["type"] == "countdown":
            blend(frame, render_countdown(t - layer["start"], W, layer["color"]), cx, cy)
        else:
            blend(frame, layer["image"], cx, cy)


def resolve(path, base):
    return os.path.normpath(path if os.path.isabs(path) else os.path.join(base, path))


def make_reel(reel_path, preview=False):
    reel = load_json(reel_path)
    base = os.path.dirname(os.path.abspath(reel_path))
    template = load_json(resolve(reel["template"], base))
    W, H = template["size"]
    fps = template["fps"]
    scenes = template["scenes"]
    total = sum(s["duration"] for s in scenes)
    layers = build_layers(template, reel, W, H)
    look = Look(reel.get("look"), W, H, total)
    out_path = resolve(reel["output"], base)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    clips = reel["clips"]
    missing = [s["slot"] for s in scenes if s["slot"] not in clips]
    if missing:
        sys.exit(f"リール設定の clips に、次の動画がありません: {', '.join(missing)}")

    if preview:
        stem = os.path.splitext(out_path)[0]
        times = sorted({0.5} | {l["start"] + 0.3 for l in layers})
        for t in [t for t in times if t < total]:
            frame = look.apply(frame_at(scenes, clips, base, t, W, H), t)
            draw_overlays(frame, layers, t, W, H, total)
            cv2.imwrite(f"{stem}_preview_{t:05.2f}s.jpg", frame)
        print(f"確認用の画像を作りました: {stem}_preview_*.jpg")
        return

    cmd = ["ffmpeg", "-v", "error", "-y",
           "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-"]
    audio = reel.get("bgm")
    if audio:
        a = template.get("audio", {})
        delay_ms = int(audio.get("delay", a.get("delay", 0)) * 1000)
        fade = audio.get("fade_out", a.get("fade_out", 1.0))
        vol = audio.get("volume", 1.0)
        cmd += ["-ss", str(audio.get("start", 0)), "-i", resolve(audio["file"], base)]
        afilter = (f"[1:a]adelay={delay_ms}|{delay_ms},volume={vol},"
                   f"afade=t=out:st={max(0, total - fade)}:d={fade},atrim=0:{total}[a]")
    else:
        cmd += ["-f", "lavfi", "-t", str(total), "-i", "anullsrc=r=44100:cl=stereo"]
        afilter = "[1:a]atrim=0:{}[a]".format(total)
    cmd += ["-filter_complex", afilter, "-map", "0:v", "-map", "[a]",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium",
            "-c:a", "aac", "-b:a", "192k", "-t", str(total), "-movflags", "+faststart", out_path]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)

    t0 = 0.0
    for scene in scenes:
        clip = clips[scene["slot"]]
        reader = ClipReader(resolve(clip["file"], base), clip.get("start", 0), clip.get("speed", 1.0))
        n = int(round(scene["duration"] * fps))
        for i in range(n):
            src = reader.at(i / fps)
            if src is None:
                sys.exit(f"動画からコマが読めません: {clip['file']}")
            frame = look.apply(cover(src, W, H), t0 + i / fps)
            draw_overlays(frame, layers, t0 + i / fps, W, H, total)
            proc.stdin.write(frame.tobytes())
        t0 += n / fps
    proc.stdin.close()
    if proc.wait() != 0:
        sys.exit("ffmpeg での書き出しに失敗しました")
    print(f"できました: {out_path}（{total:.2f}秒）")


def frame_at(scenes, clips, base, t, W, H):
    t0 = 0.0
    for scene in scenes:
        if t < t0 + scene["duration"] or scene is scenes[-1]:
            clip = clips[scene["slot"]]
            reader = ClipReader(resolve(clip["file"], base), clip.get("start", 0), clip.get("speed", 1.0))
            return cover(reader.at(t - t0), W, H)
        t0 += scene["duration"]


def main():
    p = argparse.ArgumentParser(description="型どおりにリール動画を自動で作ります")
    p.add_argument("reel", help="リール設定のJSONファイル（reels/ の中）")
    p.add_argument("--preview", action="store_true", help="動画は作らず、確認用の静止画だけ作る")
    args = p.parse_args()
    make_reel(args.reel, preview=args.preview)


if __name__ == "__main__":
    main()
