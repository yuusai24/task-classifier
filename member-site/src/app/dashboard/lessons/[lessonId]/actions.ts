"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleLessonComplete(lessonId: string, courseId: string, next: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("lesson_progress").upsert({
    member_id: user.id,
    lesson_id: lessonId,
    is_completed: next,
    completed_at: next ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  });

  revalidatePath(`/dashboard/lessons/${lessonId}`);
  revalidatePath(`/dashboard/courses/${courseId}`);
  revalidatePath("/dashboard");
}
