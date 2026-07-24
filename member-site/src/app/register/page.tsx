"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerWithInviteCode } from "./actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerWithInviteCode, {
    error: null,
  });

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-purple-200/60 bg-white/60 p-8 backdrop-blur-sm shadow-[0_0_60px_rgba(196,148,233,0.2)]">
        <h1 className="mb-6 text-center text-2xl font-semibold text-zinc-800">会員登録</h1>
        <form action={formAction} className="flex flex-col gap-4">
          <input
            name="invite_code"
            placeholder="招待コード"
            required
            className="rounded-lg border border-purple-200 bg-white/60 px-3 py-2 text-zinc-800 placeholder:text-zinc-500 outline-none focus:border-fuchsia-400/60"
          />
          <input
            name="display_name"
            placeholder="お名前"
            className="rounded-lg border border-purple-200 bg-white/60 px-3 py-2 text-zinc-800 placeholder:text-zinc-500 outline-none focus:border-fuchsia-400/60"
          />
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
            placeholder="パスワード（8文字以上）"
            required
            minLength={8}
            className="rounded-lg border border-purple-200 bg-white/60 px-3 py-2 text-zinc-800 placeholder:text-zinc-500 outline-none focus:border-fuchsia-400/60"
          />
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 py-2 font-medium text-white shadow-[0_0_30px_rgba(196,148,233,0.4)] transition hover:brightness-110 disabled:opacity-50"
          >
            {pending ? "登録中..." : "登録する"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="text-purple-600 underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
