"use client";

import type { Pin } from "@/lib/types";

interface PinCardProps {
  pin: Pin | null;
  onClose: () => void;
  onReport?: (pinId: string) => void;
  onOutboundClick?: (pinId: string, url: string) => void;
}

function EmbedPlayer({ pin }: { pin: Pin }) {
  if (pin.platform === "YOUTUBE") {
    const videoId = pin.platformMediaId;
    return (
      <div className="relative w-full aspect-[9/16] max-h-[50vh] bg-black rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube Shorts"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[9/16] max-h-[50vh] bg-gradient-to-br from-violet-950 to-fuchsia-950 rounded-lg overflow-hidden flex items-center justify-center border border-violet-500/30">
      <div className="text-center p-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-2xl">
          📸
        </div>
        <p className="text-violet-200 text-sm mb-2">Instagram Embed</p>
        <p className="text-gray-400 text-xs">
          本番環境では Instagram oEmbed API による埋め込みを表示
        </p>
        <a
          href={pin.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-cyan-400 text-sm hover:underline"
        >
          Instagramで開く →
        </a>
      </div>
    </div>
  );
}

export function PinCard({ pin, onClose, onReport, onOutboundClick }: PinCardProps) {
  if (!pin) return null;

  const handleOutbound = () => {
    onOutboundClick?.(pin.id, pin.sourceUrl);
    window.open(pin.sourceUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`
          fixed z-40 bg-[#0d0d18]/95 backdrop-blur-xl border-violet-500/20
          transition-transform duration-300 ease-out
          bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl border-t
          lg:top-0 lg:right-0 lg:bottom-0 lg:left-auto lg:w-[420px] lg:max-h-none
          lg:rounded-none lg:border-t-0 lg:border-l
          ${pin ? "translate-y-0" : "translate-y-full lg:translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-violet-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-[#0d0d18] flex items-center justify-center text-sm font-bold text-violet-300">
                  {(pin.author?.displayName ?? "?")[0].toUpperCase()}
                </div>
              </div>
              <div>
                <p className="font-semibold text-violet-100">
                  {pin.author?.handle ?? pin.author?.displayName ?? "ジァー"}
                </p>
                <p className="text-xs text-gray-500">
                  {pin.platform === "INSTAGRAM" ? "Instagram" : "YouTube Shorts"}
                  {" · "}
                  {pin.clickCount} clicks
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-violet-950/50 text-gray-400 hover:text-white transition-colors"
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <EmbedPlayer pin={pin} />

            {pin.captionSnippet && (
              <p className="text-sm text-gray-300 leading-relaxed">{pin.captionSnippet}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleOutbound}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all"
              >
                公式SNSで見る
              </button>
              {onReport && (
                <button
                  type="button"
                  onClick={() => onReport(pin.id)}
                  className="px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-950/30 transition-colors"
                >
                  通報
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
