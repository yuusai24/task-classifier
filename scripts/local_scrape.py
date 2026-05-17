#!/usr/bin/env python3
"""
【ローカル実行用】Instagram 投稿を取得して ig_posts.json に保存するスクリプト
実行方法:
  pip install instaloader
  python3 local_scrape.py
"""

import json
import os
import sys

try:
    import instaloader
except ImportError:
    print("instaloader をインストールします...")
    os.system(f"{sys.executable} -m pip install instaloader")
    import instaloader

TARGET_USERNAME = "yuusai_parallel24"
RESULTS_LIMIT = 100
OUTPUT_FILE = "ig_posts.json"

SESSIONID = "61202182916%3A7oVGSAgbjc4EWJ%3A19%3AAYj7yB_e5fqungL885a1MzVmQYNou59AdNAG1VuAJsU"


def main():
    L = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_video_thumbnails=False,
        download_geotags=False,
        download_comments=False,
        save_metadata=False,
        compress_json=False,
        quiet=False,
    )

    # セッション Cookie でログイン
    L.context._session.cookies.set("sessionid", SESSIONID, domain=".instagram.com")
    L.context._session.headers.update({
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    })

    print(f"@{TARGET_USERNAME} のデータを取得中...")

    try:
        profile = instaloader.Profile.from_username(L.context, TARGET_USERNAME)
    except Exception as e:
        print(f"エラー: {e}")
        print("\n→ ログインが必要かもしれません。以下を試してください:")
        print("  instaloader --login=あなたのIGユーザー名 --sessionid=" + SESSIONID[:20] + "...")
        sys.exit(1)

    print(f"フォロワー: {profile.followers:,} / 投稿数: {profile.mediacount}")

    posts = []
    followers = max(profile.followers, 1)

    for i, post in enumerate(profile.get_posts()):
        if i >= RESULTS_LIMIT:
            break

        likes = post.likes or 0
        comments = post.comments or 0
        er = (likes + comments) / followers * 100

        posts.append({
            "id": post.shortcode,
            "url": f"https://www.instagram.com/p/{post.shortcode}/",
            "timestamp": post.date_utc.isoformat(),
            "type": "reel" if post.is_video else "image",
            "is_video": post.is_video,
            "video_url": post.video_url if post.is_video else None,
            "caption": post.caption or "",
            "likes": likes,
            "comments": comments,
            "engagement_rate": round(er, 4),
            "hashtags": list(post.caption_hashtags) if post.caption else [],
        })

        if (i + 1) % 10 == 0:
            print(f"  {i + 1} 件取得済み...")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)

    print(f"\n✅ 完了！ {len(posts)} 件 → {OUTPUT_FILE} に保存しました")
    print(f"このファイルを Claude Code のチャットに貼り付けるか、アップロードしてください")


if __name__ == "__main__":
    main()
