"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, { error: null });

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm shadow-[0_0_60px_rgba(168,85,247,0.15)]">
        <h1 className="mb-6 text-center text-2xl font-semibold text-white">ログイン</h1>
        <form action={formAction} className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder="メールアドレス"
            required
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white placeholder:text-zinc-500 outline-none focus:border-fuchsia-400/60"
          />
          <input
            name="password"
            type="password"
            placeholder="パスワード"
            required
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white placeholder:text-zinc-500 outline-none focus:border-fuchsia-400/60"
          />
          {state.error && <p className="text-sm text-red-400">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-indigo-500 py-2 font-medium text-white shadow-[0_0_30px_rgba(217,70,239,0.35)] transition hover:brightness-110 disabled:opacity-50"
          >
            {pending ? "ログイン中..." : "ログイン"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-400">
          招待コードをお持ちの方は{" "}
          <Link href="/register" className="text-fuchsia-300 underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
