import { createClient } from '@/lib/supabase/server'
import { AnnouncementForm } from '@/components/admin/AnnouncementForm'
import { Announcement } from '@/types/database'

const typeLabels: Record<string, { label: string; icon: string; color: string }> = {
  youtube_live: { label: 'YouTubeLIVE', icon: '▶️', color: 'bg-red-100 text-red-700' },
  group_zoom: { label: 'グループZOOM', icon: '🎥', color: 'bg-blue-100 text-blue-700' },
  individual_zoom: { label: '個別セッション', icon: '👤', color: 'bg-purple-100 text-purple-700' },
}

export default async function AnnouncementsPage() {
  const supabase = await createClient()

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('scheduled_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">アナウンス管理</h2>
        <AnnouncementForm />
      </div>

      <div className="space-y-3">
        {announcements?.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📣</div>
            <p>アナウンスがまだありません</p>
          </div>
        )}
        {announcements?.map((ann: Announcement) => {
          const meta = typeLabels[ann.type]
          const date = new Date(ann.scheduled_at)
          const isLive = ann.ends_at
            ? new Date() >= date && new Date() <= new Date(ann.ends_at)
            : false

          return (
            <div
              key={ann.id}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
                    {meta.icon} {meta.label}
                  </span>
                  {isLive && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                      🔴 LIVE中
                    </span>
                  )}
                  {ann.published ? (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">公開中</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">下書き</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">{ann.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {date.toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {ann.join_url && (
                <a
                  href={ann.join_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:underline"
                >
                  URLを確認
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
