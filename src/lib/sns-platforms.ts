import type { SnsPlatform } from "@/lib/types";

export type SnsIntegrationId = Lowercase<SnsPlatform> | "x";

export interface SnsPlatformDefinition {
  id: SnsIntegrationId;
  platform: SnsPlatform | null;
  label: string;
  description: string;
  connectPath: string;
  available: boolean;
  comingSoon?: boolean;
  accentClass: string;
  icon: "youtube" | "instagram" | "x";
}

/** SNS 連携プラットフォーム定義（動画画面の連携ボタンでも再利用） */
export const SNS_PLATFORMS: SnsPlatformDefinition[] = [
  {
    id: "youtube",
    platform: "YOUTUBE",
    label: "YouTube",
    description: "Shorts を本人アカウントから取得してマップに公開",
    connectPath: "/integrations/youtube",
    available: true,
    accentClass: "from-red-600/20 to-red-900/10 border-red-500/30",
    icon: "youtube",
  },
  {
    id: "instagram",
    platform: "INSTAGRAM",
    label: "Instagram",
    description: "Reels を本人アカウントから取得（プロアカウント必須）",
    connectPath: "/integrations/instagram",
    available: false,
    comingSoon: true,
    accentClass: "from-fuchsia-600/20 to-pink-900/10 border-fuchsia-500/30",
    icon: "instagram",
  },
  {
    id: "x",
    platform: null,
    label: "X",
    description: "動画投稿との連携（準備中）",
    connectPath: "/integrations/x",
    available: false,
    comingSoon: true,
    accentClass: "from-gray-600/20 to-gray-900/10 border-gray-500/30",
    icon: "x",
  },
];

export function getSnsPlatform(id: SnsIntegrationId) {
  return SNS_PLATFORMS.find((p) => p.id === id);
}
