# 会員サイト

UTAGEから移行するための会員サイトです。Next.js + Supabase で構築しています。

## 機能

- 招待コード制の会員登録・ログイン（Supabase Auth）
- コース／レッスン動画（YouTube埋め込み）
- 受講進捗管理
- お知らせ（YouTube Live・Zoomの告知）
- 個別セッションの予約枠管理・予約
- Googleカレンダー連携による予約可能枠の自動生成（平日の空き時間を毎日自動同期）
- Zoom連携による予約確定時のミーティングURL自動発行
- 管理画面（コース・レッスン・お知らせ・招待コード・予約枠・予約状況・カレンダー連携）

## 技術構成と運用コスト

| 項目 | サービス | 目安コスト |
| --- | --- | --- |
| ホスティング | [Vercel](https://vercel.com) | 個人利用なら無料枠（Hobby）で十分 |
| DB・認証 | [Supabase](https://supabase.com) | 無料枠（500MB DB, 5万MAU）で開始可能。超えたら$25/月〜 |

UTAGEの月額費用と違い、会員数・利用量が少ないうちはほぼ無料で運用できます。

## セットアップ

### 1. Supabaseプロジェクトを作成

1. [supabase.com](https://supabase.com) で新規プロジェクトを作成
2. SQL Editorで `supabase/schema.sql` の内容を実行
3. Project Settings → API から `URL` / `anon public key` / `service_role key` を控える

### 2. ローカル環境変数

```bash
cp .env.local.example .env.local
```

`.env.local` に Supabase の値を設定する。`SUPABASE_SERVICE_ROLE_KEY` はサーバー専用（招待コード検証・予約の満席判定に使用）。ブラウザに公開されないので安全。

### 3. 依存関係インストール・起動

```bash
npm install
npm run dev
```

### 4. 最初の管理者を作成

1. `supabase/schema.sql` 末尾のコメントを参考に、SQL Editorで招待コードを1つ発行する
2. `/register` からそのコードで登録する
3. SQL Editorで自分のアカウントを管理者に昇格する

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

4. 以降は `/admin` の招待コード管理画面から会員を招待できる

### 5. Googleカレンダー連携（任意）

1. [Google Cloud Console](https://console.cloud.google.com) でプロジェクトを作成し、「Google Calendar API」を有効化する
2. 「APIとサービス」→「OAuth同意画面」を作成（External、Testingモードでよい。自分だけが使うため公開審査は不要）
3. 「認証情報」→「OAuthクライアントID」を作成（種類: ウェブアプリケーション）
   - 承認済みのリダイレクトURIに `https://<your-domain>/api/google/callback` を追加
4. 発行された `クライアントID` / `クライアントシークレット` を環境変数 `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` に設定
5. `/admin/calendar-settings` から「Googleカレンダーと連携する」を実行

### 6. Zoom連携（任意）

1. [Zoom App Marketplace](https://marketplace.zoom.us) →「Develop」→「Build App」→「Server-to-Server OAuth」でアプリを作成
2. スコープに `meeting:write:meeting` を追加
3. 発行された `Account ID` / `Client ID` / `Client Secret` を環境変数 `ZOOM_ACCOUNT_ID` / `ZOOM_CLIENT_ID` / `ZOOM_CLIENT_SECRET` に設定

## デプロイ（Vercel）

1. このリポジトリをVercelにインポート（Root Directoryを `member-site` に設定）
2. Environment Variablesに `.env.local.example` と同じ項目を設定（Google/Zoom連携を使わない場合は空欄のままで動作する）
3. Deploy

`vercel.json` に予約枠自動同期のCron設定（毎日1回）が含まれているため、デプロイするだけで自動的に有効になる。Cronからのリクエストは `CRON_SECRET` で保護される。

## ディレクトリ構成

```
src/app/                    ページ（会員向け: /dashboard, 管理: /admin, 認証: /login /register）
src/app/api/google/         GoogleカレンダーOAuth連携
src/app/api/cron/           予約枠自動同期（Vercel Cronから毎日実行）
src/lib/supabase/           Supabaseクライアント（browser / server / service / proxy）
src/lib/google-calendar.ts  Google Calendar APIラッパー
src/lib/availability.ts     稼働時間設定から候補枠を計算
src/lib/sync-availability.ts 候補枠とGoogleカレンダーの空き時間を突き合わせてsession_slotsに反映
src/lib/zoom.ts              Zoom Server-to-Server OAuth・ミーティング作成
src/proxy.ts                 セッション更新・未ログイン時のリダイレクト（旧middleware.ts）
src/types/database.ts        DBの型定義
supabase/schema.sql          テーブル定義・RLSポリシー
vercel.json                  Cronジョブ設定
```
