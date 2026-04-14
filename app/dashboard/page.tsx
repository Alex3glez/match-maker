import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import DashboardShell from "../../components/DashboardShell";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export default async function DashboardPage() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase env vars:", {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
    redirect("/login");
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // no-op for server-side session inspection
        }
      },
    },
  });
  const { data: userData, error } = await supabase.auth.getUser();

  if (error || !userData?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Match-Maker</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Dashboard de compatibilidad</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Sube tu currículum en PDF y pega una oferta de trabajo para obtener un análisis inmediato.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-5 py-4 text-sm text-slate-700 shadow-sm">
            Sesión activa
          </div>
        </header>
        <DashboardShell />
      </div>
    </main>
  );
}