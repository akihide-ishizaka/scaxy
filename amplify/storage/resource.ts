import { defineStorage } from "@aws-amplify/backend";

/**
 * S3 ストレージ
 * - thumbnails/: サムネイルキャッシュ（TTL運用想定）
 * - public/: 静的アセット
 * メディア本体（動画）は保持しない設計
 */
export const storage = defineStorage({
  name: "xyStorage",
  access: (allow) => ({
    "thumbnails/{entity_id}/*": [
      allow.authenticated.to(["read", "write", "delete"]),
      allow.guest.to(["read"]),
    ],
    "public/*": [
      allow.guest.to(["read"]),
      allow.authenticated.to(["read", "write", "delete"]),
    ],
  }),
});
