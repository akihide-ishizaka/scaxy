import type { Schema } from "../../data/resource";
import type { AppSyncResolverHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/listPinsInBounds";
import { isInBounds } from "../shared/url-validator";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

type Pin = Schema["Pin"]["type"];
type SortStrategy = "newest" | "popular" | "following";

type Handler = AppSyncResolverHandler<
  Schema["listPinsInBounds"]["args"],
  Pin[]
>;

function sortPins(pins: Pin[], strategy: SortStrategy): Pin[] {
  const sorted = [...pins];
  switch (strategy) {
    case "popular":
      return sorted.sort((a, b) => (b.clickCount ?? 0) - (a.clickCount ?? 0));
    case "following":
      return sorted;
    case "newest":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
      );
  }
}

export const handler: Handler = async (event) => {
  const { north, south, east, west, sortStrategy } = event.arguments.input;
  const strategy = (sortStrategy as SortStrategy) ?? "newest";

  const { data: activePins } = await client.models.Pin.pinsByStatus({
    status: "ACTIVE",
  });

  const pins = (activePins ?? []).filter((pin) => {
    if (pin.latitude == null || pin.longitude == null) return false;
    return isInBounds(pin.latitude, pin.longitude, north, south, east, west);
  });

  const identity = event.identity;
  let blockedUserIds: string[] = [];
  if (identity && "sub" in identity) {
    const userId = identity.sub;
    const { data: blocks } = await client.models.Block.list({
      filter: { blockerId: { eq: userId } },
    });
    blockedUserIds = (blocks ?? []).map((b) => b.blockedId);
  }

  const filtered = pins.filter(
    (pin) => !blockedUserIds.includes(pin.userId ?? "")
  );

  return sortPins(filtered, strategy);
};
