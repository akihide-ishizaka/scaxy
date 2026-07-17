import Link from "next/link";
import type { SnsIntegrationId } from "@/lib/sns-platforms";
import { getSnsPlatform } from "@/lib/sns-platforms";
import { SnsPlatformIcon } from "@/components/sns/SnsPlatformIcon";

interface SnsLinkButtonProps {
  platformId: SnsIntegrationId;
  connected?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * 動画画面などに配置する SNS 連携ボタン。
 * 未連携時は各プラットフォームの連携画面へ遷移する。
 */
export function SnsLinkButton({
  platformId,
  connected = false,
  compact = false,
  className = "",
}: SnsLinkButtonProps) {
  const platform = getSnsPlatform(platformId);
  if (!platform) return null;

  const label = connected ? `${platform.label} 連携済み` : `${platform.label} と連携`;
  const disabled = !platform.available;

  const baseClass = compact
    ? "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium"
    : "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium";

  const stateClass = connected
    ? "border-cyan-500/40 bg-cyan-950/30 text-cyan-200"
    : disabled
      ? "border-gray-600/30 bg-gray-900/30 text-gray-500 cursor-not-allowed"
      : "border-violet-500/40 bg-violet-950/30 text-violet-200 hover:bg-violet-900/40";

  if (disabled) {
    return (
      <span className={`${baseClass} ${stateClass} ${className}`} title="準備中">
        <SnsPlatformIcon icon={platform.icon} className={compact ? "h-4 w-4" : "h-5 w-5"} />
        {platform.label}（準備中）
      </span>
    );
  }

  return (
    <Link
      href={platform.connectPath}
      className={`${baseClass} ${stateClass} transition-colors ${className}`}
    >
      <SnsPlatformIcon icon={platform.icon} className={compact ? "h-4 w-4" : "h-5 w-5"} />
      {label}
    </Link>
  );
}
