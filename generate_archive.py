"""
使い方:
  python generate_archive.py transcript.txt "講座タイトル"

文字起こしテキストファイルを渡すと、UTAGE用のHTMLを output/ フォルダに生成します。
"""

import os
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, str(Path(__file__).parent))

from zoom_utage_auto.claude_client import ClaudeClient
from zoom_utage_auto.html_generator import generate_html


def main():
    if len(sys.argv) < 2:
        print("使い方: python generate_archive.py <文字起こしファイル> [講座タイトル]")
        sys.exit(1)

    transcript_path = Path(sys.argv[1])
    if not transcript_path.exists():
        print(f"エラー: ファイルが見つかりません: {transcript_path}")
        sys.exit(1)

    meeting_topic = sys.argv[2] if len(sys.argv) >= 3 else transcript_path.stem

    transcript = transcript_path.read_text(encoding="utf-8")

    print(f"[1/2] Claude APIで要約を生成中... (講座: {meeting_topic})")
    client = ClaudeClient(api_key=os.environ["ANTHROPIC_API_KEY"])
    summary = client.generate_archive_summary(transcript, meeting_topic)

    print("[2/2] HTMLを生成中...")
    html = generate_html(summary)

    output_dir = Path(os.getenv("OUTPUT_DIR", "./output"))
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_topic = "".join(c if c.isalnum() or c in "-_" else "_" for c in meeting_topic)
    output_path = output_dir / f"{timestamp}_{safe_topic}.html"
    output_path.write_text(html, encoding="utf-8")

    print(f"\n完成！ → {output_path}")
    print("このHTMLをUTAGEの会員サイトのHTMLエディタに貼り付けてください。")


if __name__ == "__main__":
    main()
