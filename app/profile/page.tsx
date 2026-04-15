"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { getProfile, saveProfile, getCandidateApplications, uploadResume, saveCandidateResume, getCandidateResumes, deleteCandidateResume, getResumeUrl } from "../actions";
import { User, UploadCloud, Briefcase, ChevronRight, FileText, Trash2, MessageSquare, Eye } from "lucide-react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

const getMatchScoreClasses = (score: number) => {
  if (score >= 90) return "bg-emerald-600 text-white";
  if (score >= 75) return "bg-lime-600 text-white";
  if (score >= 60) return "bg-amber-500 text-slate-950";
  if (score >= 45) return "bg-orange-500 text-white";
  return "bg-rose-500 text-white";
};

function getStatusDisplay(status: string) {
  switch (status) {
    case 'calculated': return { text: "Analizado (No solicitado)", color: "text-slate-500", bg: "bg-slate-100" };
    case 'applied': return { text: "Pendiente de revisión", color: "text-amber-700", bg: "bg-amber-100" };
    case 'viewed': return { text: "Vista por el reclutador", color: "text-blue-700", bg: "bg-blue-100" };
    case 'in_progress': return { text: "En proceso de selección", color: "text-emerald-700 font-bold", bg: "bg-emerald-100" };
    case 'rejected': return { text: "Rechazada", color: "text-rose-700 font-bold", bg: "bg-rose-100" };
    default: return { text: status, color: "text-slate-500", bg: "bg-slate-100" };
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  // Candidate specific
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "applied" | "viewed" | "in_progress" | "rejected">("all");

  const loadData = async () => {
    const data = await getProfile();
    if (data) {
      setProfile(data);
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setRole(data.role as "candidate" | "recruiter");
      if (data.role === "candidate") {
        const [apps, resList] = await Promise.all([
          getCandidateApplications(),
          getCandidateResumes()
        ]);
        setApplications(apps);
        setResumes(resList);
      } else {
        setApplications([]);
        setResumes([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    startTransition(async () => {
      try {
        await saveProfile({ role, first_name: firstName, last_name: lastName });
        setMessage("Perfil actualizado correctamente.");
        await loadData();
        window.dispatchEvent(new Event("profile-updated"));
      } catch (err: any) {
        const errorText = err.message || "Error al guardar el perfil.";
        if (errorText.includes("Could not find the table") || errorText.includes("relation \"public.profiles\" does not exist")) {
          setMessage("Falta la tabla en la base de datos. Ejecuta schema.sql en Supabase SQL Editor.");
        } else {
          setMessage(errorText);
        }
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage("");
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("resume", file);
        const { resumePath, fileName } = await uploadResume(formData);
        
        await saveCandidateResume(fileName, resumePath);
        
        const updatedResumes = await getCandidateResumes();
        setResumes(updatedResumes);
        
        setMessage("Currículum subido y guardado correctamente.");
      } catch (err: any) {
        setMessage(err.message || "Error al subir el currículum.");
      }
    });
  };

  const handleDeleteResume = async (id: string, path: string) => {
    startTransition(async () => {
      try {
        await deleteCandidateResume(id, path);
        setResumes((prev) => prev.filter(r => r.id !== id));
      } catch (err: any) {
        setMessage(err.message || "Error al eliminar el currículum.");
      }
    });
  };

  const handleViewMyResume = async (path: string) => {
    try {
      const result = await getResumeUrl(path);
      if (result.error) {
        alert(result.error);
        return;
      }
      if (result.url) {
        window.open(result.url, "_blank");
      }
    } catch (err: any) {
      alert(err.message || "Error al abrir el currículum.");
    }
  };

  const filteredApplications = applications.filter((app) =>
    statusFilter === "all" ? true : app.status === statusFilter
  );

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold text-slate-950">Mi Perfil</h1>

      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Datos Personales</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                <span className="font-medium">Nombre</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                <span className="font-medium">Apellidos</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
                  required
                />
              </label>
            </div>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              <span className="font-medium">Rol</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "candidate" | "recruiter")}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
              >
                <option value="candidate">Candidato</option>
                <option value="recruiter">Reclutador</option>
              </select>
            </label>
            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {isPending ? "Guardando..." : "Guardar Cambios"}
              </button>
              {message && <span className="text-sm font-medium text-emerald-600">{message}</span>}
            </div>
          </form>
        </section>

        {profile?.role === "candidate" && (
          <>
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <FileText className="h-5 w-5 text-slate-500" />
                Mis Currículums
              </h2>
              <div className="space-y-4">
                {resumes.length > 0 ? (
                  <div className="space-y-3">
                    {resumes.map((resume) => (
                      <div key={resume.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-900">{resume.file_name}</p>
                            <p className="text-xs text-slate-500">{new Date(resume.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewMyResume(resume.file_path)}
                            disabled={isPending}
                            className="rounded-full p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
                            title="Ver currículum"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteResume(resume.id, resume.file_path)}
                            disabled={isPending}
                            className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Eliminar currículum"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">No has subido ningún currículum todavía.</p>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  <UploadCloud className="h-4 w-4" />
                  Subir Nuevo PDF
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Solicitudes Realizadas</h2>
                  <p className="mt-1 text-sm text-slate-600">Filtra por estado para revisar tus solicitudes.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { value: "all", label: "Todas" },
                    { value: "applied", label: "Pendiente" },
                    { value: "viewed", label: "Vistas" },
                    { value: "in_progress", label: "En proceso de selección" },
                    { value: "rejected", label: "Rechazadas" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatusFilter(option.value as any)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${statusFilter === option.value ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              {applications.length === 0 ? (
                <p className="text-sm text-slate-600">Aún no has analizado ninguna oferta ni enviado solicitudes.</p>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((app) => {
                    const statusUI = getStatusDisplay(app.status);
                    return (
                      <Link
                        key={app.id}
                        href={`/jobs/${app.job_id}`}
                        className="group flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-slate-400 hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900">{app.jobs?.title}</h3>
                              {app.jobs?.status === 'active' ? (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Activa</span>
                              ) : app.jobs?.status === 'ended' ? (
                                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">Terminada</span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              Actualizada el {new Date(app.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${statusUI.bg} ${statusUI.color}`}>
                              {statusUI.text}
                            </span>
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold shadow-sm ${getMatchScoreClasses(app.match_score)}`}>
                              {app.match_score}%
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:text-slate-900" />
                          </div>
                        </div>
                        {app.recruiter_message && (
                          <div className="rounded-xl bg-white p-4 border border-slate-100 text-sm text-slate-600 shadow-sm flex items-start gap-3">
                            <MessageSquare className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                            <p className="italic">"{app.recruiter_message}"</p>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
