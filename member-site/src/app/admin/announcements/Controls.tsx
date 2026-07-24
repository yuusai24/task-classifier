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
            ? "bg-emerald-100 text-emerald-700"
            : "bg-purple-100 text-zinc-600"
        }`}
      >
        {isPublished ? "公開中" : "非公開"}
      </button>
      <button
        onClick={() => {
          if (confirm("削除しますか？")) startTransition(() => deleteAnnouncement(id));
        }}
        disabled={isPending}
        className="text-xs text-red-600 underline disabled:opacity-50"
      >
        削除
      </button>
    </div>
  );
}
