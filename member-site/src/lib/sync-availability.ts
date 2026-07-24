import { createServiceClient } from "@/lib/supabase/service";
import { refreshAccessToken, getBusyPeriods } from "@/lib/google-calendar";
import { generateCandidateSlots, getZonedNowParts } from "@/lib/availability";

type Interval = { starts_at: string; ends_at: string };

function overlaps(a: Interval, b: Interval): boolean {
  return new Date(a.starts_at).getTime() < new Date(b.ends_at).getTime() &&
    new Date(a.ends_at).getTime() > new Date(b.starts_at).getTime();
}

export async function syncAvailability(): Promise<{
  ok: boolean;
  message: string;
  created: number;
  removed: number;
}> {
  const service = createServiceClient();

  const [{ data: settings }, { data: connection }] = await Promise.all([
    service.from("booking_settings").select("*").eq("id", true).single(),
    service.from("google_calendar_connection").select("*").eq("id", true).maybeSingle(),
  ]);

  if (!settings) {
    return { ok: false, message: "予約設定が見つかりません。", created: 0, removed: 0 };
  }
  if (!connection) {
    return { ok: false, message: "Googleカレンダーが連携されていません。", created: 0, removed: 0 };
  }

  const accessToken = await refreshAccessToken(connection.refresh_token);

  const now = new Date();
  const { year, month, day } = getZonedNowParts(settings.timezone);
  const candidates = generateCandidateSlots(settings, { year, month, day }).filter(
    (c) => new Date(c.starts_at) > now
  );

  if (candidates.length === 0) {
    return { ok: true, message: "対象期間に候補枠がありません。", created: 0, removed: 0 };
  }

  const timeMin = now.toISOString();
  const timeMax = candidates[candidates.length - 1].ends_at;
  const busyPeriods = await getBusyPeriods(accessToken, timeMin, timeMax);

  const available = candidates.filter(
    (c) => !busyPeriods.some((b) => overlaps(c, { starts_at: b.start, ends_at: b.end }))
  );

  const { data: existingSlots } = await service
    .from("session_slots")
    .select("id, starts_at, ends_at, source")
    .gt("starts_at", now.toISOString());
  const existing = existingSlots ?? [];

  const { data: activeBookingRows } = await service
    .from("session_bookings")
    .select("slot_id")
    .neq("status", "cancelled");
  const bookedSlotIds = new Set((activeBookingRows ?? []).map((b) => b.slot_id));

  const toInsert = available.filter((a) => !existing.some((e) => overlaps(a, e)));

  const toRemove = existing.filter(
    (s) =>
      s.source === "google_sync" &&
      !bookedSlotIds.has(s.id) &&
      !available.some((a) => a.starts_at === s.starts_at && a.ends_at === s.ends_at)
  );

  let created = 0;
  if (toInsert.length > 0) {
    const { error } = await service
      .from("session_slots")
      .insert(toInsert.map((s) => ({ starts_at: s.starts_at, ends_at: s.ends_at, source: "google_sync" as const })));
    if (!error) created = toInsert.length;
  }

  let removed = 0;
  if (toRemove.length > 0) {
    const { error } = await service
      .from("session_slots")
      .delete()
      .in("id", toRemove.map((s) => s.id));
    if (!error) removed = toRemove.length;
  }

  return { ok: true, message: "同期しました。", created, removed };
}
