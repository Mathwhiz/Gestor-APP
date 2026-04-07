import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAllowedEmail, syncUserProfile } from "@/lib/auth";
import { getSupabaseAuthEnv } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const { url, anonKey, configured } = getSupabaseAuthEnv();

  if (!configured || !url || !anonKey) {
    return NextResponse.redirect(new URL("/login?message=config", request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/dashboard";
  const response = NextResponse.redirect(new URL(next, request.url));

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
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

  await syncUserProfile(data.user);
  return response;
}
