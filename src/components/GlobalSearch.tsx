"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Search, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { EASE_OUT_EXPO } from "./Motion";

export type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  category: "Build" | "Farm" | "Guia" | "Ferramenta";
  href: string;
  external?: boolean;
  keywords?: string;
};

export default function GlobalSearch({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items.slice(0, 12);
    return items
      .filter((item) =>
        [item.title, item.subtitle, item.category, item.keywords]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term),
      )
      .slice(0, 20);
  }, [items, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    const onGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      } else if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onGlobalKeyDown);
    return () => document.removeEventListener("keydown", onGlobalKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const rafId = requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      cancelAnimationFrame(rafId);
      document.body.style.overflow = prevOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const activeEl = listRef.current.children[activeIndex] as HTMLElement | undefined;
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function selectItem(item: SearchItem) {
    setOpen(false);
    setQuery("");
    if (item.external) {
      window.open(item.href, "_blank", "noopener,noreferrer");
    } else {
      router.push(item.href);
    }
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = results[activeIndex];
      if (target) selectItem(target);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar builds, farms, guias e ferramentas"
        title="Buscar"
        className="flex h-9 items-center gap-2 rounded-full bg-on-chrome/10 px-2.5 text-on-chrome/80 transition-colors hover:bg-primary hover:text-on-primary lg:px-3"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="hidden text-xs font-semibold lg:inline">Buscar…</span>
      </button>

      <AnimatePresence>
        {open ? (
          <m.div
            key="global-search-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Busca global"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: EASE_OUT_EXPO }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 p-4 pt-[10vh] backdrop-blur-sm"
          >
            <m.div
              key="global-search-dialog"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
              onClick={(event) => event.stopPropagation()}
              className="card w-full max-w-xl overflow-hidden border border-ink/15 bg-canvas shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-ink/10 px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-mute" aria-hidden="true" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={onInputKeyDown}
                  placeholder="Buscar build, farm, guia ou ferramenta…"
                  aria-label="Buscar build, farm, guia ou ferramenta"
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-mute sm:text-[15px]"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    aria-label="Limpar busca"
                    className="rounded-full p-1 text-mute transition-colors hover:bg-canvas-soft hover:text-ink"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fechar busca"
                  className="rounded-lg border border-ink/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-mute transition-colors hover:border-ink hover:text-ink"
                >
                  Esc
                </button>
              </div>

              {results.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="font-display text-base font-bold text-ink">Nenhum resultado encontrado</p>
                  <p className="mt-1 text-xs text-body">Tente buscar por outra skill, classe ou ferramenta.</p>
                </div>
              ) : (
                <ul
                  ref={listRef}
                  role="listbox"
                  aria-label="Resultados da busca"
                  className="max-h-[60vh] overflow-y-auto p-2"
                >
                  {results.map((item, index) => {
                    const active = index === activeIndex;
                    return (
                      <li key={item.id} role="option" aria-selected={active}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => selectItem(item)}
                          className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-left transition-colors ${
                            active ? "bg-primary-pale text-ink" : "text-body hover:bg-canvas-soft hover:text-ink"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-display text-sm font-bold text-ink">{item.title}</p>
                            {item.subtitle ? (
                              <p className="mt-0.5 truncate text-xs text-mute">{item.subtitle}</p>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <span
                              className={`badge ${
                                item.category === "Build"
                                  ? "badge-lime"
                                  : item.category === "Farm"
                                    ? "badge-lime-solid"
                                    : "badge-neutral"
                              }`}
                            >
                              {item.category}
                            </span>
                            {item.external ? (
                              <ArrowUpRight className="h-3.5 w-3.5 text-mute" aria-hidden="true" />
                            ) : null}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="flex items-center justify-between border-t border-ink/10 bg-canvas-soft/60 px-4 py-2 text-[11px] text-mute">
                <span>↑↓ navegar · Enter abrir</span>
                <span>{results.length} resultados</span>
              </div>
            </m.div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
