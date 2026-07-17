import type { Schema } from "../../data/resource";
import type { AppSyncResolverHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/recordClick";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

type Handler = AppSyncResolverHandler<
  Schema["recordClick"]["args"],
  Schema["Pin"]["type"] | null
>;

export const handler: Handler = async (event) => {
  const { pinId } = event.arguments.input;
  const identity = event.identity;
  const viewerUserId =
    identity && "sub" in identity ? identity.sub : undefined;

  const { data: pin } = await client.models.Pin.get({ id: pinId });
  if (!pin) {
    throw new Error("ピンが見つかりません");
  }

  await client.models.ClickLog.create({
    pinId,
    viewerUserId,
    platform: pin.platform!,
    clickedAt: new Date().toISOString(),
  });

  const { data: updated, errors } = await client.models.Pin.update({
    id: pinId,
    clickCount: (pin.clickCount ?? 0) + 1,
  });

  if (errors?.length || !updated) {
    throw new Error(errors?.[0]?.message ?? "クリック記録に失敗しました");
  }

  return updated;
};
