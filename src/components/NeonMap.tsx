"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Pin, PinSortStrategy } from "@/lib/types";
import {
  MAP_SKINS,
  getMapCameraForSkin,
  getMapStyleUrl,
  isOfficialMapStyle,
  scheduleApplyMapSkin,
  type MapSkinId,
} from "@/lib/map-skins";

const MAP_LANGUAGE = "ja";
const MAP_WORLDVIEW = "JP";

interface NeonMapProps {
  pins: Pin[];
  selectedPinId?: string | null;
  onPinSelect: (pin: Pin) => void;
  sortStrategy?: PinSortStrategy;
  mapSkin?: MapSkinId;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const NEON_PIN_SVG = `
<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#22d3ee"/>
      <stop offset="50%" style="stop-color:#a78bfa"/>
      <stop offset="100%" style="stop-color:#e879f9"/>
    </linearGradient>
  </defs>
  <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24C32 7.2 24.8 0 16 0z"
        fill="url(#pinGrad)" filter="url(#glow)" opacity="0.95"/>
  <circle cx="16" cy="14" r="6" fill="#0a0a12" opacity="0.8"/>
</svg>`;

function pinsToGeoJSON(pins: Pin[], sortStrategy: PinSortStrategy): GeoJSON.FeatureCollection {
  const sorted = [...pins];
  if (sortStrategy === "popular") {
    sorted.sort((a, b) => b.clickCount - a.clickCount);
  } else if (sortStrategy === "newest") {
    sorted.sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );
  }

  return {
    type: "FeatureCollection",
    features: sorted.map((pin, index) => ({
      type: "Feature",
      id: pin.id,
      geometry: {
        type: "Point",
        coordinates: [pin.longitude, pin.latitude],
      },
      properties: {
        pinId: pin.id,
        platform: pin.platform,
        clickCount: pin.clickCount,
        sortKey: sorted.length - index,
      },
    })),
  };
}

