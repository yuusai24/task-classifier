"use client";

import { useTransition } from "react";
import { deleteInviteCode } from "./actions";

export function DeleteInviteCodeButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => deleteInviteCode(id))}
      disabled={isPending}
      className="text-xs text-red-400 underline disabled:opacity-50"
    >
      削除
    </button>
  );
}
