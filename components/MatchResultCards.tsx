import { Sparkles, ClipboardList, ArrowRight } from "lucide-react";
import { MatchAnalysisResult } from "../app/actions";

export default function MatchResultCards({ analysis }: { analysis: MatchAnalysisResult }) {
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-3">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-3 text-slate-900">
          <Sparkles className="h-5 w-5 text-slate-500" />
          <h2 className="text-sm font-semibold">Match Score</h2>
        </div>
        <p className="text-5xl font-semibold text-slate-950">{analysis.match_score}%</p>
        <p className="mt-3 text-sm text-slate-600">Evaluación de compatibilidad entre el currículum y la oferta.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-3 text-slate-900">
          <ClipboardList className="h-5 w-5 text-slate-500" />
          <h2 className="text-sm font-semibold">Keywords faltantes</h2>
        </div>
        {analysis.missing_keywords.length > 0 ? (
          <ul className="space-y-2 text-sm text-slate-700">
            {analysis.missing_keywords.map((keyword, index) => (
              <li key={index} className="rounded-2xl bg-slate-50 px-3 py-2 text-slate-800">
                {keyword}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600">No se detectaron keywords faltantes en el currículum.</p>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-3 text-slate-900">
          <ArrowRight className="h-5 w-5 text-slate-500" />
          <h2 className="text-sm font-semibold">Plan de acción</h2>
        </div>
        <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{analysis.action_plan}</p>
      </div>
    </div>
  );
}
