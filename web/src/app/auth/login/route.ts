import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getAppOrigin, getSupabaseAuthEnv } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const { url, anonKey, configured } = getSupabaseAuthEnv();
  const appOrigin = getAppOrigin() ?? request.nextUrl.origin;

  if (!configured || !url || !anonKey) {
    return NextResponse.redirect(new URL("/login?message=config", request.url));
  }

  const next = request.nextUrl.searchParams.get("next") ?? "/dashboard";
  const response = NextResponse.next();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers ?? {}).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appOrigin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/login?message=oauth", request.url));
  }

  const redirectResponse = NextResponse.redirect(data.url);
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}
