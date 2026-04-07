"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center justify-center rounded-2xl border border-white/12 px-4 py-3 text-sm text-white/76 transition hover:bg-white/10 hover:text-white"
      type="button"
    >
      Cerrar sesion
    </button>
  );
}
