-- Cloudflare D1: 受講生管理テーブル
CREATE TABLE IF NOT EXISTS students (
  id               TEXT PRIMARY KEY,  -- LINE ユーザーID (Uxxxxxxxxx...)
  name             TEXT NOT NULL,     -- 仮名
  joined_at        TEXT NOT NULL,     -- 入会日 (YYYY-MM)
  current_stage    TEXT,              -- 現在のステージ
  progress         INTEGER,           -- 進捗率 (0〜100)
  job              TEXT,              -- 仕事・肩書き
  notes            TEXT,              -- 最近のメモ
  last_feedback_at TEXT               -- 最終フィードバック送信日時 (ISO 8601)
);

-- サンプルデータ（3名）
INSERT INTO students VALUES
  ('LINE_ID_かすみん', 'かすみん', '2025-02', 'ステージ1→2', 80, 'オンライン秘書のリーダー', '所属コミュニティーのプロモーションを任せてもらえるようになった', NULL),
  ('LINE_ID_まきちゃん', 'まきちゃん', '2025-02', 'ステージ1', 80, 'わたしを整えるノートの先生', '1期生のサポートが終わったところ。認知が弱く所属コミュニティーからしか集客できない', NULL),
  ('LINE_ID_ゆっちゃん', 'ゆっちゃん', '2025-02', 'ステージ3', 80, 'インド刺繍リボンのハンドメイド作家講師＆集客コンサル', '自分の枠を外すたびに大きく成長する', NULL);
