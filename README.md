# xy（ジィ）— SNSアグリゲーター プロトタイプ

**Videos Belong on the Map.** — ショート動画を撮影場所にマッピングする新感覚SNSアグリゲーター。

## アーキテクチャ

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 16 + Tailwind CSS + Mapbox GL JS |
| 認証 | Amazon Cognito（メール / Google / Apple ID） |
| API / DB | AWS Amplify Gen 2 + AppSync + **DynamoDB** |
| 処理系 | **AWS Lambda**（ピン作成・通報・クリック計測・範囲検索） |
| ストレージ | **Amazon S3**（サムネイルキャッシュ・静的アセット） |
| ソース管理 / CI/CD | **AWS Amplify** Hosting + Git 連携 |

## プロジェクト構成

```
xy-app/
├── amplify/                    # Amplify バックエンド定義
│   ├── auth/resource.ts        # Cognito（Apple / Google）
│   ├── data/resource.ts        # DynamoDB スキーマ（DB定義）
│   ├── storage/resource.ts     # S3 バケット
│   ├── functions/              # Lambda 関数群
│   │   ├── createPin/          # URL検証 + ピン作成
│   │   ├── reportPin/          # 3通報自動非表示
│   │   ├── recordClick/        # アウトバウンド送客ログ
│   │   └── listPinsInBounds/   # 地図範囲内ピン取得
│   └── backend.ts
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # UIコンポーネント
│   └── lib/                    # ユーティリティ
└── docs/                       # 要件定義書
```

## DynamoDB テーブル（Amplify Data で定義）

| モデル | 説明 |
|--------|------|
| `User` | xyユーザープロフィール |
| `SnsAccount` | OAuth連携SNSアカウント |
| `Pin` | 地図ピン（URL・座標・ステータス） |
| `PinReport` | 通報記録 |
| `ClickLog` | 送客クリックログ |
| `Follow` | フォロー関係 |
| `Block` | ブロック（表示フィルタ用） |

## クイックスタート

### 1. 依存関係インストール

```bash
cd xy-app
npm install
```

### 2. 環境変数

```bash
cp .env.example .env.local
```

`.env.local` に [Mapbox アクセストークン](https://account.mapbox.com/access-tokens/) を設定:

```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxx
```

### 3. フロントエンドのみ（デモモード）

```bash
npm run dev
```

http://localhost:3000 を開く。バックエンド未接続時は東京周辺のデモピンが表示されます。

### 4. AWS サンドボックス（フルスタック）

前提: [AWS CLI](https://aws.amazon.com/cli/) 設定済み、Amplify 権限のある IAM ユーザー

```bash
# サンドボックス起動（DynamoDB / Lambda / Cognito / S3 をプロビジョニング）
npm run sandbox
```

別ターミナルで:

```bash
npm run dev
```

`sandbox` 実行中に `amplify_outputs.json` が自動生成され、認証・API が有効になります。

#### 認証（Cognito）の動作

| 機能 | 説明 |
|------|------|
| サインアップ / ログイン | メール＋パスワード、Google、Apple ID |
| セッション管理 | `AuthContext` + Amplify Hub（signedIn / signedOut） |
| ルート保護 | `/publish` は `RequireAuth` でガード |
| プロフィール同期 | 確認後 Lambda + クライアントで DynamoDB `User` を作成（`id` = Cognito `sub`） |
| ログアウト | ヘッダーのユーザーメニューから |

デモモード（`sandbox` 未起動）では Cognito に接続せず、地図のデモピンのみ表示されます。

### 5. OAuth シークレット設定（Google / Apple）

```bash
npx ampx sandbox secret set GOOGLE_CLIENT_ID
npx ampx sandbox secret set GOOGLE_CLIENT_SECRET
npx ampx sandbox secret set APPLE_CLIENT_ID
# ... 他のシークレットも同様
```

### 6. Amplify Hosting へのデプロイ

1. [AWS Amplify コンソール](https://console.aws.amazon.com/amplify/) で「新しいアプリ」→ Git リポジトリを接続
2. ビルド設定は `amplify.yml`（下記参照）を使用
3. 環境変数 `NEXT_PUBLIC_MAPBOX_TOKEN` を設定
4. ブランチデプロイで CI/CD が自動実行

## 実装済み機能（フェーズ1 プロトタイプ）

- [x] ダークネオンマップ（Mapbox GL JS）
- [x] ピン表示・選択・インライン再生カード
- [x] 並び替え（新着 / 人気 / フォロー中）
- [x] デモピンデータ（東京周辺）
- [x] 「ジる」公開フォーム（URL + ジオコーディング）
- [x] 通報 UI（3件で自動非表示シミュレーション）
- [x] クリック計測 UI
- [x] DynamoDB スキーマ定義（Amplify Data）
- [x] Lambda: ピン作成（URL正規表現バリデーション）
- [x] Lambda: 通報処理（3通報 → UNDER_REVIEW）
- [x] Lambda: クリックログ記録
- [x] Lambda: 地図範囲内ピン検索
- [x] Cognito 認証（メール / Google / Apple）+ ログイン UI・ルートガード
- [x] S3 ストレージ（サムネイルキャッシュ用）

## 今後の実装（フェーズ2）

- Instagram Graph API / YouTube Data API 連携
- `#xy` ハッシュタグ自動クローラー
- ヒートマップ（ClickLog 集計 + Mapbox HeatmapLayer）
- 週次リンク切れチェッカー（EventBridge + Lambda）

## ドキュメント

詳細な要件定義は `docs/xy_project_requirements.md` を参照してください。
