import type { SnsPlatformDefinition } from "@/lib/sns-platforms";

interface SnsPlatformIconProps {
  icon: SnsPlatformDefinition["icon"];
  className?: string;
}

export function SnsPlatformIcon({ icon, className = "h-6 w-6" }: SnsPlatformIconProps) {
  if (icon === "youtube") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <rect x="2" y="5" width="20" height="14" rx="3" fill="#FF0000" />
        <path d="M10 9.5v5l5-2.5-5-2.5z" fill="white" />
      </svg>
    );
  }

  if (icon === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <defs>
          <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f58529" />
            <stop offset="50%" stopColor="#dd2a7b" />
            <stop offset="100%" stopColor="#8134af" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#ig)" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1.2" fill="white" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#111827" />
      <path
        d="M7 7h3.5l2.2 3.2L15 7H18l-4.2 6 4.4 6h-3.4l-2.4-3.4L9.4 19H6.6L11 13 7 7z"
        fill="white"
      />
    </svg>
  );
}
