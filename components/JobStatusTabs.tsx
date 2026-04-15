"use client";

import { useRouter } from "next/navigation";

type Props = {
  active: "all" | "active" | "ended";
};

const STATUS_LABELS: Record<string, string> = {
  all: "Todas",
  active: "Activas",
  ended: "Terminadas",
};

export default function JobStatusTabs({ active }: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {Object.entries(STATUS_LABELS).map(([value, label]) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => router.push(`/dashboard/recruiter${value === "all" ? "" : `?status=${value}`}`)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "bg-slate-950 text-white shadow-lg" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
