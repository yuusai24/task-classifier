-- 招待コード
create table invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  used boolean default false,
  used_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- プロフィール（受講生）
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  role text default 'student' check (role in ('student', 'admin')),
  created_at timestamptz default now()
);

-- コース
create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  thumbnail_url text,
  published boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- レッスン
create table lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  description text,
  youtube_url text,
  duration_minutes int,
  sort_order int default 0,
  published boolean default false,
  created_at timestamptz default now()
);

-- 受講進捗
create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  completed boolean default false,
  completed_at timestamptz,
  unique(user_id, lesson_id)
);

-- アナウンス（ライブ講座・イベント）
create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('youtube_live', 'group_zoom', 'individual_zoom')),
  join_url text,
  scheduled_at timestamptz not null,
  ends_at timestamptz,
  description text,
  published boolean default false,
  created_at timestamptz default now()
);

-- 個別セッション予約
create table session_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  scheduled_at timestamptz not null,
  zoom_url text,
  zoom_meeting_id text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- RLS有効化
alter table invite_codes enable row level security;
alter table profiles enable row level security;
alter table courses enable row level security;
alter table lessons enable row level security;
alter table lesson_progress enable row level security;
alter table announcements enable row level security;
alter table session_bookings enable row level security;

-- RLSポリシー
-- profiles: 自分のみ読み書き、adminは全員読める
create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "admin read all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- courses: 全受講生が読める（published=true）、adminは全操作
create policy "students read published courses" on courses for select using (
  published = true and exists (select 1 from profiles where id = auth.uid())
);
create policy "admin all courses" on courses for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- lessons: 同上
create policy "students read published lessons" on lessons for select using (
  published = true and exists (select 1 from profiles where id = auth.uid())
);
create policy "admin all lessons" on lessons for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- lesson_progress: 自分のみ
create policy "own progress" on lesson_progress for all using (auth.uid() = user_id);

-- announcements: published=trueは全受講生が読める
create policy "students read published announcements" on announcements for select using (
  published = true and exists (select 1 from profiles where id = auth.uid())
);
create policy "admin all announcements" on announcements for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- session_bookings: 自分のみ、adminは全員
create policy "own bookings" on session_bookings for all using (auth.uid() = user_id);
create policy "admin all bookings" on session_bookings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- invite_codes: adminのみ操作
create policy "admin all invite_codes" on invite_codes for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 新規ユーザー登録時にprofileを自動作成
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
