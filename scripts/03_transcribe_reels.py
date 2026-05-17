#!/usr/bin/env python3
"""
Step 3: faster-whisper でリール音声を文字起こし → tmp/transcripts/*.txt
"""

import json
import os
import sys

REELS_DIR = os.path.join(os.path.dirname(__file__), "..", "tmp", "reels")
TRANSCRIPTS_DIR = os.path.join(os.path.dirname(__file__), "..", "tmp", "transcripts")
MODEL_SIZE = "small"  # tiny / base / small / medium


def transcribe_file(mp3_path: str, model) -> str:
    segments, info = model.transcribe(mp3_path, language="ja", beam_size=5)
    text_parts = [seg.text.strip() for seg in segments]
    return " ".join(text_parts)


def main():
    manifest_path = os.path.join(REELS_DIR, "manifest.json")
    if not os.path.exists(manifest_path):
        print(f"ERROR: {manifest_path} が見つかりません。先に 02_download_reels.py を実行してください", file=sys.stderr)
        sys.exit(1)

    with open(manifest_path, encoding="utf-8") as f:
        manifest = json.load(f)

    if not manifest:
        print("文字起こし対象の音声ファイルがありません")
        return

    print(f"Whisper モデル ({MODEL_SIZE}) を読み込み中...")
    from faster_whisper import WhisperModel
    model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
    print("モデル読み込み完了")

    os.makedirs(TRANSCRIPTS_DIR, exist_ok=True)

    results = []
    for i, item in enumerate(manifest, 1):
        mp3_path = item["mp3_path"]
        post_id = item["post_id"]
        txt_path = os.path.join(TRANSCRIPTS_DIR, f"{post_id}.txt")

        print(f"\n[{i}/{len(manifest)}] {post_id} を文字起こし中...")

        if os.path.exists(txt_path):
            print(f"  スキップ（既存）: {txt_path}")
            with open(txt_path, encoding="utf-8") as f:
                transcript = f.read()
        else:
            try:
                transcript = transcribe_file(mp3_path, model)
                with open(txt_path, "w", encoding="utf-8") as f:
                    f.write(transcript)
                print(f"  完了: {txt_path}")
                print(f"  内容: {transcript[:100]}...")
            except Exception as e:
                print(f"  エラー: {e}", file=sys.stderr)
                transcript = ""

        results.append({
            "post_id": post_id,
            "transcript": transcript,
            "post": item["post"],
        })

    summary_path = os.path.join(TRANSCRIPTS_DIR, "summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n完了: {len(results)} 件 → {summary_path}")


if __name__ == "__main__":
    main()
