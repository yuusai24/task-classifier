"use client";

import { useState, useTransition } from "react";
import { disconnectGoogle, runSyncNow } from "./actions";

export function DisconnectButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("Googleカレンダーとの連携を解除しますか？")) {
          startTransition(() => disconnectGoogle());
        }
      }}
      disabled={isPending}
      className="text-xs text-red-600 underline disabled:opacity-50"
    >
      連携を解除
    </button>
  );
}

export function SyncNowButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={() =>
          startTransition(async () => {
            const result = await runSyncNow();
            setMessage(
              result.ok
                ? `${result.message}（追加: ${result.created}件 / 削除: ${result.removed}件）`
                : result.message
            );
          })
        }
        disabled={isPending}
        className="rounded-md bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(196,148,233,0.35)] transition hover:brightness-110 disabled:opacity-50"
      >
        {isPending ? "同期中..." : "今すぐ同期する"}
      </button>
      {message && <p className="text-sm text-zinc-500">{message}</p>}
    </div>
  );
}
