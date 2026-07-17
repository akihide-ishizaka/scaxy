import type { Schema } from "../../data/resource";
import type { AppSyncResolverHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/createPin";
import { parseAndValidateMediaUrl, encodeGeohash } from "../shared/url-validator";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

type Handler = AppSyncResolverHandler<
  Schema["publishPin"]["args"],
  Schema["Pin"]["type"] | null
>;

export const handler: Handler = async (event) => {
  const identity = event.identity;
  if (!identity || !("sub" in identity)) {
    throw new Error("認証が必要です");
  }

  const userId = identity.sub;
  const { input } = event.arguments;
  const parsed = parseAndValidateMediaUrl(input.sourceUrl);

  if (!parsed) {
    throw new Error(
      "許可されていないURLです。Instagram (/p/, /reel/) または YouTube (/shorts/) の投稿URLのみ登録できます。"
    );
  }

  const { data: existing } = await client.models.Pin.pinByPlatformMedia({
    platform: parsed.platform,
    platformMediaId: { eq: parsed.platformMediaId },
  });

  if (existing && existing.length > 0) {
    throw new Error("この投稿は既にマップに登録されています");
  }

  const { data: snsAccount } = await client.models.SnsAccount.get({
    id: input.snsAccountId,
  });

  if (!snsAccount || snsAccount.userId !== userId) {
    throw new Error("SNSアカウントの本人確認に失敗しました");
  }

  if (snsAccount.platform !== parsed.platform) {
    throw new Error("連携SNSと投稿URLのプラットフォームが一致しません");
  }

  const geohash = encodeGeohash(input.latitude, input.longitude);

  const { data: pin, errors } = await client.models.Pin.create({
    userId,
    snsAccountId: input.snsAccountId,
    platform: parsed.platform,
    sourceUrl: parsed.sourceUrl,
    platformMediaId: parsed.platformMediaId,
    captionSnippet: input.captionSnippet,
    thumbnailUrl: input.thumbnailUrl,
    latitude: input.latitude,
    longitude: input.longitude,
    geohash,
    status: "ACTIVE",
    reportCount: 0,
    clickCount: 0,
  });

  if (errors?.length || !pin) {
    throw new Error(errors?.[0]?.message ?? "ピンの作成に失敗しました");
  }

  return pin;
};
