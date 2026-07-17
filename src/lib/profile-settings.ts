"use client";

export interface RegisteredLocation {
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export interface ProfileSettings {
  accountName?: string;
  avatarDataUrl?: string;
  location?: RegisteredLocation;
}

function storageKey(userId: string) {
  return `xy:profile-settings:${userId}`;
}

export function readProfileSettings(userId: string): ProfileSettings | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(storageKey(userId));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ProfileSettings;
  } catch {
    return null;
  }
}

export function writeProfileSettings(userId: string, settings: ProfileSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId), JSON.stringify(settings));
}
