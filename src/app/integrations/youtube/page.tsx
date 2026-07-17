"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { RequireAuth } from "@/components/RequireAuth";
import { YouTubeConnectPanel } from "@/components/sns/YouTubeConnectPanel";
import { useAuth } from "@/contexts/AuthContext";

export default function YouTubeIntegrationPage() {
  const { profile } = useAuth();

  return (
    <main className="min-h-screen bg-[#0a0a12] text-white">
      <Header />
      <div className="px-4 pb-16 pt-24 sm:px-6">
        <RequireAuth>
          <p className="mb-6 text-center text-sm text-gray-500">
            <Link href="/integrations" className="text-violet-300 hover:text-white">
              ← SNS 連携一覧
            </Link>
          </p>
          {profile ? <YouTubeConnectPanel userId={profile.userId} /> : null}
        </RequireAuth>
      </div>
    </main>
  );
}
