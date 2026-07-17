export type SnsPlatform = "INSTAGRAM" | "YOUTUBE";

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

export function parseAndValidateMediaUrl(rawUrl: string): ParsedMediaUrl | null {
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

/** 簡易 geohash（プロトタイプ用・6桁精度） */
export function encodeGeohash(lat: number, lng: number, precision = 6): string {
  const base32 = "0123456789bcdefghjkmnpqrstuvwxyz";
  let idx = 0;
  let bit = 0;
  let even = true;
  let geohash = "";

  let latMin = -90;
  let latMax = 90;
  let lngMin = -180;
  let lngMax = 180;

  while (geohash.length < precision) {
    if (even) {
      const mid = (lngMin + lngMax) / 2;
      if (lng >= mid) {
        idx = idx * 2 + 1;
        lngMin = mid;
      } else {
        idx = idx * 2;
        lngMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat >= mid) {
        idx = idx * 2 + 1;
        latMin = mid;
      } else {
        idx = idx * 2;
        latMax = mid;
      }
    }
    even = !even;
    if (++bit === 5) {
      geohash += base32[idx];
      bit = 0;
      idx = 0;
    }
  }
  return geohash;
}

export function isInBounds(
  lat: number,
  lng: number,
  north: number,
  south: number,
  east: number,
  west: number
): boolean {
  return lat <= north && lat >= south && lng >= west && lng <= east;
}
