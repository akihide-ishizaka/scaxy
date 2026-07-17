import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a12] text-white flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <Image
          src="/icons/icon-512.png"
          alt="xy"
          width={120}
          height={120}
          priority
          className="relative mb-8 rounded-3xl shadow-[0_0_60px_rgba(139,92,246,0.4)]"
        />
        <p className="relative text-xl sm:text-2xl text-violet-200/80 font-light italic mb-2">
          Videos Belong on the Map.
        </p>
        <p className="relative text-gray-400 max-w-md mb-12 text-sm sm:text-base leading-relaxed">
          ショート動画を撮影されたその場所に完全連動。
          ネオン輝くマップで、リアルな街の熱量を直感で発見しよう。
        </p>

        <div className="relative flex flex-col sm:flex-row gap-4">
          <Link
            href="/map"
            className="px-8 py-4 rounded-xl bg-linear-to-r from-violet-600 via-fuchsia-600 to-cyan-600 text-white font-bold text-lg hover:opacity-90 transition-all shadow-[0_0_40px_rgba(139,92,246,0.4)]"
          >
            マップを探索する
          </Link>
          <Link
            href="/publish"
            className="px-8 py-4 rounded-xl border border-violet-500/40 text-violet-200 font-medium hover:bg-violet-950/40 transition-colors"
          >
            ジる（投稿を公開）
          </Link>
        </div>
      </section>

      <section className="border-t border-violet-500/10 py-16 px-6">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8">
          {[
            {
              title: "軽量設計",
              desc: "動画は自社サーバーに保存しない。URLと座標のみ管理。",
            },
            {
              title: "2タップ公開",
              desc: "OAuth連携したSNSから選んで、すぐにマップにピン。",
            },
            {
              title: "ネオンマップ",
              desc: "ダークモードの妖艶な地図で、ホットスポットを可視化。",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl border border-violet-500/10 bg-violet-950/20"
            >
              <h3 className="text-violet-200 font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-gray-600 border-t border-violet-500/10">
        xy（ジィ）— SNSアグリゲーター プロトタイプ · AWS Amplify + DynamoDB + Lambda + S3
      </footer>
    </main>
  );
}
