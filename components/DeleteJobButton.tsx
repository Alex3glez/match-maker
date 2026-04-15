"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteJob } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function DeleteJobButton({ jobId }: { jobId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta oferta? Esta acción no se puede deshacer y eliminará todas las solicitudes asociadas.")) {
      startTransition(async () => {
        try {
          await deleteJob(jobId);
          router.refresh();
        } catch (err: any) {
          alert(err.message || "Error al eliminar la oferta.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      title="Eliminar oferta"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-rose-500 transition hover:border-slate-300 hover:bg-slate-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
