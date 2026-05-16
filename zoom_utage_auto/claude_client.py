from pathlib import Path

import anthropic

PROMPT_TEMPLATE_PATH = Path(__file__).parent.parent / "prompts" / "archive_summary_prompt.txt"

SYSTEM_PROMPT = (
    "あなたはオンライン講座のアーカイブまとめを作成するアシスタントです。"
    "受講生が後から見返したときに役立つ、簡潔で要点を押さえたまとめを日本語で作成してください。"
)


class ClaudeClient:
    def __init__(self, api_key: str):
        self._client = anthropic.Anthropic(api_key=api_key)

    def generate_archive_summary(self, transcript: str, meeting_topic: str) -> dict:
        template = PROMPT_TEMPLATE_PATH.read_text(encoding="utf-8")
        prompt = template.replace("（ここに貼る）", transcript).replace(
            "# 講座タイトル：金運爆上げ強化月間",
            f"# 講座タイトル：{meeting_topic}",
        )

        message = self._client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )

        raw = message.content[0].text
        return _parse_summary(raw, meeting_topic)


def _parse_summary(text: str, meeting_topic: str) -> dict:
    sections = {
        "title": meeting_topic,
        "gain": "",
        "points": [],
        "steps": [],
        "memo": "",
    }

    current_section = None
    buffer: list[str] = []

    def flush():
        if current_section == "gain":
            sections["gain"] = "\n".join(buffer).strip()
        elif current_section == "points":
            sections["points"] = [
                line.lstrip("・-•◆◇●○▶▸→　").strip()
                for line in buffer
                if line.strip()
            ]
        elif current_section == "steps":
            sections["steps"] = [
                line.lstrip("0123456789.、。）)　").strip()
                for line in buffer
                if line.strip()
            ]
        elif current_section == "memo":
            sections["memo"] = "\n".join(buffer).strip()

    for line in text.splitlines():
        stripped = line.strip()

        if "この講座で得られること" in stripped or "得られること" in stripped:
            flush()
            current_section = "gain"
            buffer = []
        elif "重要ポイント" in stripped:
            flush()
            current_section = "points"
            buffer = []
        elif "実践ステップ" in stripped:
            flush()
            current_section = "steps"
            buffer = []
        elif "受講生への一言" in stripped or "一言メモ" in stripped:
            flush()
            current_section = "memo"
            buffer = []
        elif stripped.startswith("#"):
            pass
        elif current_section:
            buffer.append(stripped)

    flush()
    return sections
