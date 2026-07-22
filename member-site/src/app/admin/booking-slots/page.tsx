import { createClient } from "@/lib/supabase/server";
import { createSlot } from "./actions";
import { DeleteSlotButton } from "./DeleteButton";

export default async function AdminBookingSlotsPage() {
  const supabase = await createClient();
  const { data: slots } = await supabase
    .from("session_slots")
    .select("*")
    .order("starts_at", { ascending: true });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">個別セッション予約枠</h1>

      <form action={createSlot} className="mb-8 flex flex-col gap-2 rounded-lg border p-4">
        <p className="text-sm font-medium">予約枠を追加</p>
        <div className="flex gap-2">
          <input name="starts_at" type="datetime-local" required className="rounded-md border px-3 py-2" />
          <input name="ends_at" type="datetime-local" required className="rounded-md border px-3 py-2" />
          <input
            name="capacity"
            type="number"
            defaultValue={1}
            min={1}
            placeholder="定員"
            className="w-24 rounded-md border px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="self-start rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          追加
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {(slots ?? []).map((slot) => (
          <li key={slot.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
            <span>
              {new Date(slot.starts_at).toLocaleString("ja-JP")} 〜{" "}
              {new Date(slot.ends_at).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
              ・定員{slot.capacity}
            </span>
            <DeleteSlotButton id={slot.id} />
          </li>
        ))}
        {(slots ?? []).length === 0 && <p className="text-sm text-zinc-500">予約枠がありません。</p>}
      </ul>
    </div>
  );
}
