"""
友彩（ゆうさい）スクール 週次フィードバック自動生成スクリプト
"""

import csv
import os
import anthropic

SYSTEM_PROMPT = """あなたはオンラインスクール「友彩（ゆうさい）」の専任コーチです。
受講生一人ひとりの進捗データをもとに、温かく背中を押すフィードバックを書いてください。

ルール:
- 文体: 柔らかく、親しみやすい（友人のような口調）
- 長さ: 200〜300文字（LINEで読みやすい分量）
- 構成: ①今週の頑張りを承認 → ②来週の具体的なアクション1つ → ③応援メッセージ
- NGワード: 「頑張ってください」「努力しましょう」（押しつけに聞こえるため）"""

def build_user_prompt(student: dict) -> str:
    return f"""以下の受講生データをもとに、今週のLINEフィードバック文を生成してください。

---
仮名: {student['仮名']}
入会日: {student['入会日']}
現在のステージ: {student['現在のステージ']}
進捗率: {student['進捗率']}
最近のメモ（コーチ記録）: {student['最近のメモ']}
---

来週のフィードバック文（LINEメッセージとして送る）を日本語で書いてください。"""

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

    # かすみんさん（1名分）のデモ
    kasumi = students[0]
    print(f"=== {kasumi['仮名']} さんへの今週のフィードバック ===\n")
    feedback = generate_feedback(kasumi)
    print(feedback)
    print("\n" + "="*40)
    print(f"文字数: {len(feedback)}文字")
