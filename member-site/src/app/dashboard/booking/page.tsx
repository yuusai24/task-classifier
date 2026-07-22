import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { BookingForm } from "./BookingForm";
import { CancelButton } from "./CancelButton";

const STATUS_LABEL = {
  requested: "リクエスト中",
  confirmed: "確定",
  cancelled: "キャンセル済み",
};

export default async function BookingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: slots } = await supabase
    .from("session_slots")
    .select("*")
    .gt("starts_at", new Date().toISOString())
    .order("starts_at");

  // 満席判定には全会員分の予約数が必要なため service client を使う
  const service = createServiceClient();
  const { data: allActiveBookings } = await service
    .from("session_bookings")
    .select("slot_id")
    .in("status", ["requested", "confirmed"]);

  const bookedCountBySlot = new Map<string, number>();
  for (const b of allActiveBookings ?? []) {
    bookedCountBySlot.set(b.slot_id, (bookedCountBySlot.get(b.slot_id) ?? 0) + 1);
  }

  const { data: myBookings } = await supabase
    .from("session_bookings")
    .select("*, session_slots(starts_at, ends_at)")
    .eq("member_id", user!.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  const availableSlots = (slots ?? []).filter(
    (s) => (bookedCountBySlot.get(s.id) ?? 0) < s.capacity
  );

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">個別セッション予約</h1>

      <section className="mb-8">
        <h2 className="mb-3 font-medium">予約可能な枠</h2>
        {availableSlots.length === 0 ? (
          <p className="text-sm text-zinc-500">現在予約可能な枠がありません。</p>
        ) : (
          <BookingForm slots={availableSlots} bookedCountBySlot={bookedCountBySlot} />
        )}
      </section>

      <section>
        <h2 className="mb-3 font-medium">予約状況</h2>
        <ul className="flex flex-col gap-2">
          {(myBookings ?? []).map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div>
                <p>
                  {b.session_slots
                    ? new Date(b.session_slots.starts_at).toLocaleString("ja-JP")
                    : "-"}
                </p>
                <p className="text-zinc-500">{STATUS_LABEL[b.status]}</p>
                {b.meeting_url && (
                  <a href={b.meeting_url} target="_blank" rel="noopener noreferrer" className="underline">
                    参加リンク
                  </a>
                )}
              </div>
              {b.status !== "cancelled" && <CancelButton bookingId={b.id} />}
            </li>
          ))}
          {(myBookings ?? []).length === 0 && (
            <p className="text-sm text-zinc-500">予約はまだありません。</p>
          )}
        </ul>
      </section>
    </div>
  );
}
