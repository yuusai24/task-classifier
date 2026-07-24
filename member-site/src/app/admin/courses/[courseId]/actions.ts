"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateCourse(courseId: string, formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("courses")
    .update({
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
    })
    .eq("id", courseId);

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");
}

export async function createLesson(courseId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = await createClient();
  await supabase.from("lessons").insert({
    course_id: courseId,
    title,
    video_url: String(formData.get("video_url") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    duration_minutes: formData.get("duration_minutes")
      ? Number(formData.get("duration_minutes"))
      : null,
    summary: String(formData.get("summary") ?? "").trim() || null,
    material_url: String(formData.get("material_url") ?? "").trim() || null,
  });

  revalidatePath(`/admin/courses/${courseId}`);
}

export async function updateLesson(lessonId: string, courseId: string, formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("lessons")
    .update({
      title: String(formData.get("title") ?? "").trim(),
      video_url: String(formData.get("video_url") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      duration_minutes: formData.get("duration_minutes")
        ? Number(formData.get("duration_minutes"))
        : null,
      summary: String(formData.get("summary") ?? "").trim() || null,
      material_url: String(formData.get("material_url") ?? "").trim() || null,
    })
    .eq("id", lessonId);

  revalidatePath(`/admin/courses/${courseId}`);
}

export async function toggleLessonPublished(lessonId: string, courseId: string, next: boolean) {
  const supabase = await createClient();
  await supabase.from("lessons").update({ is_published: next }).eq("id", lessonId);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/dashboard");
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const supabase = await createClient();
  await supabase.from("lessons").delete().eq("id", lessonId);
  revalidatePath(`/admin/courses/${courseId}`);
}
