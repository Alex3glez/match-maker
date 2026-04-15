"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../lib/supabase-browser";
import { LogOut, Briefcase, LayoutDashboard, Search } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  const loadUser = async () => {
    const {
      data: { user: currentUser },
    } = await supabaseBrowser.auth.getUser();
    setUser(currentUser ?? null);

    if (currentUser) {
      const { data: profileData } = await supabaseBrowser
        .from("profiles")
        .select("id, first_name, role")
        .eq("id", currentUser.id)
        .single();
      setProfile(profileData ?? null);
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    loadUser();

    const { data: authListener } = supabaseBrowser.auth.onAuthStateChange((event) => {
      if (!mounted) return;
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        loadUser();
      }
      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        router.push("/login");
      }
    });

    const handleProfileUpdated = () => {
      if (mounted) {
        loadUser();
      }
    };
    window.addEventListener("profile-updated", handleProfileUpdated);

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, [router]);

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push("/login");
  };

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-950">
          MatchMaker
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          {user ? (
            <>
              <Link href="/jobs" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Ofertas</span>
              </Link>

              {profile?.role === "recruiter" && (
                <>
                  <Link href="/dashboard/recruiter" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Mis Ofertas</span>
                  </Link>
                  <Link href="/dashboard/recruiter/create" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                    <Briefcase className="h-4 w-4" />
                    <span className="hidden sm:inline">Nueva Oferta</span>
                  </Link>
                </>
              )}

              <div className="flex items-center gap-3 border-l border-slate-200 pl-4 sm:pl-6">
                <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white text-xs font-bold shadow-sm">
                    {profile?.first_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="hidden sm:flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-slate-900">{profile?.first_name || "Usuario"}</span>
                    <span className="text-xs text-slate-500">
                      {profile?.role === "recruiter" ? "Reclutador" : "Candidato"}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-slate-950 px-4 sm:px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-sm"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
