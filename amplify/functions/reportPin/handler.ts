import type { Schema } from "../../data/resource";
import type { AppSyncResolverHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/reportPin";

const REPORT_THRESHOLD = 3;
const REPORT_ELIGIBILITY_DAYS = 7;

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

type Handler = AppSyncResolverHandler<
  Schema["reportPin"]["args"],
  Schema["Pin"]["type"] | null
>;

export const handler: Handler = async (event) => {
  const identity = event.identity;
  if (!identity || !("sub" in identity)) {
    throw new Error("認証が必要です");
  }

  const reporterId = identity.sub;
  const { pinId, reason } = event.arguments.input;

  const { data: user } = await client.models.User.get({ id: reporterId });
  if (user?.reportEligibleAt) {
    const eligibleAt = new Date(user.reportEligibleAt);
    if (eligibleAt > new Date()) {
      throw new Error("通報権限がありません。アカウント作成から一定期間後に利用可能になります。");
    }
  } else if (user) {
    const created = new Date();
    created.setDate(created.getDate() - REPORT_ELIGIBILITY_DAYS + 1);
    if (created > new Date()) {
      throw new Error("通報権限がありません。アカウント作成から一定期間後に利用可能になります。");
    }
  }

  const { data: pin } = await client.models.Pin.get({ id: pinId });
  if (!pin) {
    throw new Error("ピンが見つかりません");
  }

  if (pin.userId === reporterId) {
    throw new Error("自分のピンは通報できません");
  }

  const { data: existingReports } = await client.models.PinReport.reportsByPin({
    pinId,
  });
  const alreadyReported = existingReports?.some((r) => r.reporterId === reporterId);
  if (alreadyReported) {
    throw new Error("このピンは既に通報済みです");
  }

  await client.models.PinReport.create({
    pinId,
    reporterId,
    reason: reason ?? "場所と動画が違う",
  });

  const newReportCount = (pin.reportCount ?? 0) + 1;
  const newStatus =
    newReportCount >= REPORT_THRESHOLD ? "UNDER_REVIEW" : pin.status ?? "ACTIVE";

  const { data: updated, errors } = await client.models.Pin.update({
    id: pinId,
    reportCount: newReportCount,
    status: newStatus,
  });

  if (errors?.length || !updated) {
    throw new Error(errors?.[0]?.message ?? "通報の処理に失敗しました");
  }

  return updated;
};
