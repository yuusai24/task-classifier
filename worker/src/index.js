export default {
  async scheduled(event, env, ctx) {
    let messageType;
    if (event.cron === "0 0 28 * *") messageType = "monthly";
    else if (event.cron === "0 0 * * 1") messageType = "monday";
    else if (event.cron === "0 0 * * 3") messageType = "wednesday";
    else if (event.cron === "0 0 * * 5") messageType = "friday";
    else return;

    const students = await env.DB.prepare("SELECT * FROM students").all();

    for (const student of students.results) {
      const feedback = await generateFeedback(student, messageType, env.ANTHROPIC_API_KEY);
      await sendLine(student.id, feedback, env.LINE_CHANNEL_ACCESS_TOKEN);
      await env.DB.prepare(
        "UPDATE students SET last_feedback_at = ? WHERE id = ?"
      ).bind(new Date().toISOString(), student.id).run();
    }
  }
};

async function generateFeedback(student, messageType, apiKey) {
  const typePrompts = {
    monday: `月曜日のマインドセットメッセージを送ります。今週も頑張れる気持ちになれるよう、受講生の仕事・状況を踏まえた前向きな言葉と、今週意識してほしいことを1つ伝えてください。`,
    wednesday: `水曜日の中間チェックインメッセージを送ります。「今どんな感じ？」という雰囲気で、今週の半分を過ごした受講生に寄り添い、状況を聞きながら励ます内容にしてください。`,
    friday: `金曜日の週間お疲れさまメッセージを送ります。今週1週間を労い、受講生の成長を認め、週末をゆっくり過ごしてほしいという温かい内容にしてください。`,
    monthly: `月末の振り返りレポートをお願いするメッセージを送ります。以下の5項目を返信してもらえるようにお願いしてください。温かく、負担にならない雰囲気で伝えてください。
①うまくいったこと
②うまくいかなかったこと
③今月の感謝額（売り上げ）
④今月叶ったこと
⑤来月実行すること`
  };

  const prompt = `あなたは女性起業家・副業ママのビジネスコーチ「友彩（ゆうさい）」のAIアシスタントです。
受講生へのLINEメッセージを作成してください。

【ルール】
- 200〜300文字以内
- 受講生の仕事・状況を具体的に言及する
- 自然な関西弁を混ぜる（「やで」「やね」程度）
- 個人の家族状況などは文中に書かない
- 締めは温かい言葉で終わる

【メッセージの種類】
${typePrompts[messageType]}

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
