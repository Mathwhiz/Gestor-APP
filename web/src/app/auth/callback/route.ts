import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAllowedEmail, syncUserProfile } from "@/lib/auth";
import { getAppOrigin, getSupabaseAuthEnv } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const { url, anonKey, configured } = getSupabaseAuthEnv();
  const appOrigin = getAppOrigin();

  if (!configured || !url || !anonKey) {
    return NextResponse.redirect(new URL("/login?message=config", request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  let next = request.nextUrl.searchParams.get("next") ?? "/dashboard";

  if (!next.startsWith("/")) {
    next = "/dashboard";
  }

  const redirectUrl = new URL(next, appOrigin ?? request.url);
  const response = NextResponse.redirect(redirectUrl);

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

  if (!code) {
    return NextResponse.redirect(new URL("/login?message=code", request.url));
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user?.email) {
    return NextResponse.redirect(new URL("/login?message=session", request.url));
  }

  if (!isAllowedEmail(data.user.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?message=unauthorized", request.url));
  }

  try {
    await syncUserProfile(data.user);
  } catch {
    return NextResponse.redirect(new URL("/login?message=profile", request.url));
  }

  return response;
}
