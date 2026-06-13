'use client'

import { Announcement } from '@/types/database'

const typeConfig = {
  youtube_live: { icon: '▶️', label: 'YouTubeLIVE', liveColor: 'bg-red-500', upcomingColor: 'bg-red-50 border-red-200' },
  group_zoom: { icon: '🎥', label: 'グループZOOM講座', liveColor: 'bg-blue-500', upcomingColor: 'bg-blue-50 border-blue-200' },
  individual_zoom: { icon: '👤', label: '個別セッション', liveColor: 'bg-purple-500', upcomingColor: 'bg-purple-50 border-purple-200' },
}

export function LiveBanner({ announcement, now }: { announcement: Announcement; now: string }) {
  const config = typeConfig[announcement.type]
  const scheduled = new Date(announcement.scheduled_at)
  const ends = announcement.ends_at ? new Date(announcement.ends_at) : null
  const nowDate = new Date(now)

  const isLive = nowDate >= scheduled && (ends ? nowDate <= ends : true)
  const minutesUntil = Math.round((scheduled.getTime() - nowDate.getTime()) / 60000)

  if (isLive) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 text-white p-5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
          <div>
            <div className="text-xs font-medium opacity-90 mb-0.5">
              {config.icon} {config.label} 開催中！
            </div>
            <div className="font-bold text-lg">{announcement.title}</div>
          </div>
        </div>
        {announcement.join_url && (
          <a
            href={announcement.join_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-red-600 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-red-50 transition whitespace-nowrap"
          >
            今すぐ参加 →
          </a>
        )}
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border-2 ${config.upcomingColor} p-5 flex items-center justify-between`}>
      <div className="flex items-center gap-3">
        <div className="text-2xl">{config.icon}</div>
        <div>
          <div className="text-xs font-medium text-gray-500 mb-0.5">
            {minutesUntil <= 60
              ? `あと${minutesUntil}分で開始`
              : scheduled.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            }
          </div>
          <div className="font-bold text-gray-900">{announcement.title}</div>
          <div className="text-sm text-gray-500">{config.label}</div>
        </div>
      </div>
      {announcement.join_url && (
        <a
          href={announcement.join_url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition whitespace-nowrap"
        >
          参加リンク →
        </a>
      )}
    </div>
  )
}
