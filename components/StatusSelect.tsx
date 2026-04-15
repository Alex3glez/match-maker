"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type Option = {
  value: "active" | "ended";
  label: string;
};

type Props = {
  name: string;
  value: "active" | "ended";
  options: Option[];
  className?: string;
};

export default function StatusSelect({ name, value, options, className }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        buttonRef.current &&
        listRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !listRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const currentLabel = options.find((option) => option.value === selected)?.label ?? "";

  return (
    <div className={className}>
      <input type="hidden" name={name} value={selected} />
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
      >
        <span>{currentLabel}</span>
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </button>

      {open && (
        <ul
          ref={listRef}
          className="absolute left-0 z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
        >
          {options.map((option) => (
            <li key={option.value} className="border-b border-slate-100 last:border-none">
              <button
                type="button"
                onClick={() => {
                  setSelected(option.value);
                  setOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100"
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
