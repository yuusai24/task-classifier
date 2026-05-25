#!/usr/bin/env python3
"""
友彩（ゆうさい）ボイスでThreadsに自動投稿するスクリプト。
Claude APIで文章生成 → Threads APIで投稿。
"""

import os
import sys
import time
import json
import urllib.request
import urllib.error

ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
THREADS_USER_ID = os.environ["THREADS_USER_ID"]
THREADS_ACCESS_TOKEN = os.environ["THREADS_ACCESS_TOKEN"]
THEME = os.environ.get("THEME") or "在り方とお金の循環"

YUUSAI_SYSTEM_PROMPT = """あなたは友彩（ゆうさい）さんの言葉・思想・スタイルを完全に体得した影武者AIです。
友彩さんとして、指定されたテーマでThreads投稿文を書いてください。

【友彩さんの思想5軸】
1. 在り方最優先 — 「やること・持つこと」より「在り方」が先。内側が整わないと外側は動かない。
2. 自己責任・引き寄せ — 望まない現実はすべて自分が引き寄せている。見直す対象は常に自分。
3. 感情の言語化 — 感情に蓋をしない。ざわつきに気づいたら止めて「なぜ？」を丁寧に見る。
4. 愛への変換 — マイナス評価を「〜だけど、〜してくれていた」と愛に変換するとお金の循環が変わる。
5. 行動の継続 — 「知っていてもやらない」は「知らない」と同じ。やった人だけが体感できる。

【頻出口癖】
在り方を整える / 気づきがすべての始まり / 引き寄せている / 感情に蓋をしない /
自分の言葉で書き出す / やった人だけが体感できる / エセポジティブはNG /
ざわざわする / 花丸をつけてあげて / 次のステージへ進める / 例外なく全員

【NGワード】
- 無理やりポジティブにする言葉
- 他者のせいにする言葉
- 感情を無視した即行動指示
- 根拠なき断定的な予言

【文体ルール】
- 語尾: 〜してみて / 〜しよう / 〜だから / 〜なんです
- 文は短め。テンポを大切に。
- 感情の動きを体感で表現（「ざわざわする」「ズーンとくる」「ふわっと軽くなる」）
- 共感 → 気づき → 行動の構成
- 500文字以内
- 改行を効果的に使う
- ハッシュタグは末尾に2〜4個
- 絵文字は1〜3個まで"""


def generate_post(theme: str) -> str:
    if not theme.strip():
        raise ValueError("theme must not be empty")
    payload = json.dumps({
        "model": "claude-opus-4-7",
        "max_tokens": 1024,
        "system": YUUSAI_SYSTEM_PROMPT,
        "messages": [
            {
                "role": "user",
                "content": f"テーマ：{theme}\n\n友彩さんとしてThreads投稿文を書いてください。"
            }
        ]
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["content"][0]["text"].strip()
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            detail = json.loads(body).get("error", {}).get("message", body)
        except Exception:
            detail = body
        raise RuntimeError(f"API Error: {e.code} {detail}") from None


def create_threads_container(text: str) -> str:
    """Threadsメディアコンテナを作成してcontainer_idを返す。"""
    payload = json.dumps({
        "media_type": "TEXT",
        "text": text,
    }).encode("utf-8")

    url = f"https://graph.threads.net/v1.0/{THREADS_USER_ID}/threads"
    req = urllib.request.Request(
        f"{url}?access_token={THREADS_ACCESS_TOKEN}",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return data["id"]


def publish_threads_container(container_id: str) -> str:
    """コンテナを公開してpost_idを返す。"""
    payload = json.dumps({
        "creation_id": container_id,
    }).encode("utf-8")

    url = f"https://graph.threads.net/v1.0/{THREADS_USER_ID}/threads_publish"
    req = urllib.request.Request(
        f"{url}?access_token={THREADS_ACCESS_TOKEN}",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return data["id"]


def main():
    print(f"テーマ: {THEME}")

    print("Claude APIで文章を生成中...")
    post_text = generate_post(THEME)
    print(f"\n--- 生成された投稿文 ---\n{post_text}\n------------------------\n")

    print("Threadsコンテナを作成中...")
    container_id = create_threads_container(post_text)
    print(f"コンテナID: {container_id}")

    # Threads APIの推奨待機時間
    time.sleep(5)

    print("Threadsに公開中...")
    post_id = publish_threads_container(container_id)
    print(f"投稿完了! Post ID: {post_id}")

    # GitHub Actions のサマリーに出力
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY", "")
    if summary_path:
        with open(summary_path, "a", encoding="utf-8") as f:
            f.write(f"## 投稿完了\n\n")
            f.write(f"**テーマ:** {THEME}\n\n")
            f.write(f"**Post ID:** {post_id}\n\n")
            f.write(f"**投稿内容:**\n\n```\n{post_text}\n```\n")


if __name__ == "__main__":
    main()
