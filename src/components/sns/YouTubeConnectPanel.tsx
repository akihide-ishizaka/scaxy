"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SnsPlatformIcon } from "@/components/sns/SnsPlatformIcon";
import {
  normalizeYoutubeHandle,
  readSnsConnection,
  removeSnsConnection,
  removeSnsConnectionFromBackend,
  syncSnsConnectionToBackend,
  upsertSnsConnection,
  type SnsConnection,
} from "@/lib/sns-connections";

function buildYoutubeOAuthUrl(): string | null {
  const clientId = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID;
  if (!clientId || typeof window === "undefined") return null;

  const redirectUri = `${window.location.origin}/integrations/youtube/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

interface YouTubeConnectPanelProps {
  userId: string;
}

export function YouTubeConnectPanel({ userId }: YouTubeConnectPanelProps) {
  const { isDemo } = useAuth();
  const initialConnection = useMemo(
    () => readSnsConnection(userId, "YOUTUBE"),
    [userId]
  );
  const [connection, setConnection] = useState<SnsConnection | null>(
    initialConnection
  );
  const [channelInput, setChannelInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const oauthAvailable = !!process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID;

  const handleOAuthConnect = useCallback(() => {
    const url = buildYoutubeOAuthUrl();
    if (!url) {
      setMessage("YouTube OAuth のクライアント ID が未設定です。");
      return;
    }
    window.location.href = url;
  }, []);

  const handleDemoConnect = useCallback(async () => {
    const handle = normalizeYoutubeHandle(channelInput) || "@xy-demo-channel";
    const platformUserId = handle.startsWith("@")
      ? `demo-${handle.slice(1)}`
      : handle;

    setBusy(true);
    setMessage(null);

    try {
      const next: SnsConnection = {
        platform: "YOUTUBE",
        platformUserId,
        platformHandle: handle.startsWith("@") ? handle : `@${handle}`,
        channelTitle: handle.startsWith("@") ? handle : `@${handle}`,
        thumbnailUrl: undefined,
        connectedAt: new Date().toISOString(),
        accessToken: "demo:youtube",
        isDemo: true,
      };

      upsertSnsConnection(userId, next);
      await syncSnsConnectionToBackend(userId, next);
      setConnection(next);
      setMessage("YouTube アカウントを連携しました（デモ）。");
    } catch {
      setMessage("連携の保存に失敗しました。");
    } finally {
      setBusy(false);
    }
  }, [channelInput, userId]);

  const handleDisconnect = useCallback(async () => {
    setBusy(true);
    setMessage(null);

    try {
      removeSnsConnection(userId, "YOUTUBE");
      await removeSnsConnectionFromBackend(userId, "YOUTUBE");
      setConnection(null);
      setChannelInput("");
      setMessage("YouTube 連携を解除しました。");
    } catch {
      setMessage("連携解除に失敗しました。");
    } finally {
      setBusy(false);
    }
  }, [userId]);

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-red-500/20 bg-[#0d0d18]/85 p-6 shadow-[0_0_40px_rgba(239,68,68,0.08)] backdrop-blur">
      <div className="mb-6 flex items-start gap-4">
        <SnsPlatformIcon icon="youtube" className="h-12 w-12 shrink-0" />
        <div>
          <h1 className="text-2xl font-bold text-white">YouTube 連携</h1>
          <p className="mt-1 text-sm text-gray-400">
            本人の YouTube チャンネルを連携し、Shorts をマップ公開の対象にします。
          </p>
        </div>
      </div>

      {connection ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4">
            <p className="text-xs uppercase tracking-wider text-cyan-400/80">
              連携中のアカウント
            </p>
            <div className="mt-3 flex items-center gap-3">
              {connection.thumbnailUrl ? (
                <Image
                  src={connection.thumbnailUrl}
                  alt=""
                  width={48}
                  height={48}
                  unoptimized
                  className="h-12 w-12 rounded-full border border-violet-400/30 object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-red-800 text-lg font-bold text-white">
                  YT
                </div>
              )}
              <div>
                <p className="font-semibold text-white">
                  {connection.channelTitle ?? connection.platformHandle}
                </p>
                <p className="text-sm text-gray-400">{connection.platformHandle}</p>
                {connection.isDemo && (
                  <p className="mt-1 text-xs text-amber-300">デモ連携</p>
                )}
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              連携日時: {new Date(connection.connectedAt).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/publish"
              className="rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            >
              投稿を公開する
            </Link>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={busy}
              className="rounded-xl border border-red-500/40 px-5 py-3 text-sm text-red-300 hover:bg-red-950/30 disabled:opacity-60"
            >
              連携を解除
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {oauthAvailable ? (
            <button
              type="button"
              onClick={handleOAuthConnect}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#FF0000] px-5 py-3.5 font-semibold text-white shadow-[0_0_24px_rgba(255,0,0,0.25)] transition-opacity hover:opacity-90"
            >
              <SnsPlatformIcon icon="youtube" className="h-6 w-6" />
              Google で YouTube を連携
            </button>
          ) : (
            <div className="rounded-xl border border-amber-500/25 bg-amber-950/30 p-4 text-sm text-amber-100">
              <p className="font-medium">OAuth 未設定</p>
              <p className="mt-1 text-amber-200/80">
                本番連携には <code className="text-amber-300">NEXT_PUBLIC_YOUTUBE_CLIENT_ID</code>{" "}
                の設定が必要です。今はデモ連携をご利用ください。
              </p>
            </div>
          )}

          <div className="rounded-xl border border-violet-500/20 bg-black/20 p-4">
            <label
              htmlFor="youtube-channel"
              className="mb-2 block text-sm font-medium text-violet-200"
            >
              チャンネル（デモ連携）
            </label>
            <input
              id="youtube-channel"
              type="text"
              value={channelInput}
              onChange={(event) => setChannelInput(event.target.value)}
              placeholder="@your-channel または チャンネルURL"
              className="w-full rounded-xl border border-violet-500/30 bg-[#12121f] px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
            />
            <button
              type="button"
              onClick={handleDemoConnect}
              disabled={busy}
              className="mt-3 rounded-xl border border-violet-500/40 px-5 py-2.5 text-sm text-violet-200 hover:bg-violet-950/40 disabled:opacity-60"
            >
              {busy ? "連携中..." : "デモで連携する"}
            </button>
          </div>

          {isDemo && (
            <p className="text-xs text-gray-500">
              Cognito 未接続時はローカルにのみ保存されます。
            </p>
          )}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-violet-500/10 bg-violet-950/20 p-4 text-sm text-gray-400">
        <p className="mb-2 font-medium text-violet-200">今後の拡張</p>
        <p>
          動画画面には Instagram や X などの連携ボタンを追加予定です。
          各プラットフォームは同じ連携基盤で管理します。
        </p>
      </div>

      {message && <p className="mt-4 text-sm text-cyan-300">{message}</p>}
    </div>
  );
}
