"use client";

import { useTransition } from "react";
import { approveMember, revokeMember } from "./actions";

export function ApproveButton({ memberId }: { memberId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => approveMember(memberId))}
      disabled={isPending}
      className="rounded-md bg-gradient-to-r from-purple-400 to-pink-400 px-3 py-1 text-xs font-medium text-white transition hover:brightness-110 disabled:opacity-50"
    >
      承認する
    </button>
  );
}

export function RevokeButton({ memberId }: { memberId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("この会員の承認を取り消しますか？")) {
          startTransition(() => revokeMember(memberId));
        }
      }}
      disabled={isPending}
      className="text-xs text-red-600 underline disabled:opacity-50"
    >
      承認を取り消す
    </button>
  );
}
