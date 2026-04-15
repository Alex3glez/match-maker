"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Props = {
  active: "all" | "active" | "ended";
};

const STATUS_LABELS: Record<string, string> = {
  all: "Todas",
  active: "Activas",
  ended: "Terminadas",
};

export default function JobStatusTabs({ active }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  console.log("[DEBUG JobStatusTabs] Rendering", { active, pathname, currentStatus: searchParams.get("status") });
  
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Object.entries(STATUS_LABELS).map(([value, label]) => {
        const isActive = active === value;
        console.log(`[DEBUG] Button: ${value}, isActive: ${isActive}, activeValue: ${active}`);
        const url = `/dashboard/recruiter${value === "all" ? "" : `?status=${value}`}`;
        return (
          <Link
            key={value}
            href={url}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "bg-slate-950 text-white shadow-lg" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
