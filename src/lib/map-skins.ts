import type { Map as MapboxMap, LayerSpecification } from "mapbox-gl";

export type MapSkinId =
  | "streets-japan"
  | "satellite-streets"
  | "violet"
  | "cyber"
  | "sakura"
  | "midnight"
  | "gold"
  | "google";

/** Mapbox 公式スタイル URL（設定時はカスタム配色を適用しない） */
export const OFFICIAL_MAP_STYLES = {
  "streets-japan": "mapbox://styles/mapbox/streets-v12",
  "satellite-streets": "mapbox://styles/mapbox/satellite-streets-v12",
} as const;

const NEON_BASE_STYLE = "mapbox://styles/mapbox/dark-v11";

/** 地図ベース（土地・水・地形）のカラーセット */
export interface MapSkinBase {
  background: string;
  land: string;
  landuse: string;
  water: string;
  waterway: string;
  park: string;
  grass: string;
  wood: string;
  scrub: string;
  sand: string;
  hillshadeShadow: string;
  hillshadeHighlight: string;
  aeroway: string;
  structure: string;
  building: string;
  buildingTop: string;
  admin: string;
}

export interface MapSkinPalette extends MapSkinBase {
  label: string;
  labelHalo: string;
  roads: {
    motorway: string;
    trunk: string;
    primary: string;
    secondary: string;
    tertiary: string;
    street: string;
    default: string;
  };
}

export interface MapSkinDefinition {
  id: MapSkinId;
  label: string;
  /** 公式 Mapbox スタイル（指定時は公式デザインをそのまま表示） */
  officialStyle?: string;
  useNeonOverlay?: boolean;
  palette: MapSkinPalette;
  fog: {
    color: string;
    "high-color": string;
    "horizon-blend": number;
    "space-color": string;
    "star-intensity": number;
  };
  light: {
    color: string;
    intensity: number;
    position: [number, number, number];
  };
  pinGlow: { outer: string; inner: string };
  canvasFilter: string;
  hillshadeExaggeration: number;
}

