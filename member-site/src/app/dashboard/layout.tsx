import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isApproved = profile?.role === "admin" || profile?.is_approved === true;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-purple-200/60 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text font-semibold text-transparent"
          >
            会員サイト
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-700">
            {isApproved && <Link href="/dashboard">コース</Link>}
            {isApproved && <Link href="/dashboard/booking">個別セッション</Link>}
            {profile?.role === "admin" && <Link href="/admin">管理画面</Link>}
            <span className="text-zinc-500">
              {profile?.display_name || user.email}
            </span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="underline">
                ログアウト
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {isApproved ? (
          children
        ) : (
          <div className="rounded-2xl border border-purple-200/60 bg-white/60 p-6 text-center backdrop-blur-sm">
            <p className="font-medium text-zinc-800">承認待ちです</p>
            <p className="mt-2 text-sm text-zinc-500">
              管理者が登録内容を確認後、ご利用いただけるようになります。しばらくお待ちください。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
