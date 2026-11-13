"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import AscendancyAvatar from "./AscendancyAvatar";
import { BuildCard } from "./Cards";
import { EASE_OUT_EXPO } from "./Motion";
import TagSelect from "./TagSelect";
import { uniqueClasses, uniqueTags } from "@/lib/format";
import type { Build } from "@/lib/types";

const BASE_CLASSES: { label: string; ascendancies: string[] }[] = [
  { label: "Witch", ascendancies: ["Elementalist", "Necromancer", "Occultist"] },
  { label: "Shadow", ascendancies: ["Assassin", "Saboteur", "Trickster"] },
  { label: "Ranger", ascendancies: ["Deadeye", "Pathfinder", "Warden"] },
  { label: "Duelist", ascendancies: ["Champion", "Gladiator", "Slayer"] },
  { label: "Marauder", ascendancies: ["Berserker", "Chieftain", "Juggernaut"] },
  { label: "Templar", ascendancies: ["Guardian", "Hierophant", "Inquisitor"] },
  { label: "Scion", ascendancies: ["Ascendant"] },
];

const INITIAL_BUILD_LIMIT = 9;

export default function BuildsExplorer({ builds }: { builds: Build[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [selectedClass, setSelectedClass] = useState(() => searchParams.get("classe") ?? "Todas");
  const [selectedTag, setSelectedTag] = useState(() => searchParams.get("tag") ?? "Todas");
  const [selectedBudget, setSelectedBudget] = useState(() => searchParams.get("budget") ?? "Todos");
  const [selectedFocus, setSelectedFocus] = useState(() => searchParams.get("foco") ?? "Todos");
  const [classesOpen, setClassesOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const syncUrl = useCallback(
    (next: { q: string; classe: string; tag: string; budget: string; foco: string }) => {
      const params = new URLSearchParams();
      if (next.q.trim()) params.set("q", next.q.trim());
      if (next.classe !== "Todas") params.set("classe", next.classe);
      if (next.tag !== "Todas") params.set("tag", next.tag);
      if (next.budget !== "Todos") params.set("budget", next.budget);
      if (next.foco !== "Todos") params.set("foco", next.foco);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const updateQuery = (value: string) => {
    setQuery(value);
    syncUrl({ q: value, classe: selectedClass, tag: selectedTag, budget: selectedBudget, foco: selectedFocus });
  };

  const updateClass = (value: string) => {
    setSelectedClass(value);
    syncUrl({ q: query, classe: value, tag: selectedTag, budget: selectedBudget, foco: selectedFocus });
  };

  const updateTag = (value: string) => {
    setSelectedTag(value);
    syncUrl({ q: query, classe: selectedClass, tag: value, budget: selectedBudget, foco: selectedFocus });
  };

  const updateBudget = (value: string) => {
    setSelectedBudget(value);
    syncUrl({ q: query, classe: selectedClass, tag: selectedTag, budget: value, foco: selectedFocus });
  };

  const updateFocus = (value: string) => {
    setSelectedFocus(value);
    syncUrl({ q: query, classe: selectedClass, tag: selectedTag, budget: selectedBudget, foco: value });
  };

  const clearAll = () => {
    setQuery("");
    setSelectedClass("Todas");
    setSelectedTag("Todas");
    setSelectedBudget("Todos");
    setSelectedFocus("Todos");
    syncUrl({ q: "", classe: "Todas", tag: "Todas", budget: "Todos", foco: "Todos" });
  };

  const classes = useMemo(() => uniqueClasses(builds), [builds]);
  const tags = useMemo(() => uniqueTags(builds), [builds]);
  const budgets = useMemo(
    () => Array.from(new Set(builds.map((b) => b.budget?.trim() ?? "").filter(Boolean))),
    [builds],
  );
  const focuses = useMemo(
    () => Array.from(new Set(builds.map((b) => b.focus?.trim() ?? "").filter(Boolean))),
    [builds],
  );

  const classCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const build of builds) {
      if (build.className) {
        counts.set(build.className, (counts.get(build.className) ?? 0) + 1);
      }
    }
    return counts;
  }, [builds]);

  const groupedClasses = useMemo(() => {
    const available = new Set(classes);
    const assigned = new Set<string>();
    const groups = BASE_CLASSES.map((group) => {
      const items = group.ascendancies.filter((name) => available.has(name));
      items.forEach((name) => assigned.add(name));
      return { label: group.label, items };
    }).filter((group) => group.items.length > 0);

    const others = classes.filter((name) => !assigned.has(name));
    if (others.length > 0) {
      groups.push({ label: "Outras", items: others });
    }
    return groups;
  }, [classes]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return builds.filter((build) => {
      const matchesQuery =
        !term ||
        [build.name, build.note, build.className, build.budget, build.focus, build.playstyle, ...build.tags]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      const matchesClass = selectedClass === "Todas" || build.className === selectedClass;
      const matchesTag = selectedTag === "Todas" || build.tags.includes(selectedTag);
      const matchesBudget = selectedBudget === "Todos" || build.budget === selectedBudget;
      const matchesFocus = selectedFocus === "Todos" || build.focus === selectedFocus;
      return matchesQuery && matchesClass && matchesTag && matchesBudget && matchesFocus;
    });
  }, [builds, query, selectedClass, selectedTag, selectedBudget, selectedFocus]);

  const hasFilters = Boolean(
    query ||
      selectedClass !== "Todas" ||
      selectedTag !== "Todas" ||
      selectedBudget !== "Todos" ||
      selectedFocus !== "Todos",
  );
  const hasClassFilter = selectedClass !== "Todas";
  const isCollapsed = !hasFilters && !showAll && filtered.length > INITIAL_BUILD_LIMIT;
  const visibleBuilds = isCollapsed ? filtered.slice(0, INITIAL_BUILD_LIMIT) : filtered;

  return (
    <div>
      <div className="card p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Buscar build, skill ou ascendancy…"
              className="field pl-10 pr-9"
            />
            {query ? (
              <button
                type="button"
                onClick={() => updateQuery("")}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <TagSelect value={selectedTag} options={tags} onChange={updateTag} />
        </div>

        <div className="mt-4 sm:mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setClassesOpen((current) => !current)}
                aria-expanded={classesOpen}
                className="inline-flex items-center gap-1.5 rounded-xl bg-canvas-soft px-3 py-1.5 text-left sm:hidden"
              >
                <span className="eyebrow text-ink">Classes</span>
                {hasClassFilter ? (
                  <span className="rounded-full bg-chrome px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {selectedClass}
                  </span>
                ) : null}
                <ChevronDown
                  className={`h-3.5 w-3.5 text-mute transition-transform duration-150 ${
                    classesOpen ? "rotate-180 text-ink" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              <span className="eyebrow hidden sm:inline">Classes & Ascendancies</span>
              {hasClassFilter ? (
                <button
                  type="button"
                  onClick={() => updateClass("Todas")}
                  className="rounded-full bg-chrome px-2.5 py-0.5 text-[11px] font-semibold text-primary transition-opacity hover:opacity-90"
                >
                  Ver todas
                </button>
              ) : null}
            </div>
            <div className="flex items-center gap-3 text-xs text-mute">
              <span>
                {filtered.length} de {builds.length} builds
              </span>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="font-semibold text-ink underline-offset-4 hover:underline"
                >
                  Limpar
                </button>
              ) : null}
            </div>
          </div>

          <div className={`${classesOpen ? "grid" : "hidden"} mt-3 gap-2.5 sm:grid sm:grid-cols-2 lg:grid-cols-3`}>
            {groupedClasses.map((group) => (
              <div key={group.label} className="rounded-2xl bg-canvas-soft/80 p-2.5">
                <p className="px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-mute">
                  {group.label}
                </p>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {group.items.map((option) => {
                    const active = selectedClass === option;
                    const dimmed = hasClassFilter && !active;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateClass(active ? "Todas" : option)}
                        className={`group relative flex flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-center transition-all duration-150 ${
                          active
                            ? "bg-chrome text-on-chrome ring-2 ring-primary"
                            : "bg-canvas text-body hover:bg-primary-pale hover:text-ink"
                        }`}
                      >
                        <div
                          className={`transition-all duration-150 ${
                            dimmed ? "opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0" : ""
                          }`}
                        >
                          <AscendancyAvatar name={option} className="h-9 w-9" />
                        </div>
                        <span className="w-full truncate text-[11px] font-semibold">{option}</span>
                        <span
                          className={`absolute right-1.5 top-1 text-[10px] font-semibold ${
                            active ? "text-primary" : "text-mute"
                          }`}
                        >
                          {classCounts.get(option) ?? 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {budgets.length > 0 || focuses.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-4">
              {budgets.map((budget) => {
                const active = selectedBudget === budget;
                return (
                  <button
                    key={`budget-${budget}`}
                    type="button"
                    onClick={() => updateBudget(active ? "Todos" : budget)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      active ? "bg-chrome text-primary" : "bg-canvas-soft text-body hover:bg-primary-pale hover:text-ink"
                    }`}
                  >
                    {budget}
                  </button>
                );
              })}
              {focuses.map((focus) => {
                const active = selectedFocus === focus;
                return (
                  <button
                    key={`focus-${focus}`}
                    type="button"
                    onClick={() => updateFocus(active ? "Todos" : focus)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      active ? "bg-chrome text-primary" : "bg-canvas-soft text-body hover:bg-primary-pale hover:text-ink"
                    }`}
                  >
                    {focus}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {hasFilters ? (
          <m.div
            key="active-filter-chips"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: EASE_OUT_EXPO }}
            className="mt-4 flex flex-wrap items-center gap-2"
          >
            <span className="text-xs font-semibold text-mute">Filtros ativos:</span>
            {query.trim() ? (
              <button
                type="button"
                onClick={() => updateQuery("")}
                className="inline-flex items-center gap-1.5 rounded-full bg-chrome px-3 py-1 text-xs font-semibold text-primary transition-opacity hover:opacity-90"
              >
                <span>&ldquo;{query.trim()}&rdquo;</span>
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            ) : null}
            {selectedClass !== "Todas" ? (
              <button
                type="button"
                onClick={() => updateClass("Todas")}
                className="inline-flex items-center gap-1.5 rounded-full bg-chrome px-3 py-1 text-xs font-semibold text-primary transition-opacity hover:opacity-90"
              >
                <span>{selectedClass}</span>
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            ) : null}
            {selectedTag !== "Todas" ? (
              <button
                type="button"
                onClick={() => updateTag("Todas")}
                className="inline-flex items-center gap-1.5 rounded-full bg-chrome px-3 py-1 text-xs font-semibold text-primary transition-opacity hover:opacity-90"
              >
                <span>{selectedTag}</span>
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            ) : null}
            {selectedBudget !== "Todos" ? (
              <button
                type="button"
                onClick={() => updateBudget("Todos")}
                className="inline-flex items-center gap-1.5 rounded-full bg-chrome px-3 py-1 text-xs font-semibold text-primary transition-opacity hover:opacity-90"
              >
                <span>{selectedBudget}</span>
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            ) : null}
            {selectedFocus !== "Todos" ? (
              <button
                type="button"
                onClick={() => updateFocus("Todos")}
                className="inline-flex items-center gap-1.5 rounded-full bg-chrome px-3 py-1 text-xs font-semibold text-primary transition-opacity hover:opacity-90"
              >
                <span>{selectedFocus}</span>
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={clearAll}
              className="ml-1 text-xs font-semibold text-ink underline-offset-4 hover:underline"
            >
              Limpar todos
            </button>
          </m.div>
        ) : null}
      </AnimatePresence>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleBuilds.map((build) => (
            <m.div
              key={build.slug}
              layout="position"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
              className="flex min-w-0 [&>*]:w-full"
            >
              <BuildCard build={build} />
            </m.div>
          ))}
        </AnimatePresence>
      </div>

      {!hasFilters && filtered.length > INITIAL_BUILD_LIMIT ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            className="btn btn-secondary"
          >
            {showAll
              ? "Mostrar menos builds"
              : `Mostrar todas as ${filtered.length} builds`}
          </button>
        </div>
      ) : null}

      {filtered.length === 0 && (
        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
          className="card-soft mt-10 p-8 text-center"
        >
          <p className="font-display text-lg font-bold text-ink">Nenhuma build encontrada</p>
          <p className="mt-1 text-sm text-body">Tente limpar os filtros ou buscar por outra skill.</p>
        </m.div>
      )}
    </div>
  );
}
