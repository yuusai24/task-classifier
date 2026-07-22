"use client";

import { useTransition } from "react";
import { cancelBooking } from "./actions";

export function CancelButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => cancelBooking(bookingId))}
      disabled={isPending}
      className="text-xs text-red-600 underline disabled:opacity-50"
    >
      キャンセル
    </button>
  );
}
