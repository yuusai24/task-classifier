"use client";

import { useTransition } from "react";
import { deleteSlot } from "./actions";

export function DeleteSlotButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("この枠を削除しますか？")) startTransition(() => deleteSlot(id));
      }}
      disabled={isPending}
      className="text-xs text-red-600 underline disabled:opacity-50"
    >
      削除
    </button>
  );
}