export const MAP_SKINS: Record<MapSkinId, MapSkinDefinition> = {
  "streets-japan": {
    id: "streets-japan",
    label: "Streets Japan",
    officialStyle: OFFICIAL_MAP_STYLES["streets-japan"],
    useNeonOverlay: false,
    palette: {
      background: "#f2efe9",
      land: "#e6f0e4",
      landuse: "#dfead9",
      water: "#aadaff",
      waterway: "#8ec8f8",
      park: "#c8e6c9",
      grass: "#d4e8c8",
      wood: "#b8d4b0",
      scrub: "#cfe8c4",
      sand: "#f0e9d8",
      hillshadeShadow: "#d8d4cc",
      hillshadeHighlight: "#faf8f4",
      aeroway: "#e8e6e0",
      structure: "#ebe8e2",
      building: "#e0dcd4",
      buildingTop: "#d4d0c8",
      admin: "#c9b2da",
      label: "#5f6368",
      labelHalo: "#f2efe9",
      roads: {
        motorway: "#f9bc67",
        trunk: "#f9bc67",
        primary: "#ffffff",
        secondary: "#d8d8d8",
        tertiary: "#c8c8c8",
        street: "#b0b0b0",
        default: "#a8a8a8",
      },
    },
    fog: {
      color: "rgb(242, 239, 233)",
      "high-color": "rgb(200, 220, 240)",
      "horizon-blend": 0.05,
      "space-color": "rgb(230, 235, 245)",
      "star-intensity": 0,
    },
    light: { color: "#ffffff", intensity: 0.3, position: [1.15, 200, 70] },
    pinGlow: { outer: "#4285f4", inner: "#ea4335" },
    canvasFilter: "none",
    hillshadeExaggeration: 0.1,
  },
  "satellite-streets": {
    id: "satellite-streets",
    label: "Satellite Streets",
    officialStyle: OFFICIAL_MAP_STYLES["satellite-streets"],
    useNeonOverlay: false,
    palette: {
      background: "#1a1a1a",
      land: "#2d3a28",
      landuse: "#354030",
      water: "#1a3a5c",
      waterway: "#1e4a6e",
      park: "#2a4a2a",
      grass: "#3a5238",
      wood: "#243820",
      scrub: "#304828",
      sand: "#4a4438",
      hillshadeShadow: "#0a0a0a",
      hillshadeHighlight: "#4a5a40",
      aeroway: "#3a3a3a",
      structure: "#333333",
      building: "#404040",
      buildingTop: "#505050",
      admin: "#888888",
      label: "#ffffff",
      labelHalo: "#1a1a1a",
      roads: {
        motorway: "#f9bc67",
        trunk: "#f9bc67",
        primary: "#ffffff",
        secondary: "#e0e0e0",
        tertiary: "#d0d0d0",
        street: "#c8c8c8",
        default: "#b0b0b0",
      },
    },
    fog: {
      color: "rgb(20, 24, 20)",
      "high-color": "rgb(60, 80, 60)",
      "horizon-blend": 0.08,
      "space-color": "rgb(10, 12, 10)",
      "star-intensity": 0,
    },
    light: { color: "#ffffff", intensity: 0.25, position: [1.2, 210, 60] },
    pinGlow: { outer: "#fbbf24", inner: "#f59e0b" },
    canvasFilter: "none",
    hillshadeExaggeration: 0.1,
  },
  violet: {
    id: "violet",
    label: "バイオレット",
    palette: {
      background: "#05040c",
      land: "#12101e",
      landuse: "#16132a",
      water: "#180838",
      waterway: "#3b1d8a",
      park: "#0a1220",
      grass: "#0c1018",
      wood: "#0a0e16",
      scrub: "#0e0c18",
      sand: "#12101a",
      hillshadeShadow: "#030208",
      hillshadeHighlight: "#2a1848",
      aeroway: "#14102a",
      structure: "#12101e",
      building: "#1a1030",
      buildingTop: "#241845",
      admin: "#4c1d95",
      label: "#e9d5ff",
      labelHalo: "#05040c",
      roads: {
        motorway: "#22d3ee",
        trunk: "#38bdf8",
        primary: "#67e8f9",
        secondary: "#a78bfa",
        tertiary: "#c084fc",
        street: "#8b5cf6",
        default: "#6d28d9",
      },
    },
    fog: {
      color: "rgb(5, 4, 12)",
      "high-color": "rgb(109, 40, 217)",
      "horizon-blend": 0.22,
      "space-color": "rgb(3, 2, 8)",
      "star-intensity": 0.5,
    },
    light: { color: "#c4b5fd", intensity: 0.55, position: [1.2, 210, 60] },
    pinGlow: { outer: "#e879f9", inner: "#a78bfa" },
    canvasFilter: "saturate(1.55) contrast(1.15) brightness(0.9)",
    hillshadeExaggeration: 0.25,
  },
  cyber: {
    id: "cyber",
    label: "サイバー",
    palette: {
      background: "#010a0c",
      land: "#061a14",
      landuse: "#082218",
      water: "#022830",
      waterway: "#0d9488",
      park: "#051a14",
      grass: "#061c16",
      wood: "#041a14",
      scrub: "#061812",
      sand: "#081a16",
      hillshadeShadow: "#010806",
      hillshadeHighlight: "#0a4030",
      aeroway: "#082018",
      structure: "#061816",
      building: "#0a2820",
      buildingTop: "#0f3830",
      admin: "#065f46",
      label: "#a7f3d0",
      labelHalo: "#010a0c",
      roads: {
        motorway: "#00ffcc",
        trunk: "#2dd4bf",
        primary: "#34d399",
        secondary: "#10b981",
        tertiary: "#059669",
        street: "#047857",
        default: "#065f46",
      },
    },
    fog: {
      color: "rgb(1, 10, 12)",
      "high-color": "rgb(16, 185, 129)",
      "horizon-blend": 0.18,
      "space-color": "rgb(1, 6, 10)",
      "star-intensity": 0.35,
    },
    light: { color: "#6ee7b7", intensity: 0.5, position: [1.5, 200, 70] },
    pinGlow: { outer: "#34d399", inner: "#00ffcc" },
    canvasFilter: "saturate(1.7) contrast(1.2) brightness(0.88) hue-rotate(-10deg)",
    hillshadeExaggeration: 0.25,
  },
  sakura: {
    id: "sakura",
    label: "サクラ",
    palette: {
      background: "#ffffff",
      land: "#ffffff",
      landuse: "#fefefe",
      water: "#3d1028",
      waterway: "#db2777",
      park: "#fffafa",
      grass: "#ffffff",
      wood: "#fdf8fa",
      scrub: "#fefefe",
      sand: "#fffaf8",
      hillshadeShadow: "#ebe6e8",
      hillshadeHighlight: "#ffffff",
      aeroway: "#f5f0f2",
      structure: "#f8f4f6",
      building: "#f0e8ec",
      buildingTop: "#e8dce2",
      admin: "#db2777",
      label: "#831843",
      labelHalo: "#ffffff",
      roads: {
        motorway: "#ec4899",
        trunk: "#f472b6",
        primary: "#f9a8d4",
        secondary: "#e879f9",
        tertiary: "#d946ef",
        street: "#c026d3",
        default: "#a21caf",
      },
    },
    fog: {
      color: "rgb(255, 252, 253)",
      "high-color": "rgb(251, 207, 232)",
      "horizon-blend": 0.15,
      "space-color": "rgb(253, 248, 250)",
      "star-intensity": 0.1,
    },
    light: { color: "#ffffff", intensity: 0.65, position: [1.0, 190, 55] },
    pinGlow: { outer: "#f472b6", inner: "#e879f9" },
    canvasFilter: "saturate(1.25) contrast(1.05) brightness(1.05)",
    hillshadeExaggeration: 0.04,
  },
  midnight: {
    id: "midnight",
    label: "ミッドナイト",
    palette: {
      background: "#020408",
      land: "#0a1420",
      landuse: "#0c1828",
      water: "#061428",
      waterway: "#1d4ed8",
      park: "#081018",
      grass: "#0a1218",
      wood: "#081016",
      scrub: "#0a1018",
      sand: "#0c1218",
      hillshadeShadow: "#010306",
      hillshadeHighlight: "#142848",
      aeroway: "#0c1420",
      structure: "#0a1018",
      building: "#0c1828",
      buildingTop: "#102038",
      admin: "#1e3a8a",
      label: "#bfdbfe",
      labelHalo: "#020408",
      roads: {
        motorway: "#60a5fa",
        trunk: "#3b82f6",
        primary: "#2563eb",
        secondary: "#1d4ed8",
        tertiary: "#1e40af",
        street: "#1e3a8a",
        default: "#172554",
      },
    },
    fog: {
      color: "rgb(2, 4, 8)",
      "high-color": "rgb(30, 58, 138)",
      "horizon-blend": 0.15,
      "space-color": "rgb(1, 2, 6)",
      "star-intensity": 0.6,
    },
    light: { color: "#93c5fd", intensity: 0.4, position: [1.3, 220, 50] },
    pinGlow: { outer: "#3b82f6", inner: "#60a5fa" },
    canvasFilter: "saturate(1.2) contrast(1.1) brightness(0.85)",
    hillshadeExaggeration: 0.25,
  },
  gold: {
    id: "gold",
    label: "ゴールド",
    palette: {
      background: "#0a0602",
      land: "#1a1006",
      landuse: "#221408",
      water: "#1a0c04",
      waterway: "#b45309",
      park: "#181004",
      grass: "#1a1206",
      wood: "#161004",
      scrub: "#1a1006",
      sand: "#201408",
      hillshadeShadow: "#080402",
      hillshadeHighlight: "#483018",
      aeroway: "#201408",
      structure: "#1a1006",
      building: "#281808",
      buildingTop: "#382210",
      admin: "#92400e",
      label: "#fef3c7",
      labelHalo: "#0a0602",
      roads: {
        motorway: "#fbbf24",
        trunk: "#f59e0b",
        primary: "#fcd34d",
        secondary: "#d97706",
        tertiary: "#b45309",
        street: "#92400e",
        default: "#78350f",
      },
    },
    fog: {
      color: "rgb(10, 6, 2)",
      "high-color": "rgb(180, 83, 9)",
      "horizon-blend": 0.2,
      "space-color": "rgb(6, 4, 1)",
      "star-intensity": 0.45,
    },
    light: { color: "#fde68a", intensity: 0.48, position: [1.1, 180, 65] },
    pinGlow: { outer: "#f59e0b", inner: "#fbbf24" },
    canvasFilter: "saturate(1.4) contrast(1.12) brightness(0.9) sepia(0.15)",
    hillshadeExaggeration: 0.25,
  },
  google: {
    id: "google",
    label: "Google風",
    palette: {
      background: "#e6f0e4",
      land: "#e6f0e4",
      landuse: "#dfead9",
      water: "#aadaff",
      waterway: "#8ec8f8",
      park: "#c8e6c9",
      grass: "#d4e8c8",
      wood: "#b8d4b0",
      scrub: "#cfe8c4",
      sand: "#e8f0dc",
      hillshadeShadow: "#c8dcc4",
      hillshadeHighlight: "#f2f8f0",
      aeroway: "#e0ebe0",
      structure: "#dfead9",
      building: "#d8e4d4",
      buildingTop: "#ccdcc8",
      admin: "#c9b2da",
      label: "#5f6368",
      labelHalo: "#e6f0e4",
      roads: {
        motorway: "#f9bc67",
        trunk: "#f9bc67",
        primary: "#d8d8d8",
        secondary: "#c8c8c8",
        tertiary: "#bdbdbd",
        street: "#b0b0b0",
        default: "#a8a8a8",
      },
    },
    fog: {
      color: "rgb(230, 240, 228)",
      "high-color": "rgb(200, 220, 240)",
      "horizon-blend": 0.08,
      "space-color": "rgb(230, 235, 245)",
      "star-intensity": 0,
    },
    light: { color: "#ffffff", intensity: 0.35, position: [1.15, 200, 70] },
    pinGlow: { outer: "#ea4335", inner: "#4285f4" },
    canvasFilter: "saturate(1.08) contrast(1.04) brightness(1.06)",
    hillshadeExaggeration: 0.12,
  },
};

