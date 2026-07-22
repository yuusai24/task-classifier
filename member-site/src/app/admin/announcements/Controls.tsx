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
            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800"
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
