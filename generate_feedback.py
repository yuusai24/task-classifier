"""
友彩（ゆうさい）スクール 週次フィードバック自動生成スクリプト
"""

import csv
import os
import anthropic

SYSTEM_PROMPT = """あなたはオンラインスクール「友彩（ゆうさい）」の専任コーチです。
受講生一人ひとりの近況をもとに、温かく背中を押すフィードバックを書いてください。

ルール:
- 文体: 関西弁で、親しみやすく温かい（気の合う友達のような口調）
- 長さ: 200〜300文字（LINEで読みやすい分量）
- 構成: ①今週の頑張りを承認 → ②来週の具体的なアクション1つ → ③応援メッセージ
- NGワード: 「頑張ってください」「努力しましょう」（押しつけに聞こえるため）
- バックグラウンドへの配慮: 重度障害児ママの場合、限られた時間の中で動いていることを自然にねぎらう（わざとらしくならない程度に）"""

def build_user_prompt(student: dict) -> str:
    background = student.get('バックグラウンド', '')
    background_line = f"バックグラウンド: {background}" if background else ""
    reply_history = student.get('返信履歴', '')
    reply_line = f"本人からの返信・近況メモ（蓄積）:\n{reply_history}" if reply_history else ""
    return f"""以下の受講生データをもとに、今週のLINEフィードバック文を生成してください。

---
仮名: {student['仮名']}
入会日: {student['入会日']}
現在のステージ: {student['現在のステージ']}
{background_line}
コーチメモ: {student['最近のメモ']}
{reply_line}
---

来週のフィードバック文（LINEメッセージとして送る）を日本語（関西弁）で書いてください。"""

def generate_feedback(student: dict) -> str:
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": build_user_prompt(student)}
        ]
    )
    return response.content[0].text

def load_students(csv_path: str) -> list[dict]:
    with open(csv_path, encoding="utf-8") as f:
        return list(csv.DictReader(f))

if __name__ == "__main__":
    csv_path = "docs/01_受講生カルテ.csv"
    students = load_students(csv_path)

    for student in students:
        print(f"=== {student['仮名']} さんへの今週のフィードバック ===\n")
        feedback = generate_feedback(student)
        print(feedback)
        print("\n" + "="*40)
        print(f"文字数: {len(feedback)}文字\n")