export const MAP_SKIN_LIST = Object.values(MAP_SKINS);

/** 公式 Mapbox スタイルかどうか */
export function isOfficialMapStyle(skinId: MapSkinId): boolean {
  return !!MAP_SKINS[skinId].officialStyle;
}

/** スキンに対応する Mapbox スタイル URL */
export function getMapStyleUrl(skinId: MapSkinId): string {
  return MAP_SKINS[skinId].officialStyle ?? NEON_BASE_STYLE;
}

/** スキンに応じたカメラ設定 */
export function getMapCameraForSkin(skinId: MapSkinId): {
  pitch: number;
  bearing: number;
} {
  if (skinId === "streets-japan") return { pitch: 0, bearing: 0 };
  if (skinId === "satellite-streets") return { pitch: 45, bearing: 0 };
  return { pitch: 52, bearing: -15 };
}

const STORAGE_KEY = "xy-map-skin";

export function getStoredMapSkin(): MapSkinId {
  if (typeof window === "undefined") return "violet";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored in MAP_SKINS) return stored as MapSkinId;
  return "violet";
}

export function storeMapSkin(skinId: MapSkinId) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, skinId);
  }
}

function trySetPaint(
  map: MapboxMap,
  layerId: string,
  prop: string,
  value: unknown
) {
  if (!map.getLayer(layerId)) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.setPaintProperty(layerId, prop as any, value);
  } catch {
    // レイヤーによってはプロパティ非対応
  }
}

