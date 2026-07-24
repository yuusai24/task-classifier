"use client";

import { useTransition } from "react";
import { deleteCourse } from "./actions";

export function DeleteCourseButton({ courseId }: { courseId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("このコースを削除しますか？レッスンも全て削除されます。")) {
          startTransition(() => deleteCourse(courseId));
        }
      }}
      disabled={isPending}
      className="text-xs text-red-400 underline disabled:opacity-50"
    >
      削除
    </button>
  );
}
