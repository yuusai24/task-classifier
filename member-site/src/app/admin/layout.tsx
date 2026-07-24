import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-purple-200/60 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link
            href="/admin"
            className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text font-semibold text-transparent"
          >
            管理画面
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-zinc-700">
            <Link href="/admin/members">会員承認</Link>
            <Link href="/admin/courses">コース</Link>
            <Link href="/admin/announcements">アナウンス</Link>
            <Link href="/admin/invite-codes">招待コード</Link>
            <Link href="/admin/booking-slots">予約枠</Link>
            <Link href="/admin/calendar-settings">カレンダー連携</Link>
            <Link href="/admin/bookings">予約一覧</Link>
            <Link href="/dashboard">会員画面へ</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
