import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { AssignForm } from "./AssignForm";

export default async function AdminRecordingsPage() {
  const service = createServiceClient();
  const supabase = await createClient();

  const [{ data: recordings }, { data: courses }] = await Promise.all([
    service
      .from("recording_imports")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase.from("courses").select("*").order("position"),
  ]);

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">取り込み済み録画</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Zoomのクラウド録画が完了すると自動でVimeoにアップロードされ、ここに表示されます。カテゴリを選んでレッスンとして取り込んでください。
      </p>
      <div className="flex flex-col gap-3">
        {(recordings ?? []).map((recording) => (
          <AssignForm key={recording.id} recording={recording} courses={courses ?? []} />
        ))}
        {(recordings ?? []).length === 0 && (
          <p className="text-sm text-zinc-500">取り込み待ちの録画はありません。</p>
        )}
      </div>
    </div>
  );
}
