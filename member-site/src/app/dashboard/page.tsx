import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LiveBanner } from '@/components/dashboard/LiveBanner'
import { CourseProgress } from '@/components/dashboard/CourseProgress'
import { Announcement, Course, Lesson, LessonProgress } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, role')
    .eq('id', user.id)
    .single()

  // ライブ中 or 近日開催のアナウンスを取得
  const now = new Date().toISOString()
  const soon = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24時間以内

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('published', true)
    .gte('scheduled_at', new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()) // 4時間前から
    .lte('scheduled_at', soon)
    .order('scheduled_at')

  // コースと進捗を取得
  const { data: courses } = await supabase
    .from('courses')
    .select('*, lessons(*, lesson_progress(*))')
    .eq('published', true)
    .order('sort_order')

  // 進捗をユーザーでフィルタ
  const coursesWithProgress = courses?.map((course: Course & { lessons: (Lesson & { lesson_progress: LessonProgress[] })[] }) => {
    const lessons = course.lessons.map((lesson) => ({
      ...lesson,
      progress: lesson.lesson_progress.find((p) => p.user_id === user.id),
    }))
    const completedCount = lessons.filter((l) => l.progress?.completed).length
    return { ...course, lessons, completedCount, totalCount: lessons.length }
  }) ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <h1 className="font-bold text-gray-900">受講生ポータル</h1>
          <div className="flex items-center gap-4">
            {profile?.role === 'admin' && (
              <a href="/admin" className="text-sm text-indigo-600 hover:underline">管理画面</a>
            )}
            <span className="text-sm text-gray-500">{profile?.display_name}</span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-gray-400 hover:text-gray-600">ログアウト</button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* 挨拶 */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            こんにちは、{profile?.display_name}さん 👋
          </h2>
          <p className="text-sm text-gray-500 mt-1">今日も学習を続けましょう</p>
        </div>

        {/* ライブバナー */}
        {announcements && announcements.length > 0 && (
          <div className="space-y-3">
            {(announcements as Announcement[]).map((ann) => (
              <LiveBanner key={ann.id} announcement={ann} now={now} />
            ))}
          </div>
        )}

        {/* コース進捗 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">あなたのコース</h3>
          {coursesWithProgress.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
              <div className="text-4xl mb-3">📚</div>
              <p>受講中のコースはまだありません</p>
            </div>
          ) : (
            coursesWithProgress.map((course) => (
              <CourseProgress key={course.id} course={course} userId={user.id} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
