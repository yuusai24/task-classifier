"use client";

import { useTransition } from "react";
import { togglePublished, deleteAnnouncement } from "./actions";

export function AnnouncementControls({ id, isPublished }: { id: string; isPublished: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => startTransition(() => togglePublished(id, !isPublished))}
        disabled={isPending}
        className={`rounded px-2 py-1 text-xs disabled:opacity-50 ${
          isPublished
            ? "bg-emerald-500/20 text-emerald-300"
            : "bg-white/10 text-zinc-300"
        }`}
      >
        {isPublished ? "公開中" : "非公開"}
      </button>
      <button
        onClick={() => {
          if (confirm("削除しますか？")) startTransition(() => deleteAnnouncement(id));
        }}
        disabled={isPending}
        className="text-xs text-red-400 underline disabled:opacity-50"
      >
        削除
      </button>
    </div>
  );
}
