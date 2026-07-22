"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function registerWithInviteCode(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const inviteCode = String(formData.get("invite_code") ?? "").trim();

  if (!email || !password || !inviteCode) {
    return { error: "メールアドレス・パスワード・招待コードを入力してください。" };
  }

  const service = createServiceClient();
  const { data: invite, error: inviteError } = await service
    .from("invite_codes")
    .select("*")
    .eq("code", inviteCode)
    .maybeSingle();

  if (inviteError || !invite) {
    return { error: "招待コードが無効です。" };
  }
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { error: "招待コードの有効期限が切れています。" };
  }
  if (invite.used_count >= invite.max_uses) {
    return { error: "この招待コードは利用上限に達しています。" };
  }

  const supabase = await createClient();
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName || null } },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  await service
    .from("invite_codes")
    .update({ used_count: invite.used_count + 1 })
    .eq("id", invite.id);

  redirect("/dashboard");
}
