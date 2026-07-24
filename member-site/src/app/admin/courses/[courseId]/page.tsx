import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateCourse, createLesson, updateLesson } from "./actions";
import { LessonPublishToggle, LessonDeleteButton } from "./LessonControls";

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("*").eq("id", courseId).single();
  if (!course) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("position");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">コース編集</h1>

      <form action={updateCourse.bind(null, courseId)} className="mb-8 flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-4">
        <input name="title" defaultValue={course.title} required className="rounded-md border px-3 py-2" />
        <textarea
          name="description"
          defaultValue={course.description ?? ""}
          className="rounded-md border px-3 py-2"
          rows={2}
        />
        <button
          type="submit"
          className="self-start rounded-md bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transition hover:brightness-110"
        >
          保存
        </button>
      </form>

      <h2 className="mb-3 font-medium">レッスン</h2>
      <div className="flex flex-col gap-3">
        {(lessons ?? []).map((lesson) => (
          <form
            key={lesson.id}
            action={updateLesson.bind(null, lesson.id, courseId)}
            className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-3"
          >
            <div className="flex items-center justify-between">
              <input
                name="title"
                defaultValue={lesson.title}
                required
                className="flex-1 rounded-md border px-2 py-1 text-sm"
              />
              <div className="ml-3 flex items-center gap-2">
                <LessonPublishToggle lessonId={lesson.id} courseId={courseId} isPublished={lesson.is_published} />
                <LessonDeleteButton lessonId={lesson.id} courseId={courseId} />
              </div>
            </div>
            <input
              name="video_url"
              defaultValue={lesson.video_url ?? ""}
              placeholder="動画URL（YouTube/Vimeo）"
              className="rounded-md border px-2 py-1 text-sm"
            />
            <div className="flex gap-2">
              <input
                name="duration_minutes"
                type="number"
                defaultValue={lesson.duration_minutes ?? ""}
                placeholder="分数"
                className="w-24 rounded-md border px-2 py-1 text-sm"
              />
              <textarea
                name="description"
                defaultValue={lesson.description ?? ""}
                placeholder="説明"
                className="flex-1 rounded-md border px-2 py-1 text-sm"
                rows={1}
              />
            </div>
            <button type="submit" className="self-start text-xs underline">
              このレッスンを保存
            </button>
          </form>
        ))}
      </div>

      <form action={createLesson.bind(null, courseId)} className="mt-6 flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-medium">レッスンを追加</p>
        <input name="title" placeholder="レッスン名" required className="rounded-md border px-3 py-2" />
        <input name="video_url" placeholder="動画URL（YouTube/Vimeo）" className="rounded-md border px-3 py-2" />
        <div className="flex gap-2">
          <input
            name="duration_minutes"
            type="number"
            placeholder="分数"
            className="w-24 rounded-md border px-3 py-2"
          />
          <textarea
            name="description"
            placeholder="説明（任意）"
            className="flex-1 rounded-md border px-3 py-2"
            rows={1}
          />
        </div>
        <button
          type="submit"
          className="self-start rounded-md bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transition hover:brightness-110"
        >
          追加
        </button>
      </form>
    </div>
  );
}
