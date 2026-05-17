#!/usr/bin/env python3
"""
Step 2: リール動画の上位 5 本を MP3 に変換
yt-dlp + ffmpeg を使用
"""

import json
import os
import subprocess
import sys

POSTS_PATH = os.path.join(os.path.dirname(__file__), "..", "tmp", "ig_posts.json")
REELS_DIR = os.path.join(os.path.dirname(__file__), "..", "tmp", "reels")
MAX_REELS = 5


def download_audio(video_url: str, post_id: str, output_dir: str) -> str | None:
    output_template = os.path.join(output_dir, f"{post_id}.%(ext)s")
    mp3_path = os.path.join(output_dir, f"{post_id}.mp3")

    if os.path.exists(mp3_path):
        print(f"  スキップ（既存）: {mp3_path}")
        return mp3_path

    cmd = [
        "yt-dlp",
        "-x",
        "--audio-format", "mp3",
        "--audio-quality", "0",
        "--no-playlist",
        "--quiet",
        "-o", output_template,
        video_url,
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode == 0 and os.path.exists(mp3_path):
            size_kb = os.path.getsize(mp3_path) // 1024
            print(f"  成功: {mp3_path} ({size_kb} KB)")
            return mp3_path
        else:
            print(f"  失敗: {result.stderr[:200]}", file=sys.stderr)
            return None
    except subprocess.TimeoutExpired:
        print(f"  タイムアウト: {video_url}", file=sys.stderr)
        return None


def main():
    if not os.path.exists(POSTS_PATH):
        print(f"ERROR: {POSTS_PATH} が見つかりません。先に 01_scrape_instagram.py を実行してください", file=sys.stderr)
        sys.exit(1)

    with open(POSTS_PATH, encoding="utf-8") as f:
        posts = json.load(f)

    videos = [p for p in posts if p.get("is_video") and p.get("video_url")]
    videos_sorted = sorted(videos, key=lambda x: x["engagement_rate"], reverse=True)
    targets = videos_sorted[:MAX_REELS]

    print(f"リール動画 {len(videos)} 件中、エンゲージメント上位 {len(targets)} 件をダウンロード")
    os.makedirs(REELS_DIR, exist_ok=True)

    downloaded = []
    for i, post in enumerate(targets, 1):
        print(f"\n[{i}/{len(targets)}] {post['id']} (ER: {post['engagement_rate']:.2f}%)")
        print(f"  {post['caption'][:50]}...")
        path = download_audio(post["video_url"], post["id"], REELS_DIR)
        if path:
            downloaded.append({"post_id": post["id"], "mp3_path": path, "post": post})

    print(f"\n完了: {len(downloaded)}/{len(targets)} 件ダウンロード")

    manifest_path = os.path.join(REELS_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(downloaded, f, ensure_ascii=False, indent=2)
    print(f"マニフェスト保存: {manifest_path}")


if __name__ == "__main__":
    main()
