"use client";

import { useMemo, useState } from "react";
import { BuildCard } from "./Cards";
import { uniqueClasses, uniqueTags } from "@/lib/format";
import type { Build } from "@/lib/types";

export default function BuildsExplorer({ builds }: { builds: Build[] }) {
  const [query, setQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("Todas");
  const [selectedTag, setSelectedTag] = useState("Todas");

  const classes = useMemo(() => ["Todas", ...uniqueClasses(builds)], [builds]);
  const tags = useMemo(() => ["Todas", ...uniqueTags(builds)], [builds]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return builds.filter((build) => {
      const matchesQuery =
        !term ||
        [build.name, build.note, build.className, ...build.tags].join(" ").toLowerCase().includes(term);
      const matchesClass = selectedClass === "Todas" || build.className === selectedClass;
      const matchesTag = selectedTag === "Todas" || build.tags.includes(selectedTag);
      return matchesQuery && matchesClass && matchesTag;
    });
  }, [builds, query, selectedClass, selectedTag]);

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
      active ? "bg-ink text-canvas" : "bg-canvas text-body hover:bg-primary-pale hover:text-ink"
    }`;

  return (
    <div>
      <div className="card p-4 sm:p-5">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar build, skill ou ascendancy…"
          className="field"
        />

        <div className="mt-4 space-y-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="eyebrow mr-1">Classe</span>
            {classes.map((option) => (
              <button key={option} type="button" onClick={() => setSelectedClass(option)} className={chip(selectedClass === option)}>
                {option}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="eyebrow mr-1">Tag</span>
            {tags.map((option) => (
              <button key={option} type="button" onClick={() => setSelectedTag(option)} className={chip(selectedTag === option)}>
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-mute">
          <span>
            {filtered.length} de {builds.length} builds
          </span>
          {(query || selectedClass !== "Todas" || selectedTag !== "Todas") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedClass("Todas");
                setSelectedTag("Todas");
              }}
              className="font-semibold text-ink underline-offset-4 hover:underline"
            >
              limpar
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((build) => (
          <BuildCard key={build.slug} build={build} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-body">
          Nada com esses filtros. Tenta limpar ou buscar por outra skill.
        </p>
      )}
    </div>
  );
}
