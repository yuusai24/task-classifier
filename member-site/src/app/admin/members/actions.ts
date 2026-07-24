"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveMember(memberId: string) {
  const supabase = await createClient();
  await supabase.from("profiles").update({ is_approved: true }).eq("id", memberId);
  revalidatePath("/admin/members");
}

export async function revokeMember(memberId: string) {
  const supabase = await createClient();
  await supabase.from("profiles").update({ is_approved: false }).eq("id", memberId);
  revalidatePath("/admin/members");
}
