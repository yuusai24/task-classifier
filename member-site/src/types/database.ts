export type Role = "member" | "admin";
export type EventType = "notice" | "youtube_live" | "zoom";
export type BookingStatus = "requested" | "confirmed" | "cancelled";

// Supabase-js の型解決は interface だと崩れるため、Row 型は type エイリアスで定義する。

export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  role: Role;
  is_approved: boolean;
  last_sign_in_at: string | null;
  created_at: string;
};

export type InviteCode = {
  id: string;
  code: string;
  note: string | null;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
};

export type Course = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  position: number;
  created_at: string;
};

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  summary: string | null;
  material_url: string | null;
  is_published: boolean;
  position: number;
  created_at: string;
};

export type LessonProgress = {
  member_id: string;
  lesson_id: string;
  is_completed: boolean;
  completed_at: string | null;
  updated_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string | null;
  event_type: EventType;
  event_url: string | null;
  starts_at: string | null;
  is_published: boolean;
  created_at: string;
};

export type SlotSource = "manual" | "google_sync";

export type SessionSlot = {
  id: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  source: SlotSource;
  created_at: string;
};

export type BookingSettings = {
  id: boolean;
  weekday_start_hour: number;
  weekday_end_hour: number;
  slot_duration_minutes: number;
  sync_weeks_ahead: number;
  timezone: string;
  updated_at: string;
};

export type GoogleCalendarConnection = {
  id: boolean;
  refresh_token: string;
  connected_email: string | null;
  connected_at: string;
};

export type RecordingImportStatus = "pending" | "assigned";

export type RecordingImport = {
  id: string;
  zoom_file_id: string | null;
  zoom_meeting_topic: string | null;
  vimeo_video_id: string;
  vimeo_uri: string;
  status: RecordingImportStatus;
  created_at: string;
};

export type SessionBooking = {
  id: string;
  slot_id: string;
  member_id: string;
  status: BookingStatus;
  meeting_url: string | null;
  note: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      invite_codes: {
        Row: InviteCode;
        Insert: Partial<InviteCode>;
        Update: Partial<InviteCode>;
        Relationships: [];
      };
      courses: {
        Row: Course;
        Insert: Partial<Course>;
        Update: Partial<Course>;
        Relationships: [];
      };
      lessons: {
        Row: Lesson;
        Insert: Partial<Lesson>;
        Update: Partial<Lesson>;
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_progress: {
        Row: LessonProgress;
        Insert: Partial<LessonProgress>;
        Update: Partial<LessonProgress>;
        Relationships: [];
      };
      announcements: {
        Row: Announcement;
        Insert: Partial<Announcement>;
        Update: Partial<Announcement>;
        Relationships: [];
      };
      session_slots: {
        Row: SessionSlot;
        Insert: Partial<SessionSlot>;
        Update: Partial<SessionSlot>;
        Relationships: [];
      };
      session_bookings: {
        Row: SessionBooking;
        Insert: Partial<SessionBooking>;
        Update: Partial<SessionBooking>;
        Relationships: [
          {
            foreignKeyName: "session_bookings_slot_id_fkey";
            columns: ["slot_id"];
            isOneToOne: false;
            referencedRelation: "session_slots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_bookings_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_settings: {
        Row: BookingSettings;
        Insert: Partial<BookingSettings>;
        Update: Partial<BookingSettings>;
        Relationships: [];
      };
      google_calendar_connection: {
        Row: GoogleCalendarConnection;
        Insert: Partial<GoogleCalendarConnection>;
        Update: Partial<GoogleCalendarConnection>;
        Relationships: [];
      };
      recording_imports: {
        Row: RecordingImport;
        Insert: Partial<RecordingImport>;
        Update: Partial<RecordingImport>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
