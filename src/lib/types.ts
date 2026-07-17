export type SnsPlatform = "INSTAGRAM" | "YOUTUBE";
export type PinStatus = "ACTIVE" | "UNDER_REVIEW" | "HIDDEN" | "DEAD_LINK";
export type PinSortStrategy = "newest" | "popular" | "following";
export type { MapSkinId } from "@/lib/map-skins";

export interface Pin {
  id: string;
  userId: string;
  platform: SnsPlatform;
  sourceUrl: string;
  platformMediaId: string;
  captionSnippet?: string | null;
  thumbnailUrl?: string | null;
  latitude: number;
  longitude: number;
  status: PinStatus;
  reportCount: number;
  clickCount: number;
  createdAt?: string;
  author?: {
    displayName: string;
    avatarUrl?: string | null;
    handle?: string;
  };
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
