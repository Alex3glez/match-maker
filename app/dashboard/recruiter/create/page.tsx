"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createJob } from "@/app/actions";
import { ArrowLeft, Rocket } from "lucide-react";
import Link from "next/link";

export default function CreateJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    startTransition(async () => {
      try {
        await createJob({ title, description });
        router.push("/dashboard/recruiter");
      } catch (err: any) {
        setError(err.message || "Error al crear la oferta.");
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <Link
        href="/dashboard/recruiter"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Mis Ofertas
      </Link>

      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Crear Oferta de Trabajo</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            <span className="font-medium">Título del puesto</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Frontend Developer Junior"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            <span className="font-medium">Descripción de la oferta</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={12}
              placeholder="Describe los requisitos, responsabilidades y lo que ofreces..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none focus:border-slate-400"
              required
            />
          </label>

          {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              <Rocket className="h-4 w-4" />
              {isPending ? "Publicando..." : "Publicar Oferta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
