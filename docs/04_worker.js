export default {
  async scheduled(event, env, ctx) {
    const students = await env.DB.prepare("SELECT * FROM students").all();

    for (const student of students.results) {
      const feedback = await generateFeedback(student, env.ANTHROPIC_API_KEY);
      await sendLine(student.id, feedback, env.LINE_CHANNEL_ACCESS_TOKEN);
      await env.DB.prepare(
        "UPDATE students SET last_feedback_at = ? WHERE id = ?"
      ).bind(new Date().toISOString(), student.id).run();
    }
  }
};

async function generateFeedback(student, apiKey) {
  const prompt = `あなたは女性起業家・副業ママのビジネスコーチ「友彩（ゆうさい）」のAIアシスタントです。
受講生へのLINEフィードバックメッセージを作成してください。

【ルール】
- 200〜300文字以内
- 受講生の仕事・状況を具体的に言及する
- 自然な関西弁を混ぜる（「やで」「やね」程度）
- 個人の家族状況などは文中に書かない
- 来週の小さなアクションを1つ提案する
- 締めは「応援してるよ」系で終わる

【受講生情報】
仮名: ${student.name}
入会日: ${student.joined_at}
現在のステージ: ${student.current_stage}
進捗率: ${student.progress}%
仕事・肩書き: ${student.job}
最近の状況: ${student.notes}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await res.json();
  return data.content[0].text;
}

async function sendLine(userId, message, token) {
  await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text: message }]
    })
  });
}
