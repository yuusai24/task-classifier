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
          ? "bg-emerald-100 text-emerald-700"
          : "bg-purple-100 text-zinc-600"
      }`}
    >
      {isPublished ? "公開中" : "非公開"}
    </button>
  );
}
