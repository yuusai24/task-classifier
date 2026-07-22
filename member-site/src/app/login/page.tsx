"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, { error: null });

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-6">ログイン</h1>
        <form action={formAction} className="flex flex-col gap-4">
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
            placeholder="パスワード"
            required
            className="rounded-md border px-3 py-2"
          />
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-foreground text-background py-2 font-medium disabled:opacity-50"
          >
            {pending ? "ログイン中..." : "ログイン"}
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-zinc-500">
          招待コードをお持ちの方は{" "}
          <Link href="/register" className="underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
