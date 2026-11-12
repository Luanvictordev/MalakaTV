"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Tag } from "lucide-react";

export default function TagSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const items = ["Todas", ...options];

  return (
    <div ref={rootRef} className="relative sm:w-56">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`field flex items-center justify-between gap-2 text-left ${
          open ? "border-ink" : ""
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Tag className="h-4 w-4 shrink-0 text-mute" aria-hidden="true" />
          <span className={`truncate ${value === "Todas" ? "text-mute" : "font-medium text-ink"}`}>
            {value === "Todas" ? "Todas as tags" : value}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-mute transition-transform duration-150 ${
            open ? "rotate-180 text-ink" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label="Filtrar por tag"
          className="absolute right-0 z-30 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-ink/15 bg-canvas p-1.5 shadow-[0_16px_40px_-12px_rgba(14,15,12,0.18)]"
        >
          {items.map((option) => {
            const active = value === option;
            return (
              <li key={option} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? "bg-primary-pale font-semibold text-ink"
                      : "text-body hover:bg-canvas-soft hover:text-ink"
                  }`}
                >
                  <span className="truncate">{option === "Todas" ? "Todas as tags" : option}</span>
                  {active ? <Check className="h-4 w-4 shrink-0 text-positive-deep" aria-hidden="true" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
