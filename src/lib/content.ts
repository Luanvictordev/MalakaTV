import { readCollection } from "./store";
import type { Build, Game, Guide, LinkItem, SiteConfig } from "./types";

export async function getSite(): Promise<SiteConfig> {
  return readCollection<SiteConfig>("site");
}

export async function getGames(): Promise<Game[]> {
  return readCollection<Game[]>("games");
}

export async function getGame(slug: string): Promise<Game | undefined> {
  return (await getGames()).find((game) => game.slug === slug);
}

export async function getBuilds(game?: string): Promise<Build[]> {
  const builds = await readCollection<Build[]>("builds");
  return game ? builds.filter((build) => build.game === game) : builds;
}

export async function getGuides(game?: string): Promise<Guide[]> {
  const guides = await readCollection<Guide[]>("guias");
  return game ? guides.filter((guide) => guide.game === game) : guides;
}

export async function getBuild(slug: string): Promise<Build | undefined> {
  const builds = await readCollection<Build[]>("builds");
  return builds.find((build) => build.slug === slug);
}

export async function getLinks(): Promise<LinkItem[]> {
  return readCollection<LinkItem[]>("links");
}

export { youtubeThumb, youtubeWatch, slugify, uniqueClasses, uniqueTags, hostOf } from "./format";
