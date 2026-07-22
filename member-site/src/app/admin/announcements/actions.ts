"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EventType } from "@/types/database";

export async function createAnnouncement(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = await createClient();
  await supabase.from("announcements").insert({
    title,
    body: String(formData.get("body") ?? "").trim() || null,
    event_type: (String(formData.get("event_type") ?? "notice")) as EventType,
    event_url: String(formData.get("event_url") ?? "").trim() || null,
    starts_at: formData.get("starts_at") ? new Date(String(formData.get("starts_at"))).toISOString() : null,
  });

  revalidatePath("/admin/announcements");
}

export async function togglePublished(id: string, next: boolean) {
  const supabase = await createClient();
  await supabase.from("announcements").update({ is_published: next }).eq("id", id);
  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient();
  await supabase.from("announcements").delete().eq("id", id);
  revalidatePath("/admin/announcements");
}
