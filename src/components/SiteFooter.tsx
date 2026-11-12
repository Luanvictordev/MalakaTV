import Link from "next/link";
import DiscordIcon from "./icons/DiscordIcon";
import { getGames, getSite } from "@/lib/content";

export default async function SiteFooter() {
  const site = await getSite();
  const games = await getGames();

  return (
    <footer className="border-t border-ink/10 bg-canvas">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight text-ink">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/malaka-profile.jpg"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover"
            />
            Malaka
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-ink">TV</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-body">{site.bio}</p>
          <a href={site.youtube} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm mt-5">
            {site.handle}
          </a>
        </div>

        <div>
          <p className="eyebrow">Jogos</p>
          <ul className="mt-4 space-y-2 text-sm">
            {games.map((game) => (
              <li key={game.slug}>
                {game.status === "ativo" ? (
                  <Link href={`/jogos/${game.slug}`} className="font-medium text-ink/75 transition-colors hover:text-ink">
                    {game.name}
                  </Link>
                ) : (
                  <span className="text-mute">
                    {game.name} <span className="text-[11px]">· em breve</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">Site</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/ferramentas" className="font-medium text-ink/75 transition-colors hover:text-ink">
                Ferramentas
              </Link>
            </li>
            <li>
              <a
                href={site.discord}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 font-medium text-ink/75 transition-colors hover:text-ink"
              >
                <DiscordIcon className="h-3.5 w-3.5" />
                Discord
              </a>
            </li>
            <li>
              <Link href="/admin" className="text-mute transition-colors hover:text-ink">
                Editor
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 pb-10">
        <div className="rule" />
        <p className="mt-4 text-xs text-mute">
          Conteúdo independente de fã. Path of Exile e Hero Siege são marcas de seus respectivos donos.
        </p>
      </div>
    </footer>
  );
}
