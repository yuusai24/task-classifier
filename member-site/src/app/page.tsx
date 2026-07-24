import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-1 text-xs font-medium tracking-wide text-fuchsia-200">
        MEMBERS ONLY
      </span>
      <h1 className="mt-6 bg-gradient-to-r from-amber-200 via-fuchsia-300 to-indigo-300 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
        会員サイト
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-300 sm:text-base">
        レッスン動画・進捗管理・お知らせ・個別セッション予約をまとめた
        <br className="hidden sm:block" />
        会員限定サイトです。
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/login"
          className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          ログイン
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-6 py-2.5 text-sm font-medium text-white shadow-[0_0_30px_rgba(217,70,239,0.35)] transition hover:brightness-110"
        >
          招待コードで登録
        </Link>
      </div>
    </div>
  );
}
