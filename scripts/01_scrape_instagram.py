#!/usr/bin/env python3
"""
Step 1: Instagram から過去 100 投稿を取得して tmp/ig_posts.json に保存
instaloader を使用（API キー不要）
"""

import json
import sys
import os
from datetime import datetime, timezone

import instaloader

TARGET_USERNAME = "yuusai_parallel24"
RESULTS_LIMIT = 100
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "tmp", "ig_posts.json")

# 環境変数 IG_SESSIONID が設定されている場合はログイン済みセッションを使用
IG_SESSIONID = os.environ.get("IG_SESSIONID", "")


def scrape_posts(username: str, limit: int) -> list[dict]:
    L = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_video_thumbnails=False,
        download_geotags=False,
        download_comments=False,
        save_metadata=False,
        compress_json=False,
        quiet=True,
    )

    if IG_SESSIONID:
        print("Instagram セッション Cookie でログイン中...")
        L.context._session.cookies.set("sessionid", IG_SESSIONID, domain=".instagram.com")
        L.context._session.cookies.set("ds_user_id", "", domain=".instagram.com")
        # User-Agent を一般ブラウザに偽装
        L.context._session.headers.update({
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "*/*",
            "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
        })
        print("ログイン完了")
    else:
        print("警告: IG_SESSIONID が設定されていません。ブロックされる可能性があります。")

    try:
        profile = instaloader.Profile.from_username(L.context, username)
    except instaloader.exceptions.ProfileNotExistsException:
        print(f"ERROR: プロフィール @{username} が見つかりません", file=sys.stderr)
        sys.exit(1)

    print(f"@{username} のプロフィール取得完了")
    print(f"  フォロワー: {profile.followers:,}")
    print(f"  フォロー中: {profile.followees:,}")
    print(f"  投稿数: {profile.mediacount}")

    posts = []
    print(f"投稿を最大 {limit} 件取得中...")

    for i, post in enumerate(profile.get_posts()):
        if i >= limit:
            break

        followers = profile.followers if profile.followers > 0 else 1
        likes = post.likes if post.likes else 0
        comments = post.comments if post.comments else 0
        engagement_rate = (likes + comments) / followers * 100

        post_data = {
            "id": post.shortcode,
            "url": f"https://www.instagram.com/p/{post.shortcode}/",
            "timestamp": post.date_utc.isoformat(),
            "type": "reel" if post.is_video else "image",
            "is_video": post.is_video,
            "video_url": post.video_url if post.is_video else None,
            "caption": post.caption or "",
            "likes": likes,
            "comments": comments,
            "engagement_rate": round(engagement_rate, 4),
            "hashtags": list(post.caption_hashtags) if post.caption else [],
            "mentions": list(post.caption_mentions) if post.caption else [],
        }
        posts.append(post_data)

        if (i + 1) % 10 == 0:
            print(f"  {i + 1} 件取得済み...")

    return posts


def main():
    posts = scrape_posts(TARGET_USERNAME, RESULTS_LIMIT)

    output_path = os.path.abspath(OUTPUT_PATH)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)

    print(f"\n完了: {len(posts)} 件 → {output_path}")

    videos = [p for p in posts if p["is_video"] and p["video_url"]]
    print(f"リール/動画: {len(videos)} 件")

    top5 = sorted(posts, key=lambda x: x["engagement_rate"], reverse=True)[:5]
    print("\nエンゲージメント上位 5 件:")
    for p in top5:
        print(f"  {p['id']} | ER: {p['engagement_rate']:.2f}% | {p['caption'][:40]}...")


if __name__ == "__main__":
    main()
