"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function assignRecording(importId: string, formData: FormData) {
  const courseId = String(formData.get("course_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!courseId || !title) return;

  const service = createServiceClient();
  const { data: recording } = await service
    .from("recording_imports")
    .select("*")
    .eq("id", importId)
    .single();
  if (!recording) return;

  const supabase = await createClient();
  await supabase.from("lessons").insert({
    course_id: courseId,
    title,
    video_url: `https://vimeo.com/${recording.vimeo_video_id}`,
  });

  await service.from("recording_imports").delete().eq("id", importId);

  revalidatePath("/admin/recordings");
}

export async function discardRecording(importId: string) {
  const service = createServiceClient();
  await service.from("recording_imports").delete().eq("id", importId);
  revalidatePath("/admin/recordings");
}
