"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";

function generateCode(): string {
  return randomBytes(5).toString("hex").toUpperCase();
}

export async function createInviteCode(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const maxUses = Number(formData.get("max_uses") ?? 1) || 1;
  const note = String(formData.get("note") ?? "").trim() || null;
  const expiresAtRaw = String(formData.get("expires_at") ?? "");

  await supabase.from("invite_codes").insert({
    code: generateCode(),
    max_uses: maxUses,
    note,
    expires_at: expiresAtRaw ? new Date(expiresAtRaw).toISOString() : null,
    created_by: user?.id ?? null,
  });

  revalidatePath("/admin/invite-codes");
}

export async function deleteInviteCode(id: string) {
  const supabase = await createClient();
  await supabase.from("invite_codes").delete().eq("id", id);
  revalidatePath("/admin/invite-codes");
}
