"use client";

import { useEffect } from "react";
import { configureAmplify } from "@/lib/amplify";
import { AuthProvider } from "@/contexts/AuthContext";
import "@aws-amplify/ui-react/styles.css";

configureAmplify();

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    configureAmplify();
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
