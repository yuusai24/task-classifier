"use client";

import { useActionState } from "react";
import type { SessionSlot } from "@/types/database";
import { requestBooking } from "./actions";

export function BookingForm({
  slots,
  bookedCountBySlot,
}: {
  slots: SessionSlot[];
  bookedCountBySlot: Map<string, number>;
}) {
  const [state, formAction, pending] = useActionState(requestBooking, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {slots.map((slot) => {
          const remaining = slot.capacity - (bookedCountBySlot.get(slot.id) ?? 0);
          return (
            <label
              key={slot.id}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm has-checked:border-foreground"
            >
              <input type="radio" name="slot_id" value={slot.id} required />
              <span>
                {new Date(slot.starts_at).toLocaleString("ja-JP")} 〜{" "}
                {new Date(slot.ends_at).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="text-zinc-400">残り{remaining}枠</span>
            </label>
          );
        })}
      </div>
      <textarea
        name="note"
        placeholder="相談したい内容（任意）"
        className="rounded-md border px-3 py-2 text-sm"
        rows={3}
      />
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transition hover:brightness-110 disabled:opacity-50"
      >
        {pending ? "予約中..." : "この枠で予約する"}
      </button>
    </form>
  );
}
