import type { Build } from "./types";

export function youtubeWatch(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function youtubeThumb(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function uniqueClasses(builds: Build[]): string[] {
  return [...new Set(builds.map((build) => build.className).filter(Boolean))].sort();
}

export function uniqueTags(builds: Build[]): string[] {
  const preferred = [
    "League Starter",
    "Melee",
    "Spell",
    "Bow",
    "Wand",
    "Minion",
    "Tank",
    "Boss",
    "Mapa",
    "DOT",
    "Ignite",
    "Cold",
    "Poison",
    "Barata",
    "Off-meta",
    "Iniciante",
    "Buffada",
    "Nerfada",
    "3.30",
  ];
  const all = new Set(builds.flatMap((build) => build.tags));
  const ordered = preferred.filter((tag) => all.has(tag));
  const rest = [...all].filter((tag) => !ordered.includes(tag)).sort();
  return [...ordered, ...rest];
}
