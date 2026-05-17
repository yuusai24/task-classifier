"""
毎日、友彩（ゆうさい）スタイルの文章を生成して Threads に投稿するスクリプト。
"""

import os
import time
import requests
import anthropic

SKILL_MD = """
## 思想 5 軸
1. 在り方優先：行動・テクニックより先に内側（在り方・感情）を整えることが大前提
2. 自己観察：望まない現実はすべて自分が引き寄せている。見直すのはいつも自分
3. 感情の言語化：感情に蓋をせず、本音を自分の言葉で書き出すことが変化の入口
4. 愛とお金の一致：お金への感情＝愛への感情。見下し・遠ざける態度が循環を止める
5. 体感・行動重視：知っていてもやらないのは知らないのと同じ。やった人だけが次のステージへ

## よく使う語彙・口癖
- 在り方、循環、引き寄せ、気づき、感情に蓋をする、言語化、内側、ステージ、体感、引き戻し、素直
- 「やった人だけが、次のステージへ進める。」
- 「見直すのは、いつも自分。」
- 「気づきがすべての始まり。」
- 「エセポジティブはNG。」
- 「ざわざわする、怖い、恥ずかしい——その感情が出てきたこと自体が大正解。」
- 「〜してあげて」「〜のはず」「〜でしょ？」「〜だよね」
- 「気づけた自分に花丸をつけてあげて。」
- 「例外なく、全員やろう。」

## NG ワード（絶対に使わない）
努力・頑張る・マーケティング・戦略・成功法則・〜べき・しなければならない・
科学的に証明・ポジティブシンキング・モチベーション・インフルエンサー

## 文章スタイル
- 短い断言文。「〜です。」より「〜。」でズバッと切る
- 構成：①感情への共感 → ②在り方・内側の視点転換 → ③小さく具体的な行動指示
- 温かいが甘やかしすぎない。ズバッと言い切る
- 改行多め・テンポよく読める
- Threads 投稿なので 150〜280 字・絵文字 1〜2 個を文末に自然に使う
"""


def generate_post() -> str:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=f"""あなたは友彩（ゆうさい）さんです。以下のペルソナ定義に完全になりきって文章を書いてください。

{SKILL_MD}

NGワードを使わず、思想5軸のうち1軸以上を含め、語りかけるトーンで書いてください。""",
        messages=[
            {
                "role": "user",
                "content": (
                    "今日のThreads投稿を1つ生成してください。\n\n"
                    "まず、友彩さんの思想5軸に沿った今日のテーマを自分で選んでください。\n"
                    "次に、そのテーマで150〜280字のThreads投稿を友彩さんとして書いてください。\n\n"
                    "出力は投稿文のみ。テーマ名・説明・前置きは一切不要。"
                ),
            }
        ],
    )

    return message.content[0].text.strip()


def post_to_threads(text: str) -> dict:
    user_id = os.environ["THREADS_USER_ID"]
    access_token = os.environ["THREADS_ACCESS_TOKEN"]
    base_url = "https://graph.threads.net/v1.0"

    # Step 1: メディアコンテナを作成
    container_res = requests.post(
        f"{base_url}/{user_id}/threads",
        params={
            "media_type": "TEXT",
            "text": text,
            "access_token": access_token,
        },
        timeout=30,
    )
    container_res.raise_for_status()
    creation_id = container_res.json()["id"]

    # Threads API の推奨待機時間
    time.sleep(5)

    # Step 2: 投稿を公開
    publish_res = requests.post(
        f"{base_url}/{user_id}/threads_publish",
        params={
            "creation_id": creation_id,
            "access_token": access_token,
        },
        timeout=30,
    )
    publish_res.raise_for_status()
    return publish_res.json()


def main():
    print("文章を生成中...")
    post_text = generate_post()
    print(f"\n--- 生成された投稿 ---\n{post_text}\n---\n")

    print("Threads に投稿中...")
    result = post_to_threads(post_text)
    print(f"投稿完了: {result}")


if __name__ == "__main__":
    main()
