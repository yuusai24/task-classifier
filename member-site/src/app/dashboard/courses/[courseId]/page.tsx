import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const [{ data: lessons }, { data: progress }] = await Promise.all([
    supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .eq("is_published", true)
      .order("position"),
    supabase
      .from("lesson_progress")
      .select("lesson_id, is_completed")
      .eq("member_id", user!.id),
  ]);

  const completedIds = new Set(
    (progress ?? []).filter((p) => p.is_completed).map((p) => p.lesson_id)
  );

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">{course.title}</h1>
      {course.description && (
        <p className="mb-6 text-sm text-zinc-400">{course.description}</p>
      )}
      <ul className="flex flex-col gap-2">
        {(lessons ?? []).map((lesson, i) => (
          <li key={lesson.id}>
            <Link
              href={`/dashboard/lessons/${lesson.id}`}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10"
            >
              <span>
                {i + 1}. {lesson.title}
              </span>
              {completedIds.has(lesson.id) ? (
                <span className="text-xs text-green-600">完了</span>
              ) : (
                <span className="text-xs text-zinc-400">未受講</span>
              )}
            </Link>
          </li>
        ))}
        {(lessons ?? []).length === 0 && (
          <p className="text-sm text-zinc-400">レッスンがまだありません。</p>
        )}
      </ul>
    </div>
  );
}
