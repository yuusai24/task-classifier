"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createCourse(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .insert({ title, description: String(formData.get("description") ?? "").trim() || null })
    .select("id")
    .single();

  revalidatePath("/admin/courses");
  if (data) redirect(`/admin/courses/${data.id}`);
}

export async function toggleCoursePublished(courseId: string, next: boolean) {
  const supabase = await createClient();
  await supabase.from("courses").update({ is_published: next }).eq("id", courseId);
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/dashboard");
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient();
  await supabase.from("courses").delete().eq("id", courseId);
  revalidatePath("/admin/courses");
}