function trySetLayout(
  map: MapboxMap,
  layerId: string,
  prop: string,
  value: unknown
) {
  if (!map.getLayer(layerId)) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.setLayoutProperty(layerId, prop as any, value);
  } catch {
    // ignore
  }
}

function roadColor(layerId: string, palette: MapSkinPalette): string | null {
  const { roads } = palette;
  if (layerId.includes("motorway")) return roads.motorway;
  if (layerId.includes("trunk")) return roads.trunk;
  if (layerId.includes("primary")) return roads.primary;
  if (layerId.includes("secondary")) return roads.secondary;
  if (layerId.includes("tertiary")) return roads.tertiary;
  if (
    layerId.includes("street") ||
    layerId.includes("minor") ||
    layerId.includes("service") ||
    layerId.includes("path")
  ) {
    return roads.street;
  }
  if (
    layerId.includes("road") ||
    layerId.includes("bridge") ||
    layerId.includes("tunnel")
  ) {
    return roads.default;
  }
  return null;
}

function getSourceLayer(layer: LayerSpecification): string | undefined {
  const sl = (layer as { "source-layer"?: string })["source-layer"];
  return typeof sl === "string" ? sl : undefined;
}

function landcoverColor(id: string, palette: MapSkinPalette): string {
  if (id.includes("wood") || id.includes("forest")) return palette.wood;
  if (id.includes("grass") || id.includes("crop")) return palette.grass;
  if (id.includes("scrub") || id.includes("snow")) return palette.scrub;
  if (id.includes("sand") || id.includes("beach")) return palette.sand;
  if (id.includes("park") || id.includes("national")) return palette.park;
  return palette.land;
}

