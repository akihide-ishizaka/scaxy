# Cognito OAuth 設定（参考）

シークレット登録後、`amplify/auth/resource.ts` に以下を統合してください。

```bash
npx ampx sandbox secret set GOOGLE_CLIENT_ID
npx ampx sandbox secret set GOOGLE_CLIENT_SECRET
npx ampx sandbox secret set APPLE_CLIENT_ID
npx ampx sandbox secret set APPLE_KEY_ID
npx ampx sandbox secret set APPLE_PRIVATE_KEY
npx ampx sandbox secret set APPLE_TEAM_ID
```

```typescript
import { defineAuth, secret } from "@aws-amplify/backend";
import { postConfirmation } from "./post-confirmation/resource.ts";

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret("GOOGLE_CLIENT_ID"),
        clientSecret: secret("GOOGLE_CLIENT_SECRET"),
        scopes: ["email", "profile", "openid"],
      },
      signInWithApple: {
        clientId: secret("APPLE_CLIENT_ID"),
        keyId: secret("APPLE_KEY_ID"),
        privateKey: secret("APPLE_PRIVATE_KEY"),
        teamId: secret("APPLE_TEAM_ID"),
      },
      callbackUrls: [
        "http://localhost:3000/",
        "http://localhost:3000/map",
        "http://localhost:3000/publish",
      ],
      logoutUrls: ["http://localhost:3000/", "http://localhost:3000/map"],
    },
  },
  triggers: { postConfirmation },
});
```

OAuth 変更後は `.amplify/artifacts/cdk.out` を削除してから `npm run sandbox` を再起動してください。
