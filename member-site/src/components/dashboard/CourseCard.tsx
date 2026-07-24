import Link from "next/link";
import type { Course } from "@/types/database";

export function CourseCard({
  course,
  totalLessons,
  completedLessons,
}: {
  course: Course;
  totalLessons: number;
  completedLessons: number;
}) {
  const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  return (
    <Link
      href={`/dashboard/courses/${course.id}`}
      className="block rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10"
    >
      <p className="font-medium">{course.title}</p>
      {course.description && (
        <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
          {course.description}
        </p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-fuchsia-400 to-indigo-400"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs text-zinc-400">
          {completedLessons}/{totalLessons}
        </span>
      </div>
    </Link>
  );
}
