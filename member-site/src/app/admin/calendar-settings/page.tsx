import { createServiceClient } from "@/lib/supabase/service";
import { hasZoomCredentials } from "@/lib/zoom";
import { updateBookingSettings } from "./actions";
import { DisconnectButton, SyncNowButton } from "./Controls";

export default async function CalendarSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ google_connected?: string; google_error?: string }>;
}) {
  const { google_connected, google_error } = await searchParams;
  const service = createServiceClient();

  const [{ data: connection }, { data: settings }] = await Promise.all([
    service.from("google_calendar_connection").select("*").eq("id", true).maybeSingle(),
    service.from("booking_settings").select("*").eq("id", true).single(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">予約枠の自動連携</h1>

      {google_connected && (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Googleカレンダーと連携しました。
        </p>
      )}
      {google_error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          連携に失敗しました。もう一度お試しください。
        </p>
      )}

      <section className="mb-8 rounded-lg border border-purple-200/60 bg-white/60 p-4">
        <h2 className="mb-3 font-medium">Googleカレンダー連携</h2>
        {connection ? (
          <div className="flex items-center justify-between text-sm">
            <p className="text-zinc-600">
              連携中: <span className="text-zinc-800">{connection.connected_email ?? "(メール取得不可)"}</span>
            </p>
            <DisconnectButton />
          </div>
        ) : (
          <div className="flex items-center justify-between text-sm">
            <p className="text-zinc-500">まだ連携されていません。</p>
            <a
              href="/api/google/connect"
              className="rounded-md bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(196,148,233,0.35)] transition hover:brightness-110"
            >
              Googleカレンダーと連携する
            </a>
          </div>
        )}
      </section>

      <section className="mb-8 rounded-lg border border-purple-200/60 bg-white/60 p-4">
        <h2 className="mb-3 font-medium">稼働時間の設定</h2>
        <form action={updateBookingSettings} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              開始時刻（時）
              <input
                name="weekday_start_hour"
                type="number"
                min={0}
                max={23}
                defaultValue={settings?.weekday_start_hour ?? 10}
                className="rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              終了時刻（時）
              <input
                name="weekday_end_hour"
                type="number"
                min={0}
                max={24}
                defaultValue={settings?.weekday_end_hour ?? 18}
                className="rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              1枠の長さ（分）
              <input
                name="slot_duration_minutes"
                type="number"
                min={15}
                step={15}
                defaultValue={settings?.slot_duration_minutes ?? 60}
                className="rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              何週間先まで
              <input
                name="sync_weeks_ahead"
                type="number"
                min={1}
                max={12}
                defaultValue={settings?.sync_weeks_ahead ?? 4}
                className="rounded-md border px-3 py-2 text-sm"
              />
            </label>
          </div>
          <p className="text-xs text-zinc-500">
            平日（月〜金）の指定時間帯を、{settings?.slot_duration_minutes ?? 60}
            分刻みで予約可能枠にします。すでにGoogleカレンダーで予定が入っている時間は自動で除外されます。
          </p>
          <button
            type="submit"
            className="self-start rounded-md bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(196,148,233,0.35)] transition hover:brightness-110"
          >
            設定を保存
          </button>
        </form>
      </section>

      <section className="mb-8 rounded-lg border border-purple-200/60 bg-white/60 p-4">
        <h2 className="mb-3 font-medium">同期</h2>
        <p className="mb-3 text-sm text-zinc-500">
          毎日自動で同期されますが、設定を変えた直後などはここから今すぐ反映できます。
        </p>
        <SyncNowButton />
      </section>

      <section className="rounded-lg border border-purple-200/60 bg-white/60 p-4">
        <h2 className="mb-3 font-medium">Zoom連携</h2>
        <p className="text-sm text-zinc-500">
          {hasZoomCredentials()
            ? "Zoom連携が設定されています。予約が入ると自動でZoom URLが発行されます。"
            : "Zoom連携が未設定です。Vercelの環境変数（ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET）を設定してください。"}
        </p>
      </section>
    </div>
  );
}
