import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

function getYouTubeEmbedId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>
}) {
  const { lessonId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lesson } = await supabase
    .from('lessons')
    .select('*, courses(title, id)')
    .eq('id', lessonId)
    .single()

  if (!lesson || !lesson.published) notFound()

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('user_id', user.id)
    .single()

  const embedId = lesson.youtube_url ? getYouTubeEmbedId(lesson.youtube_url) : null

  return (
    <div className="min-h-screen bg-gray-950">
      {/* ナビ */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-4">
        <a href="/dashboard" className="text-gray-400 hover:text-white text-sm transition">
          ← ダッシュボードへ戻る
        </a>
        <span className="text-gray-700">|</span>
        <span className="text-gray-300 text-sm">{(lesson.courses as { title: string } | null)?.title}</span>
      </div>

      {/* 動画 */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {embedId ? (
          <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl mb-6">
            <iframe
              src={`https://www.youtube.com/embed/${embedId}?rel=0&modestbranding=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
            <p className="text-gray-400">動画が設定されていません</p>
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-gray-400 mt-2">{lesson.description}</p>
            )}
          </div>
          <form action={`/api/lessons/${lessonId}/complete`} method="post">
            <button
              type="submit"
              className={`shrink-0 text-sm font-medium px-5 py-2.5 rounded-xl transition ${
                progress?.completed
                  ? 'bg-emerald-900 text-emerald-400 border border-emerald-700'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {progress?.completed ? '✓ 完了済み' : '完了にする'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
