"use client";

import { useActionState, useMemo, useState } from "react";
import type { SessionSlot } from "@/types/database";
import { requestBooking } from "./actions";

const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

function dateKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function BookingForm({
  slots,
  bookedCountBySlot,
}: {
  slots: SessionSlot[];
  bookedCountBySlot: Map<string, number>;
}) {
  const [state, formAction, pending] = useActionState(requestBooking, { error: null });

  const days = useMemo(() => {
    const map = new Map<string, SessionSlot[]>();
    for (const slot of slots) {
      const key = dateKey(slot.starts_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(slot);
    }
    return Array.from(map.entries()).map(([key, daySlots]) => ({
      key,
      date: new Date(daySlots[0].starts_at),
      slots: daySlots,
    }));
  }, [slots]);

  const [selectedDay, setSelectedDay] = useState(days[0]?.key ?? null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const activeDay = days.find((d) => d.key === selectedDay);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {days.map((day) => (
          <button
            key={day.key}
            type="button"
            onClick={() => {
              setSelectedDay(day.key);
              setSelectedSlotId(null);
            }}
            className={`flex flex-col items-center rounded-lg border px-3 py-2 text-sm transition ${
              selectedDay === day.key
                ? "border-fuchsia-400/60 bg-gradient-to-r from-fuchsia-500/20 to-indigo-500/20 text-white"
                : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/25"
            }`}
          >
            <span>
              {day.date.getMonth() + 1}/{day.date.getDate()}
            </span>
            <span className="text-xs text-zinc-400">({WEEKDAY_JA[day.date.getDay()]})</span>
          </button>
        ))}
      </div>

      {activeDay && (
        <div className="flex flex-wrap gap-2">
          {activeDay.slots.map((slot) => {
            const remaining = slot.capacity - (bookedCountBySlot.get(slot.id) ?? 0);
            const isSelected = selectedSlotId === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelectedSlotId(slot.id)}
                className={`rounded-lg border px-4 py-2 text-sm transition ${
                  isSelected
                    ? "border-fuchsia-400/60 bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white"
                    : "border-white/10 bg-white/5 text-zinc-200 hover:border-white/25"
                }`}
              >
                {new Date(slot.starts_at).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <span className="ml-1 text-xs opacity-70">残り{remaining}</span>
              </button>
            );
          })}
        </div>
      )}

      <input type="hidden" name="slot_id" value={selectedSlotId ?? ""} />
      <textarea
        name="note"
        placeholder="相談したい内容（任意）"
        className="rounded-md border px-3 py-2 text-sm"
        rows={3}
      />
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending || !selectedSlotId}
        className="self-start rounded-md bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transition hover:brightness-110 disabled:opacity-50"
      >
        {pending ? "予約中..." : "この枠で予約する"}
      </button>
    </form>
  );
}
