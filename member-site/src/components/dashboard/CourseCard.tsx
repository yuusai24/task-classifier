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
      className="block rounded-lg border border-purple-200/60 bg-white/60 p-4 hover:bg-purple-50"
    >
      <p className="font-medium">{course.title}</p>
      {course.description && (
        <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
          {course.description}
        </p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-purple-100">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs text-zinc-500">
          {completedLessons}/{totalLessons}
        </span>
      </div>
    </Link>
  );
}
