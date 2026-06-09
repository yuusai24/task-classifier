'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function CoursePublishToggle({ courseId, published }: { courseId: string; published: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState(published)

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('courses').update({ published: !current }).eq('id', courseId)
    setCurrent(!current)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 ${
        current
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
      }`}
    >
      {loading ? '...' : current ? '非公開にする' : '公開する'}
    </button>
  )
}
