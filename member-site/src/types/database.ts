export type Role = 'student' | 'admin'
export type AnnouncementType = 'youtube_live' | 'group_zoom' | 'individual_zoom'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Profile {
  id: string
  display_name: string | null
  email: string | null
  role: Role
  created_at: string
}

export interface Course {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  published: boolean
  sort_order: number
  created_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string | null
  youtube_url: string | null
  duration_minutes: number | null
  sort_order: number
  published: boolean
  created_at: string
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
  completed_at: string | null
}

export interface Announcement {
  id: string
  title: string
  type: AnnouncementType
  join_url: string | null
  scheduled_at: string
  ends_at: string | null
  description: string | null
  published: boolean
  created_at: string
}

export interface SessionBooking {
  id: string
  user_id: string
  scheduled_at: string
  zoom_url: string | null
  zoom_meeting_id: string | null
  status: BookingStatus
  notes: string | null
  created_at: string
}

export interface InviteCode {
  id: string
  code: string
  used: boolean
  used_by: string | null
  created_at: string
}

// コースとレッスン一覧を合わせた型
export interface CourseWithLessons extends Course {
  lessons: Lesson[]
}

// 進捗つきのレッスン
export interface LessonWithProgress extends Lesson {
  progress?: LessonProgress
}

export interface CourseWithProgress extends Course {
  lessons: LessonWithProgress[]
  completedCount: number
  totalCount: number
}
