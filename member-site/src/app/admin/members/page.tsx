import { createClient } from "@/lib/supabase/server";
import { ApproveButton, RevokeButton } from "./Controls";

function formatLastSignIn(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString("ja-JP") : "未ログイン";
}

export default async function AdminMembersPage() {
  const supabase = await createClient();

  const [{ data: members }, { data: progressRows }, { count: totalLessons }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("lesson_progress").select("member_id").eq("is_completed", true),
    supabase.from("lessons").select("id", { count: "exact", head: true }).eq("is_published", true),
  ]);

  const completedCountByMember = new Map<string, number>();
  for (const row of progressRows ?? []) {
    completedCountByMember.set(row.member_id, (completedCountByMember.get(row.member_id) ?? 0) + 1);
  }

  const pending = (members ?? []).filter((m) => m.role !== "admin" && !m.is_approved);
  const approved = (members ?? []).filter((m) => m.role === "admin" || m.is_approved);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">会員承認</h1>

      <section className="mb-8">
        <h2 className="mb-3 font-medium">承認待ち（{pending.length}）</h2>
        <ul className="flex flex-col gap-2">
          {pending.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
              <div>
                <p className="font-medium">{m.display_name || "(名前未設定)"}</p>
                <p className="text-zinc-400">{m.email}</p>
                <p className="text-xs text-zinc-400">
                  最終ログイン: {formatLastSignIn(m.last_sign_in_at)}
                </p>
              </div>
              <ApproveButton memberId={m.id} />
            </li>
          ))}
          {pending.length === 0 && <p className="text-sm text-zinc-400">承認待ちの会員はいません。</p>}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 font-medium">承認済み・管理者</h2>
        <ul className="flex flex-col gap-2">
          {approved.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
              <div>
                <p className="font-medium">
                  {m.display_name || "(名前未設定)"}
                  {m.role === "admin" && <span className="ml-2 text-xs text-zinc-400">管理者</span>}
                </p>
                <p className="text-zinc-400">{m.email}</p>
                <p className="text-xs text-zinc-400">
                  最終ログイン: {formatLastSignIn(m.last_sign_in_at)}
                  {" ・ "}
                  受講進捗: {completedCountByMember.get(m.id) ?? 0}/{totalLessons ?? 0} レッスン完了
                </p>
              </div>
              {m.role !== "admin" && <RevokeButton memberId={m.id} />}
            </li>
          ))}
          {approved.length === 0 && <p className="text-sm text-zinc-400">まだ会員がいません。</p>}
        </ul>
      </section>
    </div>
  );
}
