import { createClient } from "@/lib/supabase/server";
import { updateBooking } from "./actions";

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("session_bookings")
    .select("*, profiles(display_name, email), session_slots(starts_at, ends_at)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">予約一覧</h1>
      <ul className="flex flex-col gap-3">
        {(bookings ?? []).map((b) => (
          <li key={b.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
            <p className="font-medium">
              {b.profiles?.display_name || b.profiles?.email || "不明な会員"}
            </p>
            <p className="text-zinc-400">
              {b.session_slots ? new Date(b.session_slots.starts_at).toLocaleString("ja-JP") : "-"}
            </p>
            {b.note && <p className="mt-1 text-zinc-400">メモ: {b.note}</p>}
            <form action={updateBooking.bind(null, b.id)} className="mt-2 flex flex-wrap items-center gap-2">
              <select name="status" defaultValue={b.status} className="rounded-md border px-2 py-1 text-xs">
                <option value="requested">リクエスト中</option>
                <option value="confirmed">確定</option>
                <option value="cancelled">キャンセル</option>
              </select>
              <input
                name="meeting_url"
                defaultValue={b.meeting_url ?? ""}
                placeholder="Zoom URLなど"
                className="flex-1 rounded-md border px-2 py-1 text-xs"
              />
              <button type="submit" className="rounded-md bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-3 py-1 text-xs text-white transition hover:brightness-110">
                保存
              </button>
            </form>
          </li>
        ))}
        {(bookings ?? []).length === 0 && <p className="text-sm text-zinc-400">予約はまだありません。</p>}
      </ul>
    </div>
  );
}
