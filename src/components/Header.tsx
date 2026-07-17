"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { readProfileSettings } from "@/lib/profile-settings";

interface HeaderProps {
  onLoginClick?: () => void;
  isDemo?: boolean;
}

export function Header({ onLoginClick, isDemo: isDemoProp }: HeaderProps) {
  const { isAuthenticated, profile, signOut, isDemo: authDemo, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDemo = isDemoProp ?? authDemo;
  const registeredSettings = profile?.userId ? readProfileSettings(profile.userId) : null;
  const registeredName = registeredSettings?.accountName ?? null;
  const registeredAvatar = registeredSettings?.avatarDataUrl ?? null;

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3">
        <Link href="/" className="group flex items-center gap-2">
          <Image
            src="/icons/icon-192.png"
            alt="xy"
            width={32}
            height={32}
            className="rounded-lg shadow-[0_0_12px_rgba(139,92,246,0.5)]"
          />
          <span className="hidden sm:inline text-xs text-violet-300/70 font-light italic">
            Videos Belong on the Map.
          </span>
        </Link>
        {isDemo && (
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/40 text-amber-300/90 bg-amber-950/40">
            DEMO
          </span>
        )}
      </div>

      <nav className="pointer-events-auto flex items-center gap-2">
        <Link
          href="/publish"
          className="text-sm px-3 py-1.5 rounded-lg border border-violet-500/40 text-violet-200 hover:bg-violet-950/50 transition-colors"
        >
          ジる
        </Link>
        {!loading && isAuthenticated && profile ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-violet-500/30 bg-[#0d0d18]/80 hover:bg-violet-950/40 transition-colors"
            >
              {registeredAvatar ? (
                <Image
                  src={registeredAvatar}
                  alt="avatar"
                  width={28}
                  height={28}
                  unoptimized
                  className="h-7 w-7 rounded-full border border-violet-400/40 object-cover"
                />
              ) : (
                <span className="w-7 h-7 rounded-full bg-linear-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white">
                  {(registeredName ?? profile.displayName)[0]?.toUpperCase() ?? "?"}
                </span>
              )}
              <span className="hidden sm:inline text-sm text-violet-100 max-w-[100px] truncate">
                {registeredName ?? profile.displayName}
              </span>
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden
                />
                <div className="absolute right-0 top-full mt-1 z-40 w-48 py-1 rounded-xl border border-violet-500/20 bg-[#0d0d18]/95 backdrop-blur shadow-xl">
                  <p className="px-4 py-2 text-xs text-gray-500 truncate">
                    {profile.email ?? profile.userId}
                  </p>
                  <Link
                    href="/account"
                    className="block px-4 py-2 text-sm text-violet-200 hover:bg-violet-950/30"
                    onClick={() => setMenuOpen(false)}
                  >
                    ユーザー情報登録
                  </Link>
                  <Link
                    href="/integrations"
                    className="block px-4 py-2 text-sm text-violet-200 hover:bg-violet-950/30"
                    onClick={() => setMenuOpen(false)}
                  >
                    SNS 連携
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setMenuOpen(false);
                      await signOut();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-950/30"
                  >
                    ログアウト
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onLoginClick}
            className="text-sm px-4 py-1.5 rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)]"
          >
            ログイン
          </button>
        )}
      </nav>
    </header>
  );
}
