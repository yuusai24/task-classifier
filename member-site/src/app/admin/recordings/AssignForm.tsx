"use client";

import { useTransition } from "react";
import type { Course, RecordingImport } from "@/types/database";
import { assignRecording, discardRecording } from "./actions";

export function AssignForm({
  recording,
  courses,
}: {
  recording: RecordingImport;
  courses: Course[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => assignRecording(recording.id, formData))}
      className="flex flex-col gap-2 rounded-lg border border-purple-200/60 bg-white/60 p-4"
    >
      <p className="text-sm font-medium">
        {recording.zoom_meeting_topic || "(タイトル不明のZoom録画)"}
      </p>
      <p className="text-xs text-zinc-500">
        取り込み日時: {new Date(recording.created_at).toLocaleString("ja-JP")}
      </p>
      <div className="flex flex-wrap gap-2">
        <select name="course_id" required className="rounded-md border px-3 py-2 text-sm">
          <option value="">コースを選択</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <input
          name="title"
          defaultValue={recording.zoom_meeting_topic ?? ""}
          placeholder="レッスン名"
          required
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-md bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(196,148,233,0.35)] transition hover:brightness-110 disabled:opacity-50"
        >
          レッスンとして取り込む
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (confirm("この録画を破棄しますか？")) {
              startTransition(() => discardRecording(recording.id));
            }
          }}
          className="text-xs text-red-600 underline disabled:opacity-50"
        >
          破棄
        </button>
      </div>
    </form>
  );
}
