import Link from "next/link";
import { getJobById, updateJob } from "@/app/actions";
import { ChevronDown, Save } from "lucide-react";
import { redirect } from "next/navigation";

async function handleUpdate(formData: FormData) {
  "use server";

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "active") as "active" | "ended";
  const jobId = String(formData.get("jobId") ?? "").trim();

  if (!jobId || !title || !description) {
    throw new Error("El título, la descripción y el id de la oferta son obligatorios.");
  }

  await updateJob(jobId, { title, description, status });
  redirect(`/dashboard/recruiter/${jobId}`);
}

export default async function EditJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = await getJobById(jobId);

  if (!job) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Oferta no encontrada</h1>
        <Link href="/dashboard/recruiter" className="mt-4 inline-block text-slate-600 underline">
          Volver al panel
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Editar Oferta</h1>
          <p className="mt-2 text-sm text-slate-600">Modifica el contenido y cambia el estado de la oferta.</p>
        </div>
        <Link
          href={`/dashboard/recruiter/${jobId}`}
          className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-200"
        >
          Volver a la oferta
        </Link>
      </div>

      <form action={handleUpdate} className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <input type="hidden" name="jobId" value={jobId} />
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="font-medium">Título del puesto</span>
          <input
            name="title"
            defaultValue={job.title}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="font-medium">Descripción de la oferta</span>
          <textarea
            name="description"
            defaultValue={job.description}
            rows={12}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none focus:border-slate-400"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="font-medium">Estado de la oferta</span>
          <div className="relative">
            <select
              name="status"
              defaultValue={job.status === "ended" ? "ended" : "active"}
              className="w-full appearance-none rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="active">Activa</option>
              <option value="ended">Terminada</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Cambia el contenido o desactiva esta oferta cuando ya no acepte candidaturas.
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Save className="h-4 w-4" />
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
