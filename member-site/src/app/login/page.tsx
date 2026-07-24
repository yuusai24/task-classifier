"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, { error: null });

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-purple-200/60 bg-white/60 p-8 backdrop-blur-sm shadow-[0_0_60px_rgba(196,148,233,0.2)]">
        <h1 className="mb-6 text-center text-2xl font-semibold text-zinc-800">ログイン</h1>
        <form action={formAction} className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder="メールアドレス"
            required
            className="rounded-lg border border-purple-200 bg-white/60 px-3 py-2 text-zinc-800 placeholder:text-zinc-500 outline-none focus:border-fuchsia-400/60"
          />
          <input
            name="password"
            type="password"
            placeholder="パスワード"
            required
            className="rounded-lg border border-purple-200 bg-white/60 px-3 py-2 text-zinc-800 placeholder:text-zinc-500 outline-none focus:border-fuchsia-400/60"
          />
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 py-2 font-medium text-white shadow-[0_0_30px_rgba(196,148,233,0.4)] transition hover:brightness-110 disabled:opacity-50"
          >
            {pending ? "ログイン中..." : "ログイン"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">
          招待コードをお持ちの方は{" "}
          <Link href="/register" className="text-purple-600 underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
