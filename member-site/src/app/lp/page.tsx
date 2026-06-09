export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #e8f4fd 0%, #c9e8f8 30%, #f5f0e8 70%, #f0ebe0 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 20%, rgba(135,206,235,0.4) 0%, transparent 60%), radial-gradient(ellipse at 80% 10%, rgba(255,255,255,0.8) 0%, transparent 40%)",
          }}
        />

        <div className="relative z-10 max-w-sm mx-auto px-4 pt-8 pb-12">
          {/* Top tagline */}
          <p className="text-center text-gray-700 text-sm mb-6 leading-relaxed">
            頑張るほど
            <span className="text-rose-500 font-semibold">空回りする</span>
            ビジネスから卒業しよう。
          </p>

          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px w-16 bg-amber-400" />
            <div className="text-amber-400 text-xs">∞</div>
            <div className="h-px w-16 bg-amber-400" />
          </div>

          {/* Main headline */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              がむしゃらビジネスを
            </h1>
            <div
              className="text-5xl font-black mb-1 leading-none"
              style={{
                background: "linear-gradient(135deg, #c9a227 0%, #f0c040 40%, #c9a227 70%, #8b6914 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 2px 4px rgba(180,140,0,0.3))",
              }}
            >
              卒業する
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              オープンカレッジ
            </h2>
          </div>

          <div className="flex justify-center mb-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-semibold text-amber-100"
              style={{
                background: "linear-gradient(90deg, #2c1a0e 0%, #5c3a1a 50%, #2c1a0e 100%)",
              }}
            >
              <span className="text-amber-300">✦</span>
              般若心経 × ビジネス哲学
              <span className="text-amber-300">✦</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-gray-800 text-lg leading-relaxed">
              毎日の
              <span className="text-rose-500 font-semibold">心の使い方</span>
              で
            </p>
            <p className="text-gray-800 text-lg leading-relaxed flex items-center justify-center gap-1">
              <span className="text-amber-400 text-sm">✦</span>
              現実は変わり始める
              <span className="text-amber-400 text-sm">✦</span>
            </p>
          </div>

          {/* Feature icons */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {[
              {
                icon: "📖",
                text: (
                  <>
                    般若心経を
                    <br />
                    わかりやすく
                    <br />
                    学べる
                  </>
                ),
              },
              {
                icon: "📈",
                text: (
                  <>
                    経営・お金・
                    <br />
                    人間関係に
                    <br />
                    活かせる
                  </>
                ),
              },
              {
                icon: "❤️",
                text: (
                  <>
                    不安や執着を
                    <br />
                    手放して
                    <br />
                    心が軽くなる
                  </>
                ),
              },
              {
                icon: "👥",
                text: (
                  <>
                    受講生と一緒に
                    <br />
                    深め合える
                    <br />
                    安心の場
                  </>
                ),
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center text-center py-5 px-3 rounded-full text-sm text-gray-700 leading-relaxed"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1.5px solid #c9a227",
                  aspectRatio: "1",
                }}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-xs leading-relaxed">{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <CtaBlock />
        </div>

        {/* Bottom dark bar */}
        <div
          className="relative z-10 py-3 text-center"
          style={{ background: "#1a0a05" }}
        >
          <p className="text-amber-400 text-sm flex items-center justify-center gap-2">
            <span>✦</span>
            心を整え、経営を整え、人生を軽くする新しい学びの時間
            <span>✦</span>
          </p>
        </div>
      </section>

      {/* Worries Section */}
      <section className="bg-white max-w-sm mx-auto px-4 py-12">
        <h2 className="text-center text-xl font-bold text-gray-800 mb-2">
          こんなお悩み、
        </h2>
        <h2 className="text-center text-xl font-bold text-gray-800 mb-8">
          ありませんか？
        </h2>

        <div className="space-y-4">
          {[
            "頑張っているのに、なぜか結果が出ない",
            "お金や集客への不安がいつも頭から離れない",
            "人間関係のストレスでエネルギーを消耗している",
            "「もっと頑張らなきゃ」と自分を追い込んでしまう",
            "「私には無理かも」と半分諦めかけている",
            "ビジネスの軸が定まらず、迷い続けている",
          ].map((worry, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #fdf6f0 0%, #faf0f5 100%)",
                border: "1px solid #f0d8d0",
              }}
            >
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5"
                style={{ background: "#b5385e" }}
              >
                ✓
              </span>
              <p className="text-gray-700 text-sm leading-relaxed">{worry}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Voices Section */}
      <section
        className="py-12"
        style={{ background: "linear-gradient(180deg, #fdf8f0 0%, #f8f0f5 100%)" }}
      >
        <div className="max-w-sm mx-auto px-4">
          <p className="text-center text-amber-600 text-xs font-semibold tracking-widest mb-2">
            まず、この変化を見てください
          </p>
          <h2 className="text-center text-xl font-bold text-gray-800 mb-2 leading-relaxed">
            オープンカレッジに参加した
          </h2>
          <p className="text-center text-gray-600 text-sm mb-8 leading-relaxed">
            受講生の実際のビジネス・心の変化です
          </p>

          <div className="space-y-5">
            {[
              {
                num: "01",
                text: "般若心経を学んでから売上が1.5倍に。執着を手放したら逆にお客様が来るようになった。",
              },
              {
                num: "02",
                text: "毎朝の心の習慣で不安がなくなり、チームとの関係が劇的に改善しました。",
              },
              {
                num: "03",
                text: "「頑張らなきゃ」から「ゆだねる」に変わって月収7桁が安定してきた。",
              },
              {
                num: "04",
                text: "経営判断に迷わなくなった。心の軸ができた感覚が一番の変化です。",
              },
            ].map((voice) => (
              <div
                key={voice.num}
                className="rounded-2xl p-5"
                style={{
                  background: "white",
                  boxShadow: "0 2px 16px rgba(181,56,94,0.08)",
                  border: "1px solid #f0d8e0",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-xs font-bold tracking-widest"
                    style={{ color: "#b5385e" }}
                  >
                    VOICE
                  </span>
                  <span
                    className="text-2xl font-black leading-none"
                    style={{
                      background: "linear-gradient(135deg, #c9a227, #f0c040)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {voice.num}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{voice.text}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 text-xs mt-6">
            ※個人の感想であり、成果を保証するものではありません
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white max-w-sm mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, #c9a227)" }} />
          <span className="text-amber-600 text-sm font-bold whitespace-nowrap">参加特典</span>
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, #c9a227, transparent)" }} />
        </div>

        <div className="space-y-3">
          {[
            { num: "1", icon: "🎁", title: "早期申し込み特典", desc: "通常3,300円が無料" },
            { num: "2", icon: "💬", title: "オープンチャット招待", desc: "コミュニティへご招待" },
            { num: "3", icon: "📜", title: "般若心経解説資料プレゼント", desc: "わかりやすい入門資料" },
            { num: "4", icon: "🎬", title: "見逃し配信", desc: "いつでも復習できる" },
            { num: "5", icon: "🙋", title: "友彩へ質問", desc: "直接質問できる特典" },
          ].map((benefit) => (
            <div
              key={benefit.num}
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #fdf8f0 0%, #fff8fc 100%)",
                border: "1px solid #e8d8b0",
              }}
            >
              <div
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black"
                style={{
                  background: "linear-gradient(135deg, #c9a227 0%, #f0c040 100%)",
                }}
              >
                特典{benefit.num}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 text-sm font-semibold">{benefit.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{benefit.desc}</p>
              </div>
              <span className="text-xl">{benefit.icon}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        className="py-12"
        style={{ background: "linear-gradient(180deg, #f8f0f5 0%, #fdf8f0 100%)" }}
      >
        <div className="max-w-sm mx-auto px-4">
          <p className="text-center text-gray-700 text-sm mb-6 leading-relaxed">
            一緒に学んで、軽やかな未来へ
          </p>
          <CtaBlock />
        </div>
      </section>

      {/* Footer bar */}
      <div
        className="py-3 text-center"
        style={{ background: "#1a0a05" }}
      >
        <p className="text-amber-400 text-sm flex items-center justify-center gap-2">
          <span>✦</span>
          心を整え、経営を整え、人生を軽くする新しい学びの時間
          <span>✦</span>
        </p>
      </div>
    </div>
  );
}

function CtaBlock() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.85)", border: "1px solid #e8d8b0" }}
    >
      <div className="flex items-center justify-center gap-2 mb-4 text-amber-600 text-xs">
        <span>❧</span>
        <span>一緒に学んで、軽やかな未来へ</span>
        <span>❧</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Start date badge */}
        <div
          className="flex-shrink-0 w-20 h-20 rounded-full flex flex-col items-center justify-center text-white"
          style={{
            background: "linear-gradient(135deg, #b5385e 0%, #8b1a3a 100%)",
            border: "2px solid #c9a227",
            boxShadow: "0 0 0 3px rgba(201,162,39,0.3)",
          }}
        >
          <div className="text-xs font-bold leading-tight">7月21日</div>
          <div className="text-2xl font-black leading-none">▶</div>
          <div className="text-xs font-bold">START!</div>
        </div>

        {/* CTA button */}
        <a
          href="#"
          className="flex-1 flex items-center justify-between px-4 py-4 rounded-full text-white font-bold text-sm transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #b5385e 0%, #8b1a3a 100%)",
          }}
        >
          <span className="leading-tight">オープンチャット<br />無料参加はこちら</span>
          <span
            className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-base font-bold"
            style={{ color: "#b5385e" }}
          >
            ›
          </span>
        </a>
      </div>

      <div className="flex items-center justify-center gap-3 mt-3 text-gray-600 text-xs">
        <span className="flex items-center gap-1">
          <span>💬</span> 見るだけOK
        </span>
        <span className="flex items-center gap-1">
          <span>📱</span> スマホで簡単参加
        </span>
        <span className="flex items-center gap-1">
          <span>❤️</span> 途中入室・退室自由
        </span>
      </div>
    </div>
  );
}
