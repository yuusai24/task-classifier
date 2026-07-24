import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toEmbedUrl } from "@/lib/video";
import { CompleteButton } from "./CompleteButton";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (!lesson) notFound();

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("is_completed")
    .eq("member_id", user!.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  const embedUrl = lesson.video_url ? toEmbedUrl(lesson.video_url) : null;

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">{lesson.title}</h1>
      {embedUrl ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg border">
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : lesson.video_url ? (
        <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="underline">
          動画を開く
        </a>
      ) : (
        <p className="text-sm text-zinc-500">動画は準備中です。</p>
      )}
      {lesson.description && <p className="mt-4 text-sm">{lesson.description}</p>}
      <div className="mt-6">
        <CompleteButton
          lessonId={lesson.id}
          courseId={lesson.course_id}
          initialCompleted={progress?.is_completed ?? false}
        />
      </div>
    </div>
  );
}
