import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/postConfirmation";
import type { Schema } from "../../data/resource";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

const REPORT_ELIGIBILITY_DAYS = 7;

function resolveAuthProvider(
  userAttributes: Record<string, string>
): string {
  const identities = userAttributes.identities;
  if (identities) {
    try {
      const parsed = JSON.parse(identities) as Array<{ providerName?: string }>;
      const provider = parsed[0]?.providerName?.toLowerCase();
      if (provider?.includes("google")) return "google";
      if (provider?.includes("apple")) return "apple";
    } catch {
      // fall through
    }
  }
  return "email";
}

function resolveDisplayName(userAttributes: Record<string, string>): string {
  return (
    userAttributes.name ||
    userAttributes.nickname ||
    userAttributes.email?.split("@")[0] ||
    "ジァー"
  );
}

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const sub = event.request.userAttributes.sub;
  if (!sub) return event;

  const authProvider = resolveAuthProvider(event.request.userAttributes);
  const displayName = resolveDisplayName(event.request.userAttributes);
  const avatarUrl = event.request.userAttributes.picture ?? undefined;

  const reportEligibleAt = new Date();
  reportEligibleAt.setDate(reportEligibleAt.getDate() + REPORT_ELIGIBILITY_DAYS);

  const { data: existing } = await client.models.User.get({ id: sub });

  if (existing) {
    await client.models.User.update({
      id: sub,
      displayName,
      avatarUrl,
      lastLoginAt: new Date().toISOString(),
    });
  } else {
    await client.models.User.create({
      id: sub,
      authProvider,
      authSubject: sub,
      displayName,
      avatarUrl,
      lastLoginAt: new Date().toISOString(),
      reportEligibleAt: reportEligibleAt.toISOString(),
    });
  }

  return event;
};
