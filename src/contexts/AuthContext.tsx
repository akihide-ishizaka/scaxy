"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Hub } from "aws-amplify/utils";
import {
  getCurrentUser,
  signOut as amplifySignOut,
  fetchUserAttributes,
  type AuthUser,
} from "aws-amplify/auth";
import { isAmplifyConfigured } from "@/lib/amplify";
import { getDataClient } from "@/lib/data-client";

export interface XyUserProfile {
  userId: string;
  email?: string;
  displayName: string;
  avatarUrl?: string;
  authProvider: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  profile: XyUserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isCognitoEnabled: boolean;
  isDemo: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const REPORT_ELIGIBILITY_DAYS = 7;

async function syncUserProfile(user: AuthUser): Promise<XyUserProfile> {
  const attributes = await fetchUserAttributes();
  const email = attributes.email;
  const displayName =
    attributes.name ||
    attributes.nickname ||
    email?.split("@")[0] ||
    user.username ||
    "ジァー";
  const avatarUrl = attributes.picture;

  let authProvider = "email";
  if (attributes.identities) {
    try {
      const identities = JSON.parse(attributes.identities) as Array<{
        providerName?: string;
      }>;
      const provider = identities[0]?.providerName?.toLowerCase() ?? "";
      if (provider.includes("google")) authProvider = "google";
      else if (provider.includes("apple")) authProvider = "apple";
    } catch {
      // ignore
    }
  }

  const profile: XyUserProfile = {
    userId: user.userId,
    email,
    displayName,
    avatarUrl,
    authProvider,
  };

  if (!isAmplifyConfigured()) return profile;

  try {
    const client = getDataClient();
    const reportEligibleAt = new Date();
    reportEligibleAt.setDate(reportEligibleAt.getDate() + REPORT_ELIGIBILITY_DAYS);

    const { data: existing } = await client.models.User.get({ id: user.userId });

    if (existing) {
      await client.models.User.update({
        id: user.userId,
        displayName,
        avatarUrl,
        lastLoginAt: new Date().toISOString(),
      });
    } else {
      await client.models.User.create({
        id: user.userId,
        authProvider,
        authSubject: user.userId,
        displayName,
        avatarUrl,
        lastLoginAt: new Date().toISOString(),
        reportEligibleAt: reportEligibleAt.toISOString(),
      });
    }
  } catch (err) {
    console.warn("User profile sync skipped:", err);
  }

  return profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const cognitoEnabled = isAmplifyConfigured();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<XyUserProfile | null>(null);
  const [loading, setLoading] = useState(cognitoEnabled);

  const refreshSession = useCallback(async () => {
    if (!cognitoEnabled) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const current = await getCurrentUser();
      setUser(current);
      const synced = await syncUserProfile(current);
      setProfile(synced);
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [cognitoEnabled]);

  useEffect(() => {
    if (!cognitoEnabled) return;

    let cancelled = false;

    (async () => {
      try {
        const current = await getCurrentUser();
        if (cancelled) return;
        setUser(current);
        const synced = await syncUserProfile(current);
        if (cancelled) return;
        setProfile(synced);
      } catch {
        if (!cancelled) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cognitoEnabled]);

  useEffect(() => {
    if (!cognitoEnabled) return;

    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          refreshSession();
          break;
        case "signedOut":
          setUser(null);
          setProfile(null);
          break;
        case "tokenRefresh":
          refreshSession();
          break;
        default:
          break;
      }
    });

    return unsubscribe;
  }, [cognitoEnabled, refreshSession]);

  const signOut = useCallback(async () => {
    if (cognitoEnabled) {
      await amplifySignOut();
    }
    setUser(null);
    setProfile(null);
  }, [cognitoEnabled]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isAuthenticated: !!user,
      isCognitoEnabled: cognitoEnabled,
      isDemo: !cognitoEnabled,
      signOut,
      refreshSession,
    }),
    [user, profile, loading, cognitoEnabled, signOut, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
