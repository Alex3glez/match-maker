"use client";

import { useState, useTransition } from "react";
import { User, FileText, CheckCircle2, XCircle, ChevronDown, ExternalLink } from "lucide-react";
import { updateApplicationStatus, getResumeUrl } from "@/app/actions";

export default function ApplicationCard({ app }: { app: any }) {
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [actionType, setActionType] = useState<"none" | "rejected" | "in_progress">("none");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleAction = (status: "rejected" | "in_progress") => {
    if (!message.trim() && status === "rejected") {
      setMessage("Gracias por tu interés, pero en este momento avanzaremos con otros perfiles que se ajustan mejor a nuestras necesidades actuales.");
    } else if (!message.trim() && status === "in_progress") {
      setMessage("¡Hola! Tu perfil nos ha resultado muy interesante. Nos pondremos en contacto contigo pronto para agendar una entrevista.");
    }
    setActionType(status);
  };

  const submitAction = () => {
    if (actionType === "none") return;
    setError("");
    startTransition(async () => {
      try {
        await updateApplicationStatus(app.id, actionType, message);
        app.status = actionType;
        app.recruiter_message = message;
        setActionType("none");
      } catch (err: any) {
        setError(err.message || "Error al actualizar el estado.");
      }
    });
  };

  const handleViewResume = async () => {
    try {
      // In the match maker we might have saved resume_id or resume_path in profiles.
      // Wait, earlier we were saving it in 'applications' or relying on profile's resume_path.
      // Let's use the one attached to the profile for now if it's there.
      const resumePath = app.profiles?.resume_path;
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

  // Status visual mapping
  let statusBadge = null;
  if (app.status === 'rejected') {
    statusBadge = <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">Rechazado</span>;
  } else if (app.status === 'in_progress') {
    statusBadge = <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">En Proceso</span>;
  } else if (app.status === 'viewed') {
    statusBadge = <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Visto</span>;
  } else {
    statusBadge = <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Nuevo</span>;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <User className="h-5 w-5 text-slate-400" />
                {app.profiles?.first_name} {app.profiles?.last_name}
              </h3>
              {statusBadge}
            </div>
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
             <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-200">
               <p className="text-xs font-semibold text-slate-500 mb-1">Mensaje enviado al candidato:</p>
               <p className="text-sm italic text-slate-700">"{app.recruiter_message}"</p>
             </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-slate-50 p-4 px-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={handleViewResume}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition"
        >
          <ExternalLink className="h-4 w-4" />
          Ver Currículum PDF
        </button>

        {app.status !== 'rejected' && app.status !== 'in_progress' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleAction("rejected")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
            >
              <XCircle className="h-4 w-4" />
              Rechazar
            </button>
            <button
              onClick={() => handleAction("in_progress")}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              Avanzar
            </button>
          </div>
        )}
      </div>

      {/* Modal / Inline form para enviar el mensaje */}
      {actionType !== "none" && (
        <div className="p-6 pt-0 bg-slate-50 border-t border-slate-200">
          <div className="mt-4 space-y-4">
            <h4 className="text-sm font-semibold text-slate-900">
              {actionType === "rejected" ? "Motivo del rechazo (opcional)" : "Mensaje para el candidato (opcional)"}
            </h4>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-400"
              rows={3}
              placeholder="Escribe un mensaje para el candidato..."
            />
            {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActionType("none")}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                onClick={submitAction}
                disabled={isPending}
                className={`rounded-xl px-5 py-2 text-sm font-semibold text-white transition ${
                  actionType === "rejected" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isPending ? "Guardando..." : "Confirmar Acción"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
