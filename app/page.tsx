import Link from "next/link";
import { ArrowRight, CheckCircle2, Bot, FileText, Search, Briefcase } from "lucide-react";
import { getProfile } from "./actions";

export default async function HomePage() {
  const profile = await getProfile();

  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col bg-slate-50">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          <div className="mx-auto max-w-7xl px-6 relative z-10 text-center">
            <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-slate-950 sm:text-7xl">
              El asistente de IA para tu <span className="text-emerald-600">próximo empleo</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
              MatchMaker analiza al instante tu currículum contra cualquier oferta de trabajo, dándote un porcentaje de compatibilidad, consejos de mejora y palabras clave para destacar.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {profile ? (
                <Link
                  href={profile.role === "recruiter" ? "/dashboard/recruiter" : "/jobs"}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-8 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-xl shadow-slate-900/20"
                >
                  Ir a mi panel <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-8 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-xl shadow-slate-900/20"
                  >
                    Soy Candidato <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-8 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 shadow-sm"
                  >
                    Soy Reclutador <Briefcase className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-950 sm:text-4xl">Cómo funciona MatchMaker</h2>
              <p className="mt-4 text-lg text-slate-600">Una plataforma única que conecta a las empresas con el talento ideal utilizando la potencia de Gemini AI.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 relative overflow-hidden group hover:border-emerald-200 transition">
                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">1. Sube tu CV</h3>
                <p className="text-slate-600 leading-relaxed">
                  Crea tu perfil y sube uno o varios currículums en PDF. Estarán guardados de forma segura para usarlos cuando los necesites.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 relative overflow-hidden group hover:border-emerald-200 transition">
                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Search className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">2. Encuentra Ofertas</h3>
                <p className="text-slate-600 leading-relaxed">
                  Explora cientos de ofertas publicadas por empresas reales y descubre cuáles encajan mejor con tu experiencia.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 relative overflow-hidden group hover:border-emerald-200 transition">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl border border-emerald-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Bot className="h-6 w-6 text-emerald-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">3. Análisis IA</h3>
                <p className="text-slate-600 leading-relaxed">
                  Nuestra IA compara tu CV con la oferta en segundos y te da un <strong>Plan de Acción</strong> para asegurar la entrevista antes de aplicar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recruiter Section */}
        <section className="py-24 bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-6 lg:flex lg:items-center lg:gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold sm:text-4xl">¿Eres reclutador?</h2>
              <p className="mt-6 text-lg text-slate-400 leading-relaxed">
                Olvídate de leer cientos de currículums que no encajan. Publica tus ofertas en MatchMaker y recibe las solicitudes pre-filtradas y ordenadas por nivel de compatibilidad real gracias a nuestra IA.
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>Publicación de ofertas ilimitadas.</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>Candidatos ordenados por Match Score.</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>Notificaciones en tiempo real.</span>
                </li>
              </ul>
              {!profile && (
                <Link
                  href="/login"
                  className="mt-10 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Empezar a reclutar
                </Link>
              )}
            </div>
            <div className="mt-16 lg:mt-0 lg:w-1/2">
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-white">Frontend Developer</h4>
                    <p className="text-sm text-slate-400">12 solicitudes nuevas</p>
                  </div>
                  <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">98%</div>
                      <span className="text-sm font-medium">Alejandro G.</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400">Excelente</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">85%</div>
                      <span className="text-sm font-medium">Laura M.</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400">Muy bueno</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} MatchMaker AI. Construido para el futuro del empleo.</p>
        </div>
      </footer>
    </div>
  );
}
