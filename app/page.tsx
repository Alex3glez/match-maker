import Link from "next/link";
import { ArrowRight, CheckCircle2, Bot, FileText, Search, Briefcase, Zap, Users, TrendingUp, MessageSquare } from "lucide-react";
import { getProfile } from "./actions";

export default async function HomePage() {
  const profile = await getProfile();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-28 sm:pt-32 sm:pb-40">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-emerald-500/5 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none" />
          </div>
          
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 mb-6">
                <Zap className="h-4 w-4 text-emerald-700" />
                <span className="text-sm font-semibold text-emerald-700">Impulsado por IA</span>
              </div>
              
              <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-950">
                Encuentra el empleo <span className="text-emerald-600">perfecto</span> con IA
              </h1>
              
              <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-slate-600 leading-relaxed">
                MatchMaker analiza tu currículum en segundos y te muestra cómo encajas realmente con cada oferta. Optimiza tu candidatura antes de aplicar con recomendaciones personalizadas de IA.
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
                      href="/login?role=candidate"
                      className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-8 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-xl shadow-slate-900/20"
                    >
                      Buscar Empleo <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/login?role=recruiter"
                      className="inline-flex items-center gap-2 rounded-full bg-white border-2 border-slate-200 px-8 py-4 text-sm font-semibold text-slate-900 transition hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      Atraer Talentos <Briefcase className="h-4 w-4" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white border-y border-slate-200">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-slate-950">10K+</div>
                <p className="mt-2 text-sm sm:text-base text-slate-600">Usuarios activos</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-slate-950">500+</div>
                <p className="mt-2 text-sm sm:text-base text-slate-600">Empresas asociadas</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-slate-950">95%</div>
                <p className="mt-2 text-sm sm:text-base text-slate-600">Tasa de satisfacción</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-slate-950">2min</div>
                <p className="mt-2 text-sm sm:text-base text-slate-600">Análisis promedio</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section for Candidates */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-950">Para Candidatos</h2>
              <p className="mt-4 text-lg text-slate-600">Herramientas impulsadas por IA para destacar en tu búsqueda de empleo</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 hover:border-emerald-200 hover:bg-emerald-50/30 transition group">
                <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all">
                  <FileText className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Sube tu CV</h3>
                <p className="text-slate-600 leading-relaxed">
                  Almacena tus currículums de forma segura en la nube. Úsalos en cualquier oferta sin necesidad de volver a subir archivos.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 hover:border-emerald-200 hover:bg-emerald-50/30 transition group">
                <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all">
                  <Bot className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Análisis IA</h3>
                <p className="text-slate-600 leading-relaxed">
                  Recibe un análisis instantáneo de compatibilidad, palabras clave faltantes y un plan personalizado para mejorar tu candidatura.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 hover:border-emerald-200 hover:bg-emerald-50/30 transition group">
                <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all">
                  <TrendingUp className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Optimiza tu Candidatura</h3>
                <p className="text-slate-600 leading-relaxed">
                  Mejora tu CV basándote en datos reales. Adquiere las palabras clave que buscan los reclutadores y aumenta tus posibilidades.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recruiter Section */}
        <section className="py-24 bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold">Para Reclutadores</h2>
              <p className="mt-4 text-lg text-slate-400">Encuentra los mejores talentos 10 veces más rápido</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-emerald-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">Publica Ofertas Ilimitadas</h3>
                      <p className="mt-2 text-slate-400">Sin límites de publicaciones ni costos ocultos.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-emerald-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">Candidatos Pre-filtrados</h3>
                      <p className="mt-2 text-slate-400">Recibe candidatos ordenados por compatibilidad real.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-emerald-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">Gestión Simplificada</h3>
                      <p className="mt-2 text-slate-400">Rechaza, avanza en selección o contacta candidatos desde un único panel.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <Zap className="h-6 w-6 text-emerald-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">Tiempo es Dinero</h3>
                      <p className="mt-2 text-slate-400">Reduce el tiempo de selección de semanas a días.</p>
                    </div>
                  </div>
                </div>

                {!profile && (
                  <Link
                    href="/login?role=recruiter"
                    className="mt-10 inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition shadow-lg"
                  >
                    Empezar a Reclutar <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-slate-400 mb-6">Ejemplo: Lista de candidatos</div>
                  
                  {[
                    { name: "Alejandro G.", score: 98, status: "Excelente" },
                    { name: "Laura M.", score: 85, status: "Muy bueno" },
                    { name: "Carlos R.", score: 92, status: "Excelente" },
                  ].map((candidate, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 transition">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                          <span className="text-emerald-400 font-bold text-sm">{candidate.score}%</span>
                        </div>
                        <span className="font-medium">{candidate.name}</span>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">{candidate.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-950 mb-6">
              Listo para revolucionar tu búsqueda de empleo?
            </h2>
            <p className="text-lg text-slate-600 mb-10">
              Únete a miles de candidatos y empresas que ya confían en MatchMaker para encontrar su match perfecto.
            </p>
            
            {!profile && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login?role=candidate"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-8 py-4 text-sm font-semibold text-white hover:bg-slate-800 transition"
                >
                  Comienza Gratis <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/jobs"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-8 py-4 text-sm font-semibold text-slate-900 hover:bg-slate-200 transition"
                >
                  Ver Ofertas
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">MatchMaker</h3>
              <p className="text-sm text-slate-400">La plataforma impulsada por IA para conectar talentos con oportunidades.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/jobs" className="hover:text-white transition">Buscar Ofertas</Link></li>
                <li><Link href="/" className="hover:text-white transition">Características</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">Acerca de</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition">Contacto</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>© {new Date().getFullYear()} MatchMaker AI. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
