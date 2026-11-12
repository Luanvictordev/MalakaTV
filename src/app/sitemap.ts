import type { MetadataRoute } from "next";
import { getBuilds, getGames } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

const baseUrl = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const games = await getGames();
  const builds = await getBuilds();
  const activeSlugs = new Set(games.filter((g) => g.status === "ativo").map((g) => g.slug));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/ferramentas`, changeFrequency: "monthly", priority: 0.8 },
  ];

  const gameRoutes: MetadataRoute.Sitemap = [...activeSlugs].map((slug) => ({
    url: `${baseUrl}/jogos/${slug}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const buildRoutes: MetadataRoute.Sitemap = builds
    .filter((build) => activeSlugs.has(build.game))
    .map((build) => ({
      url: `${baseUrl}/jogos/${build.game}/builds/${build.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...gameRoutes, ...buildRoutes];
}
