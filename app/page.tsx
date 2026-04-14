import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 rounded-[40px] border border-slate-200 bg-white/95 p-10 shadow-xl shadow-slate-200/50">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Match-Maker</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Analiza la compatibilidad entre tu currículum y la oferta de trabajo.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Sube tu CV en PDF, pega la descripción de la oferta y recibe un resultado rápido con score de match, keywords faltantes y un plan de acción.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/login" className="inline-flex items-center justify-center rounded-3xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                Entrar
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center rounded-3xl border border-slate-200 px-6 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                Registrarme
              </Link>
            </div>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-8 text-slate-700 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Bienvenido</p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">MVP diseñado para reclutadores y candidatos.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Minimalista, directo y optimizado para el usuario. Usa nuestra herramienta para validar rápidamente el ajuste entre un perfil y una vacante.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
