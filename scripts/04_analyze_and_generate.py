#!/usr/bin/env python3
"""
Step 4 & 5: Claude でキャプション + 文字起こしを統合分析 → 明日の投稿 3 案生成
"""

import json
import os
import sys
from datetime import date

import anthropic

POSTS_PATH = os.path.join(os.path.dirname(__file__), "..", "tmp", "ig_posts.json")
TRANSCRIPTS_PATH = os.path.join(os.path.dirname(__file__), "..", "tmp", "transcripts", "summary.json")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "docs", "01_明日の投稿3案.md")

MODEL = "claude-sonnet-4-6"


def load_data() -> tuple[list[dict], list[dict]]:
    with open(POSTS_PATH, encoding="utf-8") as f:
        posts = json.load(f)

    transcripts = []
    if os.path.exists(TRANSCRIPTS_PATH):
        with open(TRANSCRIPTS_PATH, encoding="utf-8") as f:
            transcripts = json.load(f)

    return posts, transcripts


def build_analysis_prompt(posts: list[dict], transcripts: list[dict]) -> str:
    top10 = sorted(posts, key=lambda x: x["engagement_rate"], reverse=True)[:10]

    top10_text = ""
    for i, p in enumerate(top10, 1):
        top10_text += f"""
### {i}位 [{p['id']}]
- エンゲージメント率: {p['engagement_rate']:.2f}%
- いいね: {p['likes']:,} / コメント: {p['comments']:,}
- 種別: {p['type']}
- 投稿日: {p['timestamp'][:10]}
- キャプション:
{p['caption'][:500]}
"""

    transcript_text = ""
    for t in transcripts:
        if t.get("transcript"):
            transcript_text += f"""
### リール [{t['post_id']}] 文字起こし
{t['transcript']}
"""

    all_captions = "\n---\n".join([
        f"[{p['id']}] ER:{p['engagement_rate']:.2f}%\n{p['caption'][:300]}"
        for p in posts[:30]
    ])

    tomorrow = date.today().strftime("%Y年%m月%d日")

    return f"""あなたは Instagram マーケティングの専門家です。
以下のデータを分析して、明日（{tomorrow}）の投稿 3 案を作成してください。

# アカウント情報
- Instagram: @yuusai_parallel24（友彩 / ゆうさい）

# エンゲージメント上位 10 投稿
{top10_text}

# リール動画 文字起こし
{transcript_text if transcript_text else "（リール文字起こしデータなし）"}

# 全投稿キャプション（上位 30 件）
{all_captions}

---

# 分析タスク

## 1. エンゲージメント分析サマリー
- 上位投稿の共通要素（テーマ・感情・構造）
- 効果的なフックの型（冒頭 1-2 行のパターン）
- 言葉遣い・トーン・口調の特徴
- よく使われる CTA の型
- ハッシュタグ戦略

## 2. 明日の投稿 3 案（フック / 本文 / CTA の 3 段構造）

各案は以下の形式で：

### 案 A: [コンセプト名]
**[フック]** （冒頭 1-2 行で止まれない一言）
---
**[本文]** （200-400字、友彩さんの言葉遣いを完全再現）
---
**[CTA]** （読者が次に取るべき行動を促す）
---
**ハッシュタグ** （10-15個）
---
**投稿タイプ推奨**: 画像 or リール
**予測エンゲージメント**: 〇〇% 程度（根拠付き）

### 案 B: [コンセプト名]
（同形式）

### 案 C: [コンセプト名]
（同形式）

---
分析に基づいた根拠も必ず添えてください。
友彩さんの独特の言葉遣い・世界観を正確に再現することが最重要です。"""


def run_analysis(client: anthropic.Anthropic, posts: list[dict], transcripts: list[dict]) -> str:
    prompt = build_analysis_prompt(posts, transcripts)

    print("Claude で分析・生成中（数分かかる場合があります）...")

    with client.messages.stream(
        model=MODEL,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        result = ""
        for text in stream.text_stream:
            print(text, end="", flush=True)
            result += text

    print("\n")
    return result


def build_markdown(analysis: str, posts: list[dict]) -> str:
    top10 = sorted(posts, key=lambda x: x["engagement_rate"], reverse=True)[:10]
    avg_er = sum(p["engagement_rate"] for p in posts) / len(posts) if posts else 0
    video_count = sum(1 for p in posts if p["is_video"])

    stats = f"""# 友彩（@yuusai_parallel24）Instagram 分析 & 明日の投稿 3 案

> 生成日: {date.today().strftime('%Y年%m月%d日')}
> 分析対象: 過去 {len(posts)} 投稿（リール {video_count} 本含む）

## データサマリー

| 指標 | 値 |
|------|-----|
| 分析投稿数 | {len(posts)} 件 |
| うちリール | {video_count} 件 |
| 平均エンゲージメント率 | {avg_er:.2f}% |
| 最高エンゲージメント率 | {top10[0]['engagement_rate']:.2f}% |

### エンゲージメント TOP 10 投稿 URL
"""
    for i, p in enumerate(top10, 1):
        stats += f"{i}. [{p['id']}]({p['url']}) — ER: {p['engagement_rate']:.2f}% ({p['timestamp'][:10]})\n"

    stats += "\n---\n\n"
    return stats + analysis + "\n\n---\n\n## 選択\n\n> ✅ 選んだ案: （ここに記入）\n"


def main():
    if not os.path.exists(POSTS_PATH):
        print(f"ERROR: {POSTS_PATH} が見つかりません", file=sys.stderr)
        sys.exit(1)

    posts, transcripts = load_data()
    print(f"投稿データ: {len(posts)} 件、文字起こし: {len(transcripts)} 件")

    client = anthropic.Anthropic()

    analysis = run_analysis(client, posts, transcripts)
    markdown = build_markdown(analysis, posts)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(markdown)

    print(f"保存完了: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
