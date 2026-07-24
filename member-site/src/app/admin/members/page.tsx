import { createClient } from "@/lib/supabase/server";
import { ApproveButton, RevokeButton } from "./Controls";

export default async function AdminMembersPage() {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const pending = (members ?? []).filter((m) => m.role !== "admin" && !m.is_approved);
  const approved = (members ?? []).filter((m) => m.role === "admin" || m.is_approved);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">会員承認</h1>

      <section className="mb-8">
        <h2 className="mb-3 font-medium">承認待ち（{pending.length}）</h2>
        <ul className="flex flex-col gap-2">
          {pending.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{m.display_name || "(名前未設定)"}</p>
                <p className="text-zinc-500">{m.email}</p>
              </div>
              <ApproveButton memberId={m.id} />
            </li>
          ))}
          {pending.length === 0 && <p className="text-sm text-zinc-500">承認待ちの会員はいません。</p>}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 font-medium">承認済み・管理者</h2>
        <ul className="flex flex-col gap-2">
          {approved.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">
                  {m.display_name || "(名前未設定)"}
                  {m.role === "admin" && <span className="ml-2 text-xs text-zinc-500">管理者</span>}
                </p>
                <p className="text-zinc-500">{m.email}</p>
              </div>
              {m.role !== "admin" && <RevokeButton memberId={m.id} />}
            </li>
          ))}
          {approved.length === 0 && <p className="text-sm text-zinc-500">まだ会員がいません。</p>}
        </ul>
      </section>
    </div>
  );
}
