"use client";

import { useState, useTransition, useRef } from "react";
import { User, FileText, ChevronDown, Download, Send, X } from "lucide-react";
import { markApplicationAsViewed, updateApplicationStatus, getResumeUrl } from "@/app/actions";

const REJECTION_MESSAGES = [
  "Gracias por tu interés. En esta ocasión hemos decidido avanzar con otros perfiles que se ajustan mejor a nuestras necesidades actuales.",
  "Apreciamos tu candidatura. Aunque tu perfil es interesante, en esta ocasión no es el que buscamos para esta posición.",
  "Gracias por considerar nuestra oportunidad. Nos gustaría manterte en contacto para futuras posiciones."
];

const SELECTION_MESSAGES = [
  "¡Excelente noticia! Tu perfil nos ha resultado muy interesante. Nos pondremos en contacto muy pronto para agendar una entrevista.",
  "¡Hola! Hemos revisado tu candidatura y queremos conocerte mejor. A breve nos comunicaremos para coordinar un encuentro.",
  "¡Felicidades! Has avanzado a la siguiente etapa de nuestro proceso de selección. Pronto recibirás más información."
];

export default function ApplicationCard({ app, onStatusUpdate }: { app: any; onStatusUpdate?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [actionMode, setActionMode] = useState<"none" | "reject" | "select">("none");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showMessagePresets, setShowMessagePresets] = useState(false);
  const [localStatus, setLocalStatus] = useState(app.status);
  const [localIsNew, setLocalIsNew] = useState(app.is_new);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const actionButtonRef = useRef<HTMLButtonElement | null>(null);

  const presetMessages = actionMode === "reject" ? REJECTION_MESSAGES : SELECTION_MESSAGES;

  const getMatchScoreClasses = (score: number) => {
    if (score >= 90) return "bg-emerald-600 text-white";
    if (score >= 75) return "bg-lime-600 text-white";
    if (score >= 60) return "bg-amber-500 text-slate-950";
    if (score >= 45) return "bg-orange-500 text-white";
    return "bg-rose-500 text-white";
  };

  const handleAction = (mode: "reject" | "select") => {
    setActionMode(mode);
    setMessage("");
    setError("");
    setShowActionMenu(false);
  };

  const submitAction = () => {
    if (actionMode === "none") return;

    const status = actionMode === "reject" ? "rejected" : "in_progress";

    setError("");
    startTransition(async () => {
      try {
        await updateApplicationStatus(app.id, status, message || undefined);
        setLocalStatus(status);
        setLocalIsNew(false);
        if (message) app.recruiter_message = message;
        setActionMode("none");
        setMessage("");
        setShowActionMenu(false);
        onStatusUpdate?.();
      } catch (err: any) {
        setError(err.message || "Error al actualizar el estado.");
      }
    });
  };

  const handleViewResume = async () => {
    try {
      const resumePath = app.resume_path || app.profiles?.resume_path;
      if (!resumePath) {
        alert("El candidato no tiene un currículum válido asociado a esta solicitud.");
        return;
      }
      const url = await getResumeUrl(resumePath);
      window.open(url, "_blank");
    } catch (err: any) {
      alert(err.message || "Error al abrir el currículum.");
    }
  };

  const handleToggleDetails = () => {
    const willOpen = !expanded;
    if (willOpen && localStatus === "applied") {
      setLocalStatus("viewed");
      setLocalIsNew(false);
      startTransition(async () => {
        try {
          await markApplicationAsViewed(app.id);
          onStatusUpdate?.();
        } catch (err: any) {
          console.error(err);
        }
      });
    }
    setExpanded(willOpen);
    if (willOpen) {
      requestAnimationFrame(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  };

  let statusBadge = null;
  if (localStatus === 'rejected') {
    statusBadge = <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">Rechazado</span>;
  } else if (localStatus === 'in_progress') {
    statusBadge = <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">En proceso de selección</span>;
  } else if (localStatus === 'viewed') {
    statusBadge = <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Visto</span>;
  } else if (localStatus === 'applied') {
    statusBadge = <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Pendiente</span>;
  } else {
    statusBadge = <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Analizado</span>;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-visible">
      <div className="p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div className="min-w-0">
            <h3 className="flex items-center gap-3 text-lg font-bold text-slate-900 truncate">
              <User className="h-5 w-5 text-slate-400" />
              <span>{app.profiles?.first_name} {app.profiles?.last_name}</span>
            </h3>
            <p className="mt-2 text-sm text-slate-500">Solicitado el {new Date(app.updated_at).toLocaleDateString()}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {localIsNew && localStatus === "applied" && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Nuevo</span>
            )}
            {statusBadge}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 font-bold text-white shadow-sm">
              {app.match_score}%
            </div>
            <button
              type="button"
              onClick={handleToggleDetails}
              className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {expanded ? "Ocultar detalles" : "Ver más detalles"}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FileText className="h-4 w-4 text-slate-500" />
                  Plan de Acción Sugerido por IA
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

              {app.recruiter_message && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                  <p className="text-xs font-semibold text-emerald-700 mb-1">Mensaje del reclutador:</p>
                  <p className="text-sm text-emerald-900 italic">"{app.recruiter_message}"</p>
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleViewResume}
                  disabled={isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Ver Currículum
                </button>

                {localStatus !== "rejected" && localStatus !== "in_progress" && (
                  <div className="relative">
                    <button
                      onClick={() => setShowActionMenu(!showActionMenu)}
                      disabled={isPending}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      Acción
                      <ChevronDown className={`h-4 w-4 transition ${showActionMenu ? "rotate-180" : ""}`} />
                    </button>

                    {showActionMenu && (
                      <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-lg z-10">
                        <button
                          onClick={() => handleAction("select")}
                          className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-sm text-emerald-700 font-medium rounded-t-xl transition"
                        >
                          ✓ Pasar a proceso de selección
                        </button>
                        <button
                          onClick={() => handleAction("reject")}
                          className="w-full text-left px-4 py-2 hover:bg-rose-50 text-sm text-rose-700 font-medium rounded-b-xl transition"
                        >
                          ✗ Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {actionMode !== "none" && (
                <div className="rounded-2xl border-2 border-slate-200 p-4 bg-slate-50">
                  <div className="mb-3">
                    <label className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {actionMode === "reject" ? "Motivo de rechazo" : "Mensaje para el candidato"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActionMode("none")}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={actionMode === "reject" ? "Explica brevemente por qué rechazas esta solicitud..." : "Personaliza el mensaje para el candidato..."}
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-400 resize-none"
                      rows={3}
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      {message.length > 0 ? "El candidato recibirá este mensaje." : "Opcional. Si dejas vacío, se enviará un mensaje predeterminado."}
                    </p>
                  </div>

                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => setShowMessagePresets(!showMessagePresets)}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 transition"
                    >
                      {showMessagePresets ? "Ocultar" : "Ver"} mensajes sugeridos
                    </button>
                    {showMessagePresets && (
                      <div className="mt-3 space-y-2">
                        {presetMessages.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setMessage(preset);
                              setShowMessagePresets(false);
                            }}
                            className="w-full text-left rounded-xl bg-white border border-slate-200 hover:border-slate-300 p-3 text-xs text-slate-700 transition hover:bg-slate-50"
                          >
                            "{preset}"
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {error && <p className="text-xs text-rose-600 mb-3">{error}</p>}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={submitAction}
                      disabled={isPending}
                      className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${
                        actionMode === "reject"
                          ? "bg-rose-600 hover:bg-rose-700"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      } disabled:opacity-50`}
                    >
                      {isPending ? "Enviando..." : actionMode === "reject" ? "Rechazar" : "Confirmar proceso"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionMode("none")}
                      disabled={isPending}
                      className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold bg-white border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
