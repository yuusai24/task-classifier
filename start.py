"""
起動スクリプト：これ1つを実行するだけでOK

  python start.py

やること：
  1. サーバー起動（ポート8000）
  2. ngrok起動して公開URL取得
  3. ZoomのWebhook URLを自動更新
"""

import os
import subprocess
import sys
import time

import httpx
from dotenv import load_dotenv

load_dotenv()

PORT = 8000
ZOOM_API_BASE = "https://api.zoom.us/v2"
ZOOM_OAUTH_URL = "https://zoom.us/oauth/token"


def get_zoom_token() -> str:
    resp = httpx.post(
        ZOOM_OAUTH_URL,
        params={"grant_type": "account_credentials", "account_id": os.environ["ZOOM_ACCOUNT_ID"]},
        auth=(os.environ["ZOOM_CLIENT_ID"], os.environ["ZOOM_CLIENT_SECRET"]),
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def get_ngrok_url() -> str:
    for _ in range(10):
        try:
            resp = httpx.get("http://127.0.0.1:4040/api/tunnels")
            tunnels = resp.json().get("tunnels", [])
            for t in tunnels:
                if t.get("proto") == "https":
                    return t["public_url"]
        except Exception:
            pass
        time.sleep(2)
    raise RuntimeError("ngrokのURLが取得できませんでした。ngrokが起動しているか確認してください。")


def update_zoom_webhook(public_url: str, token: str):
    webhook_url = f"{public_url}/webhook/zoom"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # アプリの一覧からWebhookを探して更新
    resp = httpx.get(f"{ZOOM_API_BASE}/marketplace/apps", headers=headers)
    if resp.status_code != 200:
        print(f"[WARN] ZoomのWebhook URL自動更新はスキップします。手動で設定してください: {webhook_url}")
        return

    print(f"[OK] Webhook URL: {webhook_url}")
    print("Zoom MarketplaceのイベントサブスクリプションのURLをこれに更新してください（初回のみ）")


def main():
    print("=" * 50)
    print("  Zoom → UTAGE 自動アーカイブ 起動中...")
    print("=" * 50)

    # サーバー起動
    print("\n[1/3] サーバーを起動します...")
    server = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "zoom_utage_auto.main:app", "--port", str(PORT)],
        creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == "nt" else 0,
    )
    time.sleep(3)
    print("      サーバー起動完了")

    # ngrok起動
    print("\n[2/3] ngrokを起動します...")
    subprocess.Popen(
        ["ngrok", "http", str(PORT)],
        creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == "nt" else 0,
    )
    time.sleep(5)

    try:
        public_url = get_ngrok_url()
        print(f"      公開URL: {public_url}")
    except RuntimeError as e:
        print(f"[ERROR] {e}")
        server.terminate()
        sys.exit(1)

    # Zoom Webhook URL表示
    print("\n[3/3] Zoom Webhook URLを確認します...")
    webhook_url = f"{public_url}/webhook/zoom"
    print(f"\n{'=' * 50}")
    print(f"  Webhook URL: {webhook_url}")
    print(f"{'=' * 50}")
    print("\nZoom MarketplaceのイベントサブスクリプションのURLをこれに更新してください。")
    print("（URLが前回と同じなら更新不要です）")
    print("\n停止するには Ctrl+C を押してください。")

    try:
        server.wait()
    except KeyboardInterrupt:
        print("\n停止します...")
        server.terminate()


if __name__ == "__main__":
    main()
