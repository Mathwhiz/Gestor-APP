import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { getCurrentAppUser } from "@/lib/auth";
import { getSupabaseAuthEnv } from "@/lib/supabase/env";

const messageMap: Record<string, string> = {
  code: "Falto el codigo de autenticacion al volver desde Google.",
  config: "Falta configurar NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  oauth: "No se pudo iniciar el acceso con Google desde Supabase.",
  profile: "Se abrio la sesion pero fallo la sincronizacion del perfil interno.",
  session: "No se pudo abrir la sesion al volver desde Google.",
  unauthorized: "Ese Gmail no esta habilitado para entrar a la app.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await getCurrentAppUser();
  const { configured } = getSupabaseAuthEnv();
  const params = await searchParams;
  const next =
    typeof params.next === "string" && params.next.startsWith("/") ? params.next : "/dashboard";
  const messageKey = typeof params.message === "string" ? params.message : "";
  const message = messageMap[messageKey];

  if (currentUser.user) {
    redirect(next);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-[var(--color-line)] bg-white shadow-[0_24px_80px_rgba(17,24,39,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between bg-[linear-gradient(135deg,#1f4f5f_0%,#17343f_60%,#11242c_100%)] p-8 text-white sm:p-12">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-white/80">
              Gestor App
            </div>
            <div className="max-w-xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Gestoria, agencia y caja diaria en una sola herramienta.
              </h1>
              <p className="max-w-lg text-sm leading-7 text-white/72 sm:text-base">
                Acceso con Google sobre Supabase para trabajar desde cualquier lugar con base,
                tramites y caja compartidos.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Base", "Supabase Postgres"],
              ["Acceso", "Google OAuth"],
              ["Permisos", "Admin / Editor / Viewer"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/12 bg-white/8 px-4 py-4"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">{label}</p>
                <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center bg-[#f6f3ec] p-8 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Acceso
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                Ingresar con Google
              </h2>
              <p className="text-sm leading-6 text-[var(--color-muted)]">
                Cada usuario entra con su Gmail y la app le asigna un perfil interno con rol.
              </p>
            </div>

            {message ? (
              <div className="rounded-2xl border border-[rgba(173,95,71,0.26)] bg-[rgba(173,95,71,0.08)] px-4 py-4 text-sm text-[var(--color-ink)]">
                {message}
              </div>
            ) : null}

            {!configured ? (
              <div className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-4 text-sm leading-6 text-[var(--color-muted)]">
                Falta completar las variables publicas de Supabase para habilitar el login real.
              </div>
            ) : (
              <GoogleSignInButton next={next} />
            )}

            <div className="rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-5">
              <p className="text-sm font-semibold text-[var(--color-ink)]">Checklist de activacion</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-muted)]">
                <p>1. Cargar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.</p>
                <p>2. Activar Google en Supabase Auth.</p>
                <p>3. Definir correos en `APP_ADMIN_EMAILS`, `APP_EDITOR_EMAILS` o `APP_ALLOWED_EMAILS`.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
