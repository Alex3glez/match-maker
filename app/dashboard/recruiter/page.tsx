import Link from "next/link";
import { getRecruiterJobs } from "@/app/actions";
import { Plus, Briefcase, ChevronRight, Bell } from "lucide-react";
import { redirect } from "next/navigation";

const STATUS_LABELS: Record<string, string> = {
  all: "Todas",
  active: "Activas",
  ended: "Terminadas",
};

export const dynamic = "force-dynamic";

export default async function RecruiterDashboard({ searchParams }: { searchParams?: { status?: string | string[] } }) {
  const rawStatus = searchParams?.status;
  const selectedStatus = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus ?? "all";
  const normalizedStatus = ["all", "active", "ended"].includes(selectedStatus) ? selectedStatus : "all";
  let jobs;
  try {
    jobs = await getRecruiterJobs();
  } catch (error: any) {
    if (error.message === "No authenticated user found.") {
      redirect("/login");
    }
    throw error;
  }

  const filteredJobs = normalizedStatus === "all" ? jobs : jobs.filter((job: any) => job.status === normalizedStatus);
  const emptyMessage = normalizedStatus === "all" ? "Aún no has creado ninguna oferta." : normalizedStatus === "active" ? "No hay ofertas activas en este momento." : "No tienes ofertas terminadas.";

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Mis Ofertas</h1>
          <p className="mt-2 text-sm text-slate-600">Filtra tus ofertas activas o terminadas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <Link
              key={value}
              href={`/dashboard/recruiter${value === "all" ? "" : `?status=${value}`}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${normalizedStatus === value ? "bg-slate-950 text-white shadow-lg" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/dashboard/recruiter/create"
            className="flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Crear Oferta
          </Link>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Briefcase className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-900">{emptyMessage}</h2>
          <p className="mt-2 text-slate-600">Usa el filtro para ver tus ofertas activas o terminadas.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job: any) => (
            <div
              key={job.id}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-900">{job.title}</h2>
                    {job.new_applications_count > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                        <Bell className="h-3 w-3" />
                        {job.new_applications_count} nueva{job.new_applications_count > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">Publicada el {new Date(job.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${job.status === 'ended' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {job.status === 'ended' ? 'Terminada' : 'Activa'}
                  </span>
                  <Link
                    href={`/dashboard/recruiter/${job.id}/edit`}
                    className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-200"
                  >
                    Editar
                  </Link>
                  <Link
                    href={`/dashboard/recruiter/${job.id}`}
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Ver Oferta
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

