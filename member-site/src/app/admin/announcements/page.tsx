import { createClient } from "@/lib/supabase/server";
import { createAnnouncement } from "./actions";
import { AnnouncementControls } from "./Controls";

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("starts_at", { ascending: true, nullsFirst: false });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">アナウンス管理</h1>

      <form action={createAnnouncement} className="mb-8 flex flex-col gap-2 rounded-lg border p-4">
        <p className="text-sm font-medium">新しいアナウンス</p>
        <input name="title" placeholder="タイトル" required className="rounded-md border px-3 py-2" />
        <textarea name="body" placeholder="本文（任意）" className="rounded-md border px-3 py-2" rows={2} />
        <div className="flex gap-2">
          <select name="event_type" className="rounded-md border px-3 py-2 text-sm">
            <option value="notice">お知らせ</option>
            <option value="youtube_live">YouTube Live</option>
            <option value="zoom">Zoom</option>
          </select>
          <input name="event_url" placeholder="参加URL（任意）" className="flex-1 rounded-md border px-3 py-2" />
        </div>
        <input name="starts_at" type="datetime-local" className="rounded-md border px-3 py-2" />
        <button
          type="submit"
          className="self-start rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          作成
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {(announcements ?? []).map((a) => (
          <li key={a.id} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">{a.title}</p>
              {a.starts_at && (
                <p className="text-xs text-zinc-500">{new Date(a.starts_at).toLocaleString("ja-JP")}</p>
              )}
            </div>
            <AnnouncementControls id={a.id} isPublished={a.is_published} />
          </li>
        ))}
        {(announcements ?? []).length === 0 && <p className="text-sm text-zinc-500">アナウンスがありません。</p>}
      </ul>
    </div>
  );
}
