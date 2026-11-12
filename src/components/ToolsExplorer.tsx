"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { ToolCard } from "./Cards";
import type { LinkItem } from "@/lib/types";

function anchor(category: string) {
  return category.replace(/\s+/g, "-").toLowerCase();
}

export default function ToolsExplorer({ links }: { links: LinkItem[] }) {
  const [query, setQuery] = useState("");
  const categories = useMemo(() => [...new Set(links.map((item) => item.category))], [links]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return links;
    return links.filter((item) =>
      [item.name, item.description, item.category].join(" ").toLowerCase().includes(term),
    );
  }, [links, query]);

  const visibleCategories = useMemo(
    () => categories.filter((category) => filtered.some((item) => item.category === category)),
    [categories, filtered],
  );

  return (
    <>
      <div className="mt-6 flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar ferramenta, overlay ou filtro…"
            className="field pl-10 pr-9"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <a
              key={category}
              href={`#${anchor(category)}`}
              className="rounded-full bg-canvas-soft px-3 py-1.5 text-xs font-semibold text-body transition-colors hover:bg-primary-pale hover:text-ink"
            >
              {category}
            </a>
          ))}
        </div>
      </div>

      {visibleCategories.length === 0 ? (
        <div className="card-soft mt-10 p-8 text-center">
          <p className="font-display text-lg font-bold text-ink">Nenhuma ferramenta encontrada</p>
          <p className="mt-1 text-sm text-body">Tente outro termo ou limpe a busca.</p>
        </div>
      ) : (
        <div className="mt-12 space-y-12">
          {visibleCategories.map((category) => {
            const items = filtered.filter((item) => item.category === category);
            return (
              <section key={category} id={anchor(category)} className="scroll-mt-20">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">{category}</h2>
                  <span className="rule flex-1" />
                  <span className="text-xs font-medium text-mute">{items.length}</span>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <ToolCard key={item.name} item={item} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
