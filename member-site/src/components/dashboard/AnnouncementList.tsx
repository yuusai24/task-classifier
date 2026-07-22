import type { Announcement } from "@/types/database";

const EVENT_LABEL: Record<Announcement["event_type"], string> = {
  notice: "お知らせ",
  youtube_live: "YouTube Live",
  zoom: "Zoom",
};

export function AnnouncementList({
  announcements,
}: {
  announcements: Announcement[];
}) {
  if (announcements.length === 0) return null;

  return (
    <div className="mb-8 flex flex-col gap-3">
      {announcements.map((a) => (
        <div key={a.id} className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
              {EVENT_LABEL[a.event_type]}
            </span>
            {a.starts_at && (
              <span>{new Date(a.starts_at).toLocaleString("ja-JP")}</span>
            )}
          </div>
          <p className="mt-1 font-medium">{a.title}</p>
          {a.body && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{a.body}</p>}
          {a.event_url && (
            <a
              href={a.event_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm underline"
            >
              参加する
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
