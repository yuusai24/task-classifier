/**
 * 友彩（ゆうさい）受講生フィードバック Worker
 * - LINE webhook で返信を受信 → D1 に蓄積
 * - 週次 Cron で受講生ごとに個別フィードバックを LINE 配信
 */

const LINE_API = "https://api.line.me/v2/bot/message/push";

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("OK");
    const body = await request.json();
    const events = body.events ?? [];

    for (const event of events) {
      if (event.type === "message" && event.message?.type === "text") {
        await saveReply(env, event.source.userId, event.message.text);
      }
    }
    return new Response("OK");
  },

  async scheduled(event, env) {
    await sendWeeklyFeedback(env);
  },
};

async function saveReply(env, lineUserId, text) {
  const student = await env.DB.prepare(
    "SELECT id FROM students WHERE line_user_id = ?"
  ).bind(lineUserId).first();

  if (!student) return;

  await env.DB.prepare(
    "INSERT INTO reply_logs (student_id, reply_text) VALUES (?, ?)"
  ).bind(student.id, text).run();
}

async function sendWeeklyFeedback(env) {
  const students = await env.DB.prepare(
    "SELECT * FROM students"
  ).all();

  for (const student of students.results) {
    const replies = await env.DB.prepare(`
      SELECT reply_text, received_at FROM reply_logs
      WHERE student_id = ? AND used_in_feedback = 0
      ORDER BY received_at DESC LIMIT 5
    `).bind(student.id).all();

    const replyTexts = replies.results.map(r => r.reply_text);
    const feedback = await generateFeedback(env, student, replyTexts);

    await pushLine(env, student.line_user_id, feedback);

    await env.DB.prepare(
      "UPDATE reply_logs SET used_in_feedback = 1 WHERE student_id = ? AND used_in_feedback = 0"
    ).bind(student.id).run();

    await env.DB.prepare(
      "UPDATE students SET last_feedback_at = datetime('now') WHERE id = ?"
    ).bind(student.id).run();
  }
}

async function generateFeedback(env, student, replyTexts) {
  const replyContext = replyTexts.length > 0
    ? `【先週の返信内容】\n${replyTexts.map((t, i) => `${i + 1}. ${t}`).join("\n")}`
    : "【先週の返信】なし（初回または返信なし）";

  const prompt = `あなたは友彩（ゆうさい）さんの言葉・思想を完全に体得した影武者AIです。
受講生への週次LINEメッセージを友彩さんとして書いてください。

【受講生情報】
- お名前（仮名）: ${student.name}
- 入会日: ${student.joined_at}
- 守護霊: ${student.guardian_spirit || "未設定"}
- メモ: ${student.notes || "なし"}

${replyContext}

【友彩さんの思想5軸】
1. 在り方最優先 — 内側が整わないと外側は動かない
2. 自己責任・引き寄せ — 望まない現実はすべて自分が引き寄せている
3. 感情の言語化 — ざわつきに気づいたら「なぜ？」を丁寧に見る
4. 愛への変換 — マイナス評価を愛に変換するとお金の循環が変わる
5. 行動の継続 — やった人だけが体感できる

【頻出口癖】
在り方を整える / 気づきがすべての始まり / 感情に蓋をしない / 花丸をつけてあげて

【厳守ルール】
- 進捗率・達成率・パーセントは絶対に使わない
- 無理やりポジティブにしない（エセポジティブNG）
- 先週の返信内容があれば、その言葉を受け止めてから始める
- 守護霊への感謝・つながりに軽く触れてもよい
- 200〜300文字以内
- 語尾: 〜してみて / 〜しよう / 〜だから / 〜なんです
- 絵文字1〜2個まで

受講生への今週のLINEメッセージを書いてください。`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  return data.content[0].text.trim();
}

async function pushLine(env, lineUserId, text) {
  await fetch(LINE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [{ type: "text", text }],
    }),
  });
}
