"use client";

import {
  MAP_SKIN_LIST,
  type MapSkinId,
} from "@/lib/map-skins";

interface MapSkinSwitcherProps {
  value: MapSkinId;
  onChange: (skinId: MapSkinId) => void;
}

export function MapSkinSwitcher({ value, onChange }: MapSkinSwitcherProps) {
  const officialSkins = MAP_SKIN_LIST.filter((skin) => skin.officialStyle);
  const neonSkins = MAP_SKIN_LIST.filter((skin) => !skin.officialStyle);

  const renderSkinButton = (skin: (typeof MAP_SKIN_LIST)[number]) => {
    const active = value === skin.id;
    const { background, land, water, roads } = skin.palette;
    return (
      <button
        key={skin.id}
        type="button"
        onClick={() => onChange(skin.id)}
        title={skin.label}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
          active
            ? "bg-white/10 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)] ring-1 ring-violet-400/50"
            : "text-gray-400 hover:text-violet-200 hover:bg-white/5"
        }`}
      >
        <span className="w-5 h-5 rounded-md shrink-0 ring-1 ring-white/20 overflow-hidden grid grid-cols-2 grid-rows-2">
          <span style={{ background }} />
          <span style={{ background: land }} />
          <span style={{ background: water }} />
          <span style={{ background: roads.motorway }} />
        </span>
        {skin.label}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-wider text-gray-500 px-1">
        マップスキン
      </span>
      <div className="flex flex-col gap-1.5">
        <div>
          <p className="mb-1 px-1 text-[10px] text-cyan-400/70">公式 Mapbox</p>
          <div className="flex gap-1 p-1 rounded-xl bg-[#0d0d18]/90 backdrop-blur border border-cyan-500/20 overflow-x-auto max-w-[calc(100vw-2rem)] sm:max-w-none">
            {officialSkins.map(renderSkinButton)}
          </div>
        </div>
        <div>
          <p className="mb-1 px-1 text-[10px] text-violet-400/70">ネオン</p>
          <div className="flex gap-1 p-1 rounded-xl bg-[#0d0d18]/90 backdrop-blur border border-violet-500/20 overflow-x-auto max-w-[calc(100vw-2rem)] sm:max-w-none">
            {neonSkins.map(renderSkinButton)}
          </div>
        </div>
      </div>
    </div>
  );
}
