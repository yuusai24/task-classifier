"""
友彩スクール LINE webhook受信サーバー
受講生からの返信をCSVの返信履歴に蓄積する
"""

import csv
import os
import json
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler

CSV_PATH = "docs/01_受講生カルテ.csv"

# 受講生の LINE userId → 仮名 の対応表（取得したIDをここに記入）
USER_ID_MAP = {
    # "Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx": "かすみん",
    # "Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx": "まきちゃん",
    # "Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx": "ゆっちゃん",
}

def add_reply_to_csv(name: str, message: str):
    """受講生の返信をCSVの返信履歴に追記する"""
    rows = []
    with open(CSV_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            if row["仮名"] == name:
                timestamp = datetime.now().strftime("%Y-%m-%d")
                entry = f"[{timestamp}] {message}"
                existing = row.get("返信履歴", "")
                row["返信履歴"] = f"{existing} / {entry}" if existing else entry
            rows.append(row)

    with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"✅ {name} の返信を保存: {message[:30]}...")

class LineWebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        self.send_response(200)
        self.end_headers()

        try:
            data = json.loads(body)
            for event in data.get("events", []):
                if event.get("type") != "message":
                    continue
                if event["message"].get("type") != "text":
                    continue
                user_id = event["source"].get("userId", "")
                text = event["message"].get("text", "")
                name = USER_ID_MAP.get(user_id)
                if name:
                    add_reply_to_csv(name, text)
                else:
                    print(f"⚠️ 未登録のuserId: {user_id}")
        except Exception as e:
            print(f"エラー: {e}")

    def log_message(self, format, *args):
        pass

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"🚀 Webhook サーバー起動中... port {port}")
    HTTPServer(("0.0.0.0", port), LineWebhookHandler).serve_forever()
