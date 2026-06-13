import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: courseCount },
    { count: memberCount },
    { count: announcementCount },
    { count: pendingBookings },
  ] = await Promise.all([
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('announcements').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('session_bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    { label: 'コース数', value: courseCount ?? 0, href: '/admin/courses', icon: '📚', color: 'bg-indigo-50 text-indigo-700' },
    { label: '受講生数', value: memberCount ?? 0, href: '/admin/members', icon: '👥', color: 'bg-emerald-50 text-emerald-700' },
    { label: '公開アナウンス', value: announcementCount ?? 0, href: '/admin/announcements', icon: '📣', color: 'bg-amber-50 text-amber-700' },
    { label: '未確認セッション', value: pendingBookings ?? 0, href: '/admin/members', icon: '📅', color: 'bg-rose-50 text-rose-700' },
  ]

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">ダッシュボード</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className={`rounded-xl p-5 ${stat.color} hover:opacity-90 transition cursor-pointer`}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm font-medium mt-1 opacity-80">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">クイックアクション</h3>
          <div className="space-y-3">
            <Link href="/admin/courses" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition text-sm">
              <span className="text-xl">📚</span>
              <div>
                <div className="font-medium text-gray-900">コースを追加</div>
                <div className="text-gray-500 text-xs">新しいコースを作成する</div>
              </div>
            </Link>
            <Link href="/admin/announcements" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-amber-200 hover:bg-amber-50 transition text-sm">
              <span className="text-xl">📣</span>
              <div>
                <div className="font-medium text-gray-900">アナウンスを作成</div>
                <div className="text-gray-500 text-xs">ZOOM・YouTubeライブの告知</div>
              </div>
            </Link>
            <Link href="/admin/invite-codes" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition text-sm">
              <span className="text-xl">🔑</span>
              <div>
                <div className="font-medium text-gray-900">招待コードを発行</div>
                <div className="text-gray-500 text-xs">新しい受講生を招待する</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
