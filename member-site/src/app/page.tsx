import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold">会員サイト</h1>
      <p className="mt-3 max-w-md text-zinc-600 dark:text-zinc-400">
        レッスン動画・進捗管理・お知らせ・個別セッション予約をまとめた会員限定サイトです。
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/login" className="rounded-md border px-5 py-2 text-sm font-medium">
          ログイン
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-foreground px-5 py-2 text-sm font-medium text-background"
        >
          招待コードで登録
        </Link>
      </div>
    </div>
  );
}
