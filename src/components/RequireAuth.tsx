"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { useState } from "react";

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Cognito 認証が必要な画面を保護するガード
 * 未ログイン時はログインモーダルを表示
 */
export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { isAuthenticated, loading, isDemo } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-violet-300">
        認証状態を確認中...
      </div>
    );
  }

  if (isDemo) {
    return (
      <div className="px-6 py-12 max-w-lg mx-auto">
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-6 text-center">
          <p className="text-amber-200 font-medium mb-2">Cognito 未接続</p>
          <p className="text-sm text-gray-400 mb-4">
            認証機能を使うには Amplify サンドボックスを起動してください。
          </p>
          <code className="text-xs text-amber-400 bg-black/30 px-3 py-1 rounded">
            npm run sandbox
          </code>
        </div>
        {children}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {fallback ?? (
          <div className="px-6 py-16 max-w-md mx-auto text-center">
            <p className="text-violet-200 text-lg mb-2">ログインが必要です</p>
            <p className="text-gray-400 text-sm mb-6">
              ピンの公開や通報には AWS Cognito での認証が必要です。
            </p>
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium"
            >
              ログイン / 新規登録
            </button>
          </div>
        )}
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    );
  }

  return <>{children}</>;
}
