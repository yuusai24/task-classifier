"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createSlot(formData: FormData) {
  const startsAtRaw = String(formData.get("starts_at") ?? "");
  const endsAtRaw = String(formData.get("ends_at") ?? "");
  if (!startsAtRaw || !endsAtRaw) return;

  const supabase = await createClient();
  await supabase.from("session_slots").insert({
    starts_at: new Date(startsAtRaw).toISOString(),
    ends_at: new Date(endsAtRaw).toISOString(),
    capacity: Number(formData.get("capacity") ?? 1) || 1,
  });

  revalidatePath("/admin/booking-slots");
}

export async function deleteSlot(id: string) {
  const supabase = await createClient();
  await supabase.from("session_slots").delete().eq("id", id);
  revalidatePath("/admin/booking-slots");
}
