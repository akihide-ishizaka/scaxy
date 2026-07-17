"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { RequireAuth } from "@/components/RequireAuth";
import { SnsPlatformCard } from "@/components/sns/SnsPlatformCard";
import { useAuth } from "@/contexts/AuthContext";
import { readSnsConnection } from "@/lib/sns-connections";
import { SNS_PLATFORMS } from "@/lib/sns-platforms";

function IntegrationsHub() {
  const { profile } = useAuth();
  const userId = profile?.userId ?? "";

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-violet-100">SNS 連携</h1>
        <p className="mt-1 text-sm text-gray-400">
          本人の SNS アカウントを連携して、マップ公開や動画連携の対象にします。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SNS_PLATFORMS.map((platform) => {
          const connection =
            platform.platform && userId
              ? readSnsConnection(userId, platform.platform)
              : null;

          return (
            <SnsPlatformCard
              key={platform.id}
              platform={platform}
              connected={!!connection}
              handle={connection?.platformHandle}
            />
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-gray-500">
        <Link href="/map" className="text-violet-300 hover:text-white">
          ← マップに戻る
        </Link>
      </p>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a12] text-white">
      <Header />
      <div className="px-4 pb-16 pt-24 sm:px-6">
        <RequireAuth>
          <IntegrationsHub />
        </RequireAuth>
      </div>
    </main>
  );
}
