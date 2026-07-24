const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token";
const ZOOM_API_BASE = "https://api.zoom.us/v2";

export function hasZoomCredentials() {
  return Boolean(
    process.env.ZOOM_ACCOUNT_ID && process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET
  );
}

async function getZoomAccessToken(): Promise<string> {
  const basicAuth = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString("base64");

  const url = new URL(ZOOM_TOKEN_URL);
  url.searchParams.set("grant_type", "account_credentials");
  url.searchParams.set("account_id", process.env.ZOOM_ACCOUNT_ID!);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { Authorization: `Basic ${basicAuth}` },
  });
  if (!res.ok) {
    throw new Error(`Zoomアクセストークン取得に失敗しました: ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function createZoomMeeting(params: {
  topic: string;
  startTimeIso: string;
  durationMinutes: number;
}): Promise<{ joinUrl: string }> {
  const accessToken = await getZoomAccessToken();

  const res = await fetch(`${ZOOM_API_BASE}/users/me/meetings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      topic: params.topic,
      type: 2,
      start_time: params.startTimeIso,
      duration: params.durationMinutes,
      settings: {
        join_before_host: false,
        waiting_room: true,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Zoomミーティング作成に失敗しました: ${await res.text()}`);
  }

  const data = (await res.json()) as { join_url: string };
  return { joinUrl: data.join_url };
}
