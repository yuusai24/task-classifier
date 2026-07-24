const VIMEO_API_BASE = "https://api.vimeo.com";

export async function pullUploadToVimeo(params: {
  sourceUrl: string;
  name: string;
}): Promise<{ videoId: string; uri: string }> {
  const res = await fetch(`${VIMEO_API_BASE}/me/videos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.vimeo.*+json;version=3.4",
    },
    body: JSON.stringify({
      upload: {
        approach: "pull",
        link: params.sourceUrl,
      },
      name: params.name,
      privacy: {
        view: "unlisted",
        embed: "public",
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Vimeoへのアップロード開始に失敗しました: ${await res.text()}`);
  }

  const data = (await res.json()) as { uri: string };
  const videoId = data.uri.split("/").pop()!;
  return { videoId, uri: data.uri };
}
