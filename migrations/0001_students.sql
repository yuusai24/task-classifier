-- 受講生テーブル
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  line_user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  joined_at TEXT NOT NULL,
  guardian_spirit TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  last_feedback_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 返信ログテーブル（返信内容を積み上げてここに蓄積）
CREATE TABLE IF NOT EXISTS reply_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  reply_text TEXT NOT NULL,
  received_at TEXT DEFAULT (datetime('now')),
  used_in_feedback INTEGER DEFAULT 0,
  FOREIGN KEY (student_id) REFERENCES students(id)
);
