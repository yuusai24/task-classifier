import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <span className="rounded-full border border-purple-300 bg-purple-100 px-4 py-1 text-xs font-medium tracking-wide text-purple-700">
        MEMBERS ONLY
      </span>
      <h1 className="mt-6 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
        会員サイト
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-600 sm:text-base">
        レッスン動画・進捗管理・お知らせ・個別セッション予約をまとめた
        <br className="hidden sm:block" />
        会員限定サイトです。
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/login"
          className="rounded-full border border-purple-300 px-6 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-purple-50"
        >
          ログイン
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-gradient-to-r from-purple-400 to-pink-400 px-6 py-2.5 text-sm font-medium text-white shadow-[0_0_30px_rgba(196,148,233,0.4)] transition hover:brightness-110"
        >
          招待コードで登録
        </Link>
      </div>
    </div>
  );
}
