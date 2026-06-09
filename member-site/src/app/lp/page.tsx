export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #e8f4fd 0%, #c9e8f8 30%, #f5f0e8 70%, #f0ebe0 100%)",
          minHeight: "100vh",
        }}
      >
        {/* Sky background decoration */}
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

          {/* Decorative divider */}
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
                textShadow: "none",
                filter: "drop-shadow(0 2px 4px rgba(180,140,0,0.3))",
              }}
            >
              卒業する
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              オープンカレッジ
            </h2>
          </div>

          {/* Sub badge */}
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

          {/* Sub headline */}
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
          <div className="grid grid-cols-2 gap-4 mb-8">
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

          {/* CTA Section */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.6)" }}
          >
            {/* Decorative top */}
            <div className="flex items-center justify-center gap-2 mb-3 text-amber-600 text-xs">
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
                <div className="text-xs font-bold">来月</div>
                <div className="text-3xl font-black leading-none">1日</div>
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
                <span>オープンチャット無料参加はこちら</span>
                <span
                  className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0"
                  style={{ color: "#b5385e" }}
                >
                  ›
                </span>
              </a>
            </div>

            {/* Sub features */}
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
    </div>
  );
}
