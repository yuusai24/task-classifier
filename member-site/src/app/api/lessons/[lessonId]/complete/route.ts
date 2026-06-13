import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST(
  _: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: existing } = await supabase
    .from('lesson_progress')
    .select('id, completed')
    .eq('lesson_id', lessonId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase
      .from('lesson_progress')
      .update({ completed: !existing.completed, completed_at: !existing.completed ? new Date().toISOString() : null })
      .eq('id', existing.id)
  } else {
    await supabase.from('lesson_progress').insert({
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    })
  }

  redirect(`/dashboard/lessons/${lessonId}`)
}
