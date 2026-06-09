'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CourseWithProgress, LessonWithProgress } from '@/types/database'
import Link from 'next/link'

export function CourseProgress({ course, userId }: { course: CourseWithProgress; userId: string }) {
  const [lessons, setLessons] = useState(course.lessons)
  const [expanded, setExpanded] = useState(true)

  const completedCount = lessons.filter((l) => l.progress?.completed).length
  const percent = course.totalCount > 0 ? Math.round((completedCount / course.totalCount) * 100) : 0

  // 次のレッスン（未完了の最初）
  const nextLesson = lessons.find((l) => !l.progress?.completed)

  async function toggleLesson(lesson: LessonWithProgress) {
    const supabase = createClient()
    const completed = !lesson.progress?.completed

    if (lesson.progress) {
      await supabase
        .from('lesson_progress')
        .update({ completed, completed_at: completed ? new Date().toISOString() : null })
        .eq('id', lesson.progress.id)
    } else {
      await supabase.from('lesson_progress').insert({
        user_id: userId,
        lesson_id: lesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
      })
    }

    setLessons((prev) =>
      prev.map((l) =>
        l.id === lesson.id
          ? { ...l, progress: { ...l.progress, completed, completed_at: completed ? new Date().toISOString() : null } as LessonWithProgress['progress'] }
          : l
      )
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* コースヘッダー */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-lg">{course.title}</h4>
            {course.description && (
              <p className="text-sm text-gray-500 mt-1">{course.description}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-indigo-600">{percent}%</div>
            <div className="text-xs text-gray-400">{completedCount}/{course.totalCount}</div>
          </div>
        </div>

        {/* プログレスバー */}
        <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        {nextLesson && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-gray-400">次のレッスン：</span>
            <span className="text-indigo-600 font-medium">{nextLesson.title}</span>
          </div>
        )}
        {percent === 100 && (
          <div className="mt-3 text-sm text-emerald-600 font-medium">🎉 完了しました！</div>
        )}
      </div>

      {/* レッスン一覧 */}
      {expanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-100">
          {lessons.map((lesson, index) => {
            const isCompleted = lesson.progress?.completed ?? false
            const isNext = lesson.id === nextLesson?.id

            return (
              <div
                key={lesson.id}
                className={`flex items-center gap-4 px-6 py-4 transition ${isNext ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
              >
                {/* 完了チェックボックス */}
                <button
                  onClick={() => toggleLesson(lesson)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                    isCompleted
                      ? 'bg-indigo-500 border-indigo-500 text-white'
                      : isNext
                      ? 'border-indigo-400'
                      : 'border-gray-300'
                  }`}
                >
                  {isCompleted && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 shrink-0">#{index + 1}</span>
                    <span className={`text-sm font-medium ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {lesson.title}
                    </span>
                    {isNext && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full shrink-0">
                        ▶ 次はここ
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {lesson.duration_minutes && (
                    <span className="text-xs text-gray-400">{lesson.duration_minutes}分</span>
                  )}
                  {lesson.youtube_url && (
                    <Link
                      href={`/dashboard/lessons/${lesson.id}`}
                      className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      動画を見る
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
