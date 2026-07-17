"use client";

import { isAmplifyConfigured } from "@/lib/amplify";
import { getDataClient } from "@/lib/data-client";
import { parseMediaUrl } from "@/lib/media-url";
import {
  readSnsConnection,
  syncSnsConnectionToBackend,
} from "@/lib/sns-connections";
import type { Pin, SnsPlatform } from "@/lib/types";

export interface PublishPinInput {
  userId: string;
  displayName?: string;
  sourceUrl: string;
  latitude: number;
  longitude: number;
}

const LOCAL_PINS_KEY = "xy:pins:local";

function readLocalPins(): Pin[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LOCAL_PINS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Pin[];
  } catch {
    return [];
  }
}

function writeLocalPins(pins: Pin[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_PINS_KEY, JSON.stringify(pins));
}

export function readStoredPins(): Pin[] {
  return readLocalPins();
}

function mapApiPin(pin: {
  id: string;
  userId?: string | null;
  platform?: SnsPlatform | null;
  sourceUrl: string;
  platformMediaId: string;
  captionSnippet?: string | null;
  thumbnailUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: Pin["status"] | null;
  reportCount?: number | null;
  clickCount?: number | null;
  createdAt?: string | null;
}): Pin {
  return {
    id: pin.id,
    userId: pin.userId ?? "",
    platform: pin.platform ?? "YOUTUBE",
    sourceUrl: pin.sourceUrl,
    platformMediaId: pin.platformMediaId,
    captionSnippet: pin.captionSnippet,
    thumbnailUrl: pin.thumbnailUrl,
    latitude: pin.latitude ?? 0,
    longitude: pin.longitude ?? 0,
    status: pin.status ?? "ACTIVE",
    reportCount: pin.reportCount ?? 0,
    clickCount: pin.clickCount ?? 0,
    createdAt: pin.createdAt ?? undefined,
  };
}

async function resolveSnsAccountId(userId: string, platform: SnsPlatform) {
  const client = getDataClient();
  const { data: accounts, errors } = await client.models.SnsAccount.list({
    filter: {
      userId: { eq: userId },
      platform: { eq: platform },
    },
  });

  if (errors?.length) {
    throw new Error(errors[0].message ?? "SNS連携情報の取得に失敗しました");
  }

  if (accounts[0]?.id) return accounts[0].id;

  const localConnection = readSnsConnection(userId, platform);
  if (!localConnection) return null;

  await syncSnsConnectionToBackend(userId, localConnection);

  const { data: synced } = await client.models.SnsAccount.list({
    filter: {
      userId: { eq: userId },
      platform: { eq: platform },
    },
  });

  return synced[0]?.id ?? null;
}

async function publishPinRemote(
  input: PublishPinInput,
  parsed: NonNullable<ReturnType<typeof parseMediaUrl>>
): Promise<Pin> {
  const snsAccountId = await resolveSnsAccountId(input.userId, parsed.platform);
  if (!snsAccountId) {
    throw new Error(
      `${parsed.platform === "YOUTUBE" ? "YouTube" : "Instagram"} のSNS連携が必要です。先に連携画面で設定してください。`
    );
  }

  const client = getDataClient();
  const { data, errors } = await client.mutations.publishPin({
    input: {
      sourceUrl: parsed.sourceUrl,
      latitude: input.latitude,
      longitude: input.longitude,
      snsAccountId,
    },
  });

  if (errors?.length) {
    throw new Error(errors[0].message ?? "ピンの登録に失敗しました");
  }
  if (!data) {
    throw new Error("ピンの登録に失敗しました");
  }

  return mapApiPin(data);
}

function publishPinLocal(
  input: PublishPinInput,
  parsed: NonNullable<ReturnType<typeof parseMediaUrl>>
): Pin {
  const pin: Pin = {
    id: `local-${parsed.platform}-${parsed.platformMediaId}`,
    userId: input.userId,
    platform: parsed.platform,
    sourceUrl: parsed.sourceUrl,
    platformMediaId: parsed.platformMediaId,
    latitude: input.latitude,
    longitude: input.longitude,
    status: "ACTIVE",
    reportCount: 0,
    clickCount: 0,
    createdAt: new Date().toISOString(),
    author: {
      displayName: input.displayName ?? "ジァー",
    },
  };

  const others = readLocalPins().filter((existing) => existing.id !== pin.id);
  writeLocalPins([pin, ...others]);
  return pin;
}

export async function publishPin(input: PublishPinInput): Promise<Pin> {
  const parsed = parseMediaUrl(input.sourceUrl);
  if (!parsed) {
    throw new Error(
      "許可されていないURLです。Instagram (/p/, /reel/) または YouTube (/shorts/) のURLを入力してください。"
    );
  }

  if (isAmplifyConfigured()) {
    return publishPinRemote(input, parsed);
  }

  return publishPinLocal(input, parsed);
}

export async function fetchMapPins(): Promise<Pin[]> {
  if (!isAmplifyConfigured()) {
    return readLocalPins();
  }

  const client = getDataClient();
  const { data, errors } = await client.queries.listPinsInBounds({
    input: {
      north: 90,
      south: -90,
      east: 180,
      west: -180,
      sortStrategy: "newest",
    },
  });

  if (errors?.length) {
    throw new Error(errors[0].message ?? "ピン一覧の取得に失敗しました");
  }

  return (data ?? []).map(mapApiPin);
}
