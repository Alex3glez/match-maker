"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { getJobById, getApplicationForJob, calculateJobMatch, applyToJob, getProfile, getCandidateResumes, uploadResume, saveCandidateResume } from "@/app/actions";
import { ArrowLeft, Rocket, CheckCircle2, UploadCloud, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";
import MatchResultCards from "@/components/MatchResultCards";

export default function PublicJobDetail({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const [jobId, setJobId] = useState<string>("");
  const [job, setJob] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumePath, setSelectedResumePath] = useState<string>("");
  
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function load() {
      const resolvedParams = await params;
      setJobId(resolvedParams.jobId);

      const [jobData, profileData, appData] = await Promise.all([
        getJobById(resolvedParams.jobId),
        getProfile(),
        getApplicationForJob(resolvedParams.jobId)
      ]);
      
      setJob(jobData);
      setProfile(profileData);
      setApplication(appData);

      if (profileData?.role === "candidate") {
        const resList = await getCandidateResumes();
        setResumes(resList);
        if (resList.length > 0) {
          setSelectedResumePath(resList[0].file_path);
        }
      }
      
      setLoading(false);
    }
    load();
  }, [params]);

  const handleCalculateMatch = async () => {
    if (!selectedResumePath) {
      setError("Por favor, selecciona o sube un currículum para calcular el match.");
      return;
    }
    
    setError("");
    startTransition(async () => {
      try {
        const result = await calculateJobMatch(jobId, selectedResumePath);
        setApplication(result);
      } catch (err: any) {
        setError(err.message || "Error al calcular el match.");
      }
    });
  };

  const handleApply = async () => {
    if (!application?.id) return;
    setError("");
    startTransition(async () => {
      try {
        await applyToJob(application.id);
        setApplication((prev: any) => ({ ...prev, status: "applied" }));
      } catch (err: any) {
        setError(err.message || "Error al enviar la solicitud.");
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("resume", file);
        const { resumePath, fileName } = await uploadResume(formData);
        
        await saveCandidateResume(fileName, resumePath);
        
        const updatedResumes = await getCandidateResumes();
        setResumes(updatedResumes);
        setSelectedResumePath(resumePath);
        
      } catch (err: any) {
        setError(err.message || "Error al subir el currículum.");
      }
    });
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Cargando oferta...</div>;
  if (!job) return <div className="p-12 text-center font-semibold">Oferta no encontrada</div>;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <Link
        href="/jobs"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Ofertas
      </Link>

      <div className="mb-12 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-950">{job.title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Publicada por {job.profiles?.first_name} {job.profiles?.last_name} • {new Date(job.created_at).toLocaleDateString()}
        </p>
        <div className="mt-6 whitespace-pre-wrap rounded-2xl bg-slate-50 p-6 text-sm text-slate-700">
          {job.description}
        </div>
      </div>

      {profile && profile.role === "candidate" && (
        <div className="space-y-8">
          {!application ? (
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h2 className="mb-2 text-xl font-bold text-slate-900">¿Eres el candidato ideal?</h2>
              <p className="mb-6 text-sm text-slate-600">Calcula tu compatibilidad con esta oferta eligiendo tu currículum.</p>
              
              <div className="mx-auto mb-8 max-w-md text-left">
                {resumes.length > 0 ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">
                      Selecciona un currículum para analizar:
                    </label>
                    <select
                      value={selectedResumePath}
                      onChange={(e) => setSelectedResumePath(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
                    >
                      {resumes.map(r => (
                        <option key={r.id} value={r.file_path}>{r.file_name}</option>
                      ))}
                    </select>
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-500">O también puedes subir uno nuevo:</span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isPending}
                        className="text-xs font-semibold text-slate-900 underline hover:text-slate-700 disabled:opacity-50"
                      >
                        Subir PDF
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <FileText className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                    <p className="mb-4 text-sm text-slate-600">No tienes currículums guardados en tu perfil.</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isPending}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                    >
                      <UploadCloud className="h-4 w-4" />
                      Subir mi primer Currículum
                    </button>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {error && <p className="mb-4 text-sm font-medium text-rose-600">{error}</p>}
              
              <button
                onClick={handleCalculateMatch}
                disabled={isPending || (!selectedResumePath && resumes.length === 0)}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Rocket className="h-4 w-4" />
                {isPending ? "Procesando..." : "Calcular Match"}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <MatchResultCards analysis={application} />

              <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                {application.recruiter_message && (
                  <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 mb-1">Mensaje del reclutador</p>
                      <p className="text-sm text-emerald-900 italic">"{application.recruiter_message}"</p>
                    </div>
                  </div>
                )}
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                {application.status === "calculated"
                  ? "¿Te interesa esta oferta?"
                  : application.status === "applied"
                  ? "¡Solicitud enviada!"
                  : application.status === "viewed"
                  ? "Solicitud vista"
                  : application.status === "in_progress"
                  ? "En proceso de selección"
                  : application.status === "rejected"
                  ? "Solicitud rechazada"
                  : "Estado de la solicitud"}
              </h2>
              <p className="text-sm text-slate-600">
                {application.status === "calculated"
                  ? "Envía tu solicitud para que el reclutador pueda ver tu perfil."
                  : application.status === "applied"
                  ? "El reclutador ya puede ver tu perfil y el resultado de tu compatibilidad."
                  : application.status === "viewed"
                  ? "Tu solicitud ya fue vista por el reclutador."
                  : application.status === "in_progress"
                  ? "Tu candidatura está avanzando en el proceso de selección."
                  : application.status === "rejected"
                  ? "Esta solicitud no fue seleccionada en esta ocasión."
                  : "Estado actual de tu solicitud."}
              </p>
              {application.status === "rejected" && application.recruiter_message && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  <p className="font-semibold">Mensaje del reclutador</p>
                  <p className="mt-2 italic">"{application.recruiter_message}"</p>
                </div>
              )}
            </div>
            {application.status === "calculated" ? (
              <div className="flex flex-col items-end gap-2">
                {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
                <button
                  onClick={handleApply}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {isPending ? "Enviando..." : "Solicitar Trabajo"}
                </button>
              </div>
            ) : (
              <div className={`rounded-full px-4 py-2 text-sm font-bold ${
                application.status === "applied"
                  ? "bg-amber-100 text-amber-700"
                  : application.status === "viewed"
                  ? "bg-blue-100 text-blue-700"
                  : application.status === "in_progress"
                  ? "bg-emerald-100 text-emerald-700"
                  : application.status === "rejected"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-slate-100 text-slate-700"
              }`}
              >
                {application.status === "applied"
                  ? "Solicitud enviada"
                  : application.status === "viewed"
                  ? "Vista"
                  : application.status === "in_progress"
                  ? "En proceso"
                  : application.status === "rejected"
                  ? "Rechazada"
                  : application.status}
              </div>
            )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!profile && (
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">Inicia sesión como candidato para calcular tu match y postularte a esta oferta.</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Iniciar sesión
          </Link>
        </div>
      )}
    </div>
  );
}
