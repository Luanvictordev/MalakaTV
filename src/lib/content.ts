import { readCollection } from "./store";
import { extractYoutubeId, slugify } from "./format";
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
  const raw = await readCollection<Build[]>("builds");
  const builds = raw.map((build, index) => ({
    ...build,
    slug: build.slug?.trim() || slugify(build.name || "") || `build-${index + 1}`,
    videoId: extractYoutubeId(build.videoId) || build.videoId?.trim() || "",
  }));
  return game ? builds.filter((build) => build.game === game) : builds;
}

export async function getGuides(game?: string): Promise<Guide[]> {
  const raw = await readCollection<Guide[]>("guias");
  const guides = raw.map((guide, index) => {
    const cleanVideoId = extractYoutubeId(guide.videoId);
    const fallbackUrl =
      !cleanVideoId && guide.videoId?.trim().startsWith("http") && !guide.atlasUrl
        ? guide.videoId.trim()
        : guide.atlasUrl;
    return {
      ...guide,
      slug: guide.slug?.trim() || slugify(guide.title || "") || `${guide.kind}-${index + 1}`,
      videoId: cleanVideoId,
      atlasUrl: fallbackUrl,
    };
  });
  return game ? guides.filter((guide) => guide.game === game) : guides;
}

export async function getGuide(slug: string, game?: string): Promise<Guide | undefined> {
  const guides = await getGuides(game);
  return guides.find((guide) => guide.slug === slug);
}

export async function getBuild(slug: string, game?: string): Promise<Build | undefined> {
  const builds = await getBuilds(game);
  return builds.find((build) => build.slug === slug);
}

export async function getLinks(): Promise<LinkItem[]> {
  return readCollection<LinkItem[]>("links");
}

export { extractYoutubeId, youtubeThumb, youtubeWatch, slugify, uniqueClasses, uniqueTags, hostOf } from "./format";
