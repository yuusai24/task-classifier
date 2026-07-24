import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createCourse } from "./actions";
import { PublishToggle } from "./PublishToggle";
import { DeleteCourseButton } from "./DeleteButton";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase.from("courses").select("*").order("position");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">コース管理</h1>

      <form action={createCourse} className="mb-8 flex flex-col gap-2 rounded-lg border border-purple-200/60 bg-white/60 p-4">
        <p className="text-sm font-medium">新しいコースを作成</p>
        <input name="title" placeholder="コース名" required className="rounded-md border px-3 py-2" />
        <textarea name="description" placeholder="説明（任意）" className="rounded-md border px-3 py-2" rows={2} />
        <button
          type="submit"
          className="self-start rounded-md bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(196,148,233,0.35)] transition hover:brightness-110"
        >
          作成
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {(courses ?? []).map((course) => (
          <li key={course.id} className="flex items-center justify-between rounded-lg border border-purple-200/60 bg-white/60 p-3">
            <Link href={`/admin/courses/${course.id}`} className="font-medium">
              {course.title}
            </Link>
            <div className="flex items-center gap-3">
              <PublishToggle courseId={course.id} isPublished={course.is_published} />
              <DeleteCourseButton courseId={course.id} />
            </div>
          </li>
        ))}
        {(courses ?? []).length === 0 && <p className="text-sm text-zinc-500">コースがありません。</p>}
      </ul>
    </div>
  );
}
