"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Tag } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { EASE_OUT_EXPO } from "./Motion";

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
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const items = useMemo(() => ["Todas", ...options], [options]);

  useEffect(() => {
    if (!open) return;

    const currentIdx = items.indexOf(value);
    setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0);

    const onMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, items, value]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const activeEl = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, open]);

  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) => (current + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) => (current - 1 + items.length) % items.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setHighlightedIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setHighlightedIndex(items.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const target = items[highlightedIndex];
      if (target) {
        onChange(target);
        setOpen(false);
      }
    }
  }

  return (
    <div ref={rootRef} className="relative sm:w-56">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKeyDown}
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

      <AnimatePresence>
        {open ? (
          <m.ul
            ref={listRef}
            key="tag-listbox"
            role="listbox"
            aria-label="Filtrar por tag"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: EASE_OUT_EXPO }}
            className="absolute right-0 z-30 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-ink/15 bg-canvas p-1.5 shadow-[0_16px_40px_-12px_rgba(14,15,12,0.18)]"
          >
            {items.map((option, index) => {
              const active = value === option;
              const highlighted = highlightedIndex === index;
              return (
                <li key={option} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => {
                      onChange(option);
                      setOpen(false);
                      triggerRef.current?.focus();
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                      active
                        ? "bg-primary-pale font-semibold text-ink"
                        : highlighted
                          ? "bg-canvas-soft text-ink"
                          : "text-body hover:bg-canvas-soft hover:text-ink"
                    }`}
                  >
                    <span className="truncate">{option === "Todas" ? "Todas as tags" : option}</span>
                    {active ? <Check className="h-4 w-4 shrink-0 text-positive-deep" aria-hidden="true" /> : null}
                  </button>
                </li>
              );
            })}
          </m.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
