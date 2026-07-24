"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { syncAvailability } from "@/lib/sync-availability";

export async function disconnectGoogle() {
  const service = createServiceClient();
  await service.from("google_calendar_connection").delete().eq("id", true);
  revalidatePath("/admin/calendar-settings");
}

export async function updateBookingSettings(formData: FormData) {
  const service = createServiceClient();
  await service
    .from("booking_settings")
    .update({
      weekday_start_hour: Number(formData.get("weekday_start_hour")),
      weekday_end_hour: Number(formData.get("weekday_end_hour")),
      slot_duration_minutes: Number(formData.get("slot_duration_minutes")),
      sync_weeks_ahead: Number(formData.get("sync_weeks_ahead")),
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  revalidatePath("/admin/calendar-settings");
}

export async function runSyncNow() {
  const result = await syncAvailability();
  revalidatePath("/admin/calendar-settings");
  revalidatePath("/admin/booking-slots");
  return result;
}
