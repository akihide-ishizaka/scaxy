import type { Pin } from "./types";

/** バックエンド未接続時のデモ用ピンデータ（東京周辺） */
export const DEMO_PINS: Pin[] = [
  {
    id: "demo-1",
    userId: "user-1",
    platform: "INSTAGRAM",
    sourceUrl: "https://www.instagram.com/reel/demo1/",
    platformMediaId: "demo1",
    captionSnippet: "渋谷スクランブル交差点の夜景リール",
    latitude: 35.6595,
    longitude: 139.7004,
    status: "ACTIVE",
    reportCount: 0,
    clickCount: 142,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    author: {
      displayName: "neon_wanderer",
      handle: "@neon_wanderer",
      avatarUrl: null,
    },
  },
  {
    id: "demo-2",
    userId: "user-2",
    platform: "YOUTUBE",
    sourceUrl: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    platformMediaId: "dQw4w9WgXcQ",
    captionSnippet: "原宿竹下通りを歩くShorts",
    latitude: 35.6717,
    longitude: 139.7036,
    status: "ACTIVE",
    reportCount: 0,
    clickCount: 89,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    author: {
      displayName: "tokyo_vibes",
      handle: "@tokyo_vibes",
      avatarUrl: null,
    },
  },
  {
    id: "demo-3",
    userId: "user-3",
    platform: "INSTAGRAM",
    sourceUrl: "https://www.instagram.com/reel/demo3/",
    platformMediaId: "demo3",
    captionSnippet: "東京タワーからの夕焼け",
    latitude: 35.6586,
    longitude: 139.7454,
    status: "ACTIVE",
    reportCount: 0,
    clickCount: 256,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    author: {
      displayName: "skyline_ja",
      handle: "@skyline_ja",
      avatarUrl: null,
    },
  },
  {
    id: "demo-4",
    userId: "user-4",
    platform: "YOUTUBE",
    sourceUrl: "https://www.youtube.com/shorts/demo4vid",
    platformMediaId: "demo4vid",
    captionSnippet: "浅草寺の朝の様子",
    latitude: 35.7148,
    longitude: 139.7967,
    status: "ACTIVE",
    reportCount: 0,
    clickCount: 67,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    author: {
      displayName: "asakusa_walk",
      handle: "@asakusa_walk",
      avatarUrl: null,
    },
  },
  {
    id: "demo-5",
    userId: "user-5",
    platform: "INSTAGRAM",
    sourceUrl: "https://www.instagram.com/reel/demo5/",
    platformMediaId: "demo5",
    captionSnippet: "新宿ゴールデン街のネオン",
    latitude: 35.6938,
    longitude: 139.7034,
    status: "ACTIVE",
    reportCount: 0,
    clickCount: 198,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    author: {
      displayName: "night_city_xy",
      handle: "@night_city_xy",
      avatarUrl: null,
    },
  },
];

import { isAmplifyConfigured } from "./amplify";

export function isDemoMode(): boolean {
  return !isAmplifyConfigured();
}
