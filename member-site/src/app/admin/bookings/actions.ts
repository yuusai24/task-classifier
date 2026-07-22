"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/types/database";

export async function updateBooking(bookingId: string, formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("session_bookings")
    .update({
      status: (String(formData.get("status") ?? "requested")) as BookingStatus,
      meeting_url: String(formData.get("meeting_url") ?? "").trim() || null,
    })
    .eq("id", bookingId);

  revalidatePath("/admin/bookings");
}
