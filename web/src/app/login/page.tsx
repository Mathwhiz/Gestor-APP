export default function LoginPage() {
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
                Prototipo operativo pensado para trabajar desde La Pampa con tramites
                nacionales, seguimiento documental y control financiero claro.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Tramites activos", "24"],
              ["Cobros pendientes", "$ 1.280.000"],
              ["Guias utiles", "12"],
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
                Ingresar al sistema
              </h2>
              <p className="text-sm leading-6 text-[var(--color-muted)]">
                Para el prototipo el acceso es visual. Luego se conecta auth real.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[var(--color-ink)]">Email</span>
                <input
                  className="h-12 w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-accent)]"
                  defaultValue="gestor@demo.com"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[var(--color-ink)]">Contrasena</span>
                <input
                  className="h-12 w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-accent)]"
                  defaultValue="demo1234"
                  type="password"
                />
              </label>
              <a
                className="flex h-12 items-center justify-center rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
                href="/dashboard"
              >
                Entrar al prototipo
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
