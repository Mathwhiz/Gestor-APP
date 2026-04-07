import { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { getPrismaClient } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAuthEnv, splitEmails } from "@/lib/supabase/env";

const defaultProtectedPath = "/dashboard";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getRoleForEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const adminEmails = splitEmails(process.env.APP_ADMIN_EMAILS);
  const editorEmails = splitEmails(process.env.APP_EDITOR_EMAILS);

  if (adminEmails.has(normalizedEmail)) return "ADMIN" as const;
  if (editorEmails.has(normalizedEmail)) return "EDITOR" as const;
  return "VIEWER" as const;
}

export function isAllowedEmail(email: string) {
  const allowedEmails = splitEmails(process.env.APP_ALLOWED_EMAILS);
  if (allowedEmails.size > 0) {
    return allowedEmails.has(normalizeEmail(email));
  }

  const fallbackAllowedEmails = new Set([
    ...splitEmails(process.env.APP_ADMIN_EMAILS),
    ...splitEmails(process.env.APP_EDITOR_EMAILS),
  ]);

  if (fallbackAllowedEmails.size === 0) return false;
  return fallbackAllowedEmails.has(normalizeEmail(email));
}

export function canEditRole(role: "ADMIN" | "EDITOR" | "VIEWER") {
  return role === "ADMIN" || role === "EDITOR";
}

export async function syncUserProfile(user: User) {
  const email = user.email?.trim().toLowerCase();
  if (!email) return null;

  const prisma = getPrismaClient();
  const metadata = user.user_metadata ?? {};
  const fullName =
    metadata.full_name ?? metadata.name ?? metadata.user_name ?? metadata.preferred_username;
  const avatarUrl = metadata.avatar_url ?? metadata.picture ?? null;
  const lastSignInAt = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null;
  const role = getRoleForEmail(email);

  return prisma.userProfile.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email,
      fullName: typeof fullName === "string" ? fullName : null,
      avatarUrl: typeof avatarUrl === "string" ? avatarUrl : null,
      role,
      lastSignInAt,
    },
    update: {
      email,
      fullName: typeof fullName === "string" ? fullName : null,
      avatarUrl: typeof avatarUrl === "string" ? avatarUrl : null,
      role,
      lastSignInAt,
    },
  });
}

export async function getCurrentAppUser() {
  const { configured } = getSupabaseAuthEnv();
  if (!configured) {
    return { user: null, profile: null, authConfigured: false };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, authConfigured: true };
  }

  const prisma = getPrismaClient();
  const profile =
    (await prisma.userProfile.findUnique({
      where: { id: user.id },
    })) ?? (await syncUserProfile(user));

  return { user, profile, authConfigured: true };
}

export async function requireAuthenticatedAppUser() {
  const current = await getCurrentAppUser();

  if (!current.authConfigured) {
    redirect("/login?message=config");
  }

  if (!current.user || !current.profile) {
    redirect(`/login?next=${encodeURIComponent(defaultProtectedPath)}`);
  }

  return current as {
    authConfigured: true;
    user: NonNullable<typeof current.user>;
    profile: NonNullable<typeof current.profile>;
  };
}
