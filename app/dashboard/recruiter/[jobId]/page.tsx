import { getJobById, getJobApplications, markApplicationsAsRead } from "@/app/actions";
import { ArrowLeft, User, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import MatchResultCards from "@/components/MatchResultCards";

export default async function RecruiterJobDetail({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  // Mark all applications for this job as read
  await markApplicationsAsRead(jobId);

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
        <h1 className="text-3xl font-bold text-slate-950">{job.title}</h1>
        <p className="mt-2 text-sm text-slate-500">Publicada el {new Date(job.created_at).toLocaleDateString()}</p>
        <div className="mt-6 whitespace-pre-wrap rounded-2xl bg-slate-50 p-6 text-sm text-slate-700">
          {job.description}
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Candidatos</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          {applications.length} solicitudes
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <User className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <h3 className="text-xl font-semibold text-slate-900">Sin candidatos aún</h3>
          <p className="mt-2 text-slate-600">Aún nadie ha solicitado esta oferta.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app: any) => (
            <div key={app.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between border-b border-slate-100 pb-6">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <User className="h-5 w-5 text-slate-400" />
                    {app.profiles.first_name} {app.profiles.last_name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Solicitado el {new Date(app.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 font-bold text-white shadow-sm">
                    {app.match_score}%
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Match Score</span>
                </div>
              </div>

              {/* Detalle del Match */}
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <FileText className="h-4 w-4 text-slate-500" />
                    Plan de Acción Sugerido
                  </h4>
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{app.action_plan}</p>
                </div>
                
                {app.missing_keywords && app.missing_keywords.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-slate-900">Palabras Clave Faltantes</h4>
                    <div className="flex flex-wrap gap-2">
                      {app.missing_keywords.map((kw: string, i: number) => (
                        <span key={i} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