function applyBaseLayer(
  map: MapboxMap,
  layer: LayerSpecification,
  palette: MapSkinPalette,
  hillshadeExaggeration: number
) {
  const { id, type } = layer;
  const sourceLayer = getSourceLayer(layer);

  if (type === "background") {
    trySetPaint(map, id, "background-color", palette.background);
    return;
  }

  if (type === "fill") {
    // 海・湖（water ソースレイヤー）
    if (
      sourceLayer === "water" ||
      (id.includes("water") &&
        !id.includes("waterway") &&
        !id.includes("water-line"))
    ) {
      trySetPaint(map, id, "fill-color", palette.water);
      trySetPaint(map, id, "fill-opacity", 1);
      return;
    }

    // 地面（landcover = 草地・森林などのポリゴン）
    if (sourceLayer === "landcover") {
      trySetPaint(map, id, "fill-color", landcoverColor(id, palette));
      trySetPaint(map, id, "fill-opacity", 0.95);
      return;
    }

    // 土地利用
    if (sourceLayer === "landuse" || id.includes("landuse")) {
      trySetPaint(map, id, "fill-color", palette.landuse);
      trySetPaint(map, id, "fill-opacity", 0.92);
      return;
    }

    if (
      id.includes("park") ||
      id.includes("national-park") ||
      id.includes("pitch") ||
      id.includes("cemetery")
    ) {
      trySetPaint(map, id, "fill-color", palette.park);
      trySetPaint(map, id, "fill-opacity", 0.9);
      return;
    }

    if (id.includes("aeroway") || id.includes("runway") || id.includes("taxiway")) {
      trySetPaint(map, id, "fill-color", palette.aeroway);
      trySetPaint(map, id, "fill-opacity", 0.8);
      return;
    }

    if (id.includes("structure") || id.includes("pier")) {
      trySetPaint(map, id, "fill-color", palette.structure);
      trySetPaint(map, id, "fill-opacity", 0.85);
      return;
    }

    // ベース土地ポリゴン（スタイルによっては land レイヤー）
    if (id === "land" || sourceLayer === "land") {
      trySetPaint(map, id, "fill-color", palette.land);
      trySetPaint(map, id, "fill-opacity", 1);
      return;
    }

    // フォールバック: 未分類の fill は土地色
    if (id.includes("land") && !id.includes("island")) {
      trySetPaint(map, id, "fill-color", palette.land);
      trySetPaint(map, id, "fill-opacity", 0.9);
    }
    return;
  }

  if (type === "line") {
    // 川・河川（waterway ソースレイヤー）
    if (sourceLayer === "waterway" || id.includes("waterway")) {
      trySetPaint(map, id, "line-color", palette.waterway);
      trySetPaint(map, id, "line-opacity", 0.95);
      trySetPaint(map, id, "line-blur", 0.6);
      return;
    }
    if (id.includes("admin")) {
      trySetPaint(map, id, "line-color", palette.admin);
      trySetPaint(map, id, "line-opacity", 0.35);
      return;
    }
    const color = roadColor(id, palette);
    if (color) {
      const isMajor = id.includes("motorway") || id.includes("trunk");
      trySetPaint(map, id, "line-color", color);
      trySetPaint(map, id, "line-opacity", isMajor ? 0.95 : 0.78);
      trySetPaint(map, id, "line-blur", isMajor ? 1.0 : 0.55);
    }
    return;
  }

  if (type === "fill-extrusion") {
    if (id.includes("building")) {
      trySetPaint(
        map,
        id,
        "fill-extrusion-color",
        id.includes("top") ? palette.buildingTop : palette.building
      );
      trySetPaint(map, id, "fill-extrusion-opacity", 0.65);
      trySetLayout(map, id, "fill-extrusion-vertical-gradient", true);
    }
    return;
  }

  if (type === "hillshade") {
    trySetPaint(map, id, "hillshade-shadow-color", palette.hillshadeShadow);
    trySetPaint(map, id, "hillshade-highlight-color", palette.hillshadeHighlight);
    // 地形シャドウを弱めて土地色が見えるようにする
    trySetPaint(map, id, "hillshade-exaggeration", hillshadeExaggeration);
    return;
  }

  if (type === "symbol") {
    if (id.includes("label") || id.includes("place") || id.includes("road-name")) {
      trySetPaint(map, id, "text-color", palette.label);
      trySetPaint(map, id, "text-halo-color", palette.labelHalo);
      trySetPaint(map, id, "text-halo-width", 1.4);
      trySetPaint(map, id, "text-halo-blur", 0.5);
    }
  }
}

