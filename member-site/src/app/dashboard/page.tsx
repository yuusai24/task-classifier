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
      supabase.from("lessons").select("id, course_id").eq("is_published", true),
      supabase.from("lesson_progress").select("lesson_id").eq("member_id", user!.id).eq("is_completed", true),
    ]);

  const completedIds = new Set((progress ?? []).map((p) => p.lesson_id));

  return (
    <div>
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
