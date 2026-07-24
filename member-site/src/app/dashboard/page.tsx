import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AnnouncementList } from "@/components/dashboard/AnnouncementList";
import { CourseCard } from "@/components/dashboard/CourseCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: announcements }, { data: courses }, { data: lessons }, { data: progress }] =
    await Promise.all([
      supabase
        .from("announcements")
        .select("*")
        .eq("is_published", true)
        .order("starts_at", { ascending: true })
        .limit(5),
      supabase.from("courses").select("*").eq("is_published", true).order("position"),
      supabase
        .from("lessons")
        .select("id, title, course_id, position")
        .eq("is_published", true)
        .order("position"),
      supabase.from("lesson_progress").select("lesson_id").eq("member_id", user!.id).eq("is_completed", true),
    ]);

  const completedIds = new Set((progress ?? []).map((p) => p.lesson_id));

  let nextUp: { lessonId: string; lessonTitle: string; courseTitle: string } | null = null;
  for (const course of courses ?? []) {
    const courseLessons = (lessons ?? []).filter((l) => l.course_id === course.id);
    const upcoming = courseLessons.find((l) => !completedIds.has(l.id));
    if (upcoming) {
      nextUp = { lessonId: upcoming.id, lessonTitle: upcoming.title, courseTitle: course.title };
      break;
    }
  }

  return (
    <div>
      {nextUp && (
        <Link
          href={`/dashboard/lessons/${nextUp.lessonId}`}
          className="mb-8 block rounded-2xl border border-fuchsia-400/20 bg-gradient-to-r from-fuchsia-500/15 via-purple-500/10 to-indigo-500/15 p-5 shadow-[0_0_40px_rgba(168,85,247,0.15)] transition hover:brightness-110"
        >
          <span className="text-xs font-medium tracking-wide text-fuchsia-300">
            次に見るレッスン
          </span>
          <p className="mt-1 text-lg font-semibold text-white">{nextUp.lessonTitle}</p>
          <p className="mt-1 text-sm text-zinc-400">{nextUp.courseTitle}</p>
        </Link>
      )}
      <AnnouncementList announcements={announcements ?? []} />
      <h1 className="mb-4 text-xl font-semibold">コース一覧</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {(courses ?? []).map((course) => {
          const courseLessons = (lessons ?? []).filter((l) => l.course_id === course.id);
          const completed = courseLessons.filter((l) => completedIds.has(l.id)).length;
          return (
            <CourseCard
              key={course.id}
              course={course}
              totalLessons={courseLessons.length}
              completedLessons={completed}
            />
          );
        })}
        {(courses ?? []).length === 0 && (
          <p className="text-sm text-zinc-400">まだ公開中のコースがありません。</p>
        )}
      </div>
    </div>
  );
}
