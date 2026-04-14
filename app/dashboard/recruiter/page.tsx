import Link from "next/link";
import { getRecruiterJobs } from "@/app/actions";
import { Plus, Briefcase, ChevronRight, Bell } from "lucide-react";
import { redirect } from "next/navigation";

export default async function RecruiterDashboard() {
  let jobs;
  try {
    jobs = await getRecruiterJobs();
  } catch (error: any) {
    if (error.message === "No authenticated user found.") {
      redirect("/login");
    }
    throw error;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-950">Mis Ofertas</h1>
        <Link
          href="/dashboard/recruiter/create"
          className="flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Crear Oferta
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Briefcase className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-900">Aún no has creado ninguna oferta</h2>
          <p className="mt-2 text-slate-600">Empieza creando tu primera oferta de trabajo para buscar candidatos.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job: any) => (
            <Link
              key={job.id}
              href={`/dashboard/recruiter/${job.id}`}
              className="group flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow-md"
            >
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
                <p className="mt-1 text-sm text-slate-500">
                  Publicada el {new Date(job.created_at).toLocaleDateString()}
                </p>
              </div>
              <ChevronRight className="h-6 w-6 text-slate-400 transition group-hover:text-slate-900" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

