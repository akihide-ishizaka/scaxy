"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";
import { getDataClient } from "@/lib/data-client";
import {
  type RegisteredLocation,
  readProfileSettings,
  writeProfileSettings,
} from "@/lib/profile-settings";

async function fileToAvatarDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const size = 160;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("icon conversion failed");
  ctx.drawImage(bitmap, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function formatLocation(location: RegisteredLocation | null) {
  if (!location) return "未取得";
  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
}

interface AccountProfileFormProps {
  userId: string;
  defaultDisplayName: string;
  defaultAvatarUrl: string | null;
  isCognitoEnabled: boolean;
  refreshSession: () => Promise<void>;
}

function AccountProfileForm({
  userId,
  defaultDisplayName,
  defaultAvatarUrl,
  isCognitoEnabled,
  refreshSession,
}: AccountProfileFormProps) {
  const initialSettings = useMemo(
    () => readProfileSettings(userId),
    [userId]
  );
  const [accountName, setAccountName] = useState(
    initialSettings?.accountName ?? defaultDisplayName
  );
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(
    initialSettings?.avatarDataUrl ?? defaultAvatarUrl
  );
  const [location, setLocation] = useState<RegisteredLocation | null>(
    initialSettings?.location ?? null
  );
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const initials = useMemo(() => {
    if (accountName.trim().length > 0) return accountName.trim().slice(0, 1).toUpperCase();
    return "X";
  }, [accountName]);

  const handleIconSelect = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const converted = await fileToAvatarDataUrl(file);
      setAvatarDataUrl(converted);
      setMessage("アイコン画像を更新しました。");
    } catch {
      setMessage("画像の読み込みに失敗しました。別の画像を選択してください。");
    } finally {
      event.target.value = "";
    }
  }, []);

  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setMessage("このブラウザでは位置情報が利用できません。");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          updatedAt: new Date().toISOString(),
        });
        setMessage("現在地を取得しました。");
      },
      () => {
        setLocating(false);
        setMessage("位置情報を取得できませんでした。権限設定を確認してください。");
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
      }
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    setMessage(null);

    try {
      writeProfileSettings(userId, {
        accountName: accountName.trim(),
        avatarDataUrl: avatarDataUrl ?? undefined,
        location: location ?? undefined,
      });

      if (isCognitoEnabled && accountName.trim().length > 0) {
        const client = getDataClient();
        await client.models.User.update({
          id: userId,
          displayName: accountName.trim(),
        });
        await refreshSession();
      }

      setMessage("ユーザー情報を保存しました。");
    } catch {
      setMessage("保存に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setSaving(false);
    }
  }, [accountName, avatarDataUrl, isCognitoEnabled, location, refreshSession, userId]);

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-violet-500/20 bg-[#0d0d18]/85 p-6 shadow-[0_0_40px_rgba(139,92,246,0.15)] backdrop-blur">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-violet-100">ユーザー情報登録</h1>
        <p className="mt-1 text-sm text-gray-400">
          アイコン画像、カレント座標、アカウント名を登録できます。
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <p className="mb-2 text-sm font-medium text-violet-200">アイコン画像（丸）</p>
          <div className="flex items-center gap-4">
            {avatarDataUrl ? (
              <Image
                src={avatarDataUrl}
                alt="プロフィールアイコン"
                width={80}
                height={80}
                unoptimized
                className="h-20 w-20 rounded-full border border-violet-400/40 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-fuchsia-600 text-2xl font-bold text-white">
                {initials}
              </div>
            )}
            <label className="cursor-pointer rounded-lg border border-violet-500/40 px-4 py-2 text-sm text-violet-200 hover:bg-violet-950/50">
              画像を選択
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleIconSelect}
                className="hidden"
              />
            </label>
          </div>
        </section>

        <section>
          <p className="mb-2 text-sm font-medium text-violet-200">カレント座標</p>
          <div className="rounded-xl border border-violet-500/20 bg-black/20 p-4">
            <p className="text-sm text-gray-300">{formatLocation(location)}</p>
            {location?.updatedAt && (
              <p className="mt-1 text-xs text-gray-500">
                取得時刻: {new Date(location.updatedAt).toLocaleString()}
              </p>
            )}
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={locating}
              className="mt-3 rounded-lg border border-cyan-500/40 px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-950/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {locating ? "取得中..." : "現在地を取得"}
            </button>
          </div>
        </section>

        <section>
          <label htmlFor="account-name" className="mb-2 block text-sm font-medium text-violet-200">
            アカウント名
          </label>
          <input
            id="account-name"
            type="text"
            value={accountName}
            onChange={(event) => setAccountName(event.target.value)}
            placeholder="アカウント名を入力"
            maxLength={30}
            className="w-full rounded-xl border border-violet-500/30 bg-[#12121f] px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
          />
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "保存中..." : "登録する"}
          </button>
          <Link
            href="/map"
            className="rounded-xl border border-violet-500/40 px-6 py-3 text-violet-200 hover:bg-violet-950/40"
          >
            マップに戻る
          </Link>
        </div>

        {message && <p className="text-sm text-cyan-300">{message}</p>}
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { profile, isCognitoEnabled, refreshSession } = useAuth();

  return (
    <main className="min-h-screen bg-[#0a0a12] text-white">
      <Header />
      <div className="px-4 pb-16 pt-24 sm:px-6">
        <RequireAuth>
          {profile ? (
            <AccountProfileForm
              key={profile.userId}
              userId={profile.userId}
              defaultDisplayName={profile.displayName}
              defaultAvatarUrl={profile.avatarUrl ?? null}
              isCognitoEnabled={isCognitoEnabled}
              refreshSession={refreshSession}
            />
          ) : null}
        </RequireAuth>
      </div>
    </main>
  );
}
