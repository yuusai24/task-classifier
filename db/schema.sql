-- 友彩スクール 受講生テーブル
CREATE TABLE IF NOT EXISTS students (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    name             TEXT    NOT NULL,           -- 仮名（例: かすみん）
    joined_at        DATE    NOT NULL,           -- 入会日
    current_stage    TEXT    NOT NULL,           -- 現在のステージ
    progress_pct     INTEGER NOT NULL DEFAULT 0, -- 進捗率（0〜100）
    background       TEXT,                       -- バックグラウンド（任意）
    notes            TEXT,                       -- 最近のメモ（コーチ記録）
    last_feedback_at DATETIME,                   -- 直近フィードバック送信日時
    created_at       DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at       DATETIME NOT NULL DEFAULT (datetime('now'))
);

-- 進捗率を数値に変換（例: "50%" → 50）して登録
INSERT INTO students (name, joined_at, current_stage, progress_pct, background, notes) VALUES
    ('かすみん', '2025-02-01', '実践演習中', 50, '重度障害児ママ', 'オンライン秘書でチームを作っている。プロモーションを任せてもらえるようになった。'),
    ('まきちゃん', '2025-02-01', '実践演習中', 50, '重度障害児ママ', '「自信がない」が先に来てしまう傾向がある。'),
    ('ゆっちゃん', '2025-02-01', '実践演習中', 50, NULL, '毎回枠を壊すたびに売り上げ上がる。自分で枠を見つけて外していく実践中。');
