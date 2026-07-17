"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { RequireAuth } from "@/components/RequireAuth";

function YouTubeOAuthCallbackContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-violet-500/20 bg-[#0d0d18]/85 p-6 text-center">
      {error ? (
        <>
          <h1 className="text-xl font-bold text-red-300">連携に失敗しました</h1>
          <p className="mt-2 text-sm text-gray-400">{error}</p>
        </>
      ) : code ? (
        <>
          <h1 className="text-xl font-bold text-violet-100">認証コードを受信しました</h1>
          <p className="mt-2 text-sm text-gray-400">
            サーバー側のトークン交換 API 実装後、ここで連携が完了します。
          </p>
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold text-violet-100">コールバック待機中</h1>
          <p className="mt-2 text-sm text-gray-400">
            OAuth フローから戻ってきた場合に処理されます。
          </p>
        </>
      )}
      <Link
        href="/integrations/youtube"
        className="mt-6 inline-block rounded-xl border border-violet-500/40 px-5 py-2.5 text-sm text-violet-200 hover:bg-violet-950/40"
      >
        YouTube 連携画面に戻る
      </Link>
    </div>
  );
}

/** YouTube OAuth コールバック（プレースホルダ） */
export default function YouTubeOAuthCallbackPage() {
  return (
    <main className="min-h-screen bg-[#0a0a12] text-white">
      <Header />
      <div className="px-4 pb-16 pt-24 sm:px-6">
        <RequireAuth>
          <Suspense fallback={<p className="text-center text-gray-400">処理中...</p>}>
            <YouTubeOAuthCallbackContent />
          </Suspense>
        </RequireAuth>
      </div>
    </main>
  );
}
