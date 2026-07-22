"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function requestBooking(_prevState: { error: string | null }, formData: FormData) {
  const slotId = String(formData.get("slot_id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!slotId) return { error: "枠を選択してください。" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です。" };

  const { data: slot } = await supabase
    .from("session_slots")
    .select("*")
    .eq("id", slotId)
    .single();
  if (!slot) return { error: "指定された枠が見つかりません。" };

  // 他会員分の予約件数も数える必要があるため、RLSを回避するservice clientを使う
  const service = createServiceClient();
  const { count } = await service
    .from("session_bookings")
    .select("id", { count: "exact", head: true })
    .eq("slot_id", slotId)
    .in("status", ["requested", "confirmed"]);

  if ((count ?? 0) >= slot.capacity) {
    return { error: "この枠は満席です。" };
  }

  const { error } = await supabase
    .from("session_bookings")
    .insert({ slot_id: slotId, member_id: user.id, note: note || null });

  if (error) {
    return { error: "すでに予約済みか、予約に失敗しました。" };
  }

  revalidatePath("/dashboard/booking");
  return { error: null };
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("session_bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("member_id", user.id);

  revalidatePath("/dashboard/booking");
}
