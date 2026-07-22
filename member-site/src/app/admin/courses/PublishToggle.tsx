"use client";

import { useTransition } from "react";
import { toggleCoursePublished } from "./actions";

export function PublishToggle({
  courseId,
  isPublished,
}: {
  courseId: string;
  isPublished: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleCoursePublished(courseId, !isPublished))}
      disabled={isPending}
      className={`rounded px-2 py-1 text-xs disabled:opacity-50 ${
        isPublished
          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800"
      }`}
    >
      {isPublished ? "公開中" : "非公開"}
    </button>
  );
}