function addPinLayers(
  map: mapboxgl.Map,
  pins: Pin[],
  sortStrategy: PinSortStrategy,
  skinId: MapSkinId,
  onPinClick: (pinId: string) => void,
  onReady?: () => void
) {
  const skin = MAP_SKINS[skinId];

  const loadPins = () => {
    const pinImage = new Image(32, 40);
    pinImage.onload = () => {
      if (!map.getStyle()) return;

      if (!map.hasImage("neon-pin")) {
        map.addImage("neon-pin", pinImage, { sdf: false });
      }

      if (!map.getSource("pins")) {
        map.addSource("pins", {
          type: "geojson",
          data: pinsToGeoJSON(pins, sortStrategy),
        });

        map.addLayer({
          id: "pin-glow-outer",
          type: "circle",
          source: "pins",
          paint: {
            "circle-radius": 30,
            "circle-color": skin.pinGlow.outer,
            "circle-opacity": 0.1,
            "circle-blur": 2,
          },
        });

        map.addLayer({
          id: "pin-glow",
          type: "circle",
          source: "pins",
          paint: {
            "circle-radius": 20,
            "circle-color": skin.pinGlow.inner,
            "circle-opacity": 0.28,
            "circle-blur": 1.2,
          },
        });

        map.addLayer({
          id: "pins-layer",
          type: "symbol",
          source: "pins",
          layout: {
            "icon-image": "neon-pin",
            "icon-size": 1,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "symbol-sort-key": ["get", "sortKey"],
          },
        });

        map.on("click", "pins-layer", (e) => {
          const pinId = e.features?.[0]?.properties?.pinId as string | undefined;
          if (pinId) onPinClick(pinId);
        });

        map.on("mouseenter", "pins-layer", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "pins-layer", () => {
          map.getCanvas().style.cursor = "";
        });
      }

      onReady?.();
    };
    pinImage.onerror = () => onReady?.();
    pinImage.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(NEON_PIN_SVG)}`;
  };

  if (map.isStyleLoaded()) {
    loadPins();
  } else {
    map.once("load", loadPins);
  }
}

export function NeonMap({
  pins,
  selectedPinId,
  onPinSelect,
  sortStrategy = "newest",
  mapSkin = "violet",
}: NeonMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const styleUrlRef = useRef(getMapStyleUrl(mapSkin));
  const sortStrategyRef = useRef(sortStrategy);
  const mapSkinRef = useRef(mapSkin);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const pinsRef = useRef(pins);

  useEffect(() => {
    pinsRef.current = pins;
    sortStrategyRef.current = sortStrategy;
    mapSkinRef.current = mapSkin;
  }, [pins, sortStrategy, mapSkin]);

  const handlePinClick = useCallback(
    (pinId: string) => {
      const pin = pinsRef.current.find((p) => p.id === pinId);
      if (pin) onPinSelect(pin);
    },
    [onPinSelect]
  );

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !MAPBOX_TOKEN) return;

    let cancelled = false;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    mapboxgl.workerUrl = "/mapbox-gl-csp-worker.js";

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: getMapStyleUrl(mapSkinRef.current),
      center: [139.6917, 35.6895],
      zoom: 12,
      ...getMapCameraForSkin(mapSkinRef.current),
      antialias: true,
      language: MAP_LANGUAGE,
      worldview: MAP_WORLDVIEW,
      locale: {
        "NavigationControl.ResetBearing": "方位をリセット",
        "NavigationControl.ZoomIn": "ズームイン",
        "NavigationControl.ZoomOut": "ズームアウト",
      },
    });

    map.addControl(new MapboxLanguage({ defaultLanguage: MAP_LANGUAGE }));
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "bottom-right");

    const markMapReady = () => {
      if (!cancelled && mapRef.current === map) {
        setMapReady(true);
      }
    };

    const applySkinAndResize = () => {
      if (cancelled || mapRef.current !== map) return;
      if (!map.getContainer().isConnected) return;

      try {
        if (!isOfficialMapStyle(mapSkinRef.current)) {
          scheduleApplyMapSkin(map, mapSkinRef.current);
        }
        map.resize();
      } catch {
        // マップ破棄直後の resize は無視
      }
    };

    const setupMapLayers = () => {
      if (cancelled || mapRef.current !== map) return;

      try {
        map.setLanguage(MAP_LANGUAGE);
      } catch {
        return;
      }

      if (!map.getSource("pins")) {
        addPinLayers(
          map,
          pinsRef.current,
          sortStrategyRef.current,
          mapSkinRef.current,
          handlePinClick,
          () => {
            markMapReady();
            requestAnimationFrame(applySkinAndResize);
          }
        );
        return;
      }

      markMapReady();
      requestAnimationFrame(applySkinAndResize);
    };

    map.on("style.load", setupMapLayers);

    map.on("error", (e) => {
      if (cancelled) return;
      const message = e.error?.message ?? "";
      if (
        !message ||
        message.includes("does not exist on layer") ||
        message.includes("unknown property") ||
        message.includes("featureNamespace")
      ) {
        return;
      }
      setMapError(message);
      console.error("Mapbox error:", e);
    });

    mapRef.current = map;

    return () => {
      cancelled = true;
      map.off("style.load", setupMapLayers);
      mapRef.current = null;
      try {
        map.remove();
      } catch {
        // ignore teardown errors
      }
    };
  }, [handlePinClick]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = mapRef.current;
    const nextStyleUrl = getMapStyleUrl(mapSkin);
    const camera = getMapCameraForSkin(mapSkin);

    if (styleUrlRef.current !== nextStyleUrl) {
      styleUrlRef.current = nextStyleUrl;
      setMapReady(false);
      map.setStyle(nextStyleUrl);
      map.once("style.load", () => {
        map.easeTo({ pitch: camera.pitch, bearing: camera.bearing, duration: 800 });
      });
      return;
    }

    if (!isOfficialMapStyle(mapSkin)) {
      scheduleApplyMapSkin(map, mapSkin);
    }

    map.easeTo({ pitch: camera.pitch, bearing: camera.bearing, duration: 600 });
  }, [mapSkin, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const source = mapRef.current.getSource("pins") as mapboxgl.GeoJSONSource | undefined;
    source?.setData(pinsToGeoJSON(pins, sortStrategy));
  }, [pins, sortStrategy, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedPinId) return;
    const pin = pins.find((p) => p.id === selectedPinId);
    if (pin) {
      mapRef.current.flyTo({
        center: [pin.longitude, pin.latitude],
        zoom: 15,
        duration: 1200,
      });
    }
  }, [selectedPinId, pins, mapReady]);

  const skin = MAP_SKINS[mapSkin];
  const showNeonOverlay = skin.useNeonOverlay !== false;

  if (!MAPBOX_TOKEN) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a12]">
        <div className="text-center p-8 max-w-md">
          <p className="text-violet-300 text-lg mb-2">Mapbox トークンが必要です</p>
          <p className="text-gray-500 text-sm">
            <code className="text-cyan-400">.env.local</code> に{" "}
            <code className="text-cyan-400">NEXT_PUBLIC_MAPBOX_TOKEN</code> を設定し、
            開発サーバーを再起動してください。
          </p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a12]">
        <div className="text-center p-8 max-w-md">
          <p className="text-red-400 text-lg mb-2">地図の読み込みエラー</p>
          <p className="text-gray-500 text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`neon-map map-skin-${mapSkin} absolute inset-0`}
      style={{ backgroundColor: skin.palette.background }}
    >
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{
          filter: skin.canvasFilter === "none" ? undefined : skin.canvasFilter,
        }}
      />
      {showNeonOverlay && (
        <>
          <div className="neon-map-vignette pointer-events-none absolute inset-0 z-[1]" />
          <div className="neon-map-glow pointer-events-none absolute inset-0 z-[1]" />
        </>
      )}
    </div>
  );
}
