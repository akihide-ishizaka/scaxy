"use client";

import {
  Authenticator,
  ThemeProvider,
  translations,
} from "@aws-amplify/ui-react";
import { Hub, I18n } from "aws-amplify/utils";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { xyAuthTheme } from "@/lib/auth-theme";

I18n.putVocabularies(translations);
I18n.setLanguage("ja");
I18n.putVocabularies({
  ja: {
    "Sign In": "ログイン",
    "Sign in": "ログイン",
    "Create Account": "アカウント作成",
    Email: "メールアドレス",
    Password: "パスワード",
    "Confirm Password": "パスワード（確認）",
    "Forgot your password?": "パスワードをお忘れですか？",
    "Reset Password": "パスワードをリセット",
    "Send code": "コードを送信",
    Code: "確認コード",
    "New Password": "新しいパスワード",
    Submit: "送信",
    "Back to Sign In": "ログインに戻る",
    "Signing in": "ログイン中…",
    "Creating Account": "作成中…",
    "Enter your Email": "メールアドレスを入力",
    "Enter your Password": "パスワードを入力",
    "Please confirm your Password": "パスワードを再入力",
    "We Emailed You": "確認メールを送信しました",
    "Your code is on the way. To log in, enter the code we emailed to":
      "ログインするには、送信した確認コードを入力してください：",
    "It may take a minute to arrive": "到着までしばらくお待ちください",
    "Resend Code": "コードを再送信",
    Confirm: "確認",
    Confirming: "確認中…",
    "Password must have at least 8 characters":
      "パスワードは8文字以上にしてください",
    "Password must have lower case letters":
      "パスワードに小文字を含めてください",
    "Password must have upper case letters":
      "パスワードに大文字を含めてください",
    "Password must have numbers": "パスワードに数字を含めてください",
    "Your passwords must match": "パスワードが一致しません",
  },
});

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { isCognitoEnabled, refreshSession } = useAuth();

  useEffect(() => {
    if (!open || !isCognitoEnabled) return;

    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn") {
        refreshSession().then(onClose);
      }
    });

    return unsubscribe;
  }, [open, isCognitoEnabled, onClose, refreshSession]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />

      {/* 高さ固定: ログイン / アカウント作成の切替で枠サイズが変わらないようにする */}
      <div className="relative flex h-[min(92vh,36rem)] w-full max-w-[32rem] flex-col overflow-hidden rounded-2xl border border-violet-500/30 bg-[#0d0d18] shadow-[0_0_50px_rgba(139,92,246,0.25),0_0_80px_rgba(34,211,238,0.08)]">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 right-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl"
          aria-hidden
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-violet-500/10 hover:text-white"
          aria-label="閉じる"
        >
          ✕
        </button>

        <div className="relative shrink-0 px-6 pb-3 pt-7 sm:px-8">
          <p className="mb-1 text-xs font-medium tracking-[0.2em] text-violet-400/80 uppercase">
            xy
          </p>
          <h2 className="mb-1 bg-linear-to-r from-cyan-400 via-violet-300 to-fuchsia-400 bg-clip-text text-2xl font-bold text-transparent">
            ログイン
          </h2>
          <p className="text-sm text-gray-500">
            メールアドレスでサインイン / 新規登録
          </p>
        </div>

        <div className="xy-auth relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 pb-8 pt-2 sm:px-8">
          {isCognitoEnabled ? (
            <ThemeProvider theme={xyAuthTheme} colorMode="dark">
              <Authenticator
                loginMechanisms={["email"]}
                signUpAttributes={["email"]}
                className="xy-authenticator"
              />
            </ThemeProvider>
          ) : (
            <div className="rounded-xl border border-amber-500/25 bg-amber-950/40 p-4 text-sm text-amber-100">
              <p className="mb-2">
                バックエンド未デプロイのため Cognito に接続できません。
              </p>
              <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs text-amber-300">
                npm run sandbox
              </code>
              <span className="text-xs text-amber-200/70">
                {" "}
                を実行してください。
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
