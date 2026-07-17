"use client";

import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

let configured = false;

export function configureAmplify() {
  if (configured) return;
  try {
    if (outputs && "auth" in outputs) {
      Amplify.configure(outputs, { ssr: true });
      configured = true;
    }
  } catch {
    // amplify_outputs.json が未生成の場合はデモモード
  }
}

export function isAmplifyConfigured(): boolean {
  try {
    const o = outputs as {
      auth?: { user_pool_id?: string };
      data?: { url?: string };
    };
    return !!(o.auth?.user_pool_id && o.data?.url);
  } catch {
    return false;
  }
}

export function isAuthConfigured(): boolean {
  try {
    const o = outputs as { auth?: { user_pool_id?: string } };
    return !!o.auth?.user_pool_id;
  } catch {
    return false;
  }
}
