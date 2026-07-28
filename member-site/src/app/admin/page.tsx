import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const [{ count: members }, { count: courses }, { count: pendingBookings }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase
      .from("session_bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "requested"),
  ]);

  const cards = [
    { label: "会員数", value: members ?? 0, href: "/admin" },
    { label: "カテゴリ数", value: courses ?? 0, href: "/admin/courses" },
    { label: "未確定の予約", value: pendingBookings ?? 0, href: "/admin/bookings" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <Link key={c.label} href={c.href} className="rounded-lg border border-purple-200/60 bg-white/60 p-4">
          <p className="text-sm text-zinc-500">{c.label}</p>
          <p className="mt-1 text-2xl font-semibold">{c.value}</p>
        </Link>
      ))}
    </div>
  );
}
