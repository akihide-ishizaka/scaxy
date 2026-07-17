"use client";

import { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/Header";
import { NeonMap } from "@/components/NeonMap";
import { PinCard } from "@/components/PinCard";
import { AuthModal } from "@/components/AuthModal";
import { MapSkinSwitcher } from "@/components/MapSkinSwitcher";
import { DEMO_PINS, isDemoMode } from "@/lib/demo-data";
import { fetchMapPins, readStoredPins } from "@/lib/publish-pin";
import { isAmplifyConfigured } from "@/lib/amplify";
import { useAuth } from "@/contexts/AuthContext";
import {
  getStoredMapSkin,
  storeMapSkin,
  type MapSkinId,
} from "@/lib/map-skins";
import type { Pin, PinSortStrategy } from "@/lib/types";

const SORT_OPTIONS: { value: PinSortStrategy; label: string }[] = [
  { value: "newest", label: "新着" },
  { value: "popular", label: "人気" },
  { value: "following", label: "フォロー中" },
];

const DEFAULT_MAP_SKIN: MapSkinId = "violet";

export default function MapPage() {
  const [pins, setPins] = useState<Pin[]>(DEMO_PINS);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [sortStrategy, setSortStrategy] = useState<PinSortStrategy>("newest");
  // SSR / 初回クライアント描画は同じデフォルトに揃える（localStorage は mount 後）
  const [mapSkin, setMapSkin] = useState<MapSkinId>(DEFAULT_MAP_SKIN);
  const [authOpen, setAuthOpen] = useState(false);
  const isDemo = isDemoMode();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMapSkin(getStoredMapSkin());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (isAmplifyConfigured()) {
          const apiPins = await fetchMapPins();
          if (!cancelled) {
            setPins(apiPins.length > 0 ? apiPins : DEMO_PINS);
          }
          return;
        }

        const localPins = readStoredPins();
        if (!cancelled) {
          setPins(localPins.length > 0 ? [...localPins, ...DEMO_PINS] : DEMO_PINS);
        }
      } catch (err) {
        console.warn("Pin load failed:", err);
        if (!cancelled) setPins(DEMO_PINS);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSkinChange = useCallback((skinId: MapSkinId) => {
    setMapSkin(skinId);
    storeMapSkin(skinId);
  }, []);

  const handlePinSelect = useCallback((pin: Pin) => {
    setSelectedPin(pin);
  }, []);

  const handleReport = useCallback((pinId: string) => {
    if (!isAuthenticated && !isDemo) {
      setAuthOpen(true);
      return;
    }
    setPins((prev) =>
      prev
        .map((p) => {
          if (p.id !== pinId) return p;
          const newCount = p.reportCount + 1;
          return {
            ...p,
            reportCount: newCount,
            status: newCount >= 3 ? ("UNDER_REVIEW" as const) : p.status,
          };
        })
        .filter((p) => p.status === "ACTIVE")
    );
    setSelectedPin(null);
    alert("通報を受け付けました。3件で自動非表示になります。");
  }, [isAuthenticated, isDemo]);

  const handleOutboundClick = useCallback((pinId: string) => {
    setPins((prev) =>
      prev.map((p) =>
        p.id === pinId ? { ...p, clickCount: p.clickCount + 1 } : p
      )
    );
  }, []);

  const visiblePins = pins.filter((p) => p.status === "ACTIVE");

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a12]">
      <Header onLoginClick={() => setAuthOpen(true)} isDemo={isDemo} />

      <div className="absolute top-16 left-4 z-10 flex flex-col gap-3">
        <div className="hidden sm:flex gap-1 p-1 rounded-xl bg-[#0d0d18]/80 backdrop-blur border border-violet-500/20">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSortStrategy(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortStrategy === opt.value
                  ? "bg-linear-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]"
                  : "text-gray-400 hover:text-violet-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <MapSkinSwitcher value={mapSkin} onChange={handleSkinChange} />
      </div>

      <NeonMap
        pins={visiblePins}
        selectedPinId={selectedPin?.id}
        onPinSelect={handlePinSelect}
        sortStrategy={sortStrategy}
        mapSkin={mapSkin}
      />

      <PinCard
        pin={selectedPin}
        onClose={() => setSelectedPin(null)}
        onReport={handleReport}
        onOutboundClick={handleOutboundClick}
      />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
