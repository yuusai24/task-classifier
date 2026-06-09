import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LessonForm } from '@/components/admin/LessonForm'
import { CoursePublishToggle } from '@/components/admin/CoursePublishToggle'

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (!course) notFound()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order')

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
        <a href="/admin/courses" className="hover:text-gray-900">コース一覧</a>
        <span>›</span>
        <span className="text-gray-900">{course.title}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
          {course.description && (
            <p className="text-gray-500 mt-1">{course.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <CoursePublishToggle courseId={course.id} published={course.published} />
          <LessonForm courseId={course.id} />
        </div>
      </div>

      {/* レッスン一覧 */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700 mb-3">レッスン一覧</h3>
        {lessons?.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            <div className="text-3xl mb-2">🎬</div>
            <p className="text-sm">レッスンを追加してください</p>
          </div>
        )}
        {lessons?.map((lesson, index) => (
          <div
            key={lesson.id}
            className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-500">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 text-sm">{lesson.title}</span>
                {lesson.published ? (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">公開</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">非公開</span>
                )}
              </div>
              {lesson.youtube_url && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{lesson.youtube_url}</p>
              )}
            </div>
            {lesson.duration_minutes && (
              <span className="text-sm text-gray-400">{lesson.duration_minutes}分</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
