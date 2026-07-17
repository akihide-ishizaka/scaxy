"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SnsLinkButton } from "@/components/sns/SnsLinkButton";
import { useAuth } from "@/contexts/AuthContext";
import { publishPin } from "@/lib/publish-pin";
import { readSnsConnection } from "@/lib/sns-connections";
import type { SnsPlatform } from "@/lib/types";

export function PublishPanel() {
  const router = useRouter();
  const { profile, isCognitoEnabled } = useAuth();
  const userId = profile?.userId ?? "";
  const youtubeConnected = userId
    ? !!readSnsConnection(userId, "YOUTUBE")
    : false;
  const instagramConnected = userId
    ? !!readSnsConnection(userId, "INSTAGRAM")
    : false;

  const [sourceUrl, setSourceUrl] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [latitude, setLatitude] = useState(35.6595);
  const [longitude, setLongitude] = useState(139.7004);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleGeocode = async () => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !locationQuery.trim()) return;

    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationQuery)}.json?access_token=${token}&language=ja&limit=1`
      );
      const data = await res.json();
      const [lng, lat] = data.features?.[0]?.center ?? [];
      if (lat && lng) {
        setLatitude(lat);
        setLongitude(lng);
        setError(null);
      } else {
        setError("場所が見つかりませんでした");
      }
    } catch {
      setError("ジオコーディングに失敗しました");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError("ログインが必要です");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      let platform: SnsPlatform | null = null;
      if (sourceUrl.includes("instagram.com")) platform = "INSTAGRAM";
      else if (sourceUrl.includes("youtube.com") || sourceUrl.includes("youtu.be"))
        platform = "YOUTUBE";

      if (!platform) {
        throw new Error("Instagram または YouTube Shorts のURLを入力してください");
      }

      if (isCognitoEnabled) {
        const connected =
          platform === "YOUTUBE" ? youtubeConnected : instagramConnected;
        if (!connected) {
          throw new Error(
            `${platform === "YOUTUBE" ? "YouTube" : "Instagram"} を先に連携してください`
          );
        }
      }

      await publishPin({
        userId,
        displayName: profile?.displayName,
        sourceUrl,
        latitude,
        longitude,
      });

      setSuccess(true);
      setSourceUrl("");
      setTimeout(() => {
        router.push("/map");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ピンの登録に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black bg-linear-to-r from-cyan-400 via-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
          ジる — マップに公開
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          OAuth連携したSNSの投稿URLを選び、2タップで地図にピンを刺す
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-violet-200 mb-2">
            投稿URL
          </label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/... または /shorts/..."
            className="w-full px-4 py-3 rounded-lg bg-[#12121f] border border-violet-500/20 text-white placeholder-gray-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            /p/, /reel/, /shorts/ のみ許可。本人のOAuth連携アカウントの投稿のみ登録可能。
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-violet-200 mb-2">
            撮影場所
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="例: 渋谷スクランブル交差点"
              className="flex-1 px-4 py-3 rounded-lg bg-[#12121f] border border-violet-500/20 text-white placeholder-gray-600 focus:border-violet-500/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleGeocode}
              className="px-4 py-3 rounded-lg border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 transition-colors whitespace-nowrap"
            >
              検索
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              className="px-3 py-2 rounded-lg bg-[#12121f] border border-violet-500/20 text-white text-sm"
              placeholder="緯度"
            />
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              className="px-3 py-2 rounded-lg bg-[#12121f] border border-violet-500/20 text-white text-sm"
              placeholder="経度"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-950/30 border border-red-500/20 rounded-lg p-3">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-green-400 bg-green-950/30 border border-green-500/20 rounded-lg p-3">
            ピンを公開しました。マップへ移動します…
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-linear-to-r from-violet-600 via-fuchsia-600 to-cyan-600 text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(139,92,246,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "登録中..." : "xyで公開"}
        </button>
      </form>

      <div className="mt-8 rounded-xl border border-violet-500/10 bg-violet-950/20 p-4">
        <h3 className="mb-2 text-sm font-medium text-violet-200">SNS 連携</h3>
        <p className="mb-4 text-xs text-gray-500">
          本人の投稿のみ登録できます。まず SNS アカウントを連携してください。
        </p>
        <div className="flex flex-wrap gap-2">
          <SnsLinkButton platformId="youtube" connected={youtubeConnected} compact />
          <SnsLinkButton platformId="instagram" compact />
          <SnsLinkButton platformId="x" compact />
        </div>
        <Link
          href="/integrations"
          className="mt-4 inline-block text-xs text-violet-300 hover:text-white"
        >
          連携設定を開く →
        </Link>
      </div>
    </div>
  );
}
