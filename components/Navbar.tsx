import Link from "next/link";
import { getProfile, logout, getSupabaseClient } from "../app/actions";
import { LogOut, User, Briefcase, LayoutDashboard, Search } from "lucide-react";

export default async function Navbar() {
  const profile = await getProfile();
  
  // Also check if they are at least authenticated
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-950">
          MatchMaker
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {/* Ofertas públicas (para ambos roles) */}
              <Link href="/jobs" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                <Search className="h-4 w-4" />
                Buscar Ofertas
              </Link>
              
              {/* Menú de Reclutador */}
              {profile?.role === "recruiter" && (
                <>
                  <Link href="/dashboard/recruiter" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                    <LayoutDashboard className="h-4 w-4" />
                    Mis Ofertas
                  </Link>
                  <Link href="/dashboard/recruiter/create" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                    <Briefcase className="h-4 w-4" />
                    Crear Oferta
                  </Link>
                </>
              )}
              
              {/* Perfil del Usuario */}
              <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
                <Link href="/profile" className="group flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-slate-900">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition group-hover:bg-slate-200">
                    <User className="h-4 w-4" />
                  </div>
                  {profile && (
                    <span className="hidden sm:inline-block">
                      {profile.first_name}
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                        {profile.role === "recruiter" ? "Reclutador" : "Candidato"}
                      </span>
                    </span>
                  )}
                </Link>

                <form action={logout}>
                  <button type="submit" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-rose-600 transition">
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline-block">Salir</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-sm"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
