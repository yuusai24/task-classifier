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
    raise RuntimeError("ngrokのURLが取得できませんでした。")


def update_zoom_webhook(public_url: str, token: str):
    webhook_url = f"{public_url}/webhook/zoom"
    app_id = os.environ.get("ZOOM_APP_ID", "")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    if not app_id:
        print(f"[WARN] ZOOM_APP_IDが未設定です。手動でURLを更新してください: {webhook_url}")
        return

    # サブスクリプション一覧を取得
    resp = httpx.get(f"{ZOOM_API_BASE}/marketplace/apps/{app_id}/event_subscriptions", headers=headers)
    if resp.status_code != 200:
        print(f"[WARN] サブスクリプション取得失敗。手動でURLを更新してください: {webhook_url}")
        return

    subscriptions = resp.json().get("event_subscriptions", [])
    if not subscriptions:
        print(f"[WARN] サブスクリプションが見つかりません。手動でURLを更新してください: {webhook_url}")
        return

    sub_id = subscriptions[0]["id"]

    # Webhook URLを更新
    patch_resp = httpx.patch(
        f"{ZOOM_API_BASE}/marketplace/apps/{app_id}/event_subscriptions/{sub_id}",
        headers=headers,
        json={"notification_url": webhook_url},
    )

    if patch_resp.status_code in (200, 204):
        print(f"      Webhook URLを自動更新しました: {webhook_url}")
    else:
        print(f"[WARN] 自動更新失敗。手動でURLを更新してください: {webhook_url}")


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
        print(f"      公開URL取得: {public_url}")
    except RuntimeError as e:
        print(f"[ERROR] {e}")
        server.terminate()
        sys.exit(1)

    # Zoom Webhook URLを自動更新
    print("\n[3/3] ZoomのWebhook URLを更新します...")
    try:
        token = get_zoom_token()
        update_zoom_webhook(public_url, token)
    except Exception as e:
        webhook_url = f"{public_url}/webhook/zoom"
        print(f"[WARN] 自動更新できませんでした。手動でURLを更新してください: {webhook_url}")

    print(f"\n{'=' * 50}")
    print("  起動完了！Zoomで録画すると自動でHTMLが生成されます")
    print(f"  出力先: output フォルダ")
    print(f"{'=' * 50}")
    print("\n停止するには Ctrl+C を押してください。")

    try:
        server.wait()
    except KeyboardInterrupt:
        print("\n停止します...")
        server.terminate()


if __name__ == "__main__":
    main()
