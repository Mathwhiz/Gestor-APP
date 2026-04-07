"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAuthEnv } from "@/lib/supabase/env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const { url, anonKey, configured } = getSupabaseAuthEnv();

  if (!configured || !url || !anonKey) {
    throw new Error("Supabase auth is not configured.");
  }

  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}
