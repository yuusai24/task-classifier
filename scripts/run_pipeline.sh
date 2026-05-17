#!/bin/bash
# Instagram 分析パイプライン 全ステップ実行
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "========================================"
echo " Instagram 分析パイプライン 開始"
echo "========================================"

echo ""
echo "▶ Step 1: Instagram 投稿スクレイピング..."
python3 scripts/01_scrape_instagram.py

echo ""
echo "▶ Step 2: リール動画 → MP3 変換..."
python3 scripts/02_download_reels.py

echo ""
echo "▶ Step 3: Whisper 音声文字起こし..."
python3 scripts/03_transcribe_reels.py

echo ""
echo "▶ Step 4 & 5: Claude 分析 & 投稿 3 案生成..."
python3 scripts/04_analyze_and_generate.py

echo ""
echo "========================================"
echo " 完了！docs/01_明日の投稿3案.md を確認してください"
echo "========================================"
