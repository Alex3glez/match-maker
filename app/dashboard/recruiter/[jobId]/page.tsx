import { getJobById, getJobApplications, markApplicationsAsRead } from "@/app/actions";
import { ArrowLeft, User, FileText, CheckCircle2, Briefcase } from "lucide-react";
import Link from "next/link";
import ApplicationCard from "@/components/ApplicationCard";

export default async function RecruiterJobDetail({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  const job = await getJobById(jobId);
  const applications = await getJobApplications(jobId);

  if (!job) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Oferta no encontrada</h1>
        <Link href="/dashboard/recruiter" className="mt-4 inline-block text-slate-600 underline">Volver al panel</Link>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'applied').length,
    viewed: applications.filter(a => a.status === 'viewed').length,
    inProgress: applications.filter(a => a.status === 'in_progress').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <Link
        href="/dashboard/recruiter"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Mis Ofertas
      </Link>

      <div className="mb-12 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">{job.title}</h1>
            <p className="mt-2 text-sm text-slate-500">Publicada el {new Date(job.created_at).toLocaleDateString()}</p>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${job.status === 'ended' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-700'}`}>
            <Briefcase className="h-4 w-4" />
            {job.status === 'ended' ? 'Terminada' : 'Activa'}
          </div>
        </div>
        <div className="mt-6 whitespace-pre-wrap rounded-2xl bg-slate-50 p-6 text-sm text-slate-700">
          {job.description}
        </div>
      </div>
      <div className="mb-10 flex items-center justify-between gap-3">
        <div className="text-sm text-slate-600">Edita título, descripción o cambia el estado de la oferta.</div>
        <Link
          href={`/dashboard/recruiter/${job.id}/edit`}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Editar oferta
        </Link>
      </div>

      {/* Stats Section */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-2xl font-bold text-slate-950">{stats.total}</div>
          <p className="mt-1 text-xs font-medium text-slate-600">Solicitudes</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <p className="mt-1 text-xs font-medium text-slate-600">Pendientes</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.viewed}</div>
          <p className="mt-1 text-xs font-medium text-slate-600">Revisadas</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.inProgress}</div>
          <p className="mt-1 text-xs font-medium text-slate-600">En proceso de selección</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-2xl font-bold text-rose-600">{stats.rejected}</div>
          <p className="mt-1 text-xs font-medium text-slate-600">Rechazadas</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Candidatos</h2>
        <p className="mt-1 text-sm text-slate-600">Ordenados por compatibilidad</p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <User className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <h3 className="text-xl font-semibold text-slate-900">Sin candidatos aún</h3>
          <p className="mt-2 text-slate-600">Aún nadie ha solicitado esta oferta.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app: any) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}
