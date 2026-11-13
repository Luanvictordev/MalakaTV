"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { ToolCard } from "./Cards";
import { EASE_OUT_EXPO } from "./Motion";
import { slugify } from "@/lib/format";
import type { LinkItem } from "@/lib/types";

function anchor(category: string) {
  return slugify(category);
}

const GAME_FILTERS = ["Todos", "PoE 1", "PoE 2"] as const;
type GameFilter = (typeof GAME_FILTERS)[number];

export default function ToolsExplorer({ links }: { links: LinkItem[] }) {
  const [query, setQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<GameFilter>("Todos");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const categories = useMemo(() => [...new Set(links.map((item) => item.category))], [links]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return links.filter((item) => {
      const game = item.game?.trim() || "Ambos";
      const matchesGame =
        selectedGame === "Todos" || game === "Ambos" || game === selectedGame;
      const matchesQuery =
        !term ||
        [item.name, item.description, item.category, game].join(" ").toLowerCase().includes(term);
      return matchesGame && matchesQuery;
    });
  }, [links, query, selectedGame]);

  const visibleCategories = useMemo(
    () => categories.filter((category) => filtered.some((item) => item.category === category)),
    [categories, filtered],
  );

  useEffect(() => {
    if (visibleCategories.length === 0) {
      setActiveCategory("");
      return;
    }

    setActiveCategory((current) =>
      visibleCategories.includes(current) ? current : visibleCategories[0],
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id;
          const match = visibleCategories.find((category) => anchor(category) === id);
          if (match) setActiveCategory(match);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );

    const elements = visibleCategories
      .map((category) => document.getElementById(anchor(category)))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [visibleCategories]);

  return (
    <>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
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

          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrar por jogo">
            {GAME_FILTERS.map((game) => {
              const active = selectedGame === game;
              return (
                <button
                  key={game}
                  type="button"
                  onClick={() => setSelectedGame(game)}
                  aria-pressed={active}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-chrome text-primary"
                      : "bg-canvas-soft text-body hover:bg-primary-pale hover:text-ink"
                  }`}
                >
                  {game}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {visibleCategories.length > 0 ? (
        <nav
          aria-label="Categorias de ferramentas"
          className="sticky top-[57px] z-20 -mx-5 mt-3 flex flex-wrap gap-1.5 border-b border-ink/5 bg-canvas/90 px-5 py-2.5 backdrop-blur-md"
        >
          {visibleCategories.map((category) => {
            const active = activeCategory === category;
            return (
              <a
                key={category}
                href={`#${anchor(category)}`}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-chrome text-primary"
                    : "bg-canvas-soft text-body hover:bg-primary-pale hover:text-ink"
                }`}
              >
                {category}
              </a>
            );
          })}
        </nav>
      ) : null}

      {visibleCategories.length === 0 ? (
        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
          className="card-soft mt-10 p-8 text-center"
        >
          <p className="font-display text-lg font-bold text-ink">Nenhuma ferramenta encontrada</p>
          <p className="mt-1 text-sm text-body">Tente outro termo ou limpe a busca.</p>
        </m.div>
      ) : (
        <div className="mt-10 space-y-12">
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleCategories.map((category) => {
              const items = filtered.filter((item) => item.category === category);
              return (
                <m.section
                  key={category}
                  id={anchor(category)}
                  layout="position"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
                  className="scroll-mt-32"
                >
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">{category}</h2>
                    <span className="rule flex-1" />
                    <span className="text-xs font-medium text-mute">{items.length}</span>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {items.map((item) => (
                        <m.div
                          key={item.name}
                          layout="position"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                          className="flex min-w-0 [&>*]:w-full"
                        >
                          <ToolCard item={item} />
                        </m.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </m.section>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
