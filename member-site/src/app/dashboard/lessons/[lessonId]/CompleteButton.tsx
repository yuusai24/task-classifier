"use client";

import { useState, useTransition } from "react";
import { toggleLessonComplete } from "./actions";

export function CompleteButton({
  lessonId,
  courseId,
  initialCompleted,
}: {
  lessonId: string;
  courseId: string;
  initialCompleted: boolean;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const next = !completed;
          setCompleted(next);
          await toggleLessonComplete(lessonId, courseId, next);
        })
      }
      disabled={isPending}
      className={`rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${
        completed
          ? "bg-emerald-500/20 text-emerald-300"
          : "bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white"
      }`}
    >
      {completed ? "受講完了 ✓" : "受講完了にする"}
    </button>
  );
}
