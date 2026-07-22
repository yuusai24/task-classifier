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
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-6">会員登録</h1>
        <form action={formAction} className="flex flex-col gap-4">
          <input
            name="invite_code"
            placeholder="招待コード"
            required
            className="rounded-md border px-3 py-2"
          />
          <input
            name="display_name"
            placeholder="お名前"
            className="rounded-md border px-3 py-2"
          />
          <input
            name="email"
            type="email"
            placeholder="メールアドレス"
            required
            className="rounded-md border px-3 py-2"
          />
          <input
            name="password"
            type="password"
            placeholder="パスワード（8文字以上）"
            required
            minLength={8}
            className="rounded-md border px-3 py-2"
          />
          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-foreground text-background py-2 font-medium disabled:opacity-50"
          >
            {pending ? "登録中..." : "登録する"}
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-zinc-500">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
