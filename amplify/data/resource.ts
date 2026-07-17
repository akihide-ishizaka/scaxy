import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource.ts";
import { createPin } from "../functions/createPin/resource.ts";
import { reportPin } from "../functions/reportPin/resource.ts";
import { recordClick } from "../functions/recordClick/resource.ts";
import { listPinsInBounds } from "../functions/listPinsInBounds/resource.ts";

/**
 * xy DynamoDB スキーマ定義
 * Prisma (PostgreSQL) スキーマを Amplify Data / DynamoDB 向けに移植
 */
const schema = a.schema({
  SnsPlatform: a.enum(["INSTAGRAM", "YOUTUBE"]),
  PinStatus: a.enum(["ACTIVE", "UNDER_REVIEW", "HIDDEN", "DEAD_LINK"]),

  /** xy ユーザープロフィール（Cognito 認証と紐づけ） */
  User: a
    .model({
      authProvider: a.string().required(),
      authSubject: a.string().required(),
      displayName: a.string().required(),
      avatarUrl: a.string(),
      lastLoginAt: a.datetime(),
      reportEligibleAt: a.datetime(),
      snsAccounts: a.hasMany("SnsAccount", "userId"),
      pins: a.hasMany("Pin", "userId"),
    })
    .authorization((allow) => [
      allow.ownerDefinedIn("id"),
      allow.authenticated().to(["read"]),
    ]),

  /** OAuth 連携 SNS アカウント */
  SnsAccount: a
    .model({
      userId: a.id().required(),
      user: a.belongsTo("User", "userId"),
      platform: a.ref("SnsPlatform").required(),
      platformUserId: a.string().required(),
      platformHandle: a.string().required(),
      accessToken: a.string().required(),
      refreshToken: a.string(),
      tokenExpiresAt: a.datetime(),
      connectedAt: a.datetime(),
      lastSyncedAt: a.datetime(),
      pins: a.hasMany("Pin", "snsAccountId"),
    })
    .secondaryIndexes((index) => [
      index("userId").sortKeys(["platform"]).queryField("snsAccountsByUser"),
      index("platform").sortKeys(["platformUserId"]).queryField("snsAccountByPlatform"),
    ])
    .authorization((allow) => [allow.ownerDefinedIn("userId")]),

  /** 地図上のピン（メディア本体は保持しない） */
  Pin: a
    .model({
      userId: a.id().required(),
      user: a.belongsTo("User", "userId"),
      snsAccountId: a.id().required(),
      snsAccount: a.belongsTo("SnsAccount", "snsAccountId"),
      platform: a.ref("SnsPlatform").required(),
      sourceUrl: a.string().required(),
      platformMediaId: a.string().required(),
      captionSnippet: a.string(),
      thumbnailUrl: a.string(),
      latitude: a.float().required(),
      longitude: a.float().required(),
      geohash: a.string(),
      status: a.ref("PinStatus"),
      reportCount: a.integer().default(0),
      clickCount: a.integer().default(0),
      lastLinkCheckAt: a.datetime(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      reports: a.hasMany("PinReport", "pinId"),
      clickLogs: a.hasMany("ClickLog", "pinId"),
    })
    .secondaryIndexes((index) => [
      index("status").sortKeys(["createdAt"]).queryField("pinsByStatus"),
      index("geohash").sortKeys(["status"]).queryField("pinsByGeohash"),
      index("platform").sortKeys(["platformMediaId"]).queryField("pinByPlatformMedia"),
    ])
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.ownerDefinedIn("userId").to(["read", "update", "delete"]),
      allow.guest().to(["read"]),
    ]),

  /** 3通報自動非表示用 */
  PinReport: a
    .model({
      pinId: a.id().required(),
      pin: a.belongsTo("Pin", "pinId"),
      reporterId: a.id().required(),
      reason: a.string(),
    })
    .secondaryIndexes((index) => [
      index("pinId").queryField("reportsByPin"),
    ])
    .authorization((allow) => [
      allow.ownerDefinedIn("reporterId").to(["create", "read"]),
      allow.authenticated().to(["read"]),
    ]),

  /** アウトバウンド送客ログ */
  ClickLog: a
    .model({
      pinId: a.id().required(),
      pin: a.belongsTo("Pin", "pinId"),
      viewerUserId: a.id(),
      platform: a.ref("SnsPlatform").required(),
      clickedAt: a.datetime(),
    })
    .secondaryIndexes((index) => [
      index("pinId").sortKeys(["clickedAt"]).queryField("clicksByPin"),
    ])
    .authorization((allow) => [
      allow.authenticated().to(["create", "read"]),
      allow.guest().to(["create"]),
    ]),

  /** フォロー関係 */
  Follow: a
    .model({
      followerId: a.id().required(),
      followeeId: a.id().required(),
    })
    .identifier(["followerId", "followeeId"])
    .authorization((allow) => [
      allow.ownerDefinedIn("followerId").to(["create", "delete", "read"]),
      allow.authenticated().to(["read"]),
    ]),

  /** ブロック（物理削除せず表示フィルタ用） */
  Block: a
    .model({
      blockerId: a.id().required(),
      blockedId: a.id().required(),
    })
    .identifier(["blockerId", "blockedId"])
    .authorization((allow) => [
      allow.ownerDefinedIn("blockerId").to(["create", "delete", "read"]),
    ]),

  // --- カスタム Lambda ミューテーション / クエリ ---

  PublishPinInput: a.customType({
    sourceUrl: a.string().required(),
    latitude: a.float().required(),
    longitude: a.float().required(),
    snsAccountId: a.id().required(),
    captionSnippet: a.string(),
    thumbnailUrl: a.string(),
  }),

  publishPin: a
    .mutation()
    .arguments({ input: a.ref("PublishPinInput").required() })
    .returns(a.ref("Pin"))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(createPin)),

  ReportPinInput: a.customType({
    pinId: a.id().required(),
    reason: a.string(),
  }),

  reportPin: a
    .mutation()
    .arguments({ input: a.ref("ReportPinInput").required() })
    .returns(a.ref("Pin"))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(reportPin)),

  RecordClickInput: a.customType({
    pinId: a.id().required(),
  }),

  recordClick: a
    .mutation()
    .arguments({ input: a.ref("RecordClickInput").required() })
    .returns(a.ref("Pin"))
    .authorization((allow) => [allow.authenticated(), allow.guest()])
    .handler(a.handler.function(recordClick)),

  ListPinsInput: a.customType({
    north: a.float().required(),
    south: a.float().required(),
    east: a.float().required(),
    west: a.float().required(),
    sortStrategy: a.string(),
  }),

  listPinsInBounds: a
    .query()
    .arguments({ input: a.ref("ListPinsInput").required() })
    .returns(a.ref("Pin").array())
    .authorization((allow) => [allow.authenticated(), allow.guest()])
    .handler(a.handler.function(listPinsInBounds)),
}).authorization((allow) => [
  allow.resource(postConfirmation),
  allow.resource(createPin),
  allow.resource(reportPin),
  allow.resource(recordClick),
  allow.resource(listPinsInBounds),
]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
