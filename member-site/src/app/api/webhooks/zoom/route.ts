import { NextResponse, type NextRequest } from "next/server";
import { buildUrlValidationResponse, verifyZoomSignature } from "@/lib/zoom-webhook";
import { pullUploadToVimeo } from "@/lib/vimeo";
import { createServiceClient } from "@/lib/supabase/service";

type RecordingFile = {
  id: string;
  file_type: string;
  recording_type: string;
  download_url: string;
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const body = JSON.parse(rawBody) as {
    event: string;
    payload: {
      plainToken?: string;
      download_token?: string;
      object?: {
        topic?: string;
        recording_files?: RecordingFile[];
      };
    };
  };

  if (body.event === "endpoint.url_validation") {
    return new Response(JSON.stringify(buildUrlValidationResponse(body.payload.plainToken!)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const signature = request.headers.get("x-zm-signature");
  const timestamp = request.headers.get("x-zm-request-timestamp");
  if (
    !signature ||
    !timestamp ||
    !verifyZoomSignature({ rawBody, timestamp, signature })
  ) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  if (body.event !== "recording.completed") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const files = body.payload.object?.recording_files ?? [];
  const mp4File =
    files.find((f) => f.file_type === "MP4" && f.recording_type === "shared_screen_with_speaker_view") ??
    files.find((f) => f.file_type === "MP4");

  if (!mp4File) {
    return NextResponse.json({ ok: true, skipped: "no_mp4_file" });
  }

  const service = createServiceClient();

  const { data: existing } = await service
    .from("recording_imports")
    .select("id")
    .eq("zoom_file_id", mp4File.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: true, skipped: "already_imported" });
  }

  const topic = body.payload.object?.topic ?? "Zoom録画";
  const downloadToken = body.payload.download_token;
  const sourceUrl = downloadToken
    ? `${mp4File.download_url}?access_token=${downloadToken}`
    : mp4File.download_url;

  try {
    const { videoId, uri } = await pullUploadToVimeo({ sourceUrl, name: topic });

    await service.from("recording_imports").insert({
      zoom_file_id: mp4File.id,
      zoom_meeting_topic: topic,
      vimeo_video_id: videoId,
      vimeo_uri: uri,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 }
    );
  }
}
