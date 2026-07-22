-- 会員サイト DBスキーマ
-- Supabase の SQL Editor で実行してください。

create extension if not exists "pgcrypto";

-- ============================================================
-- プロフィール（受講生・管理者共通）
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 招待コード（招待コード制登録）
-- ============================================================
create table invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  note text,
  max_uses int not null default 1,
  used_count int not null default 0,
  expires_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- コース / レッスン
-- ============================================================
create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  thumbnail_url text,
  is_published boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  duration_minutes int,
  is_published boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 受講進捗
-- ============================================================
create table lesson_progress (
  member_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  is_completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (member_id, lesson_id)
);

-- ============================================================
-- アナウンス（ライブ配信・イベント告知）
-- ============================================================
create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  event_type text not null default 'notice' check (event_type in ('notice', 'youtube_live', 'zoom')),
  event_url text,
  starts_at timestamptz,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 個別セッション予約
-- ============================================================
create table session_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity int not null default 1,
  created_at timestamptz not null default now()
);

create table session_bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references session_slots(id) on delete cascade,
  member_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'cancelled')),
  meeting_url text,
  note text,
  created_at timestamptz not null default now(),
  unique (slot_id, member_id)
);

-- ============================================================
-- 新規ユーザー登録時に profiles を自動作成
-- ============================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table invite_codes enable row level security;
alter table courses enable row level security;
alter table lessons enable row level security;
alter table lesson_progress enable row level security;
alter table announcements enable row level security;
alter table session_slots enable row level security;
alter table session_bookings enable row level security;

create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles
create policy "profiles_select_own_or_admin" on profiles for select
  using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on profiles for update
  using (auth.uid() = id);
create policy "profiles_admin_all" on profiles for all
  using (public.is_admin());

-- invite_codes: 管理者のみ操作可。登録処理はサーバー側(service role)で検証する。
create policy "invite_codes_admin_all" on invite_codes for all
  using (public.is_admin());

-- courses
create policy "courses_select_published" on courses for select
  using (is_published = true or public.is_admin());
create policy "courses_admin_write" on courses for all
  using (public.is_admin());

-- lessons
create policy "lessons_select_published" on lessons for select
  using (
    (is_published = true and exists (select 1 from courses c where c.id = course_id and c.is_published = true))
    or public.is_admin()
  );
create policy "lessons_admin_write" on lessons for all
  using (public.is_admin());

-- lesson_progress: 本人のみ
create policy "progress_own" on lesson_progress for all
  using (auth.uid() = member_id or public.is_admin());

-- announcements
create policy "announcements_select_published" on announcements for select
  using (is_published = true or public.is_admin());
create policy "announcements_admin_write" on announcements for all
  using (public.is_admin());

-- session_slots: 全会員が閲覧可、管理者のみ作成/編集
create policy "slots_select_all_members" on session_slots for select
  using (exists (select 1 from profiles where id = auth.uid()));
create policy "slots_admin_write" on session_slots for all
  using (public.is_admin());

-- session_bookings: 本人と管理者のみ
create policy "bookings_own" on session_bookings for select
  using (auth.uid() = member_id or public.is_admin());
create policy "bookings_insert_own" on session_bookings for insert
  with check (auth.uid() = member_id);
create policy "bookings_update_admin" on session_bookings for update
  using (public.is_admin());
create policy "bookings_delete_own_or_admin" on session_bookings for delete
  using (auth.uid() = member_id or public.is_admin());

-- ============================================================
-- セットアップ用メモ
-- ============================================================
-- 1. 最初の招待コードを発行して1人目のアカウントを登録する:
--    insert into invite_codes (code, max_uses) values ('WELCOME1', 1);
-- 2. 登録後、そのユーザーを管理者に昇格する:
--    update profiles set role = 'admin' where email = 'you@example.com';
-- 3. 以降の招待コード発行は管理画面（/admin/invite-codes）から行える。
