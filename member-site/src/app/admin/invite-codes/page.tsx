import { createClient } from "@/lib/supabase/server";
import { createInviteCode } from "./actions";
import { DeleteInviteCodeButton } from "./DeleteButton";

export default async function AdminInviteCodesPage() {
  const supabase = await createClient();
  const { data: codes } = await supabase
    .from("invite_codes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">招待コード管理</h1>

      <form action={createInviteCode} className="mb-8 flex flex-col gap-2 rounded-lg border border-purple-200/60 bg-white/60 p-4">
        <p className="text-sm font-medium">招待コードを発行</p>
        <div className="flex gap-2">
          <input
            name="max_uses"
            type="number"
            defaultValue={1}
            min={1}
            placeholder="利用可能回数"
            className="w-32 rounded-md border px-3 py-2"
          />
          <input name="expires_at" type="date" className="rounded-md border px-3 py-2" />
        </div>
        <input name="note" placeholder="メモ（任意）" className="rounded-md border px-3 py-2" />
        <button
          type="submit"
          className="self-start rounded-md bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(196,148,233,0.35)] transition hover:brightness-110"
        >
          発行
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {(codes ?? []).map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-lg border border-purple-200/60 bg-white/60 p-3">
            <div>
              <p className="font-mono font-medium">{c.code}</p>
              <p className="text-xs text-zinc-500">
                {c.used_count}/{c.max_uses} 回使用済み
                {c.expires_at && ` ・ ${new Date(c.expires_at).toLocaleDateString("ja-JP")}まで`}
                {c.note && ` ・ ${c.note}`}
              </p>
            </div>
            <DeleteInviteCodeButton id={c.id} />
          </li>
        ))}
        {(codes ?? []).length === 0 && <p className="text-sm text-zinc-500">招待コードがありません。</p>}
      </ul>
    </div>
  );
}
