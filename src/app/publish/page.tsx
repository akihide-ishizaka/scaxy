"use client";

import Image from "next/image";
import Link from "next/link";
import { PublishPanel } from "@/components/PublishPanel";
import { RequireAuth } from "@/components/RequireAuth";

export default function PublishPage() {
  return (
    <main className="min-h-screen bg-[#0a0a12] text-white">
      <header className="border-b border-violet-500/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/icons/icon-192.png"
            alt="xy"
            width={28}
            height={28}
            className="rounded-md"
          />
        </Link>
        <Link
          href="/map"
          className="text-sm text-violet-300 hover:text-white transition-colors"
        >
          ← マップに戻る
        </Link>
      </header>
      <RequireAuth>
        <div className="px-6 py-12">
          <PublishPanel />
        </div>
      </RequireAuth>
    </main>
  );
}
