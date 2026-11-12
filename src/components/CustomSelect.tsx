"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
};

export default function CustomSelect({
  value,
  options,
  onChange,
  placeholder = "Selecione…",
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
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

  const current = options.find((item) => item.value === value);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((state) => !state)}
        className={`field flex items-center justify-between gap-2 text-left ${open ? "border-ink" : ""}`}
      >
        <span className={`truncate ${current && current.value !== "" ? "text-ink" : "text-mute"}`}>
          {current ? current.label : placeholder}
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
          className="absolute left-0 right-0 z-30 mt-2 max-h-60 overflow-auto rounded-2xl border border-ink/15 bg-canvas p-1.5 shadow-[0_16px_40px_-12px_rgba(14,15,12,0.18)]"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? "bg-primary-pale font-semibold text-ink"
                      : "text-body hover:bg-canvas-soft hover:text-ink"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
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
