import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CourseForm } from '@/components/admin/CourseForm'

export default async function CoursesPage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('*, lessons(count)')
    .order('sort_order')

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">コース管理</h2>
        <CourseForm />
      </div>

      <div className="space-y-3">
        {courses?.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📚</div>
            <p>コースがまだありません</p>
          </div>
        )}
        {courses?.map((course) => (
          <Link
            key={course.id}
            href={`/admin/courses/${course.id}`}
            className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-200 hover:shadow-sm transition"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{course.title}</h3>
                {course.published ? (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">公開中</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">下書き</span>
                )}
              </div>
              {course.description && (
                <p className="text-sm text-gray-500 line-clamp-1">{course.description}</p>
              )}
            </div>
            <div className="text-sm text-gray-400">
              {(course.lessons as { count: number }[])?.[0]?.count ?? 0} レッスン
            </div>
            <span className="text-gray-300">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
