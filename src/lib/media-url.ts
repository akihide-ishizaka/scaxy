import type { SnsPlatform } from "@/lib/types";

export interface ParsedMediaUrl {
  platform: SnsPlatform;
  platformMediaId: string;
  sourceUrl: string;
}

const INSTAGRAM_PATTERNS = [
  /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
  /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
  /instagram\.com\/reels\/([A-Za-z0-9_-]+)/,
];

const YOUTUBE_SHORTS_PATTERN = /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/;
const YOUTUBE_SHORT_URL = /youtu\.be\/([A-Za-z0-9_-]{11})/;

export function parseMediaUrl(rawUrl: string): ParsedMediaUrl | null {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  const href = url.href;

  for (const pattern of INSTAGRAM_PATTERNS) {
    const match = href.match(pattern);
    if (match) {
      const mediaId = match[1];
      return {
        platform: "INSTAGRAM",
        platformMediaId: mediaId,
        sourceUrl: `https://www.instagram.com/p/${mediaId}/`,
      };
    }
  }

  const shortsMatch = href.match(YOUTUBE_SHORTS_PATTERN);
  if (shortsMatch) {
    return {
      platform: "YOUTUBE",
      platformMediaId: shortsMatch[1],
      sourceUrl: `https://www.youtube.com/shorts/${shortsMatch[1]}`,
    };
  }

  const shortUrlMatch = href.match(YOUTUBE_SHORT_URL);
  if (shortUrlMatch && href.includes("shorts")) {
    return {
      platform: "YOUTUBE",
      platformMediaId: shortUrlMatch[1],
      sourceUrl: `https://www.youtube.com/shorts/${shortUrlMatch[1]}`,
    };
  }

  return null;
}
