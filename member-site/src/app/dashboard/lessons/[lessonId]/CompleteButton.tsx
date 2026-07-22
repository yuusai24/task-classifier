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
          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          : "bg-foreground text-background"
      }`}
    >
      {completed ? "受講完了 ✓" : "受講完了にする"}
    </button>
  );
}
