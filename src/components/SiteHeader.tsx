import Link from "next/link";
import HeaderNav from "./HeaderNav";
import type { SearchItem } from "./GlobalSearch";
import { getBuilds, getGames, getGuides, getLinks, getSite, slugify, youtubeWatch } from "@/lib/content";

export default async function SiteHeader() {
  const [site, games, builds, guides, links] = await Promise.all([
    getSite(),
    getGames(),
    getBuilds(),
    getGuides(),
    getLinks(),
  ]);

  const gameMap = new Map(games.map((g) => [g.slug, g.shortName]));

  const searchItems: SearchItem[] = [
    ...builds.map((build) => ({
      id: `build-${build.game}-${build.slug}`,
      title: build.name,
      subtitle: [gameMap.get(build.game) ?? build.game.toUpperCase(), build.className, build.budget]
        .filter(Boolean)
        .join(" · "),
      category: "Build" as const,
      href: `/jogos/${build.game || "poe1"}/builds/${build.slug || slugify(build.name)}`,
      keywords: [build.note, build.focus, build.playstyle, ...build.tags].filter(Boolean).join(" "),
    })),
    ...guides.map((guide) => {
      const isFarm = guide.kind === "farm";
      const gameLabel = gameMap.get(guide.game) ?? guide.game.toUpperCase();
      const href = isFarm
        ? `/jogos/${guide.game || "poe1"}/farms/${guide.slug || slugify(guide.title)}`
        : guide.videoId
          ? youtubeWatch(guide.videoId)
          : guide.atlasUrl || `/jogos/${guide.game || "poe1"}#guias`;
      const external = !isFarm && Boolean(guide.videoId || guide.atlasUrl);

      return {
        id: `${guide.kind}-${guide.game}-${guide.slug}`,
        title: guide.title,
        subtitle: [gameLabel, guide.metric || (isFarm ? "Farm" : "Guia")].filter(Boolean).join(" · "),
        category: (isFarm ? "Farm" : "Guia") as "Farm" | "Guia",
        href,
        external,
        keywords: [guide.note, guide.investment, guide.mapHint].filter(Boolean).join(" "),
      };
    }),
    ...links.map((link) => ({
      id: `tool-${link.name}`,
      title: link.name,
      subtitle: [link.category, link.game || "Ambos"].filter(Boolean).join(" · "),
      category: "Ferramenta" as const,
      href: link.url,
      external: true,
      keywords: link.description,
    })),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-on-chrome/10 bg-chrome">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/malaka-profile.jpg"
            alt=""
            width={30}
            height={30}
            className="h-[30px] w-[30px] rounded-full object-cover"
          />
          <span className="font-display text-xl font-extrabold tracking-tight text-on-chrome">Malaka</span>
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] text-on-primary">
            TV
          </span>
        </Link>

        <HeaderNav
          games={games}
          discord={site.discord}
          youtube={site.youtube}
          handle={site.handle}
          searchItems={searchItems}
        />
      </div>
    </header>
  );
}
