import Link from "next/link";
import DiscordIcon from "./icons/DiscordIcon";
import { getGames, getSite } from "@/lib/content";

export default async function SiteHeader() {
  const site = await getSite();
  const games = await getGames();

  return (
    <header className="sticky top-0 z-40 bg-ink">
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
          <span className="font-display text-xl font-extrabold tracking-tight text-canvas">Malaka</span>
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] text-ink">
            TV
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {games.map((game) =>
            game.status === "ativo" ? (
              <Link
                key={game.slug}
                href={`/jogos/${game.slug}`}
                className="text-sm font-semibold text-canvas/80 transition-colors hover:text-primary"
              >
                {game.shortName}
              </Link>
            ) : (
              <span
                key={game.slug}
                aria-disabled="true"
                title={`${game.name} — ${game.releaseLabel}`}
                className="flex cursor-default items-center gap-1.5 text-sm font-medium text-canvas/35"
              >
                {game.shortName}
                <span className="hidden rounded-full border border-canvas/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-canvas/40 sm:inline-flex">
                  em breve
                </span>
              </span>
            ),
          )}
          <Link
            href="/ferramentas"
            className="text-sm font-semibold text-canvas/80 transition-colors hover:text-primary"
          >
            Ferramentas
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={site.discord}
            target="_blank"
            rel="noreferrer"
            aria-label="Entrar no Discord do Malaka"
            title="Discord do Malaka"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas/10 text-canvas/80 transition-colors hover:bg-primary hover:text-ink"
          >
            <DiscordIcon className="h-4 w-4" />
          </a>
          <a href={site.youtube} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
            {site.handle}
          </a>
        </div>
      </div>
    </header>
  );
}
