import hashlib
import hmac
import re
from datetime import datetime, timezone
from urllib.parse import quote

import httpx


ZOOM_OAUTH_URL = "https://zoom.us/oauth/token"
ZOOM_API_BASE = "https://api.zoom.us/v2"


class ZoomClient:
    def __init__(self, account_id: str, client_id: str, client_secret: str):
        self._account_id = account_id
        self._client_id = client_id
        self._client_secret = client_secret
        self._token: str | None = None
        self._token_expires_at: datetime | None = None

    async def _get_token(self) -> str:
        now = datetime.now(timezone.utc)
        if self._token and self._token_expires_at and now < self._token_expires_at:
            return self._token

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                ZOOM_OAUTH_URL,
                params={"grant_type": "account_credentials", "account_id": self._account_id},
                auth=(self._client_id, self._client_secret),
            )
            resp.raise_for_status()
            data = resp.json()

        self._token = data["access_token"]
        expires_in = data.get("expires_in", 3600)
        from datetime import timedelta
        self._token_expires_at = now + timedelta(seconds=expires_in - 60)
        return self._token

    async def get_recording_transcript(self, meeting_uuid: str) -> str:
        token = await self._get_token()
        headers = {"Authorization": f"Bearer {token}"}
        encoded_uuid = quote(meeting_uuid, safe="")

        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{ZOOM_API_BASE}/meetings/{encoded_uuid}/recordings",
                headers=headers,
            )
            resp.raise_for_status()
            data = resp.json()

        transcript_url = None
        for recording_file in data.get("recording_files", []):
            if recording_file.get("file_type") == "TRANSCRIPT":
                transcript_url = recording_file.get("download_url")
                break

        if not transcript_url:
            raise ValueError("文字起こしファイルが見つかりませんでした。Zoomの設定でトランスクリプト機能を有効にしてください。")

        async with httpx.AsyncClient() as client:
            resp = await client.get(
                transcript_url,
                headers=headers,
                follow_redirects=True,
            )
            resp.raise_for_status()
            vtt_content = resp.text

        return _vtt_to_plain_text(vtt_content)

    def get_meeting_topic(self, payload: dict) -> str:
        return payload.get("payload", {}).get("object", {}).get("topic", "講座")

    def get_meeting_uuid(self, payload: dict) -> str:
        return payload.get("payload", {}).get("object", {}).get("uuid", "")


def verify_webhook_signature(
    raw_body: bytes,
    timestamp: str,
    signature: str,
    secret_token: str,
) -> bool:
    message = f"v0:{timestamp}:{raw_body.decode('utf-8')}"
    expected = "v0=" + hmac.new(
        secret_token.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def _vtt_to_plain_text(vtt: str) -> str:
    lines = []
    for line in vtt.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("WEBVTT"):
            continue
        if re.match(r"^\d+$", line):
            continue
        if re.match(r"^\d{2}:\d{2}:\d{2}", line):
            continue
        clean = re.sub(r"<[^>]+>", "", line)
        if clean:
            lines.append(clean)
    return "\n".join(lines)
