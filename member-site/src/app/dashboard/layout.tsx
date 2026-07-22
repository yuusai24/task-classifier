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

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="font-semibold">
            会員サイト
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard">コース</Link>
            <Link href="/dashboard/booking">個別セッション</Link>
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
        {children}
      </main>
    </div>
  );
}
