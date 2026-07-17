"use client";

import type { SnsPlatform } from "@/lib/types";
import { isAmplifyConfigured } from "@/lib/amplify";
import { getDataClient } from "@/lib/data-client";

export interface SnsConnection {
  platform: SnsPlatform;
  platformUserId: string;
  platformHandle: string;
  channelTitle?: string;
  thumbnailUrl?: string;
  connectedAt: string;
  /** 本番 OAuth トークン or デモ用プレースホルダ */
  accessToken: string;
  isDemo?: boolean;
}

function storageKey(userId: string) {
  return `xy:sns-connections:${userId}`;
}

export function readSnsConnections(userId: string): SnsConnection[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(storageKey(userId));
  if (!raw) return [];

  try {
    return JSON.parse(raw) as SnsConnection[];
  } catch {
    return [];
  }
}

export function readSnsConnection(
  userId: string,
  platform: SnsPlatform
): SnsConnection | null {
  return readSnsConnections(userId).find((c) => c.platform === platform) ?? null;
}

export function writeSnsConnections(userId: string, connections: SnsConnection[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId), JSON.stringify(connections));
}

export function upsertSnsConnection(userId: string, connection: SnsConnection) {
  const others = readSnsConnections(userId).filter(
    (c) => c.platform !== connection.platform
  );
  writeSnsConnections(userId, [...others, connection]);
}

export function removeSnsConnection(userId: string, platform: SnsPlatform) {
  writeSnsConnections(
    userId,
    readSnsConnections(userId).filter((c) => c.platform !== platform)
  );
}

/** YouTube チャンネル URL / @handle からハンドルを正規化 */
export function normalizeYoutubeHandle(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const handleMatch = trimmed.match(/@([A-Za-z0-9._-]+)/);
  if (handleMatch) return `@${handleMatch[1]}`;

  const channelMatch = trimmed.match(/youtube\.com\/channel\/([A-Za-z0-9_-]+)/i);
  if (channelMatch) return channelMatch[1];

  if (trimmed.startsWith("@")) return trimmed;
  if (/^UC[\w-]{20,}$/.test(trimmed)) return trimmed;

  return `@${trimmed.replace(/^@/, "")}`;
}

export async function syncSnsConnectionToBackend(
  userId: string,
  connection: SnsConnection
) {
  if (!isAmplifyConfigured()) return;

  const client = getDataClient();
  const { data: existing } = await client.models.SnsAccount.list({
    filter: {
      userId: { eq: userId },
      platform: { eq: connection.platform },
    },
  });

  const payload = {
    userId,
    platform: connection.platform,
    platformUserId: connection.platformUserId,
    platformHandle: connection.platformHandle,
    accessToken: connection.accessToken,
    connectedAt: connection.connectedAt,
    lastSyncedAt: new Date().toISOString(),
  };

  if (existing.length > 0) {
    await client.models.SnsAccount.update({
      id: existing[0].id,
      ...payload,
    });
  } else {
    await client.models.SnsAccount.create(payload);
  }
}

export async function removeSnsConnectionFromBackend(
  userId: string,
  platform: SnsPlatform
) {
  if (!isAmplifyConfigured()) return;

  const client = getDataClient();
  const { data: existing } = await client.models.SnsAccount.list({
    filter: {
      userId: { eq: userId },
      platform: { eq: platform },
    },
  });

  await Promise.all(
    existing.map((account) => client.models.SnsAccount.delete({ id: account.id }))
  );
}
