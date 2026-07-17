import { defineAuth } from "@aws-amplify/backend";
import { postConfirmation } from "./post-confirmation/resource.ts";

/**
 * AWS Cognito 認証（メール / パスワード）
 * 確認後 Lambda で DynamoDB User プロフィールを自動作成
 *
 * Google / Apple を有効にする場合は externalProviders を追加し、
 * `npx ampx sandbox secret set GOOGLE_CLIENT_ID` 等でシークレットを登録してください。
 * 例: amplify/auth/resource.oauth.ts.example を参照
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  triggers: {
    postConfirmation,
  },
});
