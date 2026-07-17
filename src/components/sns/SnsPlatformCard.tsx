import Link from "next/link";
import type { SnsPlatformDefinition } from "@/lib/sns-platforms";
import { SnsPlatformIcon } from "@/components/sns/SnsPlatformIcon";

interface SnsPlatformCardProps {
  platform: SnsPlatformDefinition;
  connected?: boolean;
  handle?: string | null;
}

export function SnsPlatformCard({
  platform,
  connected = false,
  handle,
}: SnsPlatformCardProps) {
  const content = (
    <div
      className={`rounded-2xl border bg-linear-to-br p-5 transition-all ${platform.accentClass} ${
        platform.available
          ? "hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]"
          : "opacity-70"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <SnsPlatformIcon icon={platform.icon} className="h-9 w-9 shrink-0" />
          <div>
            <h2 className="text-lg font-semibold text-white">{platform.label}</h2>
            {connected && handle ? (
              <p className="text-sm text-cyan-300">{handle}</p>
            ) : platform.comingSoon ? (
              <p className="text-xs text-gray-500">準備中</p>
            ) : (
              <p className="text-xs text-gray-500">未連携</p>
            )}
          </div>
        </div>
        {connected ? (
          <span className="rounded-full border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-1 text-xs text-cyan-200">
            連携済み
          </span>
        ) : platform.comingSoon ? (
          <span className="rounded-full border border-gray-600/40 bg-gray-900/40 px-2.5 py-1 text-xs text-gray-400">
            Soon
          </span>
        ) : null}
      </div>

      <p className="text-sm text-gray-400">{platform.description}</p>

      {platform.available && (
        <p className="mt-4 text-sm font-medium text-violet-200">
          {connected ? "設定を開く →" : "連携する →"}
        </p>
      )}
    </div>
  );

  if (!platform.available) {
    return content;
  }

  return (
    <Link href={platform.connectPath} className="block">
      {content}
    </Link>
  );
}
