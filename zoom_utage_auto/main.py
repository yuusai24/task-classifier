"""
Zoom録画完了 → 文字起こし取得 → Claude要約 → UTAGE用HTML生成
"""

import hashlib
import hmac
import json
import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, Request, Response

from .claude_client import ClaudeClient
from .html_generator import generate_html
from .zoom_client import ZoomClient, verify_webhook_signature

load_dotenv()

app = FastAPI(title="Zoom → UTAGE 自動アーカイブ")

OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", "./output"))
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

zoom = ZoomClient(
    account_id=os.environ["ZOOM_ACCOUNT_ID"],
    client_id=os.environ["ZOOM_CLIENT_ID"],
    client_secret=os.environ["ZOOM_CLIENT_SECRET"],
)
claude = ClaudeClient(api_key=os.environ["ANTHROPIC_API_KEY"])
WEBHOOK_SECRET = os.environ["ZOOM_WEBHOOK_SECRET_TOKEN"]


@app.post("/webhook/zoom")
async def zoom_webhook(
    request: Request,
    x_zm_signature: str = Header(None),
    x_zm_request_timestamp: str = Header(None),
):
    raw_body = await request.body()

    # Zoom URL検証チャレンジ（初回登録時）
    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    if payload.get("event") == "endpoint.url_validation":
        plain_token = payload["payload"]["plainToken"]
        encrypted = hmac.new(
            WEBHOOK_SECRET.encode("utf-8"),
            plain_token.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        return {"plainToken": plain_token, "encryptedToken": encrypted}

    # 署名検証
    if x_zm_signature and x_zm_request_timestamp:
        if not verify_webhook_signature(raw_body, x_zm_request_timestamp, x_zm_signature, WEBHOOK_SECRET):
            raise HTTPException(status_code=401, detail="Invalid signature")

    if payload.get("event") != "recording.completed":
        return Response(status_code=204)

    meeting_uuid = zoom.get_meeting_uuid(payload)
    meeting_topic = zoom.get_meeting_topic(payload)

    try:
        transcript = await zoom.get_recording_transcript(meeting_uuid)
    except ValueError as e:
        print(f"[WARN] {e}")
        return Response(status_code=204)

    summary = claude.generate_archive_summary(transcript, meeting_topic)
    html = generate_html(summary)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_topic = "".join(c if c.isalnum() or c in "-_" else "_" for c in meeting_topic)
    output_path = OUTPUT_DIR / f"{timestamp}_{safe_topic}.html"
    output_path.write_text(html, encoding="utf-8")

    print(f"[OK] HTMLを保存しました: {output_path}")
    return {"status": "ok", "output": str(output_path)}
