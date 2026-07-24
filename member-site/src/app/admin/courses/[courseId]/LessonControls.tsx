"use client";

import { useTransition } from "react";
import { toggleLessonPublished, deleteLesson } from "./actions";

export function LessonPublishToggle({
  lessonId,
  courseId,
  isPublished,
}: {
  lessonId: string;
  courseId: string;
  isPublished: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleLessonPublished(lessonId, courseId, !isPublished))}
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

export function LessonDeleteButton({ lessonId, courseId }: { lessonId: string; courseId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("このレッスンを削除しますか？")) {
          startTransition(() => deleteLesson(lessonId, courseId));
        }
      }}
      disabled={isPending}
      className="text-xs text-red-600 underline disabled:opacity-50"
    >
      削除
    </button>
  );
}