export function applyMapSkin(map: MapboxMap, skinId: MapSkinId) {
  if (!map.isStyleLoaded()) return;
  if (isOfficialMapStyle(skinId)) return;

  const skin = MAP_SKINS[skinId];
  const { palette, fog, light } = skin;

  try {
    map.setFog(fog);
  } catch {
    // ignore
  }

  try {
    map.setLight({
      anchor: "viewport",
      color: light.color,
      intensity: light.intensity,
      position: light.position,
    });
  } catch {
    // ignore
  }

  if (map.getLayer("sky")) {
    trySetPaint(map, "sky", "sky-atmosphere-color", palette.background);
    trySetPaint(map, "sky", "sky-atmosphere-halo-color", palette.hillshadeHighlight);
  }

  const layers = map.getStyle()?.layers ?? [];
  for (const layer of layers) {
    if (layer.id.startsWith("pin-") || layer.id === "pins-layer") continue;
    applyBaseLayer(map, layer, palette, skin.hillshadeExaggeration);
  }

  if (map.getLayer("pin-glow-outer")) {
    trySetPaint(map, "pin-glow-outer", "circle-color", skin.pinGlow.outer);
  }
  if (map.getLayer("pin-glow")) {
    trySetPaint(map, "pin-glow", "circle-color", skin.pinGlow.inner);
  }
}

/** タイル読み込み後にも再適用（言語プラグイン等でスタイルが上書きされた場合） */
export function scheduleApplyMapSkin(map: MapboxMap, skinId: MapSkinId) {
  const apply = () => applyMapSkin(map, skinId);
  apply();
  requestAnimationFrame(apply);
  map.once("idle", apply);
}
