"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { ArrowUpCircle, FileText, UploadCloud, Rocket } from "lucide-react";
import { analyzeMatch, uploadResume, MatchAnalysisResult } from "../app/actions";
import MatchResultCards from "./MatchResultCards";

export default function DashboardShell() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [resumePath, setResumePath] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState("Sube un PDF y pega la oferta de trabajo para calcular el match.");
  const [analysis, setAnalysis] = useState<MatchAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setStatusMessage("Subiendo currículum...");

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const formData = new FormData();
    formData.append("resume", file);

    startTransition(async () => {
      try {
        const result = await uploadResume(formData);
        setResumePath(result.resumePath);
        setSelectedFileName(file.name);
        setStatusMessage("Currículum subido con éxito.");
      } catch (error) {
        setErrorMessage((error as Error).message || "Error al subir el currículum.");
        setStatusMessage("No se pudo subir el currículum.");
      }
    });
  };

  const handleAnalyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setAnalysis(null);

    if (!resumePath) {
      setErrorMessage("Por favor sube primero un currículum PDF.");
      return;
    }

    if (!jobDescription.trim()) {
      setErrorMessage("Agrega el texto de la oferta de trabajo.");
      return;
    }

    setStatusMessage("Calculando match...");
    startTransition(async () => {
      try {
        const result = await analyzeMatch({ resumePath, jobDescription });
        setAnalysis(result);
        setStatusMessage("Análisis completado.");
      } catch (error) {
        setErrorMessage((error as Error).message || "Error al calcular el match.");
        setStatusMessage("No se pudo calcular el match.");
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3 text-slate-900">
            <ArrowUpCircle className="h-5 w-5 text-slate-500" />
            <div>
              <h2 className="text-lg font-semibold">Sube tu currículum</h2>
              <p className="text-sm text-slate-600">PDF, no más de 5 MB.</p>
            </div>
          </div>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={triggerFilePicker}
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <UploadCloud className="h-4 w-4" />
              {isPending ? "Procesando..." : "Seleccionar PDF"}
            </button>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Archivo</p>
              <p>{selectedFileName || "Ningún archivo seleccionado."}</p>
            </div>
            {previewUrl ? (
              <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-900">Vista previa del PDF</p>
                <iframe
                  src={previewUrl}
                  className="h-[320px] w-full rounded-3xl border border-slate-200"
                  title="Vista previa del currículum"
                />
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3 text-slate-900">
            <FileText className="h-5 w-5 text-slate-500" />
            <div>
              <h2 className="text-lg font-semibold">Oferta de trabajo</h2>
              <p className="text-sm text-slate-600">Pega el contenido de la oferta para analizar compatibilidad.</p>
            </div>
          </div>
          <form className="space-y-4" onSubmit={handleAnalyze}>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={10}
              className="w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="Pega aquí la descripción de la oferta..."
            />
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <Rocket className="h-4 w-4" />
              {isPending ? "Calculando..." : "Calcular Match"}
            </button>
          </form>
        </section>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Estado</h3>
            <p className="mt-1 text-sm text-slate-600">{statusMessage}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-2 text-sm text-slate-700">{resumePath ? "Resume listo" : "Esperando archivo"}</div>
        </div>
        {errorMessage ? <p className="mt-4 rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p> : null}
      </div>

      {analysis ? <MatchResultCards analysis={analysis} /> : null}
    </div>
  );
}
