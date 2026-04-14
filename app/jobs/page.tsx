"use client";

import { useEffect, useState } from "react";
import { getJobs } from "@/app/actions";
import Link from "next/link";
import { Search, Briefcase, ChevronRight } from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      const data = await getJobs(search);
      setJobs(data || []);
      setLoading(false);
    }
    const timer = setTimeout(() => {
      loadJobs();
    }, 300); // debounce search
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-950">Descubre Ofertas de Trabajo</h1>
        <p className="mt-3 text-lg text-slate-600">Encuentra tu próxima gran oportunidad y calcula tu compatibilidad al instante.</p>
      </div>

      <div className="mb-8 relative mx-auto max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título o palabra clave..."
          className="w-full rounded-full border border-slate-200 bg-white py-4 pl-12 pr-6 text-slate-900 shadow-sm outline-none focus:border-slate-400"
        />
      </div>

      {loading ? (
        <div className="text-center text-slate-500">Cargando ofertas...</div>
      ) : jobs.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Briefcase className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-900">No se encontraron ofertas</h2>
          <p className="mt-2 text-slate-600">Intenta buscar con otras palabras clave.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow-md sm:flex-row sm:items-center"
            >
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{job.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Publicado por {job.profiles?.first_name} {job.profiles?.last_name} • {new Date(job.created_at).toLocaleDateString()}
                </p>
                <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                  {job.description}
                </p>
              </div>
              <div className="mt-4 sm:ml-6 sm:mt-0">
                <div className="flex items-center justify-center rounded-full bg-slate-50 p-3 transition group-hover:bg-slate-100">
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-900" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
